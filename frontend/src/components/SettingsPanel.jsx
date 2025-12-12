import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Card,
  CardBody,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
  IconButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  useToast,
  useDisclosure,
  Image,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { 
  User as UserIcon, 
  Bell, 
  Shield, 
  CreditCard,
  Globe,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2
} from 'lucide-react';

export function SettingsPanel({ user, onClose }) {
  const toast = useToast();
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '+1 (555) 123-4567',
    location: user.location || 'Sacramento, CA',
    bio: 'Professional service provider with 15+ years of experience.'
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    newMessages: true,
    bookingUpdates: true,
    reviews: true,
    promotions: false
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true
  });

  // Display Settings
  const [display, setDisplay] = useState({
    language: 'en',
    timezone: 'PST',
    emailDigest: 'daily'
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSaveProfile = () => {
    toast({
      title: 'Profile updated successfully!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notification preferences saved!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: 'Privacy settings updated!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({
        title: 'Account deletion requested.',
        description: 'You will receive an email confirmation.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      position="fixed"
      inset="0"
      bg="blackAlpha.500"
      align="center"
      justify="center"
      zIndex="overlay"
      p="4"
    >
      <Card maxW="4xl" w="full" my="8" onClick={e => e.stopPropagation()}>
        <CardBody p="6">
          <Flex justify="space-between" align="center" mb="6">
            <Heading as="h2" size="xl">Settings</Heading>
            <IconButton icon={<CloseIcon />} onClick={onClose} variant="ghost" aria-label="Close settings" />
          </Flex>

          <Tabs variant="enclosed" colorScheme="blue" isLazy>
            <TabList>
              <Tab>Profile</Tab>
              <Tab>Notifications</Tab>
              <Tab>Privacy</Tab>
              <Tab>Account</Tab>
            </TabList>

            <TabPanels overflowY="auto" maxH="60vh">
              {/* Profile Tab */}
              <TabPanel>
                <VStack spacing="6" align="stretch">
                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb="4" display="flex" alignItems="center" gap="2">
                        <UserIcon size="20" />
                        Personal Information
                      </Heading>
                      
                      <VStack spacing="4" align="stretch">
                        <FormControl>
                          <FormLabel>Full Name</FormLabel>
                          <Input
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Phone</FormLabel>
                          <Input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Location</FormLabel>
                          <Input
                            value={profileData.location}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Bio</FormLabel>
                          <Textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          />
                        </FormControl>

                        <Button onClick={handleSaveProfile} colorScheme="blue" leftIcon={<Save size="16" />}>
                          Save Profile
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb="4">Profile Picture</Heading>
                      <HStack spacing="4" align="center">
                        <Image src={user.avatar} alt={user.name} boxSize="20" borderRadius="full" />
                        <Box>
                          <Button variant="outline">Upload New Photo</Button>
                          <Text fontSize="sm" color="gray.600" mt="2">
                            JPG, PNG or GIF. Max size 2MB.
                          </Text>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel>
                <VStack spacing="6" align="stretch">
                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb="4" display="flex" alignItems="center" gap="2">
                        <Bell size="20" />
                        Notification Channels
                      </Heading>
                      
                      <VStack spacing="4" align="stretch">
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Email Notifications</Text>
                            <Text fontSize="sm" color="gray.600">Receive notifications via email</Text>
                          </Box>
                          <Switch
                            isChecked={notifications.emailNotifications}
                            onChange={(e) =>
                              setNotifications({...notifications, emailNotifications: e.target.checked})
                            }
                          />
                        </Flex>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Push Notifications</Text>
                            <Text fontSize="sm" color="gray.600">Receive browser push notifications</Text>
                          </Box>
                          <Switch
                            isChecked={notifications.pushNotifications}
                            onChange={(e) =>
                              setNotifications({...notifications, pushNotifications: e.target.checked})
                            }
                          />
                        </Flex>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">SMS Notifications</Text>
                            <Text fontSize="sm" color="gray.600">Receive text message alerts</Text>
                          </Box>
                          <Switch
                            isChecked={notifications.smsNotifications}
                            onChange={(e) =>
                              setNotifications({...notifications, smsNotifications: e.target.checked})
                            }
                          />
                        </Flex>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb="4">Notification Types</Heading>
                      
                      <VStack spacing="4" align="stretch">
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">New Messages</Text>
                            <Text fontSize="sm" color="gray.600">When someone sends you a message</Text>
                          </Box>
                          <Switch
                            isChecked={notifications.newMessages}
                            onChange={(e) =>
                              setNotifications({...notifications, newMessages: e.target.checked})
                            }
                          />
                        </Flex>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Booking Updates</Text>
                            <Text fontSize="sm" color="gray.600">Updates on your bookings</Text>
                          </Box>
                          <Switch
                            isChecked={notifications.bookingUpdates}
                            onChange={(e) =>
                              setNotifications({...notifications, bookingUpdates: e.target.checked})
                            }
                          />
                        </Flex>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Reviews & Ratings</Text>
                            <Text fontSize="sm" color="gray.600">When someone reviews your service</Text>
                          </Box>
                          <Switch
                            isChecked={notifications.reviews}
                            onChange={(e) =>
                              setNotifications({...notifications, reviews: e.target.checked})
                            }
                          />
                        </Flex>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Promotions & Tips</Text>
                            <Text fontSize="sm" color="gray.600">Marketing emails and platform updates</Text>
                          </Box>
                          <Switch
                            isChecked={notifications.promotions}
                            onChange={(e) =>
                              setNotifications({...notifications, promotions: e.target.checked})
                            }
                          />
                        </Flex>

                        <Button onClick={handleSaveNotifications} colorScheme="blue" leftIcon={<Save size="16" />}>
                          Save Preferences
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Privacy Tab */}
              <TabPanel>
                <VStack spacing="6" align="stretch">
                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb="4" display="flex" alignItems="center" gap="2">
                        <Shield size="20" />
                        Privacy Controls
                      </Heading>
                      
                      <VStack spacing="4" align="stretch">
                        <FormControl>
                          <FormLabel>Profile Visibility</FormLabel>
                          <Select
                            value={privacy.profileVisibility}
                            onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                          >
                            <option value="public">Public - Anyone can view</option>
                            <option value="members">Members Only</option>
                            <option value="private">Private - Hidden from search</option>
                          </Select>
                        </FormControl>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Show Email Address</Text>
                            <Text fontSize="sm" color="gray.600">Display email on your profile</Text>
                          </Box>
                          <Switch
                            isChecked={privacy.showEmail}
                            onChange={(e) =>
                              setPrivacy({...privacy, showEmail: e.target.checked})
                            }
                          />
                        </Flex>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Show Phone Number</Text>
                            <Text fontSize="sm" color="gray.600">Display phone on your profile</Text>
                          </Box>
                          <Switch
                            isChecked={privacy.showPhone}
                            onChange={(e) =>
                              setPrivacy({...privacy, showPhone: e.target.checked})
                            }
                          />
                        </Flex>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Show Location</Text>
                            <Text fontSize="sm" color="gray.600">Display your city and state</Text>
                          </Box>
                          <Switch
                            isChecked={privacy.showLocation}
                            onChange={(e) =>
                              setPrivacy({...privacy, showLocation: e.target.checked})
                            }
                          />
                        </Flex>

                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium">Allow Messages</Text>
                            <Text fontSize="sm" color="gray.600">Let others contact you directly</Text>
                          </Box>
                          <Switch
                            isChecked={privacy.allowMessages}
                            onChange={(e) =>
                              setPrivacy({...privacy, allowMessages: e.target.checked})
                            }
                          />
                        </Flex>

                        <Button onClick={handleSavePrivacy} colorScheme="blue" leftIcon={<Save size="16" />}>
                          Save Privacy Settings
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb="4">Data & Privacy</Heading>
                      <VStack spacing="3" align="stretch">
                        <Button variant="outline" justifyContent="flex-start">
                          Download Your Data
                        </Button>
                        <Button variant="outline" justifyContent="flex-start">
                          Privacy Policy
                        </Button>
                        <Button variant="outline" justifyContent="flex-start">
                          Terms of Service
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Account Tab */}
              <TabPanel>
                <VStack spacing="6" align="stretch">
                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb="4" display="flex" alignItems="center" gap="2">
                        <Lock size="20" />
                        Security
                      </Heading>
                      
                      <VStack spacing="4" align="stretch">
                        <FormControl>
                          <FormLabel>Current Password</FormLabel>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                          />
                          <IconButton
                            aria-label="Toggle password visibility"
                            icon={showPassword ? <EyeOff /> : <Eye />}
                            onClick={() => setShowPassword(!showPassword)}
                            size="sm"
                            variant="ghost"
                            position="absolute"
                            right="8px"
                            top="50%"
                            transform="translateY(50%)"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>New Password</FormLabel>
                          <Input type="password" placeholder="Enter new password" />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Confirm New Password</FormLabel>
                          <Input type="password" placeholder="Confirm new password" />
                        </FormControl>

                        <Button colorScheme="blue">
                          Update Password
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb="4">Connected Accounts</Heading>
                      <VStack spacing="3" align="stretch">
                        <Flex justify="space-between" align="center" p="3" borderWidth="1px" borderRadius="lg">
                          <HStack spacing="3">
                            <Box w="10" h="10" bg="blue.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                              <Mail size="20" color="blue.600" />
                            </Box>
                            <Box>
                              <Text fontWeight="medium">Google</Text>
                              <Text fontSize="sm" color="gray.600">Connected</Text>
                            </Box>
                          </HStack>
                          <Button variant="outline" size="sm">Disconnect</Button>
                        </Flex>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg="red.50" borderWidth="1px" borderColor="red.200">
                    <CardBody>
                      <Heading as="h3" size="md" mb="2" color="red.700">Danger Zone</Heading>
                      <Text fontSize="sm" color="red.600" mb="4">
                        Once you delete your account, there is no going back. Please be certain.
                      </Text>
                      <Button 
                        colorScheme="red" 
                        onClick={handleDeleteAccount}
                        leftIcon={<Trash2 size="16" />} 
                      >
                        Delete Account
                      </Button>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Flex>
  );
}
