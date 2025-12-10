import { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
  Image,
  Progress,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Grid,
  Avatar,
  Icon
} from '@chakra-ui/react';
import { StarIcon, CheckIcon } from '@chakra-ui/icons';
import { reviewsAPI } from '../../services/api';

export function ProviderReviews({ providerId, providerName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // FIX: If no providerId is passed yet, stop loading immediately
    if (!providerId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewsAPI.getProviderReviews(providerId);
        // FIX: handle different response structures (axios vs fetch)
        const data = response.data || response || [];
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [providerId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" color="var(--primary)" thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        Error loading reviews: {error}
      </Alert>
    );
  }

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;
  // Handle case where isVerified might be undefined
  const verifiedReviews = reviews.filter(r => r.isVerified).length;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === stars).length / totalReviews) * 100 : 0
  }));

  const getReviewsByRating = (rating) => {
    if (rating === 'all') return reviews;
    if (rating === 'verified') return reviews.filter(r => r.isVerified);
    return reviews.filter(r => r.rating === rating);
  };

  const ReviewCard = ({ review }) => (
    <Card 
      p="6" 
      bg="var(--card)" 
      border="1px solid var(--border)"
      shadow="sm"
      _hover={{ shadow: 'md', borderColor: 'var(--primary-light)' }} 
      transition="all 0.2s"
      borderRadius="xl"
    >
      <Flex align="start" gap="4">
        <Avatar 
          src={review.seeker?.avatar} 
          name={review.seeker?.name || 'Anonymous'} 
          size="md"
        />
        <Box flex="1">
          <Flex justify="space-between" align="start" mb="2">
            <Box>
              <HStack mb="1">
                <Text fontWeight="bold" color="var(--foreground)">
                  {review.seeker?.name || 'Anonymous User'}
                </Text>
                {review.isVerified && (
                  <Badge colorScheme="green" variant="subtle" borderRadius="full" px="2">
                    Verified
                  </Badge>
                )}
              </HStack>
              <Text fontSize="sm" color="var(--muted-foreground)">
                {review.service?.title || 'Service Review'}
              </Text>
            </Box>
            <HStack bg="var(--warning-light)" px="2" py="1" borderRadius="lg">
              <StarIcon boxSize="14px" color="var(--warning)" />
              <Text fontSize="sm" fontWeight="bold" color="var(--warning-foreground-dark)">{review.rating}</Text>
            </HStack>
          </Flex>

          <Text color="var(--foreground)" mb="3" fontSize="md">
            {review.comment}
          </Text>

          <HStack justify="space-between" fontSize="sm" color="var(--muted-foreground)">
             <Text>
              {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </HStack>
        </Box>
      </Flex>
    </Card>
  );

  return (
    <Box maxW="7xl" mx="auto">
      <Box mb="8">
        <Heading as="h1" size="lg" mb="2" color="var(--foreground)">Reviews & Ratings</Heading>
        <Text color="var(--muted-foreground)">
          View and manage feedback from your clients
        </Text>
      </Box>

      {totalReviews > 0 ? (
        <>
          <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} mb="8">
            <Card bg="var(--card)" border="1px solid var(--border)" shadow="sm">
              <CardBody>
                <Text fontSize="sm" color="var(--muted-foreground)" mb="1">Average Rating</Text>
                <HStack>
                  <Heading as="h2" size="xl" color="var(--foreground)">{averageRating.toFixed(1)}</Heading>
                  <StarIcon boxSize="20px" color="var(--warning)" />
                </HStack>
              </CardBody>
            </Card>

            <Card bg="var(--card)" border="1px solid var(--border)" shadow="sm">
              <CardBody>
                <Text fontSize="sm" color="var(--muted-foreground)" mb="1">Total Reviews</Text>
                <Heading as="h2" size="xl" color="var(--foreground)">{totalReviews}</Heading>
              </CardBody>
            </Card>

            <Card bg="var(--card)" border="1px solid var(--border)" shadow="sm">
              <CardBody>
                <Text fontSize="sm" color="var(--muted-foreground)" mb="1">Verified Reviews</Text>
                <Heading as="h2" size="xl" color="var(--foreground)">{verifiedReviews}</Heading>
              </CardBody>
            </Card>
            
             <Card bg="var(--card)" border="1px solid var(--border)" shadow="sm">
              <CardBody>
                <Text fontSize="sm" color="var(--muted-foreground)" mb="1">5 Star Reviews</Text>
                <Heading as="h2" size="xl" color="var(--foreground)">
                    {ratingDistribution[0].count}
                </Heading>
              </CardBody>
            </Card>
          </Grid>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8}>
            {/* Left Column: Stats */}
            <Box>
                <Card p="6" bg="var(--card)" border="1px solid var(--border)" shadow="sm" mb="6">
                    <Heading as="h3" size="md" mb="6" color="var(--foreground)">Rating Distribution</Heading>
                    <VStack spacing="4" align="stretch">
                    {ratingDistribution.map(({ stars, count, percentage }) => (
                        <Flex key={stars} align="center" gap="3">
                        <HStack w="12">
                            <Text fontSize="sm" fontWeight="medium" color="var(--foreground)">{stars}</Text>
                            <StarIcon boxSize="12px" color="var(--warning)" />
                        </HStack>
                        <Box flex="1">
                            <Progress 
                                value={percentage} 
                                size="sm" 
                                sx={{ 
                                    '& > div': { background: 'var(--primary)' },
                                    bg: 'var(--muted)'
                                }}
                                borderRadius="full" 
                            />
                        </Box>
                        <Text fontSize="sm" color="var(--muted-foreground)" w="12" textAlign="right">
                            {percentage.toFixed(0)}%
                        </Text>
                        </Flex>
                    ))}
                    </VStack>
                </Card>
            </Box>

            {/* Right Column: List */}
            <Box>
                <Tabs variant="line" colorScheme="blue">
                    <TabList borderBottomColor="var(--border)" mb="6">
                    <Tab _selected={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} color="var(--muted-foreground)">All ({totalReviews})</Tab>
                    <Tab _selected={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} color="var(--muted-foreground)">Verified</Tab>
                    <Tab _selected={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} color="var(--muted-foreground)">Highest Rated</Tab>
                    </TabList>

                    <TabPanels>
                    <TabPanel p="0">
                        <VStack spacing="4" align="stretch">
                        {getReviewsByRating('all').map(review => (
                            <ReviewCard key={review._id} review={review} />
                        ))}
                        </VStack>
                    </TabPanel>

                    <TabPanel p="0">
                        <VStack spacing="4" align="stretch">
                        {getReviewsByRating('verified').length > 0 ? (
                            getReviewsByRating('verified').map(review => (
                            <ReviewCard key={review._id} review={review} />
                            ))
                        ) : (
                            <Flex direction="column" align="center" py="12" bg="var(--muted)" borderRadius="xl">
                                <Text color="var(--muted-foreground)">No verified reviews yet</Text>
                            </Flex>
                        )}
                        </VStack>
                    </TabPanel>
                    
                    <TabPanel p="0">
                        <VStack spacing="4" align="stretch">
                        {getReviewsByRating(5).length > 0 ? (
                            getReviewsByRating(5).map(review => (
                            <ReviewCard key={review._id} review={review} />
                            ))
                        ) : (
                            <Flex direction="column" align="center" py="12" bg="var(--muted)" borderRadius="xl">
                                <Text color="var(--muted-foreground)">No 5-star reviews yet</Text>
                            </Flex>
                        )}
                        </VStack>
                    </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
          </Grid>
        </>
      ) : (
        <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            py="20" 
            bg="var(--card)" 
            border="1px dashed var(--border)" 
            borderRadius="xl"
        >
            <Icon as={StarIcon} boxSize="10" color="var(--muted-foreground)" opacity="0.5" mb="4" />
            <Text fontSize="lg" fontWeight="medium" color="var(--foreground)">No reviews yet</Text>
            <Text color="var(--muted-foreground)">Reviews will appear here once you complete services.</Text>
        </Flex>
      )}
    </Box>
  );
}