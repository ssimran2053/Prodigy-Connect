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
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Center,
  IconButton,
  Spinner, // Import Spinner for loading state
  Alert, // Import Alert for error state
  AlertIcon
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, InfoIcon, ViewIcon, StarIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { servicesAPI } from '../../services/api';


export function PostedServices({ user }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    title: '',
    category: 'Home Services',
    description: '',
    price: '',
    location: user.location || 'Sacramento, CA',
    tags: ''
  });
  const toast = useToast();

  const categories = ['Home Services', 'Education', 'Tech Services', 'Health & Fitness', 'Creative Services', 'Business Services'];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        if (user && user.id) {
          const response = await servicesAPI.getProviderServices(user.id);
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

    if (user?.id) {
      fetchServices();
    } else {
      setLoading(false);
      setServices([]);
    }
  }, [user?.id, toast]);


  const handleAddService = async () => {
    if (!newService.title || !newService.description || !newService.price || !newService.category) {
      toast({
        title: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        ...newService,
        price: parseFloat(newService.price),
        tags: newService.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        provider: user.id, // Assign the current user as the provider
        location: newService.location || user.location || 'Sacramento, CA',
        image: 'https://images.unsplash.com/photo-1741544486057-56d132dbb799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzZXJ2aWNlJTIwd29ya2VyfGVufDF8fHx8MTc1OTk5NTIyNHww&ixlib=rb-4.1.0&q=80&w=1080', // Hardcoded for now
      };
      
      const response = await servicesAPI.createService(serviceData);
      setServices([response.data, ...services]); // Use data from backend response
      setShowAddService(false);
      setNewService({
        title: '',
        category: 'Home Services',
        description: '',
        price: '',
        location: user.location || 'Sacramento, CA',
        tags: ''
      });
      toast({
          title: 'Service posted successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
    } catch (err) {
      toast({
        title: 'Failed to post service',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    setLoading(true);
    try {
      await servicesAPI.deleteService(serviceId);
      setServices(services.filter(s => s.id !== serviceId));
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
    setLoading(true);
    try {
      const serviceToUpdate = services.find(s => s.id === serviceId);
      if (!serviceToUpdate) throw new Error('Service not found');

      const newStatus = serviceToUpdate.status === 'active' ? 'paused' : 'active';
      const updatedService = { ...serviceToUpdate, status: newStatus };

      const response = await servicesAPI.updateService(serviceId, { status: newStatus });
      setServices(services.map(s => 
        s.id === response.data.id ? response.data : s
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
      setLoading(false);
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
      const serviceData = {
        ...editingService,
        price: parseFloat(editingService.price),
        tags: Array.isArray(editingService.tags) 
          ? editingService.tags 
          : editingService.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };
      
      const response = await servicesAPI.updateService(editingService.id, serviceData);
      setServices(services.map(s => 
        s.id === response.data.id ? response.data : s
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
              onClick={() => setShowAddService(true)}
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
                <Heading as="h2" size="xl" mb="1">{services.reduce((acc, s) => acc + s.views, 0)}</Heading>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Flex justify="space-between" align="center" mb="2">
                  <Text fontSize="sm" color="gray.600">Total Bookings</Text>
                  <InfoIcon color="orange.600" />
                </Flex>
                <Heading as="h2" size="xl" mb="1">{services.reduce((acc, s) => acc + s.bookings, 0)}</Heading>
              </CardBody>
            </Card>
          </Grid>

          {/* Services Grid */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {services.map((service) => (
              <Card key={service.id} overflow="hidden" _hover={{ shadow: 'lg' }} transition="shadow 0.2s">
                <Box position="relative">
                  <Image
                    src={service.image}
                    alt={service.title}
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
                    <Text fontSize="sm">{service.price}</Text>
                  </HStack>

                  <HStack>
                    <ViewIcon color="gray.500" />
                    <Text fontSize="sm" color="gray.600">{service.location}</Text>
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
                    <Text>{service.bookings} bookings</Text>
                  </HStack>

                  <HStack>
                    <Button
                      variant="outline"
                      size="sm"
                      flex="1"
                      onClick={() => handleToggleStatus(service.id)}
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
                      onClick={() => handleDeleteService(service.id)}
                      colorScheme="red"
                    />
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}
