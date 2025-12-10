import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Badge,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
  Image,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, TimeIcon, ViewIcon } from '@chakra-ui/icons';

import { bookingsAPI } from '../../services/api';

export function CalendarView({ user }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 10)); // Oct 10, 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingsAPI.getBookings();
        setBookings(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch bookings.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const appointments = bookings;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getAppointmentsForDate = (date) => bookings.filter(apt => {
    const aptDate = new Date(apt.scheduledDate);
    return aptDate.getDate() === date && aptDate.getMonth() === currentDate.getMonth() && aptDate.getFullYear() === currentDate.getFullYear();
  });

  const selectedDateAppointments = selectedDate
    ? bookings.filter(apt => {
        const aptDate = new Date(apt.scheduledDate);
        return aptDate.getDate() === selectedDate.getDate() && aptDate.getMonth() === selectedDate.getMonth() && aptDate.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  return (
    <Box maxW="7xl" mx="auto">
      <Flex mb="6" align="center" justify="space-between">
        <Box>
          <Heading as="h1" size="xl" mb="2">{user.role === 'seeker' ? 'My Bookings' : 'Calendar'}</Heading>
          <Text color="gray.600">{user.role === 'seeker' ? 'View and manage your scheduled appointments' : 'Manage your appointments and schedule'}</Text>
        </Box>
        {user.role === 'provider' && <Button onClick={onOpen} colorScheme="blue" leftIcon={<AddIcon />}>New Appointment</Button>}
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }} gap={6}>
        <Card>
          <CardBody>
            <Flex align="center" justify="space-between" mb="6">
              <Heading as="h2" size="lg">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</Heading>
              <HStack>
                <IconButton icon={<ChevronLeftIcon />} aria-label="Previous month" variant="outline" onClick={previousMonth} />
                <IconButton icon={<ChevronRightIcon />} aria-label="Next month" variant="outline" onClick={nextMonth} />
              </HStack>
            </Flex>
            <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={2}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} textAlign="center" fontSize="sm" color="gray.500" py={2}>{day}</Text>
              ))}
            </Grid>
            <Grid templateColumns="repeat(7, 1fr)" gap={2}>
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <Box key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = i + 1;
                const dailyAppointments = getAppointmentsForDate(date);
                const isToday = date === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                const isSelected = selectedDate && date === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();
                return (
                  <Button
                    key={date}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date))}
                    variant="outline"
                    h="auto"
                    aspectRatio={1}
                    p={2}
                    flexDirection="column"
                    bg={isSelected ? 'blue.600' : isToday ? 'blue.50' : 'transparent'}
                    color={isSelected ? 'white' : 'inherit'}
                    _hover={{ bg: isSelected ? 'blue.700' : 'gray.50' }}
                  >
                    <Text>{date}</Text>
                    {dailyAppointments.length > 0 && (
                      <HStack mt={1} spacing="0.5">
                        {dailyAppointments.slice(0, 3).map((apt, i) => (
                          <Box key={i} boxSize="1.5" borderRadius="full" bg={isSelected ? 'white' : apt.status === 'confirmed' ? 'green.500' : 'yellow.500'} />
                        ))}
                      </HStack>
                    )}
                  </Button>
                );
              })}
            </Grid>
          </CardBody>
        </Card>

        <VStack spacing={4}>
          <Card w="full">
            <CardBody>
              <Heading as="h3" size="md" mb="4">{selectedDate ? `Appointments on ${selectedDate.toLocaleDateString()}` : 'Upcoming Appointments'}</Heading>
              <VStack spacing={3}>
                {loading ? (
                  <Spinner />
                ) : error ? (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                ) : ((selectedDate ? selectedDateAppointments : appointments).slice(0, 5).map(apt => (
                  <Box key={apt._id} p={3} borderWidth="1px" borderRadius="lg" w="full" _hover={{ bg: 'gray.50' }}>
                    <Flex justify="space-between" align="flex-start" mb={2}>
                      <Text fontSize="sm" fontWeight="bold" flex="1">{apt.service.title}</Text>
                      <Badge colorScheme={apt.status === 'confirmed' ? 'green' : 'yellow'}>{apt.status}</Badge>
                    </Flex>
                    <HStack fontSize="xs" color="gray.500" mb={2}>
                      <TimeIcon />
                      <Text>{new Date(apt.scheduledDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} · {apt.duration} hours</Text>
                    </HStack>
                    <HStack spacing={2} mb={2}>
                        <Image src={user.role === 'seeker' ? apt.provider.avatar : apt.seeker.avatar} alt="Avatar" boxSize="6" borderRadius="full" />
                        <Text fontSize="xs" color="gray.600">
                            {user.role === 'seeker' ? apt.provider.name : apt.seeker.name}
                        </Text>
                    </HStack>
                    <HStack fontSize="xs" color="gray.500">
                      <ViewIcon />
                      <Text>{apt.service.location || 'Online'}</Text>
                    </HStack>
                    {apt.notes && <Text fontSize="xs" color="gray.600" mt={2} pt={2} borderTopWidth="1px">{apt.notes}</Text>}
                  </Box>
                )))}
                {(selectedDate ? selectedDateAppointments : appointments).length === 0 && !loading && (
                  <Text textAlign="center" py={8} color="gray.500" fontSize="sm">{user.role === 'seeker' ? 'No bookings scheduled' : 'No appointments scheduled'}</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
      
      <AddAppointmentModal isOpen={isOpen} onClose={onClose}/>
    </Box>
  );
}

function AddAppointmentModal({ isOpen, onClose }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>New Appointment</ModalHeader>
                <ModalBody>
                    <VStack as="form" spacing={4}>
                        <FormControl>
                            <FormLabel>Title</FormLabel>
                            <Input placeholder="e.g., Client Consultation" />
                        </FormControl>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <FormControl>
                                <FormLabel>Date</FormLabel>
                                <Input type="date" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Time</FormLabel>
                                <Input type="time" />
                            </FormControl>
                        </Grid>
                        <FormControl>
                            <FormLabel>Duration</FormLabel>
                            <Select>
                                <option>30 minutes</option>
                                <option>1 hour</option>
                                <option>1.5 hours</option>
                                <option>2 hours</option>
                                <option>3 hours</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Location</FormLabel>
                            <Input placeholder="Address or 'Online'" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Notes (optional)</FormLabel>
                            <Textarea placeholder="Additional details..." />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3}>Create Appointment</Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}