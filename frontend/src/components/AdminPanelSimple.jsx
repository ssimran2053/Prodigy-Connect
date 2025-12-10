import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Input,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Image,
  Center,
  Divider,
  Grid,
  Text,
  Heading,
  useToast,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { 
  ViewIcon,
  WarningIcon,
  CheckCircleIcon,
  SearchIcon,
  ArrowUpIcon,
  RepeatIcon,
  WarningTwoIcon,
  NotAllowedIcon,
  DownloadIcon,
  InfoIcon,
  CalendarIcon,
  ChatIcon,
  RepeatClockIcon,
  CloseIcon,
  StarIcon
} from '@chakra-ui/icons';

const mockReports = [
  {
    id: '1',
    reportedUser: {
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john-report',
      role: 'Provider'
    },
    reportedBy: { name: 'Jane Smith' },
    reason: 'Inappropriate Content',
    description: 'Posted services with misleading information.',
    date: new Date(2025, 9, 18),
    status: 'pending',
    severity: 'high'
  },
  {
    id: '2',
    reportedUser: {
      name: 'Sarah Lee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-report',
      role: 'Seeker'
    },
    reportedBy: { name: 'Mike Johnson' },
    reason: 'Spam Messages',
    description: 'Sending spam messages to multiple providers.',
    date: new Date(2025, 9, 17),
    status: 'pending',
    severity: 'medium'
  }
];

const mockUsers = [
  {
    id: '1',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    role: 'Provider',
    joinDate: new Date(2024, 5, 15),
    status: 'active',
    totalServices: 45,
    rating: 4.9
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    role: 'Provider',
    joinDate: new Date(2024, 7, 22),
    status: 'active',
    totalServices: 32,
    rating: 4.8
  },
  {
    id: '3',
    name: 'Lisa Martinez',
    email: 'lisa@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    role: 'Seeker',
    joinDate: new Date(2025, 1, 10),
    status: 'active',
    totalServices: 8
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    role: 'Provider',
    joinDate: new Date(2024, 3, 5),
    status: 'flagged',
    totalServices: 12,
    rating: 3.2
  }
];

