import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Center,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputGroup,
  InputLeftElement,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowForwardIcon, SearchIcon, DragHandleIcon, AddIcon } from '@chakra-ui/icons';
import { messagesAPI } from '../../services/api';
import { UserSearchModal } from './UserSearchModal';

export function MessagingPanel({ user, initialUserToMessage = null }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await messagesAPI.getConversations();
        setConversations(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch conversations.');
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (initialUserToMessage && conversations.length) {
      const existingConversation = conversations.find(c => c.otherUser._id === initialUserToMessage._id);
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        // Create a temporary conversation object
        const newConversation = {
          _id: initialUserToMessage._id, // Temporary ID
          otherUser: initialUserToMessage,
          lastMessage: { content: `Start a conversation with ${initialUserToMessage.name}`, createdAt: new Date().toISOString() },
          unreadCount: 0,
          isNew: true, // Flag to indicate this is a temporary conversation
        };
        setConversations([newConversation, ...conversations]);
        setSelectedConversation(newConversation);
      }
    }
  }, [initialUserToMessage, conversations]);

  useEffect(() => {
    if (selectedConversation && !selectedConversation.isNew) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const response = await messagesAPI.getMessages(selectedConversation._id);
          setMessages(response.data);
          setError(null);
        } catch (err) {
          setError(err.message || 'Failed to fetch messages.');
          setMessages([]);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    } else if (selectedConversation?.isNew) {
      setMessages([]);
      setLoading(false);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const messageData = {
        recipient: selectedConversation.otherUser._id,
        content: messageText,
      };
      const response = await messagesAPI.sendMessage(messageData);
      setMessages([...messages, response.data]);
      setMessageText('');

      // Refresh conversations to show the new last message and replace temp one
      const convResponse = await messagesAPI.getConversations();
      setConversations(convResponse.data);
      // Find and select the newly created conversation
      const newConv = convResponse.data.find(c => c.otherUser._id === selectedConversation.otherUser._id);
      if (newConv) {
        setSelectedConversation(newConv);
      }

    } catch (err) {
      setError(err.message || 'Failed to send message.');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };
  
  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure();
  
  const handleSelectUser = (selectedUser) => {
    const existingConversation = conversations.find(c => c.otherUser._id === selectedUser._id);
    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      const newConversation = {
        _id: selectedUser._id, // Temp ID
        otherUser: selectedUser,
        lastMessage: { content: `Start a conversation with ${selectedUser.name}`, createdAt: new Date().toISOString() },
        unreadCount: 0,
        isNew: true,
      };
      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <UserSearchModal isOpen={isSearchOpen} onClose={onSearchClose} onSelectUser={handleSelectUser} />
      <Box maxW="7xl" mx="auto">
        <HStack justify="space-between" mb="6">
          <Box>
            <Heading as="h1" size="xl" mb="2">Messages</Heading>
            <Text color="gray.600">
              {user.role === 'admin'
                ? 'Support tickets, reports, and platform communications'
                : 'Communicate with service providers and seekers'}
            </Text>
          </Box>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onSearchOpen}>
            New Message
          </Button>
        </HStack>

        {error && (
          <Alert status="error" mb="4">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box bg="white" borderRadius="lg" borderWidth="1px" overflow="hidden" h="calc(100vh - 280px)">
          <Flex h="full">
            {/* Conversations List */}
            <VStack w="320px" borderRightWidth="1px" align="stretch" spacing={0}>
              <Box p="4" borderBottomWidth="1px">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search conversations..."
                    fontSize="sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Box>

              {loading && !conversations.length ? (
                <Center flex="1"><Spinner /></Center>
              ) : (
                <VStack flex="1" overflowY="auto" align="stretch" spacing={0}>
                  {filteredConversations.map((conv) => (
                    <Button
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      variant="ghost"
                      justifyContent="flex-start"
                      h="auto"
                      p="4"
                      borderBottomWidth="1px"
                      borderRadius="0"
                      bg={selectedConversation?._id === conv._id ? 'blue.50' : 'transparent'}
                      _hover={{ bg: 'gray.50' }}
                    >
                      <HStack w="full" spacing="3">
                        <Box position="relative">
                          <Image
                            src={conv.otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser.name}`}
                            alt={conv.otherUser.name}
                            boxSize="12"
                            borderRadius="full"
                          />
                          {conv.unreadCount > 0 && (
                            <Center position="absolute" top="-1" right="-1" boxSize="5" bgGradient="linear(to-r, blue.400, purple.500)" color="white" borderRadius="full" fontSize="xs" fontWeight="semibold" shadow="lg">
                              {conv.unreadCount}
                            </Center>
                          )}
                        </Box>
                        <VStack align="flex-start" spacing="0" flex="1" minW="0">
                          <HStack w="full" justify="space-between">
                            <Text fontSize="sm" isTruncated>{conv.otherUser.name}</Text>
                            <Text fontSize="xs" color="gray.500" flexShrink={0} ml={2}>
                              {conv.isNew ? 'Start' : formatTime(conv.lastMessage.createdAt)}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" isTruncated>
                            {conv.lastMessage.content}
                          </Text>
                        </VStack>
                      </HStack>
                    </Button>
                  ))}
                </VStack>
              )}
            </VStack>

            {/* Message Thread */}
            {selectedConversation ? (
              <Flex flex="1" direction="column">
                {/* Chat Header */}
                <HStack p="4" borderBottomWidth="1px" justify="space-between">
                  <HStack spacing="3">
                    <Image
                      src={selectedConversation.otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser.name}`}
                      alt={selectedConversation.otherUser.name}
                      boxSize="10"
                      borderRadius="full"
                    />
                    <VStack align="flex-start" spacing="0">
                      <Text fontSize="sm">{selectedConversation.otherUser.name}</Text>
                      <Text fontSize="xs" color="gray.500">{selectedConversation.otherUser.role}</Text>
                    </VStack>
                  </HStack>
                  <Menu>
                    <MenuButton as={IconButton} variant="ghost" icon={<DragHandleIcon />} />
                    <MenuList>
                      <MenuItem>View Profile</MenuItem>
                      <MenuItem>Block User</MenuItem>
                      <MenuItem color="red.500">Delete Conversation</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>

                {/* Messages */}
                {loading && !messages.length && !selectedConversation.isNew ? (
                  <Center flex="1"><Spinner /></Center>
                ) : (
                  <VStack flex="1" overflowY="auto" p="4" spacing="4">
                    {messages.map((message) => {
                      const isOwn = message.sender._id === user._id;
                      return (
                        <Flex key={message._id} w="full" justify={isOwn ? 'flex-end' : 'flex-start'}>
                          <Box
                            maxW="70%"
                            borderRadius="lg"
                            px="4"
                            py="2"
                            bg={isOwn ? 'blue.500' : 'gray.100'}
                            color={isOwn ? 'white' : 'black'}
                          >
                            <Text fontSize="sm">{message.content}</Text>
                            <Text
                              fontSize="xs"
                              mt="1"
                              textAlign="right"
                              color={isOwn ? 'blue.200' : 'gray.500'}
                            >
                              {formatTime(message.createdAt)}
                            </Text>
                          </Box>
                        </Flex>
                      );
                    })}
                    {selectedConversation.isNew && (
                        <Center flex="1" color="gray.500">
                            <Text>Start typing to send a message to {selectedConversation.otherUser.name}.</Text>
                        </Center>
                    )}
                  </VStack>
                )}


                {/* Message Input */}
                <Box as="form" onSubmit={handleSendMessage} p="4" borderTopWidth="1px">
                  <HStack spacing="2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <IconButton type="submit" icon={<ArrowForwardIcon />} colorScheme="blue" />
                  </HStack>
                </Box>
              </Flex>
            ) : (
              <Center flex="1" h="full" color="gray.500">
                <VStack>
                  <Text mb="2">Select a conversation to start messaging</Text>
                  <Text fontSize="sm">Your messages will appear here</Text>
                </VStack>
              </Center>
            )}
          </Flex>
        </Box>
      </Box>
    </>
  );
}
