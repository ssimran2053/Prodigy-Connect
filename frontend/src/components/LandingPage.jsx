import React from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Image,
  Text,
  Tooltip,
  VStack,
  HStack,
  Grid,
  Container,
  Center,
  Icon
} from '@chakra-ui/react';
import { 
  ViewIcon, 
  ChatIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  StarIcon,
  ArrowForwardIcon,
  SearchIcon,
  ArrowUpIcon,
} from '@chakra-ui/icons';

// Ensure you import your globals.css in your main entry file (index.js or App.js)
// import './globals.css'; 

import logoImageLight from '../assets/c4928b5b313acf796a0d321d9c48650523bf2f6f.png';
import logoImageFooter from '../assets/638e492cf2ecf697ce5c734aeca24edf4677345a.png';

export function LandingPage({ onGetStarted }) {
  const features = [
    {
      icon: ViewIcon,
      title: 'Connect Locally',
      description: 'Find trusted service providers in your community',
      iconColor: 'var(--primary)',
      bg: 'var(--primary-light)'
    },
    {
      icon: SearchIcon, // Changed to reflect "Location" better or keep ViewIcon
      title: 'Location-Based',
      description: 'Discover services near you with our interactive map',
      iconColor: 'var(--secondary)',
      bg: 'var(--secondary-light)'
    },
    {
      icon: ChatIcon,
      title: 'Direct Messaging',
      description: 'Communicate safely with providers through our platform',
      iconColor: 'var(--foreground)',
      bg: 'var(--muted)'
    },
    {
      icon: CalendarIcon,
      title: 'Schedule Management',
      description: 'Book and manage appointments seamlessly',
      iconColor: 'var(--info)',
      bg: 'var(--info-light)'
    },
    {
      icon: StarIcon,
      title: 'Ratings & Reviews',
      description: 'Make informed decisions with community feedback',
      iconColor: 'var(--secondary-hover)',
      bg: 'var(--secondary-light)'
    },
    {
      icon: CheckCircleIcon,
      title: 'Safe & Secure',
      description: 'Admin-monitored platform ensuring trust and safety',
      iconColor: 'var(--foreground)',
      bg: 'var(--muted)'
    }
  ];

  return (
    <Box minH="100vh" bg="var(--background)" color="var(--foreground)" fontFamily="sans-serif">
      
      {/* Navigation */}
      <Box 
        as="nav" 
        className="glass" // Uses your .glass class from globals.css
        position="fixed" 
        w="full" 
        top="0" 
        zIndex="50"
      >
        <Container maxW="container.xl" px="6" py="4">
          <Flex align="center" justify="space-between">
            <HStack gap="3">
              <Center w="10" h="10">
                <Image 
                  src={logoImageLight} 
                  alt="Prodigy Connect Logo" 
                  boxSize="100%"
                  objectFit="contain"
                />
              </Center>
              <Text fontSize="xl" fontWeight="bold" color="var(--foreground)">
                Prodigy Connect
              </Text>
            </HStack>
            <HStack gap="4">
              <Button 
                variant="ghost" 
                onClick={onGetStarted}
                fontWeight="medium"
                borderRadius="full"
                px={6}
                _hover={{ bg: 'var(--muted)' }}
              >
                Login
              </Button>
              <Button 
                onClick={onGetStarted}
                bg="var(--primary)"
                color="white"
                fontWeight="semibold"
                borderRadius="full"
                px={6}
                _hover={{ bg: 'var(--primary-hover)' }}
              >
                Sign Up
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box as="section" pt={{ base: "32", md: "40" }} pb="20" px="4" className="bg-gradient-auth">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={16} alignItems="center">
            
            {/* Left Content */}
            <Box>
              <Heading 
                as="h1" 
                fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} 
                mb="6" 
                color="var(--primary)" 
                fontWeight="bold" 
                lineHeight="1.1"
              >
                Connect with Local<br />
                Service Providers
              </Heading>
              
              <Text fontSize="lg" color="var(--muted-foreground)" mb="8" lineHeight="relaxed" maxW="lg">
                Prodigy Connect brings together service seekers and providers in your community. 
                Find trusted professionals for any task, or offer your skills to those who need them.
              </Text>
              
              <HStack spacing={4} mb={12}>
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="btn-gradient-primary" // Uses your global CSS gradient class
                  px={8}
                  h={14}
                  borderRadius="full"
                  leftIcon={<SearchIcon />}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Find Services
                </Button>
                
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="btn-gradient-primary" // keeping consistent with the provided image style
                  px={8}
                  h={14}
                  borderRadius="full"
                  leftIcon={<ArrowUpIcon />}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Offer Services
                </Button>
              </HStack>
              
              <Grid templateColumns="repeat(3, 1fr)" gap={8} pt={4}>
                <Box>
                  <Text fontSize="3xl" mb="1" fontWeight="bold" color="var(--primary)">10k+</Text>
                  <Text color="var(--muted-foreground)" fontSize="sm" fontWeight="medium">Active Users</Text>
                </Box>
                <Box>
                  <Text fontSize="3xl" mb="1" fontWeight="bold" color="var(--primary)">5k+</Text>
                  <Text color="var(--muted-foreground)" fontSize="sm" fontWeight="medium">Services Listed</Text>
                </Box>
                <Box>
                  <Text fontSize="3xl" mb="1" fontWeight="bold" color="var(--primary)">4.8<Icon as={StarIcon} boxSize={5} mb={1} ml={1}/></Text>
                  <Text color="var(--muted-foreground)" fontSize="sm" fontWeight="medium">Average Rating</Text>
                </Box>
              </Grid>
            </Box>
            
            {/* Right Image - Styled to match the "Sketch" look from reference */}
            <Box position="relative">
              <Box 
                bg="white" 
                p={4} 
                borderRadius="2xl" 
                shadow="xl" 
                transform="rotate(2deg)"
                border="1px solid var(--border)"
              >
                 {/* Note: The specific sketch image from the reference is not provided in assets. 
                    Using a placeholder that fits the community theme.
                 */}
                <Image 
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"
                  alt="Community Sketch"
                  w="full"
                  h="400px"
                  objectFit="cover"
                  borderRadius="xl"
                  filter="grayscale(20%) contrast(110%)" // Stylized to look a bit more like the art style
                />
              </Box>

              {/* Floating Badge */}
              <Flex 
                position="absolute" 
                bottom="-8" 
                left={{ base: "10%", md: "-6" }} 
                bg="white" 
                borderRadius="xl" 
                shadow="lg" 
                p="4" 
                align="center" 
                gap="3" 
                border="1px solid var(--border)"
              >
                <Center w="10" h="10" bg="var(--success-light)" borderRadius="full">
                  <CheckCircleIcon boxSize="20px" color="var(--success)" />
                </Center>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="var(--foreground)">Verified Safe</Text>
                  <Text fontSize="xs" color="var(--muted-foreground)">100% Background Checked</Text>
                </Box>
              </Flex>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Features Section - Using bg-gradient-soft */}
      <Box as="section" py="24" className="bg-gradient-soft" position="relative">
        <Container maxW="container.xl" px="4">
          <Center flexDirection="column" mb="16" textAlign="center">
            <HStack bg="var(--secondary-light)" color="var(--secondary-hover)" px="4" py="1.5" borderRadius="full" mb="6">
              <Icon as={StarIcon} boxSize={3} />
              <Text fontSize="sm" fontWeight="bold">Platform Features</Text>
            </HStack>
            <Heading as="h2" fontSize="4xl" mb="4" color="var(--foreground)">Everything You Need</Heading>
            <Text fontSize="lg" color="var(--muted-foreground)" maxW="2xl">
              Powerful features designed to connect communities and make service discovery effortless
            </Text>
          </Center>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
            {features.map((feature, index) => (
              <Card 
                key={index}
                bg="var(--card)"
                border="1px solid var(--border)"
                shadow="sm"
                _hover={{ 
                  shadow: "xl", 
                  transform: "translateY(-5px)",
                  borderColor: "var(--primary-light)" 
                }}
                transition="all 0.3s"
                borderRadius="xl"
                cursor="pointer"
              >
                <CardBody p="8">
                  <Center w="14" h="14" bg={feature.bg} borderRadius="xl" mb="6">
                    <feature.icon boxSize="28px" color={feature.iconColor} />
                  </Center>
                  <Heading as="h3" fontSize="xl" mb="3" color="var(--foreground)">{feature.title}</Heading>
                  <Text color="var(--muted-foreground)" lineHeight="1.6">{feature.description}</Text>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box as="section" id="how-it-works" py="24" bg="var(--background)">
        <Container maxW="container.xl" px="4">
          <Center flexDirection="column" mb="16">
            <Heading as="h2" fontSize="4xl" mb="4" color="var(--foreground)">How It Works</Heading>
            <Text fontSize="lg" color="var(--muted-foreground)">Get started in three simple steps</Text>
          </Center>

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={12} maxW="6xl" mx="auto">
            {[
              { step: '1', title: 'Create Account', description: 'Sign up for free as a seeker or provider', icon: ViewIcon },
              { step: '2', title: 'Browse & Connect', description: 'Find services or post your offerings', icon: SearchIcon },
              { step: '3', title: 'Book & Complete', description: 'Schedule appointments and get things done', icon: CheckCircleIcon }
            ].map((item, index) => (
              <VStack key={index} textAlign="center" spacing="6" position="relative">
                {/* Connector Line (visible on desktop) */}
                {index !== 2 && (
                  <Box 
                    display={{ base: "none", md: "block" }}
                    position="absolute"
                    top="32px"
                    right="-50%"
                    width="100%"
                    height="2px"
                    bg="var(--border)"
                    zIndex="0"
                  />
                )}
                <Center 
                  w="16" 
                  h="16" 
                  className="btn-gradient-primary" // Using gradient for the numbers
                  borderRadius="2xl" 
                  color="white" 
                  fontSize="2xl" 
                  shadow="lg" 
                  fontWeight="bold"
                  zIndex="1"
                >
                  {item.step}
                </Center>
                <Heading as="h3" fontSize="xl" color="var(--foreground)">{item.title}</Heading>
                <Text color="var(--muted-foreground)">{item.description}</Text>
              </VStack>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section - Using bg-gradient-primary */}
      <Box as="section" py="24" className="bg-gradient-soft" position="relative" overflow="hidden">
        {/* Background Pattern Overlay */}
        <Box 
            position="absolute" 
            inset="0" 
            opacity="0.1" 
            backgroundImage="radial-gradient(circle at 1px 1px, white 1px, transparent 0)"
            backgroundSize="40px 40px"
        />
        
        <Container maxW="container.xl" px="4" textAlign="center" position="relative">
          <HStack 
            bg="rgba(178, 174, 255, 1)" 
            backdropFilter="blur(10px)" 
            px="4" 
            py="2" 
            borderRadius="full" 
            mb="8" 
            display="inline-flex"
            border="1px solid rgba(255,255,255,0.3)"
          >
            <Icon as={StarIcon} color="rgba(73, 0, 218, 1)" />
            <Text fontSize="sm" fontWeight="medium" color="rgba(73, 0, 218, 1)">Join our growing community</Text>
          </HStack>
          
          <Heading as="h2" fontSize={{ base: "4xl", md: "5xl" }} mb="6" fontWeight="bold" color="var(--foreground)">
            Ready to Get Started?
          </Heading>
          <Text fontSize="xl" mb="12" color="var(--foreground)" maxW="2xl" mx="auto">
            Join thousands of service seekers and providers making meaningful connections every day
          </Text>
          
          <Flex direction={{ base: "column", sm: "row" }} gap={4} justify="center" mb={16}>
            <Button 
              size="lg" 
              bg="white"
              color="var(--primary)"
              borderRadius={"full"}
              px="10" 
              h="14"
              shadow="xl"
              _hover={{ transform: "scale(1.05)", bg: "gray.50"}}
              onClick={onGetStarted}
              leftIcon={<Icon as={ArrowUpIcon} transform="rotate(45deg)"/>}
            >
              Create Free Account
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="btn-gradient-primary"
              color="white"
              borderColor="whiteAlpha.600"
              borderRadius="full"
              h="14"
              px="10"
              _hover={{ bg: "whiteAlpha.200", borderColor: "white" }}
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How It Works
            </Button>
          </Flex>

          <Flex 
            justify="center" 
            gap={{ base: 6, md: 16 }} 
            flexWrap="wrap"
            borderTop="1px solid rgba(255,255,255,0.2)"
            pt="8"
            maxW="4xl"
            mx="auto"
          >
            <HStack spacing="3">
              <CheckCircleIcon boxSize="24px" color="var(--success-dark)" />
              <VStack align="flex-start" spacing="0">
                <Text fontWeight="bold" color="var(--foreground)">100% Free</Text>
                <Text fontSize="xs" color="var(--foreground)">No Hidden Fees</Text>
              </VStack>
            </HStack>
            <HStack spacing="3">
              <CheckCircleIcon boxSize="24px" color="var(--success-dark)" />
              <VStack align="flex-start" spacing="0">
                <Text fontWeight="bold" color="var(--foreground)">Verified Safe</Text>
                <Text fontSize="xs" color="var(--foreground)">Background Checked</Text>
              </VStack>
            </HStack>
            <HStack spacing="3">
              <StarIcon boxSize="24px" color="var(--warning)" />
              <VStack align="flex-start" spacing="0">
                <Text fontWeight="bold" color="var(--foreground)">Top Rated</Text>
                <Text fontSize="xs" color="var(--foreground)">4.8/5 Average</Text>
              </VStack>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" bg="#0f172a" color="var(--muted-foreground)" py="16">
        <Container maxW="container.xl" px="4">
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }} gap={12} mb={12}>
            <VStack align="flex-start" spacing={6}>
              <HStack gap="3">
                <Center w="8" h="8">
                  <Image 
                    src={logoImageFooter} 
                    alt="Prodigy Connect"
                    boxSize="100%"
                    objectFit="contain"
                  />
                </Center>
                <Text color="white" fontSize="lg" fontWeight="bold">Prodigy Connect</Text>
              </HStack>
              <Text fontSize="sm" maxW="xs">
                Connecting communities through trusted local services. Find help or offer your skills today.
              </Text>
            </VStack>
            
            <VStack align="flex-start">
              <Text color="white" fontWeight="bold" mb="4">Platform</Text>
              <VStack as="ul" spacing="3" align="flex-start" listStyleType="none">
                <Text as="a" href="#" _hover={{ color: "white" }} cursor="pointer">Browse Services</Text>
                <Text as="a" href="#" _hover={{ color: "white" }} cursor="pointer">Become a Provider</Text>
                <Text as="a" href="#" _hover={{ color: "white" }} cursor="pointer">How It Works</Text>
              </VStack>
            </VStack>
            
            <VStack align="flex-start">
              <Text color="white" fontWeight="bold" mb="4">Company</Text>
              <VStack as="ul" spacing="3" align="flex-start" listStyleType="none">
                <Text as="a" href="#" _hover={{ color: "white" }} cursor="pointer">About Us</Text>
                <Text as="a" href="#" _hover={{ color: "white" }} cursor="pointer">Contact</Text>
                <Text as="a" href="#" _hover={{ color: "white" }} cursor="pointer">Careers</Text>
              </VStack>
            </VStack>
            
            <VStack align="flex-start">
              <Text color="white" fontWeight="bold" mb="4">Legal</Text>
              <VStack as="ul" spacing="3" align="flex-start" listStyleType="none">
                <Text as="a" href="https://www.termsfeed.com/blog/sample-privacy-policy-template/" _hover={{ color: "white" }} cursor="pointer">Privacy Policy</Text>
                <Text as="a" href="https://www.termsfeed.com/blog/sample-terms-of-service-template/" _hover={{ color: "white" }} cursor="pointer">Terms of Service</Text>
                <Text as="a" href="https://www.termsfeed.com/blog/sample-cookies-policy-template/" _hover={{ color: "white" }} cursor="pointer">Cookie Policy</Text>
              </VStack>
            </VStack>
          </Grid>
          
          <Box borderTop="1px solid" borderColor="gray.800" pt="8" fontSize="sm" textAlign="center">
            © 2025 Prodigy Connect. All rights reserved. | CSC 131-04 Software Engineering Project
          </Box>
        </Container>
      </Box>
    </Box>
  );
}