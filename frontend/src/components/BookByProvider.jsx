import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Input,
  Badge,
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Image,
  Flex,
  Spacer,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  Center,
} from '@chakra-ui/react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { 
  CheckCircleIcon,
  WarningIcon,
  SearchIcon,
  StarIcon,
  ViewIcon,
  ArrowBackIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { servicesAPI, bookingsAPI } from '../../services/api';

export function BookByProvider({ user }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchAndGroupServices = async () => {
      try {
        setLoading(true);
        const response = await servicesAPI.getServices();
        const services = response.data || [];

        const providersMap = new Map();
        services.forEach(service => {
          if (!service.provider) return;

          const providerId = service.provider._id;
          if (!providersMap.has(providerId)) {
            providersMap.set(providerId, {
              ...service.provider,
              services: [],
            });
          }
          providersMap.get(providerId).services.push(service);
        });

        setProviders(Array.from(providersMap.values()));
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch data.');
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndGroupServices();
  }, []);

  const categories = ['all', 'Home Services', 'Education', 'Tech Services', 'Health & Fitness', 'Creative Services'];
  const timeSlots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    const providerCategories = provider.services.map(s => s.category);
    const matchesCategory = selectedCategory === 'all' || providerCategories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

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

    if (!selectedProvider || !selectedService) {
      toast({
        title: 'An error occurred',
        description: 'Provider or service not selected.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const bookingData = {
      service: selectedService._id,
      provider: selectedProvider._id,
      seeker: user._id,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      duration: selectedService.duration,
      price: selectedService.price,
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
      setSelectedService(null);
      setSelectedTime('');
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

  if (!selectedProvider) {
    return (
      <Box maxW="7xl" mx="auto">
        <Heading as="h1" size="xl" mb="2">Book by Provider</Heading>
        <Text color="gray.600" mb="6">Choose your preferred service provider and book their services</Text>
        <Card mb="6">
          <CardBody>
            <HStack spacing="4">
              <Input placeholder="Search providers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} w="200px">
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </Select>
            </HStack>
          </CardBody>
        </Card>
        
        {loading ? (
          <Center h="200px"><Spinner /></Center>
        ) : error ? (
          <Alert status="error"><AlertIcon />{error}</Alert>
        ) : filteredProviders.length === 0 ? (
          <Center h="200px"><Text>No providers found.</Text></Center>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {filteredProviders.map((provider) => (
              <Card key={provider._id} _hover={{ shadow: 'lg' }} transition="shadow 0.2s">
                <CardBody>
                  <VStack align="stretch" spacing="4">
                    <HStack align="start" spacing="4">
                      <Image src={provider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.name}`} alt={provider.name} boxSize="16" borderRadius="full" />
                      <Box>
                        <Heading as="h3" size="md">{provider.name}</Heading>
                        <HStack>
                          <StarIcon color="gold" />
                          <Text>{provider.rating || 'New'}</Text>
                          <Text color="gray.500">({provider.reviews?.length || 0})</Text>
                        </HStack>
                        <Badge>{provider.services.map(s => s.category).join(', ')}</Badge>
                      </Box>
                    </HStack>
                    <Button colorScheme="blue" onClick={() => setSelectedProvider(provider)} rightIcon={<ChevronRightIcon />}>
                      View Services
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )}
      </Box>
    );
  }

  if (selectedProvider && !selectedService) {
    return (
      <Box maxW="7xl" mx="auto">
        <Button variant="ghost" onClick={() => setSelectedProvider(null)} mb="4" leftIcon={<ArrowBackIcon />}>
          Back to Providers
        </Button>
        <Card mb="6">
          <CardBody>
            <HStack align="start" spacing="4">
              <Image src={selectedProvider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProvider.name}`} alt={selectedProvider.name} boxSize="20" borderRadius="full" />
              <Box>
                <Heading as="h1" size="lg" mb="2">{selectedProvider.name}</Heading>
                <HStack>
                  <StarIcon color="gold" />
                  <Text>{selectedProvider.rating || 'New'} ({selectedProvider.reviews?.length || 0} reviews)</Text>
                </HStack>
                <Badge>{selectedProvider.services.map(s => s.category).join(', ')}</Badge>
              </Box>
            </HStack>
          </CardBody>
        </Card>
        <Heading as="h2" size="lg" mb="4">Select a Service</Heading>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          {selectedProvider.services.map((service) => (
            <Card key={service._id} _hover={{ shadow: 'lg' }} transition="shadow 0.2s">
              <CardBody>
                <VStack align="stretch" spacing="3">
                  <Heading as="h3" size="md">{service.title}</Heading>
                  <Text color="gray.600">{service.description}</Text>
                  <Flex justify="space-between" align="center">
                    <Text>Duration: {service.duration || 'N/A'}</Text>
                    <Text color="blue.600" fontWeight="bold">{formatPrice(service.price)}</Text>
                  </Flex>
                  <Button colorScheme="blue" onClick={() => setSelectedService(service)}>
                    Book This Service
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Box>
    )
  }

  return (
    <Box maxW="7xl" mx="auto">
      <Button variant="ghost" onClick={() => setSelectedService(null)} mb="4" leftIcon={<ArrowBackIcon />}>
          Back to Services
        </Button>
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="6">
        <Card>
          <CardBody>
            <Heading as="h3" size="md" mb="4">Select Date</Heading>
            <Center>
              <DayPicker mode="single" selected={selectedDate} onSelect={setSelectedDate} />
            </Center>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Heading as="h3" size="md" mb="4">Booking Details</Heading>
            <VStack spacing="4" align="stretch">
              <Box>
                <Text mb="2">Time Slot</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap="2">
                  {timeSlots.map((time) => (
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
              <Button colorScheme="blue" onClick={() => {
                if(!selectedTime) {
                  toast({
                    title: 'Please select a time slot',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                  })
                  return;
                }
                setShowConfirmDialog(true)
              }} leftIcon={<CheckCircleIcon />}>
                Confirm Booking
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
      <AlertDialog isOpen={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Confirm Your Booking</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              <VStack spacing="3" align="stretch">
                <Text>You are about to book the following service:</Text>
                <Box bg="gray.50" p="4" borderRadius="md">
                  <VStack spacing="2" align="stretch">
                    <HStack><Text w="100px" color="gray.600">Provider:</Text><Text>{selectedProvider.name}</Text></HStack>
                    <HStack><Text w="100px" color="gray.600">Service:</Text><Text>{selectedService?.title}</Text></HStack>
                    <HStack><Text w="100px" color="gray.600">Date:</Text><Text>{selectedDate?.toLocaleDateString()}</Text></HStack>
                    <HStack><Text w="100px" color="gray.600">Time:</Text><Text>{selectedTime}</Text></HStack>
                  </VStack>
                </Box>
              </VStack>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleConfirmBooking} ml={3}>Confirm</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

const formatPrice = (price) => {
  if (!price) return 'N/A';
  if (typeof price === 'number') return `$${price}`;
  if (typeof price === 'object' && typeof price.amount !== 'undefined') {
    const amount = price.currency === 'USD' ? `$${price.amount}` : `${price.amount} ${price.currency}`;
    if (price.type === 'hourly') return `${amount}/hr`;
    return amount;
  }
  return 'Inquire for price';
};
