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
  Text,
  VStack,
  Image,
  Center,
  Divider,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckCircleIcon, LockIcon, EmailIcon } from '@chakra-ui/icons';
import logoImageLight from '../assets/c4928b5b313acf796a0d321d9c48650523bf2f6f.png';
import { authAPI } from '../../services/api';

export function AdminAuthForm({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({ email, password });
      toast({
        title: 'Logged in.',
        description: "You're now logged in as admin.",
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

  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-b, gray.900, gray.800)" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p="4" 
      position="relative" 
      overflow="hidden"
    >
      <Box position="absolute" inset="0" opacity="0.1">
        <Box position="absolute" top="0" left="-4" w="72" h="72" bg="blue.500" borderRadius="full" mixBlendMode="multiply" filter="blur(40px)" animation="pulse 2s infinite" />
        <Box position="absolute" top="0" right="-4" w="72" h="72" bg="red.500" borderRadius="full" mixBlendMode="multiply" filter="blur(40px)" animation="pulse 2s infinite .7s" />
        <Box position="absolute" bottom="-8" left="20" w="72" h="72" bg="purple.500" borderRadius="full" mixBlendMode="multiply" filter="blur(40px)" animation="pulse 2s infinite 1s" />
      </Box>

      <Box w="full" maxW="md" position="relative" zIndex="10">
        <Flex align="center" justify="space-between" mb="4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            color="white"
            _hover={{ bg: "whiteAlpha.100" }}
            leftIcon={<ArrowBackIcon />}
          >
            Back to Login
          </Button>
        </Flex>

        <Card bg="blackAlpha.400" backdropFilter="blur(10px)" border="1px" borderColor="whiteAlpha.200">
          <CardBody p="8">
            <Center flexDirection="column" textAlign="center" mb="8">
              <Center w="20" h="20" bgGradient="linear(to-r, blue.500, purple.500)" borderRadius="xl" p="3" mb="4" shadow="lg">
                <CheckCircleIcon boxSize="48px" color="white" />
              </Center>
              <Heading as="h2" size="lg" mb="2" color="white">Admin Access</Heading>
              <Text color="gray.400">Secure administrator login portal</Text>
            </Center>

            {error && (
              <Alert status="error" mb="6">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <VStack as="form" onSubmit={handleSubmit} spacing="5">
              <FormControl>
                <FormLabel color="gray.300">Admin Email</FormLabel>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@prodigyconnect.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  pl="10"
                  bg="blackAlpha.300"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "blue.500" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Password</FormLabel>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  pl="10"
                  bg="blackAlpha.300"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "blue.500" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Security Code</FormLabel>
                <Input
                  id="security-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  maxLength={6}
                  pl="10"
                  bg="blackAlpha.300"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "blue.500" }}
                />
              </FormControl>

              <Button 
                type="submit" 
                w="full" 
                bgGradient="linear(to-r, blue.500, purple.500)" 
                color="white" 
                _hover={{ opacity: 0.9 }} 
                transition="opacity 0.2s" 
                shadow="lg"
                leftIcon={<CheckCircleIcon />}
                isLoading={loading}
                loadingText="Signing In..."
              >
                Sign In as Admin
              </Button>
            </VStack>

            <Box mt="6" p="4" bg="blue.900" border="1px" borderColor="blue.700" borderRadius="lg">
              <Flex gap="3">
                <CheckCircleIcon color="blue.400" mt="0.5" />
                <Box>
                  <Text color="blue.300" mb="1" fontSize="sm">Admin Security Notice</Text>
                  <Text fontSize="xs" color="gray.400">
                    This is a secure administrator portal. All login attempts are monitored.
                  </Text>
                </Box>
              </Flex>
            </Box>
          </CardBody>
        </Card>

        <Box mt="4" textAlign="center">
          <Text fontSize="xs" color="gray.500">
            Prodigy Connect Admin Portal
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
