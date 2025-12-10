import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Badge,
  Card,
  CardBody,
  Input,
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  Flex,
  Tooltip,
  Kbd,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ViewIcon, 
  CalendarIcon, 
  ChatIcon,
  TimeIcon,
  ArrowUpIcon,
  StarIcon,
  SettingsIcon,
  BellIcon,
  AddIcon,
} from '@chakra-ui/icons';

export function GlobalSearch({ isOpen, onClose, onSelect, onNavigate, userRole = 'seeker' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches] = useState([
    'Plumbing services',
    'Math tutoring',
    'Web development',
    'Graphic design'
  ]);

  const mockData = [
    { id: '1', type: 'service', title: 'Professional Plumbing Services', subtitle: 'Mike Anderson · $75-150/hr · ⭐ 4.9', icon: <ViewIcon />, badge: 'Service' },
    { id: '2', type: 'provider', title: 'Emily Chen', subtitle: 'Math & Science Tutoring · ⭐ 5.0', icon: <ViewIcon />, badge: 'Provider' },
    { id: '3', type: 'appointment', title: 'Plumbing Repair - Kitchen Sink', subtitle: 'Oct 12, 2025 at 10:00 AM', icon: <CalendarIcon />, badge: 'Appointment' },
  ];

  const getQuickActions = () => { return [] };
  const quickActions = getQuickActions();

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (results.length > 0) {
        if (e.key === 'ArrowDown') setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        if (e.key === 'ArrowUp') setSelectedIndex(prev => Math.max(prev - 1, 0));
        if (e.key === 'Enter') handleSelect(results[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (result) => {
    onSelect?.(result);
    onClose();
    setQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalBody p={0}>
          <Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          <VStack align="stretch">
            {results.map((result, index) => (
              <Button key={result.id} onClick={() => handleSelect(result)} justifyContent="start" variant={index === selectedIndex ? 'solid' : 'ghost'} colorScheme={index === selectedIndex ? 'blue' : 'gray'}>
                <HStack>
                  {result.icon}
                  <Box textAlign="left">
                    <Text>{result.title}</Text>
                    <Text fontSize="sm" color="gray.500">{result.subtitle}</Text>
                  </Box>
                </HStack>
              </Button>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function SearchButton({ onClick }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  return (
    <Tooltip label="Search (⌘K)">
      <Button onClick={onClick} variant="outline" leftIcon={<SearchIcon />}>
        Search...
        <Kbd ml="4">⌘K</Kbd>
      </Button>
    </Tooltip>
  );
}
