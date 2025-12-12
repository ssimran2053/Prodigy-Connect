import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Input,
  Badge,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  useToast,
  Checkbox,
  Flex,
  Spacer,
  Center,
  Image,
  Spinner
} from '@chakra-ui/react';
import { 
  SearchIcon,
  ViewIcon,
  InfoIcon,
  StarIcon,
  TimeIcon,
  UpDownIcon,
  CloseIcon,
  CalendarIcon,
  ArrowUpIcon
} from '@chakra-ui/icons';
import { servicesAPI } from '../../services/api';
import PlaceholderImage from '../assets/c4928b5b313acf796a0d321d9c48650523bf2f6f.png';

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5001';

const getImageUrl = (path) => {
  if (!path) return PlaceholderImage;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  let baseUrl = API_BASE_URL;
  
  // Handle trailing slash
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  // If the base URL ends with /api, remove it because static files are usually at root
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
    
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const availabilityOptions = ['Weekdays', 'Weekends', 'Evenings', 'Flexible'];
const languageOptions = ['English', 'Spanish', 'Chinese', 'French'];
const serviceCategories = [
  'All Services',
  'Home Services',
  'Education',
  'Tech Services',
  'Health & Fitness',
  'Creative Services',
  'Business Services',
  'Other'
];

export function AdvancedFilters() {
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    distance: 25,
    rating: 0,
    availability: [],
    languages: [],
    verified: false,
    instantBook: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await servicesAPI.getServices();
        setServices(response.data || []);
      } catch (err) {
        toast({
          title: 'Failed to fetch services',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [toast]);

  const activeFiltersCount = 
    (filters.rating > 0 ? 1 : 0) +
    filters.availability.length +
    filters.languages.length +
    (filters.verified ? 1 : 0) +
    (filters.instantBook ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 200 ? 1 : 0) +
    (filters.distance !== 25 ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 200],
      distance: 25,
      rating: 0,
      availability: [],
      languages: [],
      verified: false,
      instantBook: false
    });
    setSelectedCategory('All Services');
    toast({
      title: 'All filters cleared',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const filteredServices = services.filter(service => {
    // Category Filter
    if (selectedCategory !== 'All Services' && service.category !== selectedCategory) return false;

    // Price Filter
    const price = service.price?.amount || 0;
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = service.title?.toLowerCase() || '';
      const description = service.description?.toLowerCase() || '';
      return title.includes(query) || description.includes(query);
    }

    return true;
  });

  return (
    <Box maxW="7xl" mx="auto">
      <Flex justify="space-between" align="center" mb="6">
        <Box>
          <Heading as="h1" size="xl" mb="2">Advanced Search & Filters</Heading>
          <Text color="gray.600">Find exactly what you're looking for with powerful filtering</Text>
        </Box>
        <HStack>
          {activeFiltersCount > 0 && (
            <Badge colorScheme="blue" variant="solid" fontSize="sm" py="1" px="2.5" borderRadius="full">
              {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
            </Badge>
          )}
          <Button variant="outline" onClick={resetFilters} leftIcon={<CloseIcon />}>
            Clear All
          </Button>
        </HStack>
      </Flex>

      <Box mb="6">
        <Input 
          placeholder="Search services by title or description..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg="white"
        />
      </Box>

      <Grid templateColumns={{base: '1fr', lg: "300px 1fr"}} gap="6">
        <VStack spacing="4" align="stretch">
          <Card>
            <CardBody>
              <Heading as="h3" size="sm" mb="3" display="flex" alignItems="center" gap="2">
                <UpDownIcon />
                Categories
              </Heading>
              <VStack align="stretch" spacing="2">
                {serviceCategories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      toast({
                        title: `Showing ${category}`,
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                      });
                    }}
                    justifyContent="start"
                    variant={selectedCategory === category ? 'solid' : 'ghost'}
                    colorScheme={selectedCategory === category ? 'blue' : 'gray'}
                  >
                    {category}
                  </Button>
                ))}
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Heading as="h3" size="sm" mb="3">Price Range</Heading>
              <Slider
                aria-label='price-range-slider'
                defaultValue={filters.priceRange}
                onChangeEnd={(val) => setFilters({...filters, priceRange: val})}
                min={0}
                max={500}
                step={10}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6} index={0} />
                <SliderThumb boxSize={6} index={1} />
              </Slider>
              <HStack justify="space-between" mt={2}>
                <Text>${filters.priceRange[0]}</Text>
                <Text>${filters.priceRange[1]}</Text>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading as="h3" size="sm" mb="3">Distance</Heading>
              <Slider
                aria-label='distance-slider'
                defaultValue={filters.distance}
                onChangeEnd={(val) => setFilters({...filters, distance: val})}
                min={0}
                max={50}
                step={5}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6} />
              </Slider>
              <Text textAlign="center" mt={2}>Within {filters.distance} miles</Text>
            </CardBody>
          </Card>
        </VStack>

        <VStack spacing="4" align="stretch">
          <Card>
            <CardBody>
              <Text>Showing {filteredServices.length} results</Text>
            </CardBody>
          </Card>
          
          {loading ? (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          ) : filteredServices.length === 0 ? (
            <Center py={10}>
              <Text color="gray.500">No services found matching your criteria.</Text>
            </Center>
          ) : (
            filteredServices.map((service) => (
            <Card key={service._id} _hover={{ shadow: 'lg' }} transition="shadow 0.2s">
              <CardBody>
                <Flex gap="4">
                  <Image 
                    src={getImageUrl(service.image)} 
                    alt={service.title}
                    w="16" h="16" 
                    borderRadius="lg" 
                    objectFit="cover"
                    fallbackSrc={PlaceholderImage}
                  />
                  <Box flex="1">
                    <Flex justify="space-between">
                      <Heading as="h4" size="md">{service.title}</Heading>
                      <Box textAlign="right">
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                          ${service.price?.amount || 0}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {service.price?.type === 'hourly' ? '/hour' : ' fixed'}
                        </Text>
                      </Box>
                    </Flex>
                    <HStack fontSize="sm" color="gray.600" my="2">
                      <Text fontWeight="bold">{service.provider?.name}</Text>
                      <Text>•</Text>
                      <Text>{service.category}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mb="3" noOfLines={2}>
                      {service.description}
                    </Text>
                    <HStack>
                      <HStack>
                        <StarIcon color="gold" />
                        <Text fontWeight="medium">{service.rating || 'New'}</Text>
                        <Text color="gray.500">({service.totalReviews || 0} reviews)</Text>
                      </HStack>
                    </HStack>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          )))}
        </VStack>
      </Grid>
    </Box>
  );
}
