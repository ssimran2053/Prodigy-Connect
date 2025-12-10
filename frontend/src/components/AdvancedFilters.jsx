import { useState } from 'react';
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
  Center
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

const availabilityOptions = ['Weekdays', 'Weekends', 'Evenings', 'Flexible'];
const languageOptions = ['English', 'Spanish', 'Chinese', 'French'];
const serviceCategories = [
  'All Services',
  'Home Services',
  'Education',
  'Tech Services',
  'Health & Fitness',
  'Creative',
  'Consulting'
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
  const toast = useToast();

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
              <Text>Showing 247 results</Text>
            </CardBody>
          </Card>
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} _hover={{ shadow: 'lg' }} transition="shadow 0.2s">
              <CardBody>
                <Flex gap="4">
                  <Center bg="blue.500" w="16" h="16" borderRadius="lg" color="white" fontSize="2xl" fontWeight="bold">
                    {String.fromCharCode(64 + i)}
                  </Center>
                  <Box flex="1">
                    <Flex justify="space-between">
                      <Heading as="h4" size="md">Professional Service Provider</Heading>
                      <Box textAlign="right">
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">$75</Text>
                        <Text fontSize="sm" color="gray.500">/hour</Text>
                      </Box>
                    </Flex>
                    <HStack fontSize="sm" color="gray.600" my="2">
                      <ViewIcon />
                      <Text>2.5 miles away</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mb="3">
                      Experienced professional with 10+ years in the industry
                    </Text>
                    <HStack>
                      <HStack>
                        <StarIcon color="gold" />
                        <Text fontWeight="medium">4.9</Text>
                        <Text color="gray.500">(124 reviews)</Text>
                      </HStack>
                      <Badge colorScheme="green">Verified</Badge>
                      <Badge colorScheme="blue">Instant Book</Badge>
                    </HStack>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Grid>
    </Box>
  );
}
