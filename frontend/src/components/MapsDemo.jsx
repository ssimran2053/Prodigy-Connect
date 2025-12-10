import { useState } from 'react';
import { MapPin, Navigation, Search, Map } from 'lucide-react';
import { 
    Box, 
    Heading, 
    Text, 
    Tabs, 
    TabList, 
    TabPanels, 
    Tab, 
    TabPanel, 
    Card, 
    CardHeader, 
    CardBody, 
    List, 
    ListItem, 
    ListIcon,
    Spinner,
    Code
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { MapView } from './MapView';
import { ServiceMap } from './ServiceMap';
import { LocationPicker } from './LocationPicker';
import { useCurrentLocation } from '../hooks/useGoogleMaps';

export function MapsDemo() {
  const { location: userLocation, loading: locationLoading } = useCurrentLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Sample services data
  const sampleServices = [
    {
      _id: '1',
      title: 'Professional Plumbing Services',
      description: 'Expert plumbing services for residential and commercial properties. 24/7 emergency service available.',
      category: 'Home Services',
      price: { amount: 75, type: 'hour' },
      rating: 4.8,
      totalReviews: 124,
      location: {
        address: '1234 Main St',
        city: 'Sacramento',
        state: 'CA',
        zipCode: '95814',
        coordinates: { lat: 38.5816, lng: -121.4944 }
      },
      provider: {
        name: 'John Smith',
        rating: 4.9
      }
    },
    {
      _id: '2',
      title: 'Expert Electrical Repair',
      description: 'Licensed electrician with 15+ years experience. Residential and commercial electrical services.',
      category: 'Home Services',
      price: { amount: 85, type: 'hour' },
      rating: 4.9,
      totalReviews: 89,
      location: {
        address: '5678 Oak Ave',
        city: 'Sacramento',
        state: 'CA',
        zipCode: '95825',
        coordinates: { lat: 38.6071, lng: -121.4165 }
      },
      provider: {
        name: 'Sarah Johnson',
        rating: 5.0
      }
    },
    {
      _id: '3',
      title: 'HVAC Installation & Repair',
      description: 'Complete heating and cooling solutions. Installation, repair, and maintenance services.',
      category: 'Home Services',
      price: { amount: 95, type: 'hour' },
      rating: 4.7,
      totalReviews: 156,
      location: {
        address: '9012 Elm St',
        city: 'Sacramento',
        state: 'CA',
        zipCode: '95831',
        coordinates: { lat: 38.5016, lng: -121.4585 }
      },
      provider: {
        name: 'Mike Davis',
        rating: 4.8
      }
    }
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  return (
    <Box p={6} maxW="7xl" mx="auto">
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>Google Maps Integration Demo</Heading>
        <Text color="gray.600">
          Explore the maps features for Prodigy Connect
        </Text>
      </Box>

      <Tabs>
        <TabList>
          <Tab><Map size={16} style={{marginRight: "8px"}} />Basic Map</Tab>
          <Tab><MapPin size={16} style={{marginRight: "8px"}} />Service Map</Tab>
          <Tab><Search size={16} style={{marginRight: "8px"}} />Location Picker</Tab>
          <Tab><Navigation size={16} style={{marginRight: "8px"}} />Current Location</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading as="h2" size="lg">Basic Map View</Heading>
                <Text>Interactive Google Map with search and current location features</Text>
              </CardHeader>
              <CardBody>
                <MapView
                  center={{ lat: 38.5816, lng: -121.4944 }}
                  zoom={12}
                  markers={[
                    {
                      lat: 38.5816,
                      lng: -121.4944,
                      title: 'Sacramento, CA',
                      info: '<strong>Sacramento</strong><br/>Capital of California'
                    },
                    {
                      lat: 38.6071,
                      lng: -121.4165,
                      title: 'North Sacramento',
                      info: '<strong>North Sacramento</strong><br/>Service Area'
                    }
                  ]}
                  height="500px"
                  showSearch={true}
                  showCurrentLocation={true}
                />
              </CardBody>
            </Card>
            <Card mt={4}>
                <CardHeader>
                    <Heading as="h3" size="md">Features</Heading>
                </CardHeader>
                <CardBody>
                    <List spacing={2}>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Search any location using the search bar
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Click the navigation button to get your current location
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Click markers to view information
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Zoom and pan to explore the map
                        </ListItem>
                    </List>
                </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
             <Card>
                <CardHeader>
                    <Heading as="h2" size="lg">Service Map</Heading>
                    <Text>Display services on an interactive map with details sidebar</Text>
                </CardHeader>
                <CardBody>
                    <ServiceMap
                        services={sampleServices}
                        userLocation={userLocation}
                        showNearbySearch={true}
                        height="600px"
                    />
                </CardBody>
            </Card>
            <Card mt={4}>
                <CardHeader>
                    <Heading as="h3" size="md">Features</Heading>
                </CardHeader>
                <CardBody>
                    <List spacing={2}>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />View all services with location data on the map</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Click markers to see detailed service information</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Search for services within a specific radius</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />View distance from your location to each service</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Filter by category, price range, and rating</ListItem>
                    </List>
                </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
                <CardHeader>
                    <Heading as="h2" size="lg">Location Picker</Heading>
                    <Text>Validate and select addresses with autocomplete and map preview</Text>
                </CardHeader>
                <CardBody>
                    <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        showMap={true}
                        height="400px"
                    />
                    {selectedLocation && (
                        <Box mt={6} p={4} bg="blue.50" borderRadius="lg">
                        <Heading as="h4" size="sm" mb={2}>Selected Location Data:</Heading>
                        <Code p={3} borderRadius="md" w="full" display="block" whiteSpace="pre-wrap">
                            {JSON.stringify(selectedLocation, null, 2)}
                        </Code>
                        </Box>
                    )}
                </CardBody>
            </Card>
            <Card mt={4}>
                <CardHeader>
                    <Heading as="h3" size="md">Features</Heading>
                </CardHeader>
                <CardBody>
                     <List spacing={2}>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Address autocomplete with Google Places suggestions</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Address validation and standardization</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Extract components (city, state, ZIP code)</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Use current location button</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Map preview of selected location</ListItem>
                    </List>
                </CardBody>
            </Card>
            <Card mt={4}>
                <CardHeader>
                    <Heading as="h3" size="md">Use Cases</Heading>
                </CardHeader>
                <CardBody>
                    <Box>
                        <Heading as="h5" size="sm" mb={1}>Service Provider Registration</Heading>
                        <Text>Use in the service creation form to ensure accurate business addresses</Text>
                    </Box>
                    <Box mt={4}>
                        <Heading as="h5" size="sm" mb={1}>User Profile Setup</Heading>
                        <Text>Collect and validate user addresses during account setup</Text>
                    </Box>
                    <Box mt={4}>
                        <Heading as="h5" size="sm" mb={1}>Booking Forms</Heading>
                        <Text>Validate service location addresses for bookings</Text>
                    </Box>
                </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
                <CardHeader>
                    <Heading as="h2" size="lg">Current Location</Heading>
                    <Text>Access and display user's current location</Text>
                </CardHeader>
                <CardBody>
                    {locationLoading ? (
                        <Box textAlign="center" py={8}>
                        <Spinner size="xl" />
                        <Text mt={2} color="gray.600">Getting your location...</Text>
                        </Box>
                    ) : userLocation ? (
                        <>
                        <Box p={4} bg="green.50" borderRadius="lg">
                            <Heading as="h4" size="sm" color="green.900" mb={2}>Location Found</Heading>
                            <Text>Latitude: {userLocation.lat.toFixed(6)}</Text>
                            <Text>Longitude: {userLocation.lng.toFixed(6)}</Text>
                            {userLocation.accuracy && (
                                <Text>Accuracy: ±{Math.round(userLocation.accuracy)} meters</Text>
                            )}
                        </Box>
                        <MapView
                            center={userLocation}
                            zoom={15}
                            markers={[
                            {
                                lat: userLocation.lat,
                                lng: userLocation.lng,
                                title: 'Your Location',
                                info: '<strong>You are here</strong>'
                            }
                            ]}
                            height="400px"
                            showSearch={false}
                            showCurrentLocation={false}
                        />
                        </>
                    ) : (
                        <Box textAlign="center" py={8}>
                            <Navigation size={48} style={{margin: "auto", marginBottom: "16px"}} color="gray" />
                            <Text color="gray.600" mb={4}>Location access not available</Text>
                            <Text fontSize="sm" color="gray.500">Please enable location permissions in your browser</Text>
                        </Box>
                    )}
                </CardBody>
            </Card>
             <Card mt={4}>
                <CardHeader>
                    <Heading as="h3" size="md">Features</Heading>
                </CardHeader>
                <CardBody>
                     <List spacing={2}>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Automatic location detection using browser geolocation</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />High accuracy positioning</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Display current location on map</ListItem>
                        <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Use for "Near Me" searches</ListItem>
                    </List>
                </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default MapsDemo;
