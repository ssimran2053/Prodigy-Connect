import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Image,
  Center,
  useToast,
  Alert,
  AlertIcon,
  Icon
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import logoImageLight from '../assets/c4928b5b313acf796a0d321d9c48650523bf2f6f.png';
import { authAPI } from '../../services/api';

// Ensure globals.css is imported in your main app entry point
// import './globals.css'; 

export function AuthForm({ onLogin, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleSubmit = async (e, isSignup) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isSignup) {
        response = await authAPI.register({ name, email, password, role });
      } else {
        response = await authAPI.login({ email, password });
      }
      
      toast({
        title: isSignup ? 'Account created.' : 'Logged in.',
        description: isSignup ? "We've created your account for you." : "You're now logged in.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onLogin(response.user);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      toast({
        title: 'Authentication Error',
        description: err.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    bg: "var(--input-background)",
    borderColor: "var(--border)",
    _hover: { borderColor: "var(--primary-light)" },
    _focus: { 
      borderColor: "var(--primary)", 
      boxShadow: "0 0 0 1px var(--primary)" 
    },
    borderRadius: "md"
  };

  return (
    <Box 
      minH="100vh" 
      className="bg-gradient-auth" // Uses the soft blue/pink gradient from globals.css
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p="4"
    >
      <Box w="full" maxW="md">
        <Flex align="center" justify="space-between" mb="6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            leftIcon={<ArrowBackIcon />}
            color="var(--foreground)"
            _hover={{ bg: "whiteAlpha.500", color: "var(--primary)" }}
          >
            Back to Home
          </Button>
        </Flex>

        <Card 
          bg="var(--card)" 
          shadow="xl" 
          borderRadius="xl" 
          border="1px solid var(--border)"
          overflow="hidden"
        >
          <CardBody p={{ base: "6", md: "8" }}>
            <Center flexDirection="column" textAlign="center" mb="8">
              <Center w="20" h="20" mb="4">
                <Image 
                  src={logoImageLight} 
                  alt="Prodigy Connect Logo"
                  boxSize="100%"
                  objectFit="contain"
                />
              </Center>
              <Heading as="h2" size="lg" mb="2" color="var(--foreground)">
                Welcome Back
              </Heading>
              <Text color="var(--muted-foreground)">
                Sign in or create your account to continue
              </Text>
            </Center>

            {error && (
              <Alert status="error" mb="6" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Tabs isFitted variant="line" colorScheme="blue" mb="6">
              <TabList mb="1em" borderBottomColor="var(--border)">
                <Tab 
                  _selected={{ 
                    color: "var(--primary)", 
                    borderColor: "var(--primary)",
                    fontWeight: "semibold"
                  }}
                  color="var(--muted-foreground)"
                >
                  Login
                </Tab>
                <Tab 
                  _selected={{ 
                    color: "var(--primary)", 
                    borderColor: "var(--primary)",
                    fontWeight: "semibold"
                  }}
                  color="var(--muted-foreground)"
                >
                  Sign Up
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p="0">
                  <VStack as="form" onSubmit={(e) => handleSubmit(e, false)} spacing="5">
                    <FormControl isRequired>
                      <FormLabel htmlFor="login-email" color="var(--foreground)" fontSize="sm" fontWeight="medium">Email</FormLabel>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        {...inputStyles}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel htmlFor="login-password" color="var(--foreground)" fontSize="sm" fontWeight="medium">Password</FormLabel>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        {...inputStyles}
                      />
                    </FormControl>
                    <Button 
                      type="submit" 
                      w="full" 
                      size="lg"
                      bg="var(--primary)"
                      color={"white"}
                      borderRadius={"full"}
                      isLoading={loading}
                      loadingText="Signing In..."
                      _hover={{ 
                        shadow: "lg", 
                        transform: "translateY(-1px)" 
                      }}
                      transition="all 0.2s"
                    >
                      Sign In
                    </Button>
                  </VStack>
                </TabPanel>
                
                <TabPanel p="0">
                  <VStack as="form" onSubmit={(e) => handleSubmit(e, true)} spacing="5">
                    <FormControl isRequired>
                      <FormLabel htmlFor="signup-name" color="var(--foreground)" fontSize="sm" fontWeight="medium">Full Name</FormLabel>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        {...inputStyles}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel htmlFor="signup-email" color="var(--foreground)" fontSize="sm" fontWeight="medium">Email</FormLabel>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        {...inputStyles}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel htmlFor="signup-password" color="var(--foreground)" fontSize="sm" fontWeight="medium">Password</FormLabel>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        {...inputStyles}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel htmlFor="role" color="var(--foreground)" fontSize="sm" fontWeight="medium">I am a...</FormLabel>
                      <Select
                        id="role"
                        value={role || 'seeker'}
                        onChange={(e) => setRole(e.target.value)}
                        {...inputStyles}
                      >
                        <option value="seeker">Service Seeker</option>
                        <option value="provider">Service Provider</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </FormControl>
                    <Button 
                      type="submit" 
                      w="full" 
                      size="lg"
                      bg="var(--primary)"
                      color={"white"}
                      borderRadius={"full"}
                      isLoading={loading}
                      loadingText="Creating Account..."
                      _hover={{ 
                        shadow: "lg", 
                        transform: "translateY(-1px)" 
                      }}
                      transition="all 0.2s"
                    >
                      Create Account
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}