import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Badge,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  Flex,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Select,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Code,
  Center,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon, StarIcon, ChatIcon, UpDownIcon, CalendarIcon } from '@chakra-ui/icons';
import { FaHeart } from 'react-icons/fa';
import { servicesAPI, authAPI, reviewsAPI, bookingsAPI } from '../../services/api';
import PlaceholderImage from '../assets/c4928b5b313acf796a0d321d9c48650523bf2f6f.png';

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5001';

const getImageUrl = (path) => {
  if (!path) return PlaceholderImage;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  let baseUrl = API_BASE_URL;
  
  // Handle trailing slash
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  // If the base URL ends with /api, remove it because static files are usually at root
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
    
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};


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

const formatLocation = (location) => {
  if (!location) return 'N/A';
  if (typeof location === 'string') return location;
  if (location.city && location.state) return `${location.city}, ${location.state}`;
  if (location.city) return location.city;
  if (location.address) return location.address;
  return 'Remote';
}


// ... (Keep the BookingFlow, ReviewSection, and ServiceDetailModal components as they are)

function ReviewSection({ serviceId, providerId, canReview, user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [eligibleBooking, setEligibleBooking] = useState(null);
  const toast = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getServiceReviews(serviceId);
      setReviews(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  // Check if user has a completed booking to review
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;
      try {
        // Fetch completed bookings for this user
        const bookingsResponse = await bookingsAPI.getBookings({ status: 'completed' });
        const userBookings = bookingsResponse.data || [];
        
        // Filter for this service
        const serviceBookings = userBookings.filter(b => 
          (b.service._id === serviceId || b.service === serviceId)
        );

        // Get current reviews to check which bookings are already reviewed
        const reviewsResponse = await reviewsAPI.getServiceReviews(serviceId);
        const serviceReviews = reviewsResponse.data || [];
        
        const userReviews = serviceReviews.filter(r => r.seeker._id === user._id);
        const reviewedBookingIds = new Set(userReviews.map(r => r.booking));

        // Find a booking that hasn't been reviewed
        const bookingToReview = serviceBookings.find(b => !reviewedBookingIds.has(b._id));
        
        setEligibleBooking(bookingToReview);
      } catch (err) {
        console.error("Error checking review eligibility", err);
      }
    };
    checkEligibility();
  }, [user, serviceId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Please log in to submit a review.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!eligibleBooking) {
      toast({
        title: 'Unable to submit review',
        description: 'You must have a completed booking for this service to leave a review.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await reviewsAPI.createReview({
        ...newReview,
        service: serviceId,
        provider: providerId,
        seeker: user._id,
        booking: eligibleBooking._id
      });
      toast({
        title: 'Review submitted!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(); // Refresh reviews
      setEligibleBooking(null); // Reset eligibility
    } catch (error) {
      toast({
        title: 'Error submitting review',
        description: error.message || 'There was an error submitting your review.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      {loading && <Center><Spinner /></Center>}
      {error && <Alert status="error"><AlertIcon />{error}</Alert>}
      
      <VStack spacing={6} align="stretch">
        {reviews.map(review => (
          <Box key={review._id} p={4} borderWidth="1px" borderRadius="md">
            <HStack align="start" spacing={4}>
              <Image src={review.seeker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.seeker.name}`} alt={review.seeker.name} boxSize="10" borderRadius="full" />
              <VStack align="stretch" spacing={1}>
                <Text fontWeight="bold">{review.seeker.name}</Text>
                <HStack>
                  {Array(5).fill('').map((_, i) => (
                    <StarIcon key={i} color={i < review.rating ? 'yellow.400' : 'gray.300'} />
                  ))}
                </HStack>
                <Text color="gray.600">{review.comment}</Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      {eligibleBooking && (
        <Box mt={8}>
          <Heading as="h4" size="md" mb={4}>Leave a Review</Heading>
          <VStack as="form" onSubmit={handleReviewSubmit} spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Rating</FormLabel>
              <HStack>
                {[1, 2, 3, 4, 5].map(star => (
                  <StarIcon 
                    key={star}
                    color={star <= newReview.rating ? 'yellow.400' : 'gray.300'}
                    boxSize={6}
                    cursor="pointer"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  />
                ))}
              </HStack>
            </FormControl>
            <FormControl>
              <FormLabel>Comment</FormLabel>
              <Textarea 
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience..."
              />
            </FormControl>
            <Button type="submit" colorScheme="blue">Submit Review</Button>
          </VStack>
        </Box>
      )}
      {!eligibleBooking && user && (
        <Box mt={8} p={4} bg="gray.50" borderRadius="md">
          <Text color="gray.600" textAlign="center" fontSize="sm">
            You can leave a review after you have booked and completed this service.
          </Text>
        </Box>
      )}
    </Box>
  );
}

function generateMockReviews(providerName) {
    return [];
}


export function ServiceListings({ user, services, loading, error, favoritesOnly = false, providerView = false, onBookService, onStartMessage }) {
  const [renderError, setRenderError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState(null);
  const toast = useToast();

  // Initialize favorites from the user prop
  useEffect(() => {
    const initFavorites = async () => {
      if (user?.favorites) {
        const favIds = user.favorites.map(f => (f && typeof f === 'object' && f._id) ? f._id : f);
        setFavorites(new Set(favIds));
      }
      
      try {
        const res = await authAPI.getMe();
        if (res.data?.favorites) {
          const freshFavIds = res.data.favorites.map(f => (f && typeof f === 'object' && f._id) ? f._id : f);
          setFavorites(new Set(freshFavIds));
        }
      } catch (e) {
        console.error("Failed to refresh favorites", e);
      }
    };
    if (user) initFavorites();
  }, [user?._id]);


  const categories = ['all', 'Home Services', 'Education', 'Tech Services', 'Health & Fitness', 'Creative Services'];

  const filteredServices = services.filter(service => {
    const matchesSearch = (service.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (service.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    if (providerView) {
      const providerId = service.provider?._id || service.provider;
      return providerId === user?._id && matchesSearch && matchesCategory;
    }

    const matchesFavorites = !favoritesOnly || favorites.has(service._id);
    const isActive = service.status === 'active';
    return matchesSearch && matchesCategory && matchesFavorites && isActive;
  });

  const toggleFavorite = async (serviceId) => {
    if (!user) {
      toast({
        title: 'Please log in to save services.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newFavorites = new Set(favorites);
    const originalFavorites = new Set(favorites); // Keep a copy for rollback

    if (newFavorites.has(serviceId)) {
      newFavorites.delete(serviceId);
    } else {
      newFavorites.add(serviceId);
    }

    // Optimistically update the UI
    setFavorites(newFavorites);

    try {
      // Make the API call to update the user's favorites
      await authAPI.updateDetails({ favorites: Array.from(newFavorites) });
      toast({
        title: newFavorites.has(serviceId) ? 'Service Saved!' : 'Service Unsaved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to update favorites:', error);
      // Rollback the UI change on error
      setFavorites(originalFavorites);
      toast({
        title: 'Error',
        description: 'Could not update your favorites. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleViewDetails = async (service) => {
    setSelectedService(service);
    onOpen();

    try {
      const response = await servicesAPI.getService(service._id);
      if (response.data) {
        setSelectedService(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch service details:", error);
    }
  }
  
  const renderContent = () => {
    try {
      if (loading) {
        return (
          <Flex justify="center" align="center" minH="300px">
            <Spinner size="xl" />
            <Text ml="4" fontSize="lg">Loading Services...</Text>
          </Flex>
        );
      }
  
      if (error) {
        return (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            There was an error fetching services: {error}
          </Alert>
        );
      }
      
      if (filteredServices.length === 0) {
        return (
          <Flex justify="center" align="center" minH="300px">
            <Text fontSize="lg" color="gray.500">No services found.</Text>
          </Flex>
        )
      }

      return (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {filteredServices.map((service) => (
            <Card key={service._id} overflow="hidden" _hover={{ shadow: 'lg' }} transition="shadow 0.2s">
              <Box position="relative">
                <Image
                  src={getImageUrl(service.image)}
                  alt={service.title}
                  onError={(e) => {
                    e.target.src = PlaceholderImage;
                  }}
                  w="full"
                  h="48"
                  objectFit="cover"
                />
                <IconButton
                  isRound
                  icon={<FaHeart color={favorites.has(service._id) ? 'white' : 'gray'} />}
                  aria-label="Favorite"
                  position="absolute"
                  top="3"
                  right="3"
                  onClick={() => toggleFavorite(service._id)}
                  bg={favorites.has(service._id) ? 'red.500' : 'gray.200'}
                  _hover={{ bg: favorites.has(service._id) ? 'red.600' : 'gray.300' }}
                />
                <Badge position="absolute" top="3" left="3" colorScheme="blue">{service.category}</Badge>
              </Box>
              <CardBody>
                <Heading as="h3" size="md" mb="2">{service.title}</Heading>
                <Text fontSize="sm" color="gray.600" mb="3" noOfLines={2}>{service.description}</Text>
                
                <HStack spacing="2" mb="3">
                  <Image
                    src={service.provider?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${service.provider?.name}`}
                    alt={service.provider?.name}
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${service.provider?.name}`;
                    }}
                    boxSize="8"
                    borderRadius="full"
                  />
                  <VStack align="flex-start" spacing="0" flex="1" minW="0">
                    <Text fontSize="sm" isTruncated>{service.provider?.name || 'N/A'}</Text>
                    <HStack spacing="1" fontSize="xs" color="gray.500">
                      <StarIcon color="yellow.400" />
                      <Text as="span">{service.provider?.rating || 'New'}</Text>
                      <Text as="span">({service.provider?.reviews?.length || 0})</Text>
                    </HStack>
                  </VStack>
                </HStack>

                <HStack spacing="2" fontSize="sm" color="gray.600" mb="3">
                  <ViewIcon />
                  <Text>
                    {formatLocation(service.location)}
                  </Text>
                </HStack>

                <HStack spacing="1" mb="3" wrap="wrap">
                  {(service.tags || []).map((tag, i) => (
                    <Badge key={i} colorScheme="gray">{tag}</Badge>
                  ))}
                </HStack>

                <Flex justify="space-between" align="center" pt="3" borderTopWidth="1px">
                  <Text color="blue.600" fontWeight="bold">
                    {formatPrice(service.price)}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(service)}
                  >
                    View Details
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )
    } catch (e) {
      console.error("[DEBUG] Render error:", e);
      // Use state to avoid rendering again and causing a loop
      if (!renderError) {
        setRenderError(e);
      }
      return null; // Return null on initial error
    }
  }


  return (
    <Box maxW="7xl" mx="auto">
      <Box mb="6">
        <Heading as="h1" size="xl" mb="2">
          {providerView ? 'My Posted Services' : favoritesOnly ? 'My Favorites' : 'Browse Services'}
        </Heading>
        <Text color="gray.600">
          {providerView 
            ? 'Manage your active service listings'
            : favoritesOnly 
            ? 'Services you\'ve saved for later'
            : 'Discover trusted service providers in your community'}
        </Text>
      </Box>

      <Box bg="white" borderRadius="lg" borderWidth="1px" p="4" mb="6">
        <HStack spacing="4">
          <InputGroup flex="1">
            <InputLeftElement pointerEvents='none'>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Select w="200px" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </Select>
          <IconButton icon={<UpDownIcon />} aria-label="Filter" variant="outline" />
        </HStack>
      </Box>

      {renderError ? (
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Heading size="md">A rendering error occurred.</Heading>
            <Text>Please check the console for more details. The error was:</Text>
            <Code mt="2" p="2" borderRadius="md" display="block" whiteSpace="pre-wrap">
              {renderError.message}
            </Code>
          </Box>
        </Alert>
      ) : renderContent()}
      
      {selectedService && (
        <ServiceDetailModal
          user={user}
          service={selectedService}
          isOpen={isOpen}
          onClose={onClose}
          isFavorite={favorites.has(selectedService._id)}
          onToggleFavorite={() => toggleFavorite(selectedService._id)}
          onBook={() => onBookService(selectedService)}
          onStartMessage={onStartMessage}
        />
      )}
    </Box>
  );
}

function ServiceDetailModal({ user, service, isOpen, onClose, isFavorite, onToggleFavorite, onBook, onStartMessage }) {
    // Make sure to use service._id instead of service.id if coming from MongoDB
    const provider = service.provider || {};
    
    const handleMessageClick = () => {
        if (onStartMessage) {
            onStartMessage(provider);
        }
        onClose();
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader p="0">
            <Box position="relative">
              <Image 
                src={getImageUrl(service.image)} 
                alt={service.title} 
                w="full" 
                h="64" 
                objectFit="cover"
                onError={(e) => { e.target.src = PlaceholderImage; }}
              />
              <ModalCloseButton bg="white" />
            </Box>
          </ModalHeader>
          <ModalBody p="6">
            <Flex justify="space-between" align="flex-start" mb="4">
              <Box>
                <Badge colorScheme="blue" mb="2">{service.category}</Badge>
                <Heading as="h2" size="lg" mb="2">{service.title}</Heading>
                <HStack color="gray.600">
                  <ViewIcon />
                  <Text>{formatLocation(service.location)}</Text>
                </HStack>
              </Box>
              <Box textAlign="right">
                <Text fontSize="2xl" color="blue.600" fontWeight="bold" mb="1">{formatPrice(service.price)}</Text>
                <Button size="sm" variant="ghost" onClick={onToggleFavorite} leftIcon={<StarIcon color={isFavorite ? 'red.500' : 'gray.500'} />} colorScheme={isFavorite ? 'red' : 'gray'}>
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
              </Box>
            </Flex>
  
            <HStack spacing="3" mb="6" pb="6" borderBottomWidth="1px">
              <Image src={provider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.name}`} alt={provider.name} boxSize="16" borderRadius="full" />
              <VStack align="flex-start" spacing="0">
                <Text fontSize="lg" fontWeight="bold">{provider.name}</Text>
                <HStack>
                  <HStack spacing="1">
                    <StarIcon color="yellow.400" />
                    <Text>{provider.rating || 'New'}</Text>
                  </HStack>
                  <Text color="gray.400">·</Text>
                  <Text color="gray.600">{provider.reviews?.length || 0} reviews</Text>
                </HStack>
              </VStack>
            </HStack>
            
            <Tabs>
              <TabList>
                <Tab>Service Details</Tab>
                <Tab>Reviews ({provider.reviews?.length || 0})</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing="6" align="flex-start">
                      <Box>
                          <Heading as="h3" size="md" mb="2">About This Service</Heading>
                          <Text color="gray.600">{service.description}</Text>
                      </Box>
                      <Box>
                          <Heading as="h3" size="md" mb="3">Highlights</Heading>
                          <HStack spacing="2" wrap="wrap">
                              {(service.tags || []).map((tag, i) => (
                                  <Badge key={i} colorScheme="gray">{tag}</Badge>
                              ))}
                          </HStack>
                      </Box>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <ReviewSection
                      serviceId={service._id}
                      providerId={provider._id}
                      canReview={true} // This should be determined by backend logic
                      user={user}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
  
          </ModalBody>
          <ModalFooter borderTopWidth="1px">
            <Button flex="1" colorScheme="blue" onClick={onBook} leftIcon={<CalendarIcon />}>
              Book Now
            </Button>
            <Button flex="1" variant="outline" ml={3} leftIcon={<ChatIcon />} onClick={handleMessageClick}>
              Message
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }