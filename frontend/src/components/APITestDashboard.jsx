import { useState } from 'react';
import {
  Box,
  Button,
  Badge,
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
  Flex,
  Code
} from '@chakra-ui/react';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Server,
  Users,
  Package,
  Calendar,
  Star,
  MessageSquare,
  Shield,
  Activity
} from 'lucide-react';
import API from '../../services/api';

export function APITestDashboard() {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Test definitions
  const tests = {
    health: {
      name: 'Health Check',
      icon: Activity,
      endpoint: '/api/health',
      description: 'Test if the server is running',
      test: async () => {
        return await API.health.check();
      }
    },
    auth: {
      name: 'Authentication',
      icon: Shield,
      endpoint: '/api/auth/*',
      description: 'Test auth endpoints (register, login)',
      test: async () => {
        // Test registration
        const registerData = {
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'Test123!@#',
          role: 'seeker'
        };
        
        try {
          const result = await API.auth.register(registerData);
          
          // Test getting current user
          const meResult = await API.auth.getMe();
          
          return {
            success: true,
            register: result,
            getMe: meResult
          };
        } catch (error) {
          throw new Error(`Auth test failed: ${error.message}`);
        }
      }
    },
    services: {
        name: 'Services',
        icon: Package,
        endpoint: '/api/services/*',
        description: 'Test service CRUD operations',
        test: async () => {
          try {
            // Get all services
            const allServices = await API.services.getServices();
            
            return {
              success: true,
              allServices
            };
          } catch (error) {
            throw new Error(`Services test failed: ${error.message}`);
          }
        }
      },
      bookings: {
        name: 'Bookings',
        icon: Calendar,
        endpoint: '/api/bookings/*',
        description: 'Test booking operations',
        test: async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('Authentication required - Please login first');
            }
            
            const bookings = await API.bookings.getBookings();
            
            return {
              success: true,
              bookings
            };
          } catch (error) {
            throw new Error(`Bookings test failed: ${error.message}`);
          }
        }
      },
  };

  const runTest = async (testKey) => {
    setTesting(true);
    setSelectedTest(testKey);
    
    try {
      const startTime = Date.now();
      const result = await tests[testKey].test();
      const endTime = Date.now();
      
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          status: 'success',
          data: result,
          duration: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setTesting(false);
      setSelectedTest(null);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    
    for (const testKey of Object.keys(tests)) {
      await runTest(testKey);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTesting(false);
  };

  const clearResults = () => {
    setTestResults({});
  };

  const getStatusColorScheme = (status) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <XCircle />;
      default:
        return <Server />;
    }
  };

  return (
    <Box bg="gray.50" p="6" minH="100vh">
      <Box maxW="7xl" mx="auto">
        <Box mb="8">
          <Flex justify="space-between" align="center" mb="4">
            <Box>
              <Heading as="h1" size="xl" mb="2">API Test Dashboard</Heading>
              <Text color="gray.600">Test all Prodigy Connect backend endpoints</Text>
            </Box>
            <HStack>
              <Button colorScheme="blue" onClick={runAllTests} isLoading={testing} loadingText="Testing...">
                Run All Tests
              </Button>
              <Button variant="outline" onClick={clearResults} isDisabled={testing}>
                Clear Results
              </Button>
            </HStack>
          </Flex>
          <Card bg="blue.50" borderWidth="1px" borderColor="blue.200">
            <CardBody>
              <HStack color="blue.900">
                <Server size="20" />
                <Text fontWeight="medium">API URL:</Text>
                <Code>{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</Code>
              </HStack>
            </CardBody>
          </Card>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="4" mb="8">
          {Object.entries(tests).map(([key, test]) => {
            const result = testResults[key];
            const Icon = test.icon;
            
            return (
              <Card key={key} transition="all 0.2s" _hover={{ shadow: 'lg' }}>
                <CardBody>
                  <Flex justify="space-between" align="start" mb="4">
                    <HStack>
                      <Box p="2" bg="white" borderRadius="lg" shadow="sm">
                        <Icon size="24" />
                      </Box>
                      <Box>
                        <Text fontWeight="medium">{test.name}</Text>
                        <Code fontSize="xs">{test.endpoint}</Code>
                      </Box>
                    </HStack>
                    {result && (
                      <Box color={getStatusColorScheme(result.status) + ".600"}>
                        {getStatusIcon(result.status)}
                      </Box>
                    )}
                  </Flex>

                  <Text fontSize="sm" color="gray.600" mb="4">{test.description}</Text>

                  {result && (
                    <Box mb="4" p="3" bg="white" borderRadius="md" borderWidth="1px">
                      <VStack align="stretch" fontSize="xs" spacing="1">
                        <HStack justify="space-between">
                          <Text color="gray.600">Status:</Text>
                          <Badge colorScheme={getStatusColorScheme(result.status)}>{result.status}</Badge>
                        </HStack>
                        {result.duration && (
                           <HStack justify="space-between">
                           <Text color="gray.600">Duration:</Text>
                           <Text>{result.duration}ms</Text>
                         </HStack>
                        )}
                        <HStack justify="space-between">
                          <Text color="gray.600">Time:</Text>
                          <Text>{new Date(result.timestamp).toLocaleTimeString()}</Text>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  <Button
                    w="full"
                    onClick={() => runTest(key)}
                    isLoading={testing && selectedTest === key}
                    loadingText="Testing..."
                    colorScheme={result ? getStatusColorScheme(result.status) : 'gray'}
                    variant={result ? 'solid' : 'outline'}
                  >
                    Run Test
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