export function AdminPanelSimple() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const pendingReports = mockReports.filter(r => r.status === 'pending');
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const flaggedUsers = mockUsers.filter(u => u.status === 'flagged').length;

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportAction = async (reportId, action) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: action === 'resolve' ? 'Report resolved' : 'Report dismissed',
      description: action === 'resolve' ? 'User has been suspended.' : 'The report has been dismissed.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setIsProcessing(false);
  };

  const handleUserAction = async (userId, action) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const messages = {
      suspend: 'User suspended successfully',
      activate: 'User activated successfully',
      verify: 'User verified successfully'
    };
    
    toast({
      title: 'Action Completed',
      description: messages[action] || 'Action completed',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setIsProcessing(false);
  };

  return (
    <Box maxW="7xl" mx="auto">
      <Flex mb="6" align="center" justify="space-between">
        <Box>
          <Heading as="h1" size="xl" mb="2">Admin Dashboard</Heading>
          <Text color="gray.600">Monitor and manage platform activity</Text>
        </Box>
        <HStack spacing="2">
          <Button variant="outline" size="sm" leftIcon={<RepeatClockIcon />}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" leftIcon={<DownloadIcon />}>
            Export
          </Button>
        </HStack>
      </Flex>

      <Grid templateColumns="repeat(4, 1fr)" gap="6" mb="6">
        <Card>
          <CardBody>
            <Flex align="center" justify="space-between" mb="3">
              <Center w="12" h="12" bg="blue.100" borderRadius="xl">
                <ViewIcon boxSize="24px" color="blue.600" />
              </Center>
              <ArrowUpIcon boxSize="20px" color="green.600" />
            </Flex>
            <Heading as="h2" size="2xl" mb="1">{totalUsers}</Heading>
            <Text color="gray.600" fontSize="sm">Total Users</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Flex align="center" justify="space-between" mb="3">
              <Center w="12" h="12" bg="green.100" borderRadius="xl">
                <RepeatIcon boxSize="24px" color="green.600" />
              </Center>
              <Badge colorScheme="green">{Math.round(activeUsers / totalUsers * 100)}%</Badge>
            </Flex>
            <Heading as="h2" size="2xl" mb="1">{activeUsers}</Heading>
            <Text color="gray.600" fontSize="sm">Active Users</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Flex align="center" justify="space-between" mb="3">
              <Center w="12" h="12" bg="yellow.100" borderRadius="xl">
                <WarningTwoIcon boxSize="24px" color="yellow.600" />
              </Center>
              {pendingReports.length > 0 && (
                <Badge colorScheme="red" variant="solid" animation="pulse 1.5s infinite">
                  {pendingReports.length}
                </Badge>
              )}
            </Flex>
            <Heading as="h2" size="2xl" mb="1">{pendingReports.length}</Heading>
            <Text color="gray.600" fontSize="sm">Pending Reports</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Flex align="center" justify="space-between" mb="3">
              <Center w="12" h="12" bg="red.100" borderRadius="xl">
                <WarningIcon boxSize="24px" color="red.600" />
              </Center>
            </Flex>
            <Heading as="h2" size="2xl" mb="1">{flaggedUsers}</Heading>
            <Text color="gray.600" fontSize="sm">Flagged Users</Text>
          </CardBody>
        </Card>
      </Grid>
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>User Management</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="6">
              <VStack spacing="6">
                <Card w="full">
                  <CardBody>
                  <Heading as="h3" size="md" mb="4">Recent Activity</Heading>
                  <VStack align="stretch" spacing="4">
                  {[
                  { action: 'New provider registered', user: 'Emily Rodriguez', time: '2 mins ago', icon: CheckCircleIcon, color: 'green' },
                  { action: 'Service booking completed', user: 'Michael Chen', time: '15 mins ago', icon: CheckCircleIcon, color: 'blue' },
                  { action: 'Report submitted', user: 'Sarah Lee', time: '1 hour ago', icon: WarningTwoIcon, color: 'yellow' },
                  { action: 'User verified', user: 'David Park', time: '2 hours ago', icon: CheckCircleIcon, color: 'purple' },
                  { action: 'Payment processed', user: 'Lisa Martinez', time: '3 hours ago', icon: InfoIcon, color: 'green' }
                ].map((item, index) => (
                  <Flex key={index} align="center" p="3" bg="gray.50" borderRadius="lg">
                    <Center w="10" h="10" bg={`${item.color}.100`} borderRadius="full" mr="4">
                      <item.icon boxSize="20px" color={`${item.color}.600`} />
                    </Center>
                    <Box>
                      <Text fontWeight="medium">{item.action}</Text>
                      <Text fontSize="sm" color="gray.600">{item.user}</Text>
                    </Box>
                    <Spacer />
                    <Text fontSize="xs" color="gray.500">{item.time}</Text>
                  </Flex>
                ))}
                </VStack>
                  </CardBody>
                </Card>
              </VStack>
              <VStack spacing="6">
              <Card w="full">
                  <CardBody>
                  <Heading as="h3" size="md" mb="4">Quick Stats</Heading>
                  <VStack align="stretch" spacing="4">
                  <Box>
                  <Flex justify="space-between" align="center" mb="1">
                    <Text fontSize="sm" color="gray.600">Provider Growth</Text>
                    <Text fontSize="sm" fontWeight="medium">+18%</Text>
                  </Flex>
                  <Box w="full" bg="gray.200" borderRadius="full" h="2">
                    <Box bg="blue.600" h="2" borderRadius="full" w="75%" />
                  </Box>
                </Box>
                <Box>
                  <Flex justify="space-between" align="center" mb="1">
                    <Text fontSize="sm" color="gray.600">Seeker Engagement</Text>
                    <Text fontSize="sm" fontWeight="medium">+24%</Text>
                  </Flex>
                  <Box w="full" bg="gray.200" borderRadius="full" h="2">
                    <Box bg="green.600" h="2" borderRadius="full" w="85%" />
                  </Box>
                </Box>
                <Box>
                  <Flex justify="space-between" align="center" mb="1">
                    <Text fontSize="sm" color="gray.600">Booking Conversion</Text>
                    <Text fontSize="sm" fontWeight="medium">+12%</Text>
                  </Flex>
                  <Box w="full" bg="gray.200" borderRadius="full" h="2">
                    <Box bg="purple.600" h="2" borderRadius="full" w="68%" />
                  </Box>
                </Box>
                <Box>
                  <Flex justify="space-between" align="center" mb="1">
                    <Text fontSize="sm" color="gray.600">User Satisfaction</Text>
                    <Text fontSize="sm" fontWeight="medium">4.8/5.0</Text>
                  </Flex>
                  <Box w="full" bg="gray.200" borderRadius="full" h="2">
                    <Box bg="yellow.500" h="2" borderRadius="full" w="96%" />
                  </Box>
                </Box>
                  </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Grid>
          </TabPanel>
          <TabPanel>
          <VStack spacing="6" align="stretch">
            {pendingReports.length > 0 && (
              <Card>
                <CardBody>
                  <Heading as="h3" size="md" mb="4">Pending Reports ({pendingReports.length})</Heading>
                  <VStack spacing="4" align="stretch">
                    {pendingReports.map(report => (
                      <Card key={report.id} p="4" bg={report.severity === 'high' ? 'red.50' : 'yellow.50'} borderWidth="1px" borderColor={report.severity === 'high' ? 'red.200' : 'yellow.200'}>
                        <Flex align="start" gap="4">
                          <Image src={report.reportedUser.avatar} alt={report.reportedUser.name} boxSize="12" borderRadius="full" />
                          <Box>
                            <Flex align="center" gap="2" mb="1">
                              <Text fontWeight="bold">{report.reportedUser.name}</Text>
                              <Badge>{report.reportedUser.role}</Badge>
                              <Badge colorScheme={report.severity === 'high' ? 'red' : 'yellow'}>{report.severity}</Badge>
                            </Flex>
                            <Text fontSize="sm" color="gray.600" mb="2">Reported by {report.reportedBy.name} • {report.date.toLocaleDateString()}</Text>
                            <Text fontSize="sm" mb="2"><Text as="span" fontWeight="medium">Reason:</Text> {report.reason}</Text>
                            <Text fontSize="sm" bg="white" p="2" borderRadius="md" border="1px" borderColor="gray.200">{report.description}</Text>
                            <HStack mt="3" spacing="2">
                              <Button size="sm" colorScheme="red" onClick={() => handleReportAction(report.id, 'resolve')} isLoading={isProcessing} leftIcon={<NotAllowedIcon />}>
                                Suspend User
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleReportAction(report.id, 'dismiss')} isLoading={isProcessing} leftIcon={<CloseIcon />}>
                                Dismiss
                              </Button>
                            </HStack>
                          </Box>
                        </Flex>
                      </Card>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardBody>
                <Flex mb="4" align="center" justify="space-between">
                  <Heading as="h3" size="md">All Users</Heading>
                  <Input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} w="64" />
                </Flex>
                <VStack spacing="3" align="stretch">
                  {filteredUsers.map(user => (
                    <Card key={user.id} p="4" _hover={{ shadow: 'md' }} transition="shadow 0.2s">
                      <Flex align="center" justify="space-between">
                        <Flex align="center" gap="4">
                          <Image src={user.avatar} alt={user.name} boxSize="12" borderRadius="full" />
                          <Box>
                            <Flex align="center" gap="2" mb="1">
                              <Text fontWeight="medium">{user.name}</Text>
                              <Badge colorScheme={user.status === 'active' ? 'green' : 'red'}>{user.status}</Badge>
                              <Badge variant="outline">{user.role}</Badge>
                            </Flex>
                            <Text fontSize="sm" color="gray.600">{user.email}</Text>
                          </Box>
                        </Flex>
                        <HStack spacing="2">
                          {user.status === 'active' ? (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, 'suspend')} isLoading={isProcessing} leftIcon={<NotAllowedIcon />}>
                              <Text as="span" ml="1.5">Suspend</Text>
                            </Button>
                          ) : (
                            <Button size="sm" colorScheme="green" onClick={() => handleUserAction(user.id, 'activate')} isLoading={isProcessing} leftIcon={<CheckCircleIcon />}>
                              <Text as="span" ml="1.5">Activate</Text>
                            </Button>
                          )}
                          {user.role === 'Provider' && (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, 'verify')} isLoading={isProcessing} leftIcon={<CheckCircleIcon />}>
                              <Text as="span" ml="1.5">Verify</Text>
                            </Button>
                          )}
                        </HStack>
                      </Flex>
                    </Card>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

