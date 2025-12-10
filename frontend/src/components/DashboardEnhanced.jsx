import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
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
  Grid,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  Avatar,
  IconButton,
  Badge,
  createIcon // Added to create custom icons without external deps
} from '@chakra-ui/react';
import { ServiceListings } from './ServiceListings';
import { MessagingPanel } from './MessagingPanel';
import { CalendarView } from './CalendarView';
import { MapView } from './MapView';
import { AdminPanelSimple } from './AdminPanelSimple';
import { ProfileView } from './ProfileView';
import { NotificationButton } from './NotificationPanel';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { PaymentSystem } from './PaymentSystem';
import { AdvancedBooking } from './AdvancedBooking';
import { AdvancedFilters } from './AdvancedFilters';
import { GlobalSearch, SearchButton } from './GlobalSearchEnhanced';
import { PostedServices } from './PostedServices';
import { ServiceRequests } from './ServiceRequests';
import { ProviderReviews } from './ProviderReviews';
import { SettingsPanel } from './SettingsPanel';
import { 
  InfoIcon,
  SearchIcon,
  ChatIcon,
  CalendarIcon,
  ViewIcon,
  CheckCircleIcon,
  RepeatClockIcon,
  AddIcon,
  StarIcon,
  SettingsIcon,
  ArrowUpIcon,
  UpDownIcon,
  BellIcon
} from '@chakra-ui/icons';
import logoImageLight from '../assets/c4928b5b313acf796a0d321d9c48650523bf2f6f.png';

// --- Custom Icons ---

const HomeIcon = createIcon({
  displayName: 'HomeIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
    />
  ),
});

const PaymentIcon = createIcon({
  displayName: 'PaymentIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
    />
  ),
});

// --------------------

