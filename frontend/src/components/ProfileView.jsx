import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Grid,
  Text,
  Heading,
  Button,
  Badge,
  Image,
  useToast,
  Card,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  VStack,
  HStack
} from '@chakra-ui/react';
import { 
  MapPin, 
  Star, 
  Calendar, 
  MessageSquare, 
  Award,
  Briefcase,
  Clock,
  Shield,
  Save,
  X
} from 'lucide-react';
import { reviewsAPI, bookingsAPI, authAPI } from '../../services/api';

export function ProfileView({ user, isOwnProfile, onOpenSettings }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayUser, setDisplayUser] = useState(user);
  const [formData, setFormData] = useState({
    name: user.name || '',
    location: user.location || '',
    bio: user.bio || ''
  });
  const [currentRating, setCurrentRating] = useState(user.rating || 0);
  const [completedJobsCount, setCompletedJobsCount] = useState(user.completedJobs || 0);
  const toast = useToast();

  useEffect(() => {
    setDisplayUser(user);
    setFormData({
      name: user.name || '',
      location: user.location || '',
      bio: user.bio || ''
    });
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      const response = await authAPI.updateDetails(formData);
      setDisplayUser(response.data);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const fetchFreshData = async () => {
      if (user.role === 'provider') {
        try {
          const response = await reviewsAPI.getProviderReviews(user._id);
          const reviews = response.data || [];
          if (reviews.length > 0) {
            const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
            setCurrentRating(avg.toFixed(1));
          }

          if (isOwnProfile) {
            const bookingsRes = await bookingsAPI.getBookings({ status: 'completed' });
            const count = bookingsRes.count !== undefined ? bookingsRes.count : (bookingsRes.data ? bookingsRes.data.length : 0);
            setCompletedJobsCount(count);
          }
        } catch (err) {
          console.error("Failed to fetch fresh provider data:", err);
        }
      } else if (user.role === 'seeker' && isOwnProfile) {
        try {
          const bookingsRes = await bookingsAPI.getBookings({ status: 'completed' });
          const count = bookingsRes.count !== undefined ? bookingsRes.count : (bookingsRes.data ? bookingsRes.data.length : 0);
          setCompletedJobsCount(count);
        } catch (err) {
          console.error("Failed to fetch seeker stats:", err);
        }
      }
    };
    
    fetchFreshData();
  }, [user, isOwnProfile]);

  // Admin-specific profile data
  const adminData = {
    bio: 'Platform administrator responsible for managing Prodigy Connect operations, user support, and content moderation.',
    role: 'System Administrator',
    adminLevel: 'Super Admin',
    accountCreated: 'March 2024',
    lastLogin: 'October 20, 2025',
    permissions: ['User Management', 'Content Moderation', 'Analytics Access', 'System Configuration', 'Support Management'],
    recentActions: [
      { action: 'Verified provider account', user: 'Lisa Martinez', time: '2 hours ago' },
      { action: 'Resolved support ticket', user: 'Sarah Johnson', time: '5 hours ago' },
      { action: 'Removed inappropriate content', user: 'FastFix Solutions', time: '1 day ago' },
      { action: 'Updated platform guidelines', user: 'System', time: '3 days ago' }
    ],
    platformStats: {
      ticketsResolved: 156,
      usersManaged: 1247,
      contentReviewed: 89,
      securityActions: 12
    }
  };

  // Role-specific profile data
  const profileData = displayUser.role === 'admin' ? adminData : displayUser.role === 'provider' ? {    bio: displayUser.bio || 'Professional service provider with over 15 years of experience. Committed to delivering high-quality work and excellent customer service.',
    skills: ['Licensed & Certified', 'Emergency Services', 'Free Estimates', 'Satisfaction Guaranteed'],
    experience: '15+ years',
    completedJobs: 347,
    responseTime: '< 2 hours',
    availability: 'Mon-Sat, 8AM-6PM',
    servicesOffered: [
      {
        title: 'Emergency Repairs',
        description: '24/7 emergency service available',
        price: '$150-300'
      },
      {
        title: 'Installation Services',
        description: 'Professional installation and setup',
        price: '$100-250'
      },
      {
        title: 'Maintenance & Inspection',
        description: 'Regular maintenance and safety checks',
        price: '$75-150'
      }
    ]
  } : {
    bio: displayUser.bio || 'Active member of the Prodigy Connect community. Looking for reliable service providers to help with various projects and tasks.',
    interests: ['Home Improvement', 'Tech Support', 'Tutoring', 'Event Planning'],
    memberSince: 'January 2024',
    savedServices: 12,
    bookingsCompleted: 8,
    preferredCategories: ['Plumbing', 'Electrical', 'Tutoring'],
    favoriteProviders: [
      {
        name: 'John\'s Plumbing',
        service: 'Plumbing',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johnplumb'
      },
      {
        name: 'Tech Support Pro',
        service: 'Technology',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techsup'
      },
      {
        name: 'Math Tutoring Plus',
        service: 'Tutoring',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mathtutor'
      }
    ]
  };

