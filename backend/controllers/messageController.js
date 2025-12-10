import { Message, Conversation } from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        // Sort messages to get the most recent one first in each conversation
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          // Group messages by the "other user" in the conversation
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          },
          // Get the most recent message in the conversation 
          lastMessage: { $first: '$$ROOT' },
          // Count unread messages where the current user is the recipient
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        // Populate the "other user's" details from the 'users' collection.
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        // Deconstruct the otherUser array field from the input documents to output a document for each element.
        $unwind: '$otherUser'
      },
      {
        // Project only the necessary fields for the final output.
        $project: {
          _id: 1,
          lastMessage: 1,
          unreadCount: 1,
          'otherUser._id': 1,
          'otherUser.name': 1,
          'otherUser.email': 1,
          'otherUser.avatar': 1,
          'otherUser.role': 1
        }
      },
      {
        // Sort the final conversation list by the most recent message time.
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: conversationId },
        { sender: conversationId, recipient: req.user._id }
      ]
    })
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Message.countDocuments({
      $or: [
        { sender: req.user._id, recipient: conversationId },
        { sender: conversationId, recipient: req.user._id }
      ]
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: messages.reverse()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { recipient, content, bookingId } = req.body;
    const senderId = req.user._id;

    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    if (recipient === senderId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot send message to yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipient] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipient],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      recipient,
      content,
      booking: bookingId || null,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await message.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'recipient', select: 'name avatar' },
    ]);

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only recipient can mark as read
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    message.read = true;
    message.readAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};