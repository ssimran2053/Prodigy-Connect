import { useState } from 'react';
import {
  Box,
  Button,
  Badge,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  BellIcon,
  CheckIcon,
  CloseIcon,
  ChatIcon,
  CalendarIcon,
  StarIcon,
  WarningIcon,
  CheckCircleIcon,
  TimeIcon,
} from '@chakra-ui/icons';

const mockNotifications = [
  {
    id: '1',
    type: 'message',
    title: 'New message from Mike Anderson',
    description: 'I can start the plumbing work this Friday. Does that work for you?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false
  },
  {
    id: '2',
    type: 'booking',
    title: 'Appointment confirmed',
    description: 'Your appointment with Emily Chen for tutoring is confirmed for Oct 15.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false
  },
  {
    id: '3',
    type: 'review',
    title: 'New review received',
    description: 'Sarah Johnson left you a 5-star review!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment received',
    description: 'You received $150 for plumbing service from John Smith.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true
  },
  {
    id: '5',
    type: 'system',
    title: 'Profile views increasing',
    description: 'Your profile has been viewed 45 times this week!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true
  }
];

export function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message':
        return <ChatIcon color="blue.600" />;
      case 'booking':
        return <CalendarIcon color="green.600" />;
      case 'review':
        return <StarIcon color="yellow.600" />;
      case 'payment':
        return <CheckCircleIcon color="green.600" />;
      case 'system':
        return <WarningIcon color="blue.600" />;
      default:
        return <BellIcon color="gray.600" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
            <Flex align="center" justify="space-between">
                <HStack>
                    <BellIcon color="blue.500" />
                    <Heading as="h2" size="md">Notifications</Heading>
                    {unreadCount > 0 && (
                        <Badge colorScheme="red" borderRadius="full" px="2">{unreadCount}</Badge>
                    )}
                </HStack>
                <DrawerCloseButton />
            </Flex>
        </DrawerHeader>
        <DrawerBody p={0}>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              w="full"
              leftIcon={<CheckIcon />}
            >
              Mark all as read
            </Button>
          )}
          <VStack divider={<Box h="1px" bg="gray.200" />} spacing={0}>
            {notifications.length === 0 ? (
              <Box p={8} textAlign="center" color="gray.500">
                <BellIcon boxSize="48px" mx="auto" mb={3} color="gray.300" />
                <Text mb={1}>No notifications</Text>
                <Text fontSize="sm">You're all caught up!</Text>
              </Box>
            ) : (
              notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={4}
                  _hover={{ bg: 'gray.50' }}
                  bg={!notification.read ? 'blue.50' : 'transparent'}
                  w="full"
                >
                  <HStack spacing={3}>
                    <Box pt={1}>{getIcon(notification.type)}</Box>
                    <VStack align="stretch" spacing={1} flex="1">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight={!notification.read ? 'semibold' : 'normal'}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <Box boxSize="8px" bg="blue.500" borderRadius="full" />
                        )}
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {notification.description}
                      </Text>
                      <HStack justify="space-between">
                        <HStack spacing={1} fontSize="xs" color="gray.500">
                          <TimeIcon />
                          <Text>{formatTime(notification.timestamp)}</Text>
                        </HStack>
                        <HStack>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="xs"
                            colorScheme="red"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))
            )}
          </VStack>
        </DrawerBody>

        {notifications.length > 0 && (
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" w="full" onClick={() => setNotifications([])}>
              Clear all notifications
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export function NotificationButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [unreadCount] = useState(2); // This would come from context/state management

  return (
    <>
      <IconButton
        variant="ghost"
        aria-label="Notifications"
        icon={
            <>
                <BellIcon />
                {unreadCount > 0 && (
                    <Box
                    as="span"
                    position="absolute"
                    top="1"
                    right="1"
                    w="2"
                    h="2"
                    bg="red.500"
                    borderRadius="full"
                    />
                )}
            </>
        }
        onClick={onOpen}
      />
      <NotificationPanel isOpen={isOpen} onClose={onClose} />
    </>
  );
}