return (
    <Box maxWidth="6xl" mx="auto">
      {/* Profile Header */}
      <Card p={6} mb={6}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Flex direction="column" alignItems={{ base: 'center', md: 'flex-start' }}>
            <Image
              src={displayUser.avatar}
              alt={displayUser.name}
              boxSize="128px"
              borderRadius="full"
              mb={4}
            />
            {isOwnProfile && (
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            )}
          </Flex>

          <Box flex="1">
            <Flex direction={{ base: 'column', md: 'row' }} alignItems="flex-start" justifyContent="space-between" mb={4}>
              <Box>
                {isEditing ? (
                  <VStack align="start" spacing={3} mb={4}>
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Location</FormLabel>
                      <Input 
                        value={formData.location} 
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </FormControl>
                  </VStack>
                ) : (
                  <>
                    <Heading as="h1" size="xl" mb={2}>{displayUser.name}</Heading>
                    <Flex alignItems="center" gap={2} color="gray.600" mb={2}>
                      <MapPin size={16} />
                      <Text>{displayUser.location}</Text>
                    </Flex>
                  </>
                )}
                {displayUser.role === 'provider' && (
                  <Flex alignItems="center" gap={4} mb={2}>
                    <Flex alignItems="center" gap={1}>
                      <Star size={20} color="orange" fill="orange" />
                      <Text fontSize="lg">{currentRating}</Text>
                    </Flex>
                    <Badge colorScheme="yellow">
                      <Award size={12} style={{ marginRight: '4px' }} />
                      Top Rated
                    </Badge>
                  </Flex>
                )}
                {displayUser.role === 'seeker' && (
                  <Flex alignItems="center" gap={4} mb={2}>
                    <Badge variant="outline">
                      Community Member
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      Member since {profileData.memberSince}
                    </Text>
                  </Flex>
                )}
                {displayUser.role === 'admin' && (
                  <Flex alignItems="center" gap={4} mb={2}>
                    <Badge variant="outline">
                      {adminData.role}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      Admin Level: {adminData.adminLevel}
                    </Text>
                  </Flex>
                )}
              </Box>

              <Flex gap={2} mt={{ base: 4, md: 0 }}>
                {isOwnProfile ? (
                  <>
                    {isEditing ? (
                      <HStack>
                        <Button onClick={handleSaveProfile} colorScheme="blue" leftIcon={<Save size={16} />}>Save</Button>
                        <Button onClick={() => setIsEditing(false)} variant="ghost" leftIcon={<X size={16} />}>Cancel</Button>
                      </HStack>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                    <Button variant="outline" onClick={onOpenSettings}>Settings</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => toast({ title: 'Message conversation would open here', status: 'success' })} leftIcon={<MessageSquare size={16} />}>
                      Message
                    </Button>
                    <Button variant="outline" onClick={() => toast({ title: 'Booking form would open here', status: 'success' })} leftIcon={<Calendar size={16} />}>
                      Book
                    </Button>
                  </>
                )}
              </Flex>
            </Flex>

            {isEditing ? (
              <FormControl mb={4}>
                <FormLabel>Bio</FormLabel>
                <Textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                />
              </FormControl>
            ) : (
              <Text color="gray.600" mb={4}>{profileData.bio}</Text>
            )}

            {displayUser.role === 'provider' && (
              <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                <Flex alignItems="center" gap={2}>
                  <Briefcase size={20} color="blue" />
                  <Box>
                    <Text fontSize="sm" color="gray.600">Experience</Text>
                    <Text>{profileData.experience}</Text>
                  </Box>
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Award size={20} color="blue" />
                  <Box>
                    <Text fontSize="sm" color="gray.600">Completed</Text>
                    <Text>{completedJobsCount} jobs</Text>
                  </Box>
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Clock size={20} color="blue" />
                  <Box>
                    <Text fontSize="sm" color="gray.600">Response</Text>
                    <Text>{profileData.responseTime}</Text>
                  </Box>
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Calendar size={20} color="blue" />
                  <Box>
                    <Text fontSize="sm" color="gray.600">Available</Text>
                    <Text fontSize="sm">{profileData.availability}</Text>
                  </Box>
                </Flex>
              </Grid>
            )}
            
            {displayUser.role === 'seeker' && (
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                    <Flex alignItems="center" gap={2}>
                        <Star size={20} color="blue" />
                        <Box>
                        <Text fontSize="sm" color="gray.600">Saved Services</Text>
                        <Text>{profileData.savedServices}</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                        <Award size={20} color="blue" />
                        <Box>
                        <Text fontSize="sm" color="gray.600">Bookings</Text>
                        <Text>{completedJobsCount} completed</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                        <Briefcase size={20} color="blue" />
                        <Box>
                        <Text fontSize="sm" color="gray.600">Interests</Text>
                        <Text fontSize="sm">{profileData.interests.length} categories</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                        <Calendar size={20} color="blue" />
                        <Box>
                        <Text fontSize="sm" color="gray.600">Member Since</Text>
                        <Text fontSize="sm">{profileData.memberSince}</Text>
                        </Box>
                    </Flex>
                </Grid>
            )}

            {displayUser.role === 'admin' && (
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                    <Flex alignItems="center" gap={2}>
                        <Briefcase size={20} color="blue" />
                        <Box>
                        <Text fontSize="sm" color="gray.600">Role</Text>
                        <Text>{adminData.role}</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                        <Award size={20} color="blue" />
                        <Box>
                        <Text fontSize="sm" color="gray.600">Admin Level</Text>
                        <Text>{adminData.adminLevel}</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                        <Clock size={20} color="blue" />
                        <Box>
                        <Text fontSize="sm" color="gray.600">Account Created</Text>
                        <Text>{adminData.accountCreated}</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                        <Calendar size={20} color="blue" />
                        <Box>
                        <Text fontSize="sm" color="gray.600">Last Login</Text>
                        <Text fontSize="sm">{adminData.lastLogin}</Text>
                        </Box>
                    </Flex>
                </Grid>
            )}
          </Box>
        </Flex>
      </Card>

      <Card p={6}>
        {displayUser.role === 'admin' && (
          <>
            <Box>
              <Heading as="h2" size="lg" mb={4}>About Me</Heading>
              <Text color="gray.700" mb={4}>{adminData.bio}</Text>
              <Text color="gray.700">
                I'm dedicated to ensuring the smooth operation of Prodigy Connect. With extensive
                experience in system administration and a commitment to user satisfaction, I ensure
                that the platform runs efficiently and securely. My goal is to build
                long-term relationships with users based on trust and quality service.
              </Text>
            </Box>
            <Box mt={6}>
              <Heading as="h3" size="md" mb={3}>Admin Permissions</Heading>
              <Flex flexWrap="wrap" gap={2}>
                {adminData.permissions.map((permission, index) => (
                  <Badge key={index} colorScheme="gray">{permission}</Badge>
                ))}
              </Flex>
            </Box>
            <Box mt={6}>
              <Heading as="h3" size="md" mb={3}>Account Information</Heading>
              <Grid templateColumns={{ md: 'repeat(2, 1fr)' }} gap={4}>
                <Flex alignItems="flex-start" gap={3}>
                  <Shield size={20} color="blue" />
                  <Box>
                    <Text mb={1}>Admin Level</Text>
                    <Text color="gray.600">{adminData.adminLevel}</Text>
                  </Box>
                </Flex>
                <Flex alignItems="flex-start" gap={3}>
                  <Calendar size={20} color="blue" />
                  <Box>
                    <Text mb={1}>Account Created</Text>
                    <Text color="gray.600">{adminData.accountCreated}</Text>
                  </Box>
                </Flex>
              </Grid>
            </Box>
          </>
        )}

        {displayUser.role !== 'admin' && (
          <>
            <Box>
              <Heading as="h2" size="lg" mb={4}>About Me</Heading>
              <Text color="gray.700" mb={4}>{profileData.bio}</Text>
              {displayUser.role === 'provider' ? (
                <Text color="gray.700">
                  I'm dedicated to providing top-notch service to every client. With extensive
                  experience in the field and a commitment to customer satisfaction, I ensure
                  that every job is completed to the highest standards. My goal is to build
                  long-term relationships with clients based on trust and quality work.
                </Text>
              ) : (
                <Text color="gray.700">
                  I'm actively looking for quality service providers to help with various projects.
                  I value reliability, professionalism, and clear communication. I believe in supporting
                  local businesses and building lasting relationships with trusted providers in my community.
                </Text>
              )}
            </Box>

            <Box mt={6}>
              <Heading as="h3" size="md" mb={3}>
                {displayUser.role === 'provider' ? 'Skills & Certifications' : 'Interests & Preferences'}
              </Heading>
              <Flex flexWrap="wrap" gap={2}>
                {displayUser.role === 'provider' ? (
                  profileData.skills.map((skill, index) => (
                    <Badge key={index} colorScheme="gray">{skill}</Badge>
                  ))
                ) : (
                  profileData.interests.map((interest, index) => (
                    <Badge key={index} colorScheme="gray">{interest}</Badge>
                  ))
                )}
              </Flex>
            </Box>

            <Box mt={6}>
              <Heading as="h3" size="md" mb={3}>Service Area</Heading>
              <Grid templateColumns={{ md: 'repeat(2, 1fr)' }} gap={4}>
                <Flex alignItems="flex-start" gap={3}>
                  <MapPin size={20} color="blue" />
                  <Box>
                    <Text mb={1}>Primary Location</Text>
                    <Text color="gray.600" >Sacramento, CA</Text>
                  </Box>
                </Flex>
                <Flex alignItems="flex-start" gap={3}>
                  <MapPin size={20} color="blue" />
                  <Box>
                    <Text mb={1}>Service Radius</Text>
                    <Text color="gray.600">30 miles</Text>
                  </Box>
                </Flex>
              </Grid>
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
}
