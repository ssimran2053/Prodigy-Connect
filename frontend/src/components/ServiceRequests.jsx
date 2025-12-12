import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Badge,
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
  Flex,
  Image,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  Center
} from '@chakra-ui/react';
import { TimeIcon, CheckCircleIcon, CloseIcon, ChatIcon, CalendarIcon, InfoIcon, ViewIcon } from '@chakra-ui/icons';
import { bookingsAPI } from '../../services/api';


export function ServiceRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [response, setResponse] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const userId = user?._id || user?.id;
        if (userId) {
          const response = await bookingsAPI.getBookings({ providerId: userId });
          setRequests(response.data);
        } else {
          setRequests([]);
        }
      } catch (err) {
        setError(err);
        toast({
          title: 'Failed to load service requests',
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
      fetchRequests();
    } else {
      setLoading(false);
      setRequests([]);
    }
  }, [user, toast]);


  const handleAcceptRequest = async (requestId) => {
    setLoading(true);
    try {
      await bookingsAPI.confirmBooking(requestId);
      setRequests(requests.map(r =>
        (r._id || r.id) === requestId ? { ...r, status: 'confirmed' } : r
      ));
      toast({
        title: 'Request accepted! Client will be notified.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setShowResponseDialog(false);
    } catch (err) {
      toast({
        title: 'Failed to accept request',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRequest = (requestId) => {
    setRequests(requests.map(r =>
      (r._id || r.id) === requestId ? { ...r, status: 'declined' } : r
    ));
    toast({
      title: 'Request declined',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setShowResponseDialog(false);
  };

  const handleCompleteRequest = async (requestId) => {
    setLoading(true);
    try {
      await bookingsAPI.completeBooking(requestId);
      setRequests(requests.map(r =>
        (r._id || r.id) === requestId ? { ...r, status: 'completed' } : r
      ));
      toast({
        title: 'Request marked as completed!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to complete request',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = (request) => {
    setSelectedRequest(request);
    setShowResponseDialog(true);
  };

  const getRequestsByStatus = (status) => {
    if (status === 'all') return requests;
    return requests.filter(r => r.status === status);
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Remote';
    if (typeof location === 'string') return location;
    if (location.address || location.city || location.state) {
        return [location.address, location.city, location.state].filter(Boolean).join(', ');
    }
    return 'Remote';
  };

  const formatPrice = (price) => {
      if (!price) return 'N/A';
      if (typeof price === 'number') return `$${price}`;
      if (price.amount) return `$${price.amount}`;
      return 'N/A';
  };

  const RequestCard = ({ request }) => (
    <Card>
        <CardBody>
            <Flex justify="space-between" mb={3}>
                <HStack align="start" spacing={3} flex="1">
                <Image
                    src={request.seeker?.avatar}
                    alt={request.seeker?.name}
                    boxSize="12"
                    borderRadius="full"
                    fallbackSrc="https://via.placeholder.com/150"
                />
                <Box>
                    <HStack mb={1}>
                    <Heading size="sm">{request.seeker?.name || 'Unknown User'}</Heading>
                    {request.seeker?.rating && (
                        <HStack>
                            <Text color="yellow.500">★</Text>
                            <Text fontSize="sm">{request.seeker.rating}</Text>
                        </HStack>
                    )}
                    </HStack>
                    <Text fontSize="sm" color="gray.600">{formatTimeAgo(request.createdAt)}</Text>
                </Box>
                </HStack>
            </Flex>
    
            <Box mb={3}>
                <Flex justify="space-between" mb={2}>
                <Heading size="sm">{request.service?.title || 'Service'}</Heading>
                <Badge variant="outline">{request.service?.category || 'General'}</Badge>
                </Flex>
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {request.notes || 'No additional notes provided.'}
                </Text>
            </Box>
    
            <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={4} fontSize="sm">
                <HStack color="gray.600">
                <InfoIcon />
                <Text>{formatPrice(request.price)}</Text>
                </HStack>
                <HStack color="gray.600">
                <CalendarIcon />
                <Text>{new Date(request.scheduledDate).toLocaleDateString()} {request.scheduledTime}</Text>
                </HStack>
                <HStack color="gray.600" gridColumn="span 2">
                <ViewIcon />
                <Text>{formatLocation(request.location)}</Text>
                </HStack>
            </Grid>
    
            {request.status === 'pending' && (
                <HStack>
                <Button
                    size="sm"
                    flex="1"
                    colorScheme="blue"
                    onClick={() => handleRespondToRequest(request)}
                    leftIcon={<CheckCircleIcon />}
                >
                    Accept
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    flex="1"
                    onClick={() => handleDeclineRequest(request._id || request.id)}
                    leftIcon={<CloseIcon />}
                >
                    Decline
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: 'Opening message thread...', status: 'info', duration: 3000, isClosable: true })}
                    leftIcon={<ChatIcon />}
                >
                </Button>
                </HStack>
            )}
    
            {request.status === 'confirmed' && (
                <HStack>
                <Badge colorScheme="green">
                    Confirmed - Awaiting Booking
                </Badge>
                <Button
                    size="sm"
                    colorScheme="green"
                    ml="auto"
                    onClick={() => handleCompleteRequest(request._id || request.id)}
                    leftIcon={<CheckCircleIcon />}
                >
                    Complete
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: 'Opening message thread...', status: 'info', duration: 3000, isClosable: true })}
                    leftIcon={<ChatIcon />}
                >
                    Message
                </Button>
                </HStack>
            )}
    
            {request.status === 'declined' && (
                <Badge variant="outline" colorScheme="gray">
                Declined
                </Badge>
            )}
    
            {request.status === 'completed' && (
                <Badge colorScheme="blue">
                Completed
                </Badge>
            )}
        </CardBody>
    </Card>
  );

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
          <Box mb={6}>
            <Heading as="h1" size="2xl" mb={2}>Service Requests</Heading>
            <Text color="gray.600">
              Manage incoming service requests from clients in your area
            </Text>
          </Box>

          {/* Stats */}
          <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
            <Card>
                <CardBody>
                    <Flex justify="space-between">
                        <Box>
                        <Text fontSize="sm" color="gray.600">Pending</Text>
                        <Heading size="lg">{getRequestsByStatus('pending').length}</Heading>
                        </Box>
                        <Center w="12" h="12" borderRadius="full" bg="orange.100">
                        <TimeIcon color="orange.600" />
                        </Center>
                    </Flex>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Flex justify="space-between">
                        <Box>
                        <Text fontSize="sm" color="gray.600">Confirmed</Text>
                        <Heading size="lg">{getRequestsByStatus('confirmed').length}</Heading>
                        </Box>
                        <Center w="12" h="12" borderRadius="full" bg="green.100">
                        <CheckCircleIcon color="green.600" />
                        </Center>
                    </Flex>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Flex justify="space-between">
                        <Box>
                        <Text fontSize="sm" color="gray.600">Completed</Text>
                        <Heading size="lg">{getRequestsByStatus('completed').length}</Heading>
                        </Box>
                        <Center w="12" h="12" borderRadius="full" bg="blue.100">
                        <Text fontSize="2xl">✓</Text>
                        </Center>
                    </Flex>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Flex justify="space-between">
                        <Box>
                        <Text fontSize="sm" color="gray.600">Total</Text>
                        <Heading size="lg">{requests.length}</Heading>
                        </Box>
                        <Center w="12" h="12" borderRadius="full" bg="purple.100">
                        <ChatIcon color="purple.600" />
                        </Center>
                    </Flex>
                </CardBody>
            </Card>
          </Grid>

          {/* Tabs */}
          <Tabs variant="enclosed-colored">
            <TabList>
              <Tab>
                Pending ({getRequestsByStatus('pending').length})
              </Tab>
              <Tab>
                Confirmed ({getRequestsByStatus('confirmed').length})
              </Tab>
              <Tab>
                Completed ({getRequestsByStatus('completed').length})
              </Tab>
              <Tab>
                All Requests ({requests.length})
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {getRequestsByStatus('pending').length > 0 ? (
                    <VStack spacing={4}>
                        {getRequestsByStatus('pending').map(request => (
                        <RequestCard key={request._id || request.id} request={request} />
                        ))}
                    </VStack>
                ) : (
                    <Center py={12}>
                    <Text color="gray.600">No pending requests</Text>
                    </Center>
                )}
              </TabPanel>

              <TabPanel>
                {getRequestsByStatus('confirmed').length > 0 ? (
                    <VStack spacing={4}>
                        {getRequestsByStatus('confirmed').map(request => (
                        <RequestCard key={request._id || request.id} request={request} />
                        ))}
                    </VStack>
                ) : (
                    <Center py={12}>
                    <Text color="gray.600">No confirmed requests</Text>
                    </Center>
                )}
              </TabPanel>

              <TabPanel>
                {getRequestsByStatus('completed').length > 0 ? (
                    <VStack spacing={4}>
                        {getRequestsByStatus('completed').map(request => (
                        <RequestCard key={request._id || request.id} request={request} />
                        ))}
                    </VStack>
                ) : (
                    <Center py={12}>
                    <Text color="gray.600">No completed requests</Text>
                    </Center>
                )}
              </TabPanel>

              <TabPanel>
                <VStack spacing={4}>
                    {requests.map(request => (
                    <RequestCard key={request._id || request.id} request={request} />
                    ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Response Dialog */}
          <Modal isOpen={showResponseDialog} onClose={() => setShowResponseDialog(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Accept Service Request<ModalCloseButton /></ModalHeader>
              <ModalBody>
                <Text mb={4}>Review the request details and send a message to the client.</Text>

                {selectedRequest && (
                  <VStack spacing={4} align="stretch">
                    <Box p={3} bg="gray.50" borderRadius="lg">
                      <Text fontSize="sm" mb={1} color="gray.600">Service Type</Text>
                      <Text>{selectedRequest.service?.title}</Text>
                    </Box>

                    <Box p={3} bg="gray.50" borderRadius="lg">
                      <Text fontSize="sm" mb={1} color="gray.600">Client</Text>
                      <Text>{selectedRequest.seeker?.name}</Text>
                    </Box>

                    <FormControl>
                      <FormLabel>Send a message (optional)</FormLabel>
                      <Textarea
                        placeholder="Let the client know when you can start, ask questions, or provide additional details..."
                        rows={4}
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                      />
                    </FormControl>
                  </VStack>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowResponseDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => selectedRequest && handleAcceptRequest(selectedRequest._id || selectedRequest.id)}
                >
                  Accept Request
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
}