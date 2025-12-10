import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  VStack,
  HStack,
  Image,
  Text,
  Button,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { authAPI } from '../../services/api';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export function UserSearchModal({ isOpen, onClose, onSelectUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery) {
      const search = async () => {
        setLoading(true);
        try {
          const response = await authAPI.searchUsers(debouncedQuery);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Failed to search users:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      };
      search();
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const handleSelect = (user) => {
    onSelectUser(user);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Message</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Search for a user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            mb={4}
          />
          <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto">
            {loading && <Center><Spinner /></Center>}
            {searchResults.map((user) => (
              <Button
                key={user._id}
                variant="ghost"
                w="full"
                justifyContent="flex-start"
                onClick={() => handleSelect(user)}
              >
                <HStack spacing={3}>
                  <Image
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    boxSize="10"
                    borderRadius="full"
                  />
                  <VStack align="flex-start" spacing={0}>
                    <Text>{user.name}</Text>
                    <Text fontSize="sm" color="gray.500">{user.email}</Text>
                  </VStack>
                </HStack>
              </Button>
            ))}
            {!loading && searchResults.length === 0 && searchQuery && (
              <Text textAlign="center" color="gray.500">No users found.</Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}