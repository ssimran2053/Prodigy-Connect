import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Input,
  Text,
  VStack,
  HStack,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { MapPin, Loader2, CheckCircle, Navigation } from 'lucide-react';
import MapView from './MapView';
import API from '../../services/api';

export function LocationPicker({ 
  onLocationSelect = () => {},
  initialAddress = '',
  showMap = true,
  height = '300px'
}) {
  const [address, setAddress] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const validateAddress = async (addressToValidate) => {
    if (!addressToValidate?.trim()) return;
    setIsValidating(true);
    setError(null);
    setIsValid(false);
    try {
      const result = await API.maps.validateAddress(addressToValidate);
      if (result.valid && result.data) {
        setIsValid(true);
        const newLocation = {
          address: result.data.formattedAddress,
          lat: result.data.location.lat,
          lng: result.data.location.lng,
          components: result.data.components
        };
        setSelectedLocation(newLocation);
        onLocationSelect({
          address: newLocation.address,
          coordinates: newLocation.location,
          ...newLocation.components
        });
      } else {
        setError('Address could not be validated');
        setIsValid(false);
      }
    } catch (err) {
      setError('Validation failed: ' + err.message);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const result = await API.maps.searchPlaces(query);
      if (result.success && result.data) {
        setSuggestions(result.data.slice(0, 5));
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if(address) searchAddress(address);
    }, 500);
    return () => clearTimeout(timer);
  }, [address]);

  const handleSelectSuggestion = async (place) => {
    setAddress(place.address);
    setShowSuggestions(false);
    await validateAddress(place.address);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setIsValidating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await API.maps.reverseGeocode(position.coords.latitude, position.coords.longitude);
          if (result.success && result.data) {
            setAddress(result.data.address);
            await validateAddress(result.data.address);
          }
        } catch (err) {
          setError('Failed to get address from location');
        } finally {
          setIsValidating(false);
        }
      },
      (err) => {
        setError('Unable to get your location: ' + err.message);
        setIsValidating(false);
      }
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <FormLabel htmlFor="address">Address</FormLabel>
        <Box position="relative">
          <Input
            id="address"
            placeholder="Enter address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            isInvalid={error}
            isValid={isValid}
          />
          {showSuggestions && suggestions.length > 0 && (
            <Card position="absolute" zIndex="10" w="full" mt="1">
              <CardBody>
                {suggestions.map((place, index) => (
                  <Button key={index} variant="ghost" w="full" justifyContent="start" onClick={() => handleSelectSuggestion(place)}>
                    <VStack align="start">
                      <Text fontSize="sm">{place.name}</Text>
                      <Text fontSize="xs" color="gray.500">{place.address}</Text>
                    </VStack>
                  </Button>
                ))}
              </CardBody>
            </Card>
          )}
        </Box>
        {error && <Text color="red.500" fontSize="sm">{error}</Text>}
      </Box>
      <HStack>
        <Button onClick={handleGetCurrentLocation} isLoading={isValidating} leftIcon={<Navigation size="16" />}>
          Use Current Location
        </Button>
        <Button colorScheme="blue" onClick={() => validateAddress(address)} isLoading={isValidating}>
          Validate Address
        </Button>
      </HStack>
      {isValid && selectedLocation && (
        <Alert status="success">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Valid Address</AlertTitle>
            <AlertDescription>{selectedLocation.address}</AlertDescription>
          </Box>
        </Alert>
      )}
      {showMap && selectedLocation && (
        <Box>
          <FormLabel>Location Preview</FormLabel>
          <MapView
            center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            zoom={15}
            markers={[{ lat: selectedLocation.lat, lng: selectedLocation.lng, title: selectedLocation.address }]}
            height={height}
          />
        </Box>
      )}
    </VStack>
  );
}

export default LocationPicker;
