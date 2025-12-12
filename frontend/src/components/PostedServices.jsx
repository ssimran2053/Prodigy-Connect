import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Badge,
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  Flex,
  Image,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Center,
  IconButton,
  Spinner, // Import Spinner for loading state
  Alert, // Import Alert for error state
  AlertIcon,
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, InfoIcon, ViewIcon, StarIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { servicesAPI } from '../../services/api';
import { PostServiceModal } from './PostServiceModal';
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
};

export function PostedServices({ user }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingService, setEditingService] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const userId = user?._id || user?.id;
        if (userId) {
          const response = await servicesAPI.getProviderServices(userId);
          setServices(response.data);
        } else {
          console.warn('User or user.id is not available, cannot fetch services.');
          setServices([]);
        }
      } catch (err) {
        setError(err);
        toast({
          title: 'Failed to load services',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    const userId = user?._id || user?.id;
    if (userId) {
      fetchServices();
    } else {
      setLoading(false);
      setServices([]);
    }
  }, [user?._id, toast]);

  const handleServicePosted = (newService) => {
    setServices([newService, ...services]);
  };
  
  const handleDeleteService = async (serviceId) => {
    setLoading(true);
    try {
      await servicesAPI.deleteService(serviceId);
      setServices(services.filter(s => (s._id || s.id) !== serviceId));
      toast({
          title: 'Service deleted successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
    } catch (err) {
      toast({
        title: 'Failed to delete service',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (serviceId) => {
    // setLoading(true); // Removed to prevent UI flash
    try {
      const serviceToUpdate = services.find(s => (s._id || s.id) === serviceId);
      if (!serviceToUpdate) throw new Error('Service not found');

      const newStatus = serviceToUpdate.status === 'active' ? 'paused' : 'active';
      const updatedService = { ...serviceToUpdate, status: newStatus };

      const response = await servicesAPI.updateService(serviceId, { status: newStatus });
      setServices(services.map(s => 
        (s._id || s.id) === (response.data._id || response.data.id) ? response.data : s
      ));
      
      toast({
          title: `Service ${newStatus === 'active' ? 'activated' : 'paused'}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
    } catch (err) {
      toast({
        title: 'Failed to update service status',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      // setLoading(false);
    }
  };

  const handleEditService = async () => {
    if (!editingService) return;
    
    if (!editingService.title || !editingService.description || !editingService.price || !editingService.category) {
      toast({
        title: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      let priceAmount = editingService.price;
      if (typeof priceAmount === 'object' && priceAmount !== null) {
        priceAmount = priceAmount.amount;
      }

      const serviceData = {
        ...editingService,
        price: parseFloat(priceAmount),
        tags: Array.isArray(editingService.tags) 
          ? editingService.tags 
          : editingService.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };
      
      const response = await servicesAPI.updateService(editingService._id || editingService.id, serviceData);
      setServices(services.map(s => 
        (s._id || s.id) === (response.data._id || response.data.id) ? response.data : s
      ));
      
      setEditingService(null);
      toast({
          title: 'Service updated successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
    } catch (err) {
      toast({
        title: 'Failed to update service',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (service) => {
    setEditingService({ ...service });
  };

  return (
    <Box maxW="7xl" mx="auto">
      {loading && (
        <Center py={10}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Center>
      )}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error: {error.message}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Flex mb="6" align="center" justify="space-between">
            <Box>
              <Heading as="h1" size="xl" mb="2">My Posted Services</Heading>
              <Text color="gray.600">Manage your active service listings</Text>
            </Box>
            <Button
              onClick={onOpen}
              colorScheme="blue"
              leftIcon={<AddIcon />}
            >
              Post New Service
            </Button>
          </Flex>

          {/* Stats */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={6}>
            <Card>
              <CardBody>
                <Flex justify="space-between" align="center" mb="2">
                  <Text fontSize="sm" color="gray.600">Total Services</Text>
                  <StarIcon color="blue.600" />
                </Flex>
                <Heading as="h2" size="xl" mb="1">{services.length}</Heading>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Flex justify="space-between" align="center" mb="2">
                  <Text fontSize="sm" color="gray.600">Active</Text>
                  <CheckCircleIcon color="green.600" />
                </Flex>
                <Heading as="h2" size="xl" mb="1">{services.filter(s => s.status === 'active').length}</Heading>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Flex justify="space-between" align="center" mb="2">
                  <Text fontSize="sm" color="gray.600">Total Views</Text>
                  <ViewIcon color="purple.600" />
                </Flex>
                <Heading as="h2" size="xl" mb="1">{services.reduce((acc, s) => acc + (s.views || 0), 0)}</Heading>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Flex justify="space-between" align="center" mb="2">
                  <Text fontSize="sm" color="gray.600">Total Bookings</Text>
                  <InfoIcon color="orange.600" />
                </Flex>
                <Heading as="h2" size="xl" mb="1">{services.reduce((acc, s) => acc + (s.totalBookings || 0), 0)}</Heading>
              </CardBody>
            </Card>
          </Grid>

          {/* Services Grid */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {services.map((service) => (
              <Card key={service._id || service.id} overflow="hidden" _hover={{ shadow: 'lg' }} transition="shadow 0.2s">
                <Box position="relative">
                  <Image
                    src={getImageUrl(service.image)}
                    alt={service.title}
                    onError={(e) => {
                      console.error(`Failed to load image: ${getImageUrl(service.image)}`);
                      e.target.src = PlaceholderImage;
                    }}
                    w="full"
                    h="48"
                    objectFit="cover"
                  />
                  <Badge
                    position="absolute" top="3" right="3"
                    colorScheme={service.status === 'active' ? 'green' : 'gray'}
                  >
                    {service.status === 'active' ? 'Active' : 'Paused'}
                  </Badge>
                </Box>
                <CardBody>
                  <Box>
                    <Heading as="h3" size="md" mb="1">{service.title}</Heading>
                    <Badge variant="subtle">{service.category}</Badge>
                  </Box>

                  <Text fontSize="sm" color="gray.600" my={3} noOfLines={2}>
                    {service.description}
                  </Text>

                  <HStack>
                    <InfoIcon color="gray.500" />
                    <Text fontSize="sm">{formatPrice(service.price)}</Text>
                  </HStack>

                  <HStack>
                    <ViewIcon color="gray.500" />
                    <Text fontSize="sm" color="gray.600">{formatLocation(service.location)}</Text>
                  </HStack>

                  <HStack spacing={1} mt={3} mb={4} wrap="wrap">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </HStack>

                  <HStack justify="space-between" fontSize="sm" color="gray.600" mb="4">
                    <HStack>
                      <ViewIcon />
                      <Text>{service.views} views</Text>
                    </HStack>
                    <Text>{service.totalBookings || 0} bookings</Text>
                  </HStack>

                  <HStack>
                    <Button
                      variant="outline"
                      size="sm"
                      flex="1"
                      onClick={() => handleToggleStatus(service._id || service.id)}
                    >
                      {service.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                    <IconButton
                      variant="outline"
                      size="sm"
                      aria-label="Edit service"
                      icon={<EditIcon />}
                      onClick={() => openEditDialog(service)}
                    />
                    <IconButton
                      variant="outline"
                      size="sm"
                      aria-label="Delete service"
                      icon={<DeleteIcon />}
                      onClick={() => handleDeleteService(service._id || service.id)}
                      colorScheme="red"
                    />
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </>
      )}

      <PostServiceModal isOpen={isOpen} onClose={onClose} user={user} onServicePosted={handleServicePosted} />

      {/* Edit Service Modal */}
      <Modal isOpen={!!editingService} onClose={() => setEditingService(null)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Service</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input 
                  value={editingService?.title || ''} 
                  onChange={(e) => setEditingService({...editingService, title: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select 
                  value={editingService?.category || ''} 
                  onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                >
                  <option value="Home Services">Home Services</option>
                  <option value="Education">Education</option>
                  <option value="Tech Services">Tech Services</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                  <option value="Creative Services">Creative Services</option>
                  <option value="Business Services">Business Services</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  value={editingService?.description || ''} 
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                />
              </FormControl>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input 
                    value={editingService?.location?.city || ''} 
                    onChange={(e) => setEditingService({
                      ...editingService, 
                      location: { ...(editingService.location || {}), city: e.target.value }
                    })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>State</FormLabel>
                  <Input 
                    value={editingService?.location?.state || ''} 
                    onChange={(e) => setEditingService({
                      ...editingService, 
                      location: { ...(editingService.location || {}), state: e.target.value }
                    })}
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Price ($)</FormLabel>
                <Input 
                  type="number"
                  value={editingService?.price?.amount !== undefined ? editingService.price.amount : (editingService?.price || '')} 
                  onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tags (comma separated)</FormLabel>
                <Input 
                  value={Array.isArray(editingService?.tags) ? editingService.tags.join(', ') : (editingService?.tags || '')} 
                  onChange={(e) => setEditingService({...editingService, tags: e.target.value})}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditingService(null)}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleEditService} isLoading={loading}>Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
