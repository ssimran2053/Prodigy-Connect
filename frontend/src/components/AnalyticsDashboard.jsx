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
  Grid,
  Flex,
  Heading,
  Text,
  useToast,
  VStack,
  HStack,
  Icon
} from '@chakra-ui/react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  InfoIcon, 
  ViewIcon, 
  CalendarIcon,
  StarIcon,
  DownloadIcon
} from '@chakra-ui/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const revenueData = [
    { month: 'Jan', revenue: 4200, bookings: 28 }, { month: 'Feb', revenue: 5100, bookings: 34 }, { month: 'Mar', revenue: 4800, bookings: 31 }, { month: 'Apr', revenue: 6200, bookings: 42 }, { month: 'May', revenue: 7500, bookings: 48 }, { month: 'Jun', revenue: 8100, bookings: 52 }, { month: 'Jul', revenue: 7800, bookings: 49 }, { month: 'Aug', revenue: 9200, bookings: 58 }, { month: 'Sep', revenue: 8500, bookings: 54 }, { month: 'Oct', revenue: 9800, bookings: 62 }
];
const serviceDistribution = [
    { name: 'Home Services', value: 35, color: '#3b82f6' }, { name: 'Education', value: 25, color: '#8b5cf6' }, { name: 'Tech Services', value: 20, color: '#10b981' }, { name: 'Health & Fitness', value: 12, color: '#f59e0b' }, { name: 'Other', value: 8, color: '#ef4444' }
];
const userGrowthData = [
    { week: 'Week 1', seekers: 120, providers: 45 }, { week: 'Week 2', seekers: 145, providers: 52 }, { week: 'Week 3', seekers: 168, providers: 58 }, { week: 'Week 4', seekers: 195, providers: 65 }, { week: 'Week 5', seekers: 220, providers: 71 }, { week: 'Week 6', seekers: 247, providers: 78 }
];
const topServices = [
    { name: 'Plumbing Repair', bookings: 142, revenue: '2,450', growth: 12.5 }, { name: 'Math Tutoring', bookings: 128, revenue: '$8,960', growth: 8.3 }, { name: 'Web Development', bookings: 98, revenue: '5,680', growth: 15.2 }, { name: 'Personal Training', bookings: 87, revenue: '$6,525', growth: -2.1 }, { name: 'Landscaping', bookings: 76, revenue: '1,400', growth: 5.8 }
];

export function AnalyticsDashboard({ userRole }) {
  const toast = useToast();

  return (
    <Box maxW="7xl" mx="auto" >
      <Flex mb="6" align="center" justify="space-between">
        <Box>
          <Heading as="h1" size="xl" mb="2">Platform Analytics</Heading>
          <Text color="gray.600">Monitor platform-wide performance and user activity</Text>
        </Box>
        <Button 
          colorScheme="blue" 
          onClick={() => toast({ title: 'Analytics report exported successfully', status: 'success', duration: 3000, isClosable: true })}
          leftIcon={<DownloadIcon />}
        >
          Export Report
        </Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
        <Card>
            <CardBody>
                <HStack justify="space-between" mb="2">
                    <Text fontSize="sm" color="gray.600">Total Revenue</Text>
                    <InfoIcon color="green.500" />
                </HStack>
                <Heading size="lg" mb="1">$71,300</Heading>
                <HStack fontSize="sm">
                    <Badge colorScheme="green" variant="subtle"><ArrowUpIcon /> +18.2%</Badge>
                    <Text color="gray.500">vs last month</Text>
                </HStack>
            </CardBody>
        </Card>
        {/* Other stat cards here */}
      </Grid>

      <Tabs variant="soft-rounded" colorScheme="blue" mt={6}>
        <TabList>
          <Tab>Revenue & Bookings</Tab>
          <Tab>Services</Tab>
          <Tab>User Growth</Tab>
          <Tab>Performance</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card><CardBody><ResponsiveContainer width="100%" height={350}><AreaChart data={revenueData}><defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient><linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/><stop offset="95%" stopColor="#fb7185" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" name="Revenue ($)"/><Area type="monotone" dataKey="bookings" stroke="#fb7185" fill="url(#colorBookings)" name="Bookings"/></AreaChart></ResponsiveContainer></CardBody></Card>
          </TabPanel>
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)"}} gap={6}>
                <Card><CardBody><Heading size="md" mb={4}>Service Distribution</Heading><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={serviceDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{serviceDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Heading size="md" mb={4}>Top Performing Services</Heading><VStack align="stretch" spacing={4}>{topServices.map(s => (<HStack key={s.name} p={3} bg="gray.50" borderRadius="md" justify="space-between"><Box><Text fontWeight="medium">{s.name}</Text><Text fontSize="sm" color="gray.600">{s.bookings} bookings</Text></Box><Box textAlign="right"><Text fontWeight="semibold" color="green.600">{s.revenue}</Text><HStack color={s.growth >= 0 ? 'green.600' : 'red.600'}><Icon as={s.growth >= 0 ? ArrowUpIcon : ArrowDownIcon} boxSize={3} /><Text fontSize="sm">{Math.abs(s.growth)}%</Text></HStack></Box></HStack>))}</VStack></CardBody></Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}