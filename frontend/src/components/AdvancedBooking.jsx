import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  useToast,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Center,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { 
  CheckCircleIcon,
  WarningIcon,
  CalendarIcon,
  ViewIcon
} from '@chakra-ui/icons';
import { BookByProvider } from './BookByProvider';
import { servicesAPI, bookingsAPI } from '../../services/api';

export function AdvancedBooking({ user, serviceToBook }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('2 hours - $110');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await servicesAPI.getServices();
        const servicesData = response.data || [];
        setServices(servicesData);
        if (servicesData.length > 0) {
          // If a service is passed as a prop, select it, otherwise select the first one
          if (serviceToBook) {
            setSelectedService(serviceToBook._id);
          } else {
            setSelectedService(servicesData[0]._id);
          }
        }
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch services.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (serviceToBook) {
      setSelectedService(serviceToBook._id);
    }
  }, [serviceToBook]);


  const handleConfirmBooking = async () => {
    if (!user) {
      toast({
        title: 'Please log in to book a service.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const service = services.find(s => s._id === selectedService);
    if (!service) {
      toast({
        title: 'Please select a valid service.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // This is not ideal, in a real application, you would have a more robust way to handle this
    const priceAmount = parseFloat(selectedDuration.split('$')[1]);

    const bookingData = {
      service: service._id,
      provider: service.provider._id,
      seeker: user._id,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      duration: parseFloat(selectedDuration.split(' ')[0]),
      price: {
        amount: priceAmount,
        currency: 'USD'
      },
    };

    setShowConfirmDialog(false);

    try {
      await bookingsAPI.createBooking(bookingData);
      toast({
        title: 'Booking Confirmed!',
        description: 'You will receive a confirmation email shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'There was an error creating your booking.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="7xl" mx="auto">
      <Heading as="h1" size="xl" mb="2">Book Services</Heading>
      <Text color="gray.600" mb="6">Schedule appointments with service providers</Text>

      <Tabs colorScheme="blue">
        <TabList>
          <Tab><CalendarIcon mr="2" />Quick Booking</Tab>
          <Tab><ViewIcon mr="2" />By Provider</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="6">
              <Card>
                <CardBody>
                  <Heading as="h3" size="md" mb="4">Select Date</Heading>
                  <Center>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                  </Center>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading as="h3" size="md" mb="4">Booking Details</Heading>
                  <VStack spacing="4" align="stretch">
                    <Box>
                      <Text mb="2" fontSize="sm">Service</Text>
                      {loading ? (
                        <Spinner />
                      ) : error ? (
                        <Alert status="error">
                          <AlertIcon />
                          {error}
                        </Alert>
                      ) : (
                        <Select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                          {services.map((service) => (
                            <option key={service._id} value={service._id}>
                              {service.title}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Box>

                    <Box>
                      <Text mb="2" fontSize="sm">Time Slot</Text>
                      <Grid templateColumns="repeat(2, 1fr)" gap="2">
                        {['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'].map((time) => (
                          <Button 
                            key={time} 
                            variant={selectedTime === time ? 'solid' : 'outline'}
                            colorScheme={selectedTime === time ? 'blue' : 'gray'}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </Grid>
                    </Box>

                    <Box>
                      <Text mb="2" fontSize="sm">Duration</Text>
                      <Select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)}>
                        <option>1 hour - $60</option>
                        <option>2 hours - $110</option>
                        <option>3 hours - $150</option>
                      </Select>
                    </Box>

                    <Button 
                      colorScheme="blue"
                      onClick={() => {
                        if (!selectedTime) {
                          toast({
                            title: 'Please select a time slot',
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                          });
                          return;
                        }
                        setShowConfirmDialog(true);
                      }}
                      leftIcon={<CheckCircleIcon />}
                    >
                      Confirm Booking
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          <TabPanel>
            <BookByProvider />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <AlertDialog isOpen={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Your Booking
            </AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              <VStack spacing="3" align="stretch">
                <Text>You are about to book the following service:</Text>
                <Box bg="gray.50" p="4" borderRadius="md">
                  <VStack spacing="2" align="stretch">
                    <HStack>
                      <Text w="120px" color="gray.600">Service:</Text>
                      <Text>{selectedService}</Text>
                    </HStack>
                    <HStack>
                      <Text w="120px" color="gray.600">Date:</Text>
                      <Text>{selectedDate?.toLocaleDateString()}</Text>
                    </HStack>
                    <HStack>
                      <Text w="120px" color="gray.600">Time Slot:</Text>
                      <Text>{selectedTime}</Text>
                    </HStack>
                    <HStack>
                      <Text w="120px" color="gray.600">Duration & Cost:</Text>
                      <Text>{selectedDuration}</Text>
                    </HStack>
                  </VStack>
                </Box>
                <Text fontSize="sm" pt="2">
                  By confirming, you agree to the booking terms and conditions.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleConfirmBooking} ml={3}>
                Confirm Booking
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