export function DashboardEnhanced({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('home');
  const [serviceToBook, setServiceToBook] = useState(null);
  const [userToMessage, setUserToMessage] = useState(null);
  const { isOpen: isPostServiceOpen, onOpen: onPostServiceOpen, onClose: onPostServiceClose } = useDisclosure();
  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  const handleSelectServiceToBook = (service) => {
    setServiceToBook(service);
    setCurrentView('booking');
  };

  const handleStartMessage = (recipient) => {
    setUserToMessage(recipient);
    setCurrentView('messages');
  };

  const handleViewChange = (view) => {
    if (view !== 'messages') {
      setUserToMessage(null);
    }
    setCurrentView(view);
  };

  // Custom Icon wrapper using Global Variables
  const NavIcon = ({ icon, isActive }) => (
    <Icon 
      as={icon} 
      boxSize="5" 
      mr="3" 
      color={isActive ? "var(--primary-foreground)" : "var(--muted-foreground)"} 
      transition="color 0.2s"
    />
  );

  const navigation = [
    { id: 'home', label: 'Home', icon: HomeIcon, show: true }, // Updated Icon
    { id: 'browse', label: 'Browse Services', icon: SearchIcon, show: user.role !== 'provider' },
    { id: 'favorites', label: 'Favorites', icon: StarIcon, show: user.role === 'seeker' },
    { id: 'booking', label: 'Book Services', icon: CalendarIcon, show: user.role === 'seeker' },
    { id: 'posted-services', label: 'Posted Services', icon: AddIcon, show: user.role === 'provider' },
    { id: 'requests', label: 'Requests', icon: ChatIcon, show: user.role === 'provider' },
    { id: 'messages', label: 'Messages', icon: ChatIcon, show: true },
    { 
      id: 'calendar', 
      label: user.role === 'seeker' ? 'My Bookings' : 'My Calendar', 
      icon: CalendarIcon, 
      show: user.role !== 'admin'
    },
    { id: 'map', label: 'Map', icon: ViewIcon, show: user.role === 'seeker' || user.role === 'admin' },
    { id: 'payments', label: 'Payments', icon: PaymentIcon, show: user.role == 'provider' },
    { id: 'reviews', label: 'Reviews & Ratings', icon: StarIcon, show: user.role === 'provider' },
    { id: 'filters', label: 'Advanced Search', icon: UpDownIcon, show: user.role === 'seeker' },
    { id: 'analytics', label: 'Platform Analytics', icon: ArrowUpIcon, show: user.role === 'admin' },
    { id: 'admin', label: 'Admin Panel', icon: CheckCircleIcon, show: user.role === 'admin' },
    { id: 'profile', label: 'Profile', icon: ViewIcon, show: true },
  ].filter(item => item.show);

  return (
    <Box minH="100vh" bg="var(--background)" color="var(--foreground)">
      {/* Header */}
      <Flex 
        as="header" 
        bg="var(--card)" 
        borderBottomWidth="1px" 
        borderColor="var(--border)"
        position="sticky" 
        top="0" 
        zIndex="40" 
        px="6" 
        py="3" 
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap="3">
          <Box w="8" h="8">
            <Image 
              src={logoImageLight} 
              alt="Prodigy Connect" 
              boxSize="100%"
              objectFit="contain" 
            />
          </Box>
          <Text fontSize="xl" fontWeight="bold" color="var(--foreground)">Prodigy Connect</Text>
            {user.role === 'admin' && (
              <Text fontSize="xs" bg="red.100" color="red.700" px="2" py="0.5" borderRadius="md">Admin</Text>
            )}
            {user.role === 'provider' && (
              <Text fontSize="xs" bg="blue.100" color="blue.700" px="2" py="0.5" borderRadius="md">Provider</Text>
            )}
        </Flex>

        <Flex align="center" gap="4">
          <SearchButton onClick={onSearchOpen} />
          <NotificationButton />
          {user.role === 'provider' && (
            <Button 
              size="sm"
              bg="var(--primary)"
              color="white"
              _hover={{ bg: 'var(--primary-hover)' }}
              onClick={onPostServiceOpen}
              leftIcon={<AddIcon />}
              title="Create a new service listing"
            >
              Post Service
            </Button>
          )}

          <Flex align="center" gap="3" pl="4" borderLeft="1px solid" borderColor="var(--border)">
            <Avatar 
              size="sm" 
              name={user.name} 
              src={user.avatar} 
              bg="var(--primary-light)"
              color="var(--primary)"
            />
            <Box display={{ base: 'none', md: 'block' }} lineHeight="1.2">
              <Text fontSize="sm" fontWeight="semibold" color="var(--foreground)">{user.name}</Text>
              <Text fontSize="xs" color="var(--muted-foreground)">{user.location}</Text>
            </Box>
            <Menu>
              <MenuButton 
                as={IconButton} 
                icon={<SettingsIcon />} 
                variant="ghost" 
                size="sm" 
                borderRadius="full" 
                color="var(--muted-foreground)"
                _hover={{ bg: "var(--muted)", color: "var(--foreground)" }}
              />
              <MenuList bg="var(--popover)" borderColor="var(--border)">
                <MenuItem icon={<SettingsIcon />} onClick={onSettingsOpen} _hover={{ bg: "var(--muted)" }}>Settings</MenuItem>
                <MenuItem icon={<RepeatClockIcon />} onClick={onLogout} _hover={{ bg: "var(--muted)" }}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Flex>

      <Flex>
        {/* Sidebar Navigation */}
        <Box 
          as="aside" 
          position="sticky" 
          top="65px" 
          h="calc(100vh - 65px)" 
          bg="var(--sidebar)" 
          borderRightWidth="1px" 
          borderColor="var(--sidebar-border)"
          w="64"
          display={{ base: 'none', md: 'block' }}
        >
          <Box px="6" py="6">
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="var(--muted-foreground)" mb="4" letterSpacing="wider">
              Navigation
            </Text>
            <VStack spacing="2" align="stretch">
              {navigation.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    justifyContent="flex-start"
                    variant="ghost"
                    h="10"
                    px="4"
                    // Apply global gradient class when active
                    className={isActive ? "bg-gradient-primary" : ""}
                    bg={isActive ? undefined : 'transparent'}
                    // Use CSS variables for text colors
                    color={isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)'}
                    fontWeight={isActive ? 'semibold' : 'medium'}
                    _hover={!isActive ? { bg: 'var(--sidebar-accent)', color: 'var(--sidebar-primary)' } : { opacity: 0.9 }}
                    borderRadius="lg"
                    leftIcon={<NavIcon icon={item.icon} isActive={isActive} />}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </VStack>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box as="main" flex="1" p="8" overflowY="auto" h="calc(100vh - 65px)" bg="var(--background)">
          {currentView === 'home' && <HomeView user={user} onNavigate={handleViewChange} />}
          {currentView === 'browse' && <ServiceListings user={user} onBookService={handleSelectServiceToBook} onStartMessage={handleStartMessage} />}
          {currentView === 'posted-services' && <PostedServices user={user} />}
          {currentView === 'requests' && <ServiceRequests user={user} />}
          {currentView === 'favorites' && <ServiceListings user={user} favoritesOnly onBookService={handleSelectServiceToBook} onStartMessage={handleStartMessage} />}
          {currentView === 'messages' && <MessagingPanel user={user} initialUserToMessage={userToMessage} />}
          {currentView === 'calendar' && <CalendarView user={user} />}
          {currentView === 'booking' && <AdvancedBooking user={user} serviceToBook={serviceToBook} />}
          {currentView === 'map' && <MapView user={user} />}
          {currentView === 'analytics' && <AnalyticsDashboard userRole={user.role} />}
          {currentView === 'payments' && <PaymentSystem />}
          {currentView === 'reviews' && <ProviderReviews providerId={user.id} providerName={user.name} />}
          {currentView === 'filters' && <AdvancedFilters />}
          {currentView === 'profile' && <ProfileView user={user} isOwnProfile />}
          {currentView === 'admin' && user.role === 'admin' && <AdminPanelSimple />}
        </Box>
      </Flex>

      <PostServiceModal isOpen={isPostServiceOpen} onClose={onPostServiceClose} />
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={onSearchClose} 
        onNavigate={(view) => setCurrentView(view)}
        userRole={user.role}
      />
      {isSettingsOpen && <SettingsPanel user={user} onClose={onSettingsClose} />}
    </Box>
  );
}

function HomeView({ user, onNavigate }) {
  return (
    <Box maxW="6xl" mx="auto">
      <Box mb="8">
        <Heading as="h1" size="lg" mb="1" color="var(--foreground)">
          Welcome back, {user.name}!
        </Heading>
        <Text color="var(--muted-foreground)" fontSize="lg">
          Find the perfect service provider for your needs
        </Text>
      </Box>

      {/* Stats Grid */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={8}>
        <Card bg="var(--card)" shadow="sm" borderRadius="xl" border="1px solid" borderColor="var(--border)">
          <CardBody p="6">
            <Heading size="2xl" mb="2" color="var(--foreground)" fontWeight="medium">247</Heading>
            <Text color="var(--muted-foreground)" fontSize="md">
              {user.role === 'provider' ? 'Profile Views' : 'Services Available'}
            </Text>
          </CardBody>
        </Card>
        <Card bg="var(--card)" shadow="sm" borderRadius="xl" border="1px solid" borderColor="var(--border)">
          <CardBody p="6">
            <Heading size="2xl" mb="2" color="var(--foreground)" fontWeight="medium">18</Heading>
            <Text color="var(--muted-foreground)" fontSize="md">
              {user.role === 'provider' ? 'Active Requests' : 'Saved Favorites'}
            </Text>
          </CardBody>
        </Card>
        <Card bg="var(--card)" shadow="sm" borderRadius="xl" border="1px solid" borderColor="var(--border)">
          <CardBody p="6">
            <Heading size="2xl" mb="2" color="var(--foreground)" fontWeight="medium">
              {user.role === 'provider' ? '4.8' : '12'}
            </Heading>
            <Text color="var(--muted-foreground)" fontSize="md">
              {user.role === 'provider' ? 'Average Rating' : 'Messages'}
            </Text>
          </CardBody>
        </Card>
      </Grid>

      {/* Quick Actions Banner - Uses Global Gradient */}
      <Box 
        className="bg-gradient-primary"
        color="white" 
        borderRadius="2xl" 
        p="8" 
        mb="8" 
        shadow="lg"
        position="relative"
        overflow="hidden"
      >
        <Box position="relative" zIndex="1">
          <Heading as="h2" size="lg" mb="2">Quick Actions</Heading>
          <Text mb="6" opacity="0.9" fontSize="lg">What would you like to do today?</Text>
          
          <HStack spacing="3">
            {user.role === 'provider' ? (
              <>
                <Button bg="whiteAlpha.300" _hover={{ bg: "whiteAlpha.400" }} color="white" onClick={() => onNavigate('posted-services')}>
                  Manage Services
                </Button>
                <Button bg="whiteAlpha.300" _hover={{ bg: "whiteAlpha.400" }} color="white" onClick={() => onNavigate('requests')}>
                  View Requests
                </Button>
              </>
            ) : user.role === 'admin' ? (
              <>
                <Button bg="whiteAlpha.300" _hover={{ bg: "whiteAlpha.400" }} color="white" onClick={() => onNavigate('admin')}>
                  User Management
                </Button>
                <Button bg="whiteAlpha.300" _hover={{ bg: "whiteAlpha.400" }} color="white" onClick={() => onNavigate('analytics')}>
                  Analytics
                </Button>
              </>
            ) : (
              <>
                <Button 
                  bg="whiteAlpha.300" 
                  _hover={{ bg: "whiteAlpha.400" }} 
                  color="white" 
                  fontWeight="medium"
                  px="6"
                  onClick={() => onNavigate('browse')}
                >
                  Browse Services
                </Button>
                <Button 
                  bg="whiteAlpha.300" 
                  _hover={{ bg: "whiteAlpha.400" }} 
                  color="white" 
                  fontWeight="medium"
                  px="6"
                  onClick={() => onNavigate('map')}
                >
                  View Map
                </Button>
                <Button 
                  bg="whiteAlpha.300" 
                  _hover={{ bg: "whiteAlpha.400" }} 
                  color="white" 
                  fontWeight="medium"
                  px="6"
                  onClick={() => onNavigate('favorites')}
                >
                  My Favorites
                </Button>
              </>
            )}
          </HStack>
        </Box>
      </Box>

      {/* Recent Activity */}
      <Card bg="var(--card)" shadow="sm" borderRadius="xl" border="1px solid" borderColor="var(--border)">
        <CardBody p="6">
          <Heading as="h2" size="md" mb="6" color="var(--foreground)">Recent Activity</Heading>
          <VStack spacing="0" align="stretch">
            {[
              { type: 'Plumbing', time: '1 hour ago', avatar: 'https://bit.ly/dan-abramov' },
              { type: 'Tutoring', time: '2 hours ago', avatar: 'https://bit.ly/kent-c-dodds' },
              { type: 'Landscaping', time: '3 hours ago', avatar: 'https://bit.ly/prosper-baba' }
            ].map((item, i) => (
              <Flex 
                key={i} 
                align="center" 
                gap="4" 
                py="4" 
                borderBottomWidth={i === 2 ? "0" : "1px"} 
                borderColor="var(--border)"
              >
                <Avatar size="md" src={item.avatar} name="User" />
                <Box flex="1">
                  <Text fontSize="md" color="var(--foreground)">
                    {user.role === 'provider' 
                      ? `New inquiry about your ${item.type} service`
                      : `New ${item.type} service available near you`}
                  </Text>
                  <Text fontSize="sm" color="var(--muted-foreground)">{item.time}</Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}

function PostServiceModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent borderRadius="xl" bg="var(--card)">
        <ModalHeader borderBottomWidth="1px" borderColor="var(--border)" color="var(--foreground)">Post a New Service</ModalHeader>
        <ModalBody py="6">
          <VStack as="form" spacing="5">
            <FormControl>
              <FormLabel fontWeight="medium" color="var(--foreground)">Service Title</FormLabel>
              <Input placeholder="e.g., Professional Plumbing Services" borderRadius="md" bg="var(--input-background)" borderColor="var(--input)" />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium" color="var(--foreground)">Category</FormLabel>
              <Select borderRadius="md" bg="var(--input-background)" borderColor="var(--input)">
                <option>Home Services</option>
                <option>Tutoring & Education</option>
                <option>Tech Support</option>
                <option>Creative Services</option>
                <option>Other</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium" color="var(--foreground)">Description</FormLabel>
              <Textarea rows={4} placeholder="Describe your service..." borderRadius="md" bg="var(--input-background)" borderColor="var(--input)" />
            </FormControl>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <FormControl>
                <FormLabel fontWeight="medium" color="var(--foreground)">Price Range</FormLabel>
                <Input placeholder="$50-100/hr" borderRadius="md" bg="var(--input-background)" borderColor="var(--input)" />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="medium" color="var(--foreground)">Location</FormLabel>
                <Input placeholder="Sacramento, CA" borderRadius="md" bg="var(--input-background)" borderColor="var(--input)" />
              </FormControl>
            </Grid>
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="var(--border)" bg="var(--muted)" borderBottomRadius="xl">
          <Button variant="ghost" mr={3} onClick={onClose} color="var(--muted-foreground)">Cancel</Button>
          <Button 
            className="btn-gradient-primary" // Use global gradient class
            colorScheme="blue" 
          >
            Post Service
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}