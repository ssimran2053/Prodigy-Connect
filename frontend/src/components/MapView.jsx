import { useState, useEffect, useRef } from 'react';
import { Box, Button, Input, IconButton, Text, Spinner, Card, CardBody, Code, VStack, HStack, InputGroup, InputLeftElement, Center, List, ListItem, ListIcon, useToast } from '@chakra-ui/react';
import { ViewIcon, ArrowForwardIcon, SearchIcon } from '@chakra-ui/icons';
import { useGoogleMaps, useGeocoding, useCurrentLocation, useDirections } from '../hooks/useGoogleMaps';
import API from '../../services/api';

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
  const tempMarkerRef = useRef(null); // Ref to hold the temporary marker
  const directionsRendererRef = useRef(null);
  const toast = useToast();
  
  // We need to store references to the loaded classes
  const MapClassRef = useRef(null);
  const MarkerClassRef = useRef(null);
  const InfoWindowClassRef = useRef(null);
  const LatLngBoundsClassRef = useRef(null);
  
  // Hooks
  const { isLoaded, error: mapError } = useGoogleMaps();
  const { geocode, reverseGeocode, loading: isSearching } = useGeocoding();
  const { location: userLocation, loading: isGettingLocation, error: locationError, refresh: getCurrentLocation } = useCurrentLocation();
  const { directions, getDirections, clearDirections, loading: isNavigating } = useDirections();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  useEffect(() => {
    if (mapError) {
        toast({
            title: "Error loading map",
            description: mapError,
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    }
    if (locationError) {
        toast({
            title: "Error getting location",
            description: locationError,
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    }
  }, [mapError, locationError, toast]);

  // Initialize Map
  useEffect(() => {
    // Don't initialize the map until the script is loaded and the ref is available.
    if (!isLoaded || !mapRef.current || googleMapRef.current) return;
    if (!window.google) return;

    const initMap = async () => {
      try {
        // Asynchronously load the required libraries from the Google Maps API.
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const { LatLngBounds } = await google.maps.importLibrary("core");
        const { DirectionsRenderer } = await google.maps.importLibrary("routes");

        // Store the loaded classes in refs so they can be used elsewhere without reloading.
        MapClassRef.current = Map;
        MarkerClassRef.current = AdvancedMarkerElement;
        LatLngBoundsClassRef.current = LatLngBounds;
        InfoWindowClassRef.current = window.google.maps.InfoWindow;

        // 3. Initialize the Map
        const map = new Map(mapRef.current, {
          center,
          zoom,
          mapId: "DEMO_MAP_ID", // Required for modern features, using demo ID for now
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });
        
        const directionsRenderer = new DirectionsRenderer();
        directionsRenderer.setMap(map);
        directionsRendererRef.current = directionsRenderer;

        googleMapRef.current = map;

        // Add a click listener to the map
        map.addListener('click', async (e) => {
          // First, close any info window that might already be open.
          if (activeInfoWindow) {
            activeInfoWindow.close();
          }
          // Then, remove the last temporary marker from the map.
          if (tempMarkerRef.current) {
            tempMarkerRef.current.map = null;
            tempMarkerRef.current = null;
          }

          const latLng = e.latLng;
          if (!latLng) return;

          // Create a new marker where the user clicked.
          const TempMarkerClass = MarkerClassRef.current;
          if (!TempMarkerClass) return;
          
          const marker = new TempMarkerClass({
            position: latLng,
            map: map,
          });

          // Store the new marker in our ref immediately after creation
          tempMarkerRef.current = marker;

          try {
            const addressData = await reverseGeocode(latLng.lat(), latLng.lng());
            
            let foundAddress = 'No address found for this location.';
            let placeId = null;
            if (addressData) {
                if (addressData.formatted_address) {
                    foundAddress = addressData.formatted_address;
                } else if (addressData.address) { // Fallback for different geocoding response structures.
                    foundAddress = addressData.address;
                }
                if (addressData.place_id) {
                    placeId = addressData.place_id;
                }
            }

            let infoWindowContent = `<div style="padding: 8px;">${foundAddress}</div>`;

            if (placeId) {
                try {
                    const placeDetails = await API.maps.getPlaceDetails(placeId); // Fetch rich details for the place.
                    if (placeDetails && placeDetails.data) { // Check for the nested data object
                        const { name, address, rating: placeRating, phoneNumber: phone, website: web, placeId: newPlaceId } = placeDetails.data;
                        const formattedAddress = address || foundAddress;
                        const rating = placeRating ? `⭐ ${placeRating}` : '';
                        const phoneNumber = phone || '';
                        const website = web ? `<a href="${web}" target="_blank" rel="noopener noreferrer">${web}</a>` : '';
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name || formattedAddress)}&query_place_id=${newPlaceId || placeId}`;

                        infoWindowContent = `
                            <div style="padding: 8px;">
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${name}</h3>
                                <p style="margin-bottom: 4px;">${formattedAddress}</p>
                                ${rating ? `<p style="margin-bottom: 4px;">${rating}</p>` : ''}
                                ${phoneNumber ? `<p style="margin-bottom: 4px;">${phoneNumber}</p>` : ''}
                                ${website ? `<p style="margin-bottom: 4px;">${website}</p>` : ''}
                                <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #4285F4; text-decoration: none;">View on Google Maps</a>
                            </div>
                        `;
                    }
                } catch (placeDetailsError) {
                    console.error("Failed to fetch place details:", placeDetailsError);
                    // If fetching details fails, we'll just show the basic address.
                }
            }

            const infoWindow = new InfoWindowClassRef.current({
              content: infoWindowContent,
            });
            
            // When the user closes the info window, clean up the temporary marker.
            infoWindow.addListener('closeclick', () => {
              marker.map = null;
              tempMarkerRef.current = null; // Clear the ref as well
              setActiveInfoWindow(null); // Explicitly clear the active info window state
            });

            infoWindow.open(map, marker);
            setActiveInfoWindow(infoWindow);
            
          } catch (error) {
            console.error("Reverse geocoding failed", error);
            // If geocoding fails, remove the marker we just added.
            marker.map = null;

            toast({
                title: "Reverse Geocoding Failed",
                description: "Could not retrieve address for this location.",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
          }
        });

      } catch (err) {
        console.error("Map initialization error:", err);
        toast({
            title: "Map initialization error",
            description: err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
        });
      }
    };

    initMap();
  }, [isLoaded, center, zoom, toast]);

  // Render Directions
  useEffect(() => {
    if (directions && directionsRendererRef.current) {
      directionsRendererRef.current.setDirections(directions);
    }
  }, [directions]);
  
  // Update Markers
  useEffect(() => {
    // Don't try to render markers until the map and marker library are ready.
    if (!googleMapRef.current || !MarkerClassRef.current || !isLoaded) return;

    // Clear out any old markers from the map before adding new ones.
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const AdvancedMarkerElement = MarkerClassRef.current;
    const InfoWindow = InfoWindowClassRef.current;
    const LatLngBounds = LatLngBoundsClassRef.current;
    markers.forEach((markerData, index) => {
      const marker = new AdvancedMarkerElement({
        position: { lat: markerData.lat, lng: markerData.lng },
        title: markerData.title || `Location ${index + 1}`,
      });

      // Set map on the instance
      marker.map = googleMapRef.current;

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

    // If we have multiple markers, adjust the map's viewport to show all of them.
    if (markers.length > 1 && LatLngBounds) {
      const bounds = new LatLngBounds();
      markers.forEach(markerData => {
        bounds.extend({ lat: markerData.lat, lng: markerData.lng });
      });
      googleMapRef.current.fitBounds(bounds);
    }
  }, [markers, isLoaded, onMarkerClick]);

  // Update Center when User Location Found
  useEffect(() => {
      if (userLocation && googleMapRef.current && MarkerClassRef.current) {
        googleMapRef.current.setCenter(userLocation);
        googleMapRef.current.setZoom(14);
        
        const AdvancedMarkerElement = MarkerClassRef.current;
        const marker = new AdvancedMarkerElement({
            position: userLocation,
            title: 'Your Location',
            content: (() => {
                const element = document.createElement('div');
                element.style.width = '16px';
                element.style.height = '16px';
                element.style.backgroundColor = 'blue';
                element.style.borderRadius = '50%';
                element.style.border = '2px solid white';
                element.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
                element.style.cursor = 'pointer';
                return element;
            })(),
          });
        marker.map = googleMapRef.current;
      }
  }, [userLocation, isLoaded]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length > 2) { // Only search when the user has typed a few characters.
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchResults([]); // Clear previous results immediately for better UX
    clearDirections();

    try {
      const results = await geocode(searchQuery);
      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        // Let the user know if the search didn't return any results.
        toast({
            title: "Search failed",
            description: "No results found for your search query.",
            status: "warning",
            duration: 5000,
            isClosable: true,
        });
      }
    } catch (err) {
        // Handle cases where the search request itself fails.
        toast({
            title: "Search failed",
            description: err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    }
  };

  const handleResultSelection = (result) => {
    setSearchResults([]);
    setSearchQuery(result.formatted_address || result.address);

    const location = result.geometry?.location || result.location;
    
    if (location && googleMapRef.current && MarkerClassRef.current) {
      // Clean up any existing temporary marker before showing the new one.
      if (activeInfoWindow) {
        activeInfoWindow.close();
      }
      if (tempMarkerRef.current) {
        tempMarkerRef.current.map = null;
        tempMarkerRef.current = null;
      }

      googleMapRef.current.setCenter(location);
      googleMapRef.current.setZoom(15);

      const AdvancedMarkerElement = MarkerClassRef.current;
      const marker = new AdvancedMarkerElement({
          position: location,
          title: result.formatted_address || result.address,
      });
      marker.map = googleMapRef.current;
      tempMarkerRef.current = marker; // Store this marker as the current temporary marker

      if (InfoWindowClassRef.current) {
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.name || result.address)}&query_place_id=${result.place_id}`;

        const infoWindowContent = `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${result.name || result.address}</h3>
            <p style="margin-bottom: 8px;">${result.formatted_address}</p>
            <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" style="color: #4285F4; text-decoration: none;">View on Google Maps</a>
          </div>
        `;
        
        const infoWindow = new InfoWindowClassRef.current({
          content: infoWindowContent,
        });

        infoWindow.open(googleMapRef.current, marker);
        setActiveInfoWindow(infoWindow);

        // Make sure we clean up the marker if the user closes the info window.
        infoWindow.addListener('closeclick', () => {
          if (tempMarkerRef.current) {
            tempMarkerRef.current.map = null;
            tempMarkerRef.current = null;
            setActiveInfoWindow(null); // Clear the active info window state
          }
        });
      }
    }
  };

  const handleNavigation = (destination) => {
    if (!userLocation) {
        toast({
            title: "Navigation Error",
            description: "Your current location is not available. Please enable location services.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
      return;
    }
    
    const destinationLocation = destination.geometry?.location || destination.location;
    if (!destinationLocation) {
        toast({
            title: "Navigation Error",
            description: "Could not find location for the destination.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
      return;
    }

    setSearchResults([]);
    clearDirections();
    getDirections(userLocation, destinationLocation);
  };
  
  if (!isLoaded && !mapError) {
    return (
        <Center h="100%">
            <VStack>
                <Spinner size="xl" />
                <Text>Loading Google Maps...</Text>
            </VStack>
        </Center>
    )
  }

  if (mapError && !isLoaded) {
    return (
      <Card>
        <CardBody>
          <VStack>
            <ViewIcon boxSize="48px" color="red.500" />
            <Text color="red.500">{mapError}</Text>
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
          <HStack>
              <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                      <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                      type="text"
                      placeholder="Search location or place..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg="white"
                      shadow="lg"
                  />
              </InputGroup>
              <Button 
                  onClick={handleSearch}
                  isLoading={isSearching}
                  colorScheme="blue"
                  shadow="lg"
              >
                  Search
              </Button>
          </HStack>
          {searchResults.length > 0 && (
            <Box bg="white" mt="2" borderRadius="lg" shadow="lg" p="2" maxH="300px" overflowY="auto">
              <List spacing={3}>
                {searchResults.map((result) => (
                  <ListItem 
                    key={result.place_id || result.address} 
                    p="2" 
                    _hover={{ bg: 'gray.100' }} 
                    cursor="pointer"
                    onClick={() => handleResultSelection(result)}
                  >
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="bold">{result.name || result.address}</Text>
                        <Text fontSize="sm" color="gray.500">{result.formatted_address}</Text>
                      </Box>
                      <Button 
                        size="sm"
                        colorScheme="green"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation(result);
                        }}
                        isLoading={isNavigating}
                      >
                        Navigate
                      </Button>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
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