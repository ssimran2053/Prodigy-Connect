import { useState, useEffect, useRef } from 'react';
import { Box, Button, Input, IconButton, Text, Spinner, Card, CardBody, Code, VStack, HStack, InputGroup, InputLeftElement, Center } from '@chakra-ui/react';
import { ViewIcon, ArrowForwardIcon, SearchIcon } from '@chakra-ui/icons';
import { useGoogleMaps, useGeocoding, useCurrentLocation } from '../hooks/useGoogleMaps';

// Ensure the key exists (Vite requires VITE_ prefix)
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function MapView({ 
  center = { lat: 38.5816, lng: -121.4944 }, // Default to Sacramento
  zoom = 12,
  markers = [],
  onMarkerClick = () => {},
  showSearch = true,
  showCurrentLocation = true,
  height = '500px',
  className = ''
}) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  
  // We need to store references to the loaded classes
  const MapClassRef = useRef(null);
  const MarkerClassRef = useRef(null);
  const InfoWindowClassRef = useRef(null);
  const LatLngBoundsClassRef = useRef(null);
  
  // Hooks
  const { isLoaded, error: mapError } = useGoogleMaps();
  const { geocode, loading: isSearching } = useGeocoding();
  const { location: userLocation, loading: isGettingLocation, error: locationError, refresh: getCurrentLocation } = useCurrentLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
      if (mapError) setError(mapError);
      if (locationError) setError(locationError);
  }, [mapError, locationError]);

  // Initialize Map
  useEffect(() => {
    // 1. Wait for script to load and refs to be ready
    if (!isLoaded || !mapRef.current || googleMapRef.current) return;
    if (!window.google) return;

    const initMap = async () => {
      try {
        // 2. Use importLibrary to safely load the Map class
        const { Map } = await window.google.maps.importLibrary("maps");
        const { Marker } = await window.google.maps.importLibrary("marker");
        const { LatLngBounds } = await window.google.maps.importLibrary("core");

        // Store classes for later use in other effects
        MapClassRef.current = Map;
        MarkerClassRef.current = Marker;
        LatLngBoundsClassRef.current = LatLngBounds;
        InfoWindowClassRef.current = window.google.maps.InfoWindow;

        // 3. Initialize the Map
        const map = new Map(mapRef.current, {
          center,
          zoom,
          mapId: "DEMO_MAP_ID", // Required for modern features, using demo ID for now
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        googleMapRef.current = map;
      } catch (err) {
        console.error("Map initialization error:", err);
        setError('Error initializing map: ' + err.message);
      }
    };

    initMap();
  }, [isLoaded, center, zoom]);

  // Update Markers
  useEffect(() => {
    // Wait until map AND the Marker class are ready
    if (!googleMapRef.current || !MarkerClassRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const Marker = MarkerClassRef.current;
    const InfoWindow = InfoWindowClassRef.current;
    const LatLngBounds = LatLngBoundsClassRef.current;

    markers.forEach((markerData, index) => {
      // 4. Create marker using the loaded class
      const marker = new Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMapRef.current,
        title: markerData.title || `Location ${index + 1}`,
        animation: window.google.maps.Animation.DROP,
      });

      if (markerData.info) {
        const infoWindow = new InfoWindow({
          content: `<div style="padding: 8px;"><h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${markerData.title}</h3>${markerData.info}</div>`
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
          onMarkerClick(markerData, index);
        });
      }

      markersRef.current.push(marker);
    });

    // Auto-fit bounds if multiple markers exist
    if (markers.length > 1 && LatLngBounds) {
      const bounds = new LatLngBounds();
      markers.forEach(marker => {
        // Access position from the marker instance
        const pos = marker.getPosition();
        if (pos) {
            bounds.extend(pos);
        }
      });
      googleMapRef.current.fitBounds(bounds);
    }
  }, [markers, isLoaded, onMarkerClick]);

  // Update Center when User Location Found
  useEffect(() => {
      if (userLocation && googleMapRef.current && MarkerClassRef.current) {
        googleMapRef.current.setCenter(userLocation);
        googleMapRef.current.setZoom(14);
        
        const Marker = MarkerClassRef.current;
        new Marker({
            position: userLocation,
            map: googleMapRef.current,
            title: 'Your Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            }
          });
      }
  }, [userLocation, isLoaded]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const result = await geocode(searchQuery);
      
      if (result.location && googleMapRef.current && MarkerClassRef.current) {
        const location = result.location;
        const Marker = MarkerClassRef.current;
        
        googleMapRef.current.setCenter(location);
        googleMapRef.current.setZoom(14);

        new Marker({
            position: location,
            map: googleMapRef.current,
            title: result.address,
            animation: window.google.maps.Animation.DROP,
        });
      }
    } catch (err) {
      setError('Search failed: ' + err.message);
    }
  };

  if (error) {
    return (
      <Card>
        <CardBody>
          <VStack>
            <ViewIcon boxSize="48px" color="red.500" />
            <Text color="red.500">{error}</Text>
            {!GOOGLE_MAPS_API_KEY && (
              <VStack>
                <Text>Add this to your .env file:</Text>
                <Code>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</Code>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Box position="relative" className={className}>
      {showSearch && (
        <Box position="absolute" top="4" left="4" right="4" zIndex="10">
          <form onSubmit={handleSearch}>
            <HStack>
                <InputGroup>
                    <InputLeftElement pointerEvents='none'>
                        <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                        type="text"
                        placeholder="Search location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="white"
                        shadow="lg"
                    />
                </InputGroup>
                <Button 
                    type="submit" 
                    isLoading={isSearching}
                    colorScheme="blue"
                    shadow="lg"
                >
                    Search
                </Button>
            </HStack>
          </form>
        </Box>
      )}

      {showCurrentLocation && (
        <IconButton
          isRound
          icon={<ArrowForwardIcon />}
          aria-label="Get current location"
          position="absolute"
          bottom="4"
          right="4"
          zIndex="10"
          onClick={getCurrentLocation}
          isLoading={isGettingLocation}
          shadow="lg"
        />
      )}

      <Box 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        borderRadius="lg"
        overflow="hidden"
        shadow="lg"
        bg="gray.100" 
      >
        {!isLoaded && (
             <Center h="100%">
                <VStack>
                    <Spinner size="xl" />
                    <Text>Loading Google Maps...</Text>
                </VStack>
            </Center>
        )}
      </Box>
    </Box>
  );
}

export default MapView;