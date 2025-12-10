import { useState, useEffect } from 'react';
import { MapPin, Star, Phone, Mail } from 'lucide-react';
import { MapView } from './MapView';
import { 
    Box, 
    Grid, 
    Card, 
    CardHeader, 
    CardBody, 
    Badge, 
    Button, 
    Slider, 
    SliderTrack, 
    SliderFilledTrack, 
    SliderThumb,
    Text,
    Heading,
    Flex,
    Spinner,
    Image,
    VStack,
    HStack,
    Divider
} from '@chakra-ui/react';
import API from '../../../services/api';

export function ServiceMap({ 
  services = [], 
  userLocation = null,
  onServiceSelect = () => {},
  showNearbySearch = true,
  height = '600px'
}) {
  const [markers, setMarkers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [nearbyServices, setNearbyServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Convert services to markers
  useEffect(() => {
    const serviceMarkers = services
      .filter(service => service.location?.coordinates?.lat && service.location?.coordinates?.lng)
      .map(service => ({
        lat: service.location.coordinates.lat,
        lng: service.location.coordinates.lng,
        title: service.title,
        service,
        info: `
          <div style="max-width: 250px;">
            <p style="margin: 4px 0; color: #666;">${service.category}</p>
            <p style="margin: 8px 0; font-weight: 600; color: #1e40af;">
              $${service.price?.amount || service.price}/${service.price?.type || 'hour'}
            </p>
            ${service.rating ? `
              <div style="display: flex; align-items: center; gap: 4px; margin: 4px 0;">
                <span style="color: #fbbf24;">★</span>
                <span>${service.rating.toFixed(1)}</span>
                <span style="color: #999;">(${service.totalReviews || 0})</span>
              </div>
            ` : ''}
            <p style="margin: 8px 0; color: #666; font-size: 14px;">
              ${service.description?.substring(0, 100)}...
            </p>
          </div>
        `
      }));

    setMarkers(serviceMarkers);
  }, [services]);

  // Handle marker click
  const handleMarkerClick = (markerData) => {
    setSelectedService(markerData.service);
    onServiceSelect(markerData.service);
  };

  // Search nearby services
  const handleNearbySearch = async () => {
    if (!userLocation) {
      alert('Please enable location access to search nearby services');
      return;
    }

    setLoading(true);
    try {
      const result = await API.maps.getNearbyServices(
        userLocation.lat,
        userLocation.lng,
        { radius: searchRadius }
      );

      if (result.success) {
        setNearbyServices(result.data);
      }
    } catch (error) {
      console.error('Nearby search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get center point
  const getCenter = () => {
    if (userLocation) {
      return userLocation;
    }
    if (markers.length > 0) {
      return { lat: markers[0].lat, lng: markers[0].lng };
    }
    return { lat: 38.5816, lng: -121.4944 }; // Default Sacramento
  };

  return (
    <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
      {/* Map */}
      <Box>
        <MapView
          center={getCenter()}
          zoom={12}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          height={height}
          showSearch={true}
          showCurrentLocation={true}
        />

        {/* Nearby Search Controls */}
        {showNearbySearch && userLocation && (
          <Card mt={4}>
            <CardBody>
              <VStack spacing={4}>
                <Text>Search Radius: <Text as="span" fontWeight="semibold">{searchRadius} miles</Text></Text>
                <Slider
                  value={searchRadius}
                  onChange={(value) => setSearchRadius(value)}
                  min={1}
                  max={50}
                  step={1}
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>
                <Button 
                  onClick={handleNearbySearch}
                  isLoading={loading}
                  w="full"
                  colorScheme="blue"
                >
                  {`Search within ${searchRadius} miles`}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>

      {/* Service Details Sidebar */}
      <VStack spacing={4}>
        {selectedService ? (
          <Card w="full">
            <CardHeader>
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Heading as="h2" size="md" mb={2}>{selectedService.title}</Heading>
                  <Badge>{selectedService.category}</Badge>
                </Box>
                <Box textAlign="right">
                  <Text fontWeight="semibold" color="blue.600">${selectedService.price?.amount || selectedService.price}</Text>
                  <Text fontSize="sm" color="gray.500">per {selectedService.price?.type || 'hour'}</Text>
                </Box>
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Rating */}
                {selectedService.rating > 0 && (
                  <HStack>
                    <Star size={16} color="orange" fill="orange" />
                    <Text fontWeight="semibold">{selectedService.rating.toFixed(1)}</Text>
                    <Text color="gray.500">({selectedService.totalReviews || 0} reviews)</Text>
                  </HStack>
                )}

                {/* Description */}
                <Box>
                  <Heading as="h4" size="sm" mb={2}>Description</Heading>
                  <Text fontSize="sm" color="gray.600">{selectedService.description}</Text>
                </Box>

                {/* Location */}
                {selectedService.location?.address && (
                  <Box>
                    <Heading as="h4" size="sm" mb={2} display="flex" alignItems="center" gap={2}>
                      <MapPin size={16} /> Location
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {selectedService.location.address}, {selectedService.location.city}, {selectedService.location.state} {selectedService.location.zipCode}
                    </Text>
                  </Box>
                )}

                {/* Provider Info */}
                {selectedService.provider && (
                  <Box>
                    <Heading as="h4" size="sm" mb={2}>Provider</Heading>
                    <HStack>
                      <Image 
                        src={selectedService.provider.avatar} 
                        alt={selectedService.provider.name}
                        boxSize="40px"
                        borderRadius="full"
                        fallbackSrc={`https://via.placeholder.com/40/09f/fff?text=${selectedService.provider.name?.charAt(0) || 'P'}`}
                      />
                      <Box>
                        <Text fontWeight="medium">{selectedService.provider.name}</Text>
                        {selectedService.provider.rating && (
                          <HStack>
                            <Star size={12} color="orange" fill="orange" />
                            <Text fontSize="sm" color="gray.500">{selectedService.provider.rating.toFixed(1)}</Text>
                          </HStack>
                        )}
                      </Box>
                    </HStack>
                  </Box>
                )}

                {/* Actions */}
                <Divider />
                <VStack>
                  <Button w="full" colorScheme="blue">Book Now</Button>
                  <HStack w="full">
                    <Button w="full" variant="outline" size="sm" leftIcon={<Phone size={16} />}>Call</Button>
                    <Button w="full" variant="outline" size="sm" leftIcon={<Mail size={16} />}>Message</Button>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody textAlign="center" color="gray.500">
              <MapPin size={48} style={{margin: "auto", marginBottom: "8px", opacity: "0.3"}} />
              <Text>Click a marker on the map to view service details</Text>
            </CardBody>
          </Card>
        )}

        {/* Nearby Results */}
        {nearbyServices.length > 0 && (
          <Card>
            <CardHeader>
              <Heading as="h3" size="sm">Nearby Services ({nearbyServices.length})</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} maxH="96" overflowY="auto">
                {nearbyServices.map((service) => (
                  <Box 
                    key={service._id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="lg"
                    _hover={{ bg: "gray.50" }}
                    cursor="pointer"
                    onClick={() => setSelectedService(service)}
                    w="full"
                  >
                    <Flex justify="space-between" mb={1}>
                      <Heading as="h5" size="sm" >{service.title}</Heading>
                      <Badge variant="outline">{service.distance} mi</Badge>
                    </Flex>
                    <Text fontSize="xs" color="gray.500" mb={2}>{service.category}</Text>
                    <Flex justify="space-between">
                      <Text fontWeight="semibold" color="blue.600" fontSize="sm">${service.price?.amount || service.price}</Text>
                      {service.rating > 0 && (
                        <HStack>
                          <Star size={12} color="orange" fill="orange" />
                          <Text fontSize="xs" color="gray.500">{service.rating.toFixed(1)}</Text>
                        </HStack>
                      )}
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Grid>
  );
}

export default ServiceMap;
