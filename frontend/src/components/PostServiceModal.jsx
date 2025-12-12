import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  useToast,
  VStack,
  Grid
} from '@chakra-ui/react';
import { servicesAPI } from '../../services/api';

export function PostServiceModal({ isOpen, onClose, user, onServicePosted }) {
  const [newService, setNewService] = useState({
    title: '',
    category: 'Home Services',
    description: '',
    price: '',
    location: user.location || 'Sacramento, CA',
    tags: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const categories = ['Home Services', 'Education', 'Tech Services', 'Health & Fitness', 'Creative Services', 'Business Services'];

  const handlePostService = async () => {
    if (!newService.title || !newService.description || !newService.price || !newService.category) {
      toast({
        title: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newService.title);
      formData.append('category', newService.category);
      formData.append('description', newService.description);
      formData.append('price', parseFloat(newService.price));
      formData.append('location', newService.location || user.location || 'Sacramento, CA');
      formData.append('tags', newService.tags);

      formData.append('provider', user._id);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      
      const response = await servicesAPI.createService(formData);
      onServicePosted(response.data);
      onClose();
      setNewService({
        title: '',
        category: 'Home Services',
        description: '',
        price: '',
        location: user.location || 'Sacramento, CA',
        tags: ''
      });
      setImageFile(null);
      toast({
          title: 'Service posted successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
    } catch (err) {
      toast({
        title: 'Failed to post service',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent borderRadius="xl" bg="var(--card)">
        <ModalHeader borderBottomWidth="1px" borderColor="var(--border)" color="var(--foreground)">Post a New Service</ModalHeader>
        <ModalBody py="6">
          <VStack as="form" spacing="5">
            <FormControl>
              <FormLabel fontWeight="medium" color="var(--foreground)">Service Title</FormLabel>
              <Input 
                placeholder="e.g., Professional Plumbing Services" 
                borderRadius="md" 
                bg="var(--input-background)" 
                borderColor="var(--input)"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium" color="var(--foreground)">Category</FormLabel>
              <Select 
                borderRadius="md" 
                bg="var(--input-background)" 
                borderColor="var(--input)"
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
              >
                {categories.map(cat => <option key={cat}>{cat}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium" color="var(--foreground)">Description</FormLabel>
              <Textarea 
                rows={4} 
                placeholder="Describe your service..." 
                borderRadius="md" 
                bg="var(--input-background)" 
                borderColor="var(--input)"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
            </FormControl>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <FormControl>
                <FormLabel fontWeight="medium" color="var(--foreground)">Price</FormLabel>
                <Input 
                  type="number"
                  placeholder="$50" 
                  borderRadius="md" 
                  bg="var(--input-background)" 
                  borderColor="var(--input)"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="medium" color="var(--foreground)">Location</FormLabel>
                <Input 
                  placeholder="Sacramento, CA" 
                  borderRadius="md" 
                  bg="var(--input-background)" 
                  borderColor="var(--input)"
                  value={newService.location}
                  onChange={(e) => setNewService({ ...newService, location: e.target.value })}
                />
              </FormControl>
            </Grid>
            <FormControl>
              <FormLabel fontWeight="medium" color="var(--foreground)">Tags</FormLabel>
              <Input 
                placeholder="e.g., plumbing, home repair, 24/7" 
                borderRadius="md" 
                bg="var(--input-background)" 
                borderColor="var(--input)"
                value={newService.tags}
                onChange={(e) => setNewService({ ...newService, tags: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium" color="var(--foreground)">Service Image</FormLabel>
              <Input 
                type="file"
                p="1.5"
                borderRadius="md" 
                bg="var(--input-background)" 
                borderColor="var(--input)"
                onChange={(e) => setImageFile(e.target.files[0])}
                accept="image/png, image/jpeg, image/gif"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="var(--border)" bg="var(--muted)" borderBottomRadius="xl">
          <Button variant="ghost" mr={3} onClick={onClose} color="var(--muted-foreground)">Cancel</Button>
          <Button 
            className="btn-gradient-primary"
            colorScheme="blue"
            onClick={handlePostService}
            isLoading={loading}
          >
            Post Service
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
