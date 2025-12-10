import { useState } from 'react';
import { 
  Box, Flex, Text, Button, Input, Badge,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, RadioGroup, Radio, Stack, useToast,
  Card, CardHeader, CardBody, CardFooter, Heading, Spacer, SimpleGrid
} from '@chakra-ui/react';
import { 
  AddIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CopyIcon,
  DownloadIcon,
  TimeIcon,
  QuestionOutlineIcon,
  PlusSquareIcon,
  RepeatClockIcon
} from '@chakra-ui/icons';

const mockTransactions = [
  {
    id: 'TXN-1001',
    date: '2025-10-08',
    description: 'Plumbing Service - Sarah Johnson',
    amount: 150.00,
    status: 'completed',
    type: 'income',
    invoice: 'INV-1001'
  },
  {
    id: 'TXN-1002',
    date: '2025-10-07',
    description: 'Math Tutoring Session',
    amount: 60.00,
    status: 'completed',
    type: 'income',
    invoice: 'INV-1002'
  },
  {
    id: 'TXN-1003',
    date: '2025-10-06',
    description: 'Platform Commission Fee',
    amount: 25.50,
    status: 'completed',
    type: 'expense'
  },
  {
    id: 'TXN-1004',
    date: '2025-10-05',
    description: 'Web Development Project',
    amount: 450.00,
    status: 'pending',
    type: 'income',
    invoice: 'INV-1003'
  },
  {
    id: 'TXN-1005',
    date: '2025-10-04',
    description: 'Landscaping Service',
    amount: 200.00,
    status: 'completed',
    type: 'income',
    invoice: 'INV-1004'
  }
];

const paymentMethods = [
  { id: '1', type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
  { id: '2', type: 'Mastercard', last4: '8888', expiry: '08/26', isDefault: false }
];

const bankAccounts = [
  { id: 'bank1', bankName: 'Chase Bank', accountType: 'Checking', last4: '7890', isDefault: true },
  { id: 'bank2', bankName: 'Bank of America', accountType: 'Savings', last4: '4321', isDefault: false }
];

export function PaymentSystem({ user }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('bank1');
  const [payoutAmount, setPayoutAmount] = useState('734.50');
  const availableBalance = 734.50;
  const toast = useToast()

  const totalEarnings = mockTransactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = mockTransactions
    .filter(t => t.type === 'income' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDownloadInvoice = (transaction) => {
    toast({
        title: `Downloading invoice ${transaction.invoice}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="green.600" />;
      case 'pending':
        return <TimeIcon color="yellow.600" />;
      case 'failed':
        return <QuestionOutlineIcon color="red.600" />;
      case 'refunded':
        return <RepeatClockIcon color="gray.600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'green',
      pending: 'yellow',
      failed: 'red',
      refunded: 'gray'
    };
    return variants[status] || variants.pending;
  };

  const handlePayoutRequest = () => {
    const amount = parseFloat(payoutAmount);
    
    if (isNaN(amount) || amount <= 0) {
        toast({
            title: 'Please enter a valid amount',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
      return;
    }
    
    if (amount > availableBalance) {
        toast({
            title: `Amount exceeds available balance ($${availableBalance.toFixed(2)})`,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
      return;
    }
    
    const selectedAccount = bankAccounts.find(acc => acc.id === payoutMethod);
    toast({
        title: `Payout request of $${amount.toFixed(2)} to ${selectedAccount?.bankName} •••• ${selectedAccount?.last4} submitted! Funds will be transferred within 2-3 business days.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    setShowPayoutDialog(false);
  };

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>Payments & Billing</Heading>
          <Text color="gray.600">Manage your earnings and payment methods</Text>
        </Box>
        <Button 
          colorScheme="blue"
          onClick={() => setShowPayoutDialog(true)}
          leftIcon={<CopyIcon />}
        >
          Request Payout
        </Button>
      </Flex>

      {/* Financial Overview */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="sm" color="gray.600">Total Earnings</Text>
              <CopyIcon color="green.600" />
            </Flex>
            <Heading size="lg">${totalEarnings.toFixed(2)}</Heading>
            <Text fontSize="sm" color="gray.500">This month</Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="sm" color="gray.600">Pending</Text>
              <TimeIcon color="yellow.600" />
            </Flex>
            <Heading size="lg">${pendingAmount.toFixed(2)}</Heading>
            <Text fontSize="sm" color="gray.500">Processing</Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="sm" color="gray.600">Available</Text>
              <CopyIcon color="blue.600" />
            </Flex>
            <Heading size="lg">$734.50</Heading>
            <Text fontSize="sm" color="gray.500">Ready for payout</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Tabs variant="enclosed-colored">
        <TabList>
          <Tab>Transactions</Tab>
          <Tab>Payment Methods</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Card>
                <CardHeader>
                    <Flex justify="space-between" align="center">
                        <Heading as="h3" size="md">Recent Transactions</Heading>
                        <Button variant="outline" size="sm" leftIcon={<DownloadIcon />}>
                            Export
                        </Button>
                    </Flex>
              </CardHeader>
              <CardBody>
                <Stack spacing={3}>
                  {mockTransactions.map((transaction) => (
                    <Flex 
                      key={transaction.id}
                      align="center" 
                      justify="space-between" 
                      p={4} 
                      bg="gray.50" 
                      borderRadius="lg" 
                      _hover={{ boxShadow: 'md' }} 
                      transition="box-shadow 0.2s"
                    >
                      <Flex align="center" gap={3}>
                        {getStatusIcon(transaction.status)}
                        <Box>
                            <Text fontWeight="medium">{transaction.description}</Text>
                            <Text fontSize="sm" color="gray.500">{transaction.date}</Text>
                        </Box>
                      </Flex>
                      <Flex align="center" gap={4}>
                        <Text fontWeight="medium" color={transaction.type === 'income' ? 'green.600' : 'red.600'}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </Text>
                        <Badge colorScheme={getStatusBadge(transaction.status)}>{transaction.status}</Badge>
                        {transaction.invoice && <Button size="xs" variant="outline" onClick={() => handleDownloadInvoice(transaction)}>Invoice</Button>}
                      </Flex>
                    </Flex>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card>
                <CardHeader>
                    <Flex justify="space-between" align="center">
                    <Heading as="h3" size="md">Payment Methods</Heading>
                    <Button 
                        colorScheme="blue"
                        onClick={() => setShowAddCard(true)}
                        leftIcon={<AddIcon />}
                    >
                        Add Card
                    </Button>
                    </Flex>
                </CardHeader>
              <CardBody>
                <Stack spacing={3}>
                  {paymentMethods.map((method) => (
                    <Flex 
                      key={method.id}
                      align="center" 
                      justify="space-between" 
                      p={4} 
                      borderWidth="1px" 
                      borderRadius="lg"
                    >
                      <Flex align="center" gap={3}>
                        <PlusSquareIcon />
                        <Box>
                            <Text fontWeight="medium">{method.type} ending in {method.last4}</Text>
                            <Text fontSize="sm" color="gray.500">Expires {method.expiry}</Text>
                        </Box>
                        {method.isDefault && <Badge colorScheme="blue">Default</Badge>}
                      </Flex>
                      <Button size="sm" variant="outline">Remove</Button>
                    </Flex>
                  ))}
                </Stack>

                {showAddCard && (
                  <Card mt={6} p={6} bg="gray.50" borderWidth="1px" borderRadius="lg">
                    <Heading as="h4" size="md" mb={4}>Add New Payment Method</Heading>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Card Number</FormLabel>
                        <Input placeholder="1234 5678 9012 3456" />
                      </FormControl>
                      <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                          <FormLabel>Expiry Date</FormLabel>
                          <Input placeholder="MM/YY" />
                        </FormControl>
                        <FormControl>
                          <FormLabel>CVV</FormLabel>
                          <Input placeholder="123" type="password" />
                        </FormControl>
                      </SimpleGrid>
                      <FormControl>
                        <FormLabel>Cardholder Name</FormLabel>
                        <Input placeholder="John Doe" />
                      </FormControl>
                      <Flex gap={2}>
                        <Button 
                          colorScheme="blue"
                          onClick={() => {
                            toast({
                                title: 'Payment method added successfully',
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              });
                            setShowAddCard(false);
                          }}
                        >
                          Add Card
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddCard(false)}>
                          Cancel
                        </Button>
                      </Flex>
                    </Stack>
                  </Card>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Payout Dialog */}
      <Modal isOpen={showPayoutDialog} onClose={() => setShowPayoutDialog(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Payout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              {/* Available Balance Display */}
              <Box bg="blue.50" p={4} borderRadius="lg" borderWidth="1px" borderColor="blue.100">
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text fontSize="sm" color="gray.600">Available Balance</Text>
                    <Text fontSize="2xl" fontWeight="bold" mt={1}>${availableBalance.toFixed(2)}</Text>
                  </Box>
                  <CopyIcon boxSize={8} color="blue.600" />
                </Flex>
                <Button
                  variant="link"
                  size="sm"
                  mt={2}
                  onClick={() => setPayoutAmount(availableBalance.toFixed(2))}
                >
                  Withdraw all available funds
                </Button>
              </Box>

              {/* Payment Method Selection */}
              <FormControl>
                <FormLabel>Select Bank Account</FormLabel>
                <RadioGroup value={payoutMethod} onChange={setPayoutMethod}>
                  <Stack spacing={3}>
                    {bankAccounts.map((account) => (
                      <Box
                        key={account.id}
                        p={4}
                        borderRadius="lg"
                        borderWidth="2px"
                        borderColor={payoutMethod === account.id ? 'blue.600' : 'gray.200'}
                        cursor="pointer"
                        onClick={() => setPayoutMethod(account.id)}
                      >
                        <Flex align="center" justify="space-between">
                            <Flex align="center" gap={3}>
                                <Radio value={account.id} id={account.id} />
                                <Box>
                                    <Text fontWeight="medium">{account.bankName}</Text>
                                    <Text fontSize="sm" color="gray.500">{account.accountType} •••• {account.last4}</Text>
                                </Box>
                            </Flex>
                          {account.isDefault && <Badge colorScheme="blue">Default</Badge>}
                        </Flex>
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Amount Input */}
              <FormControl>
                <FormLabel htmlFor="payout-amount">Payout Amount</FormLabel>
                <Input
                  id="payout-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={availableBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                />
                 <Text fontSize="xs" color="gray.500" mt={1}>
                    Processing time: 2-3 business days
                </Text>
              </FormControl>

              {/* Summary */}
              {parseFloat(payoutAmount) > 0 && !isNaN(parseFloat(payoutAmount)) && (
                <Box bg="gray.50" p={4} borderRadius="lg" spacing={2}>
                  <Flex justify="space-between" fontSize="sm">
                    <Text color="gray.600">Amount to transfer</Text>
                    <Text fontWeight="medium">${parseFloat(payoutAmount).toFixed(2)}</Text>
                  </Flex>
                  <Flex justify="space-between" fontSize="sm">
                    <Text color="gray.600">Processing fee</Text>
                    <Text fontWeight="medium">$0.00</Text>
                  </Flex>
                  <Flex justify="space-between" pt={2} mt={2} borderTopWidth="1px">
                    <Text fontWeight="medium">You will receive</Text>
                    <Text fontWeight="medium" color="green.600">${parseFloat(payoutAmount).toFixed(2)}</Text>
                  </Flex>
                </Box>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowPayoutDialog(false)}
              mr={3}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handlePayoutRequest}
              leftIcon={<ArrowRightIcon />}
            >
              Confirm Payout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
