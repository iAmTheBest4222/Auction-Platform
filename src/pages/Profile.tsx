import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Item {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  sellerId: string | { _id: string };
  endTime: string;
  status: string;
  bids: Array<{
    bidderId: string;
    amount: number;
    timestamp: string;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [itemsForSale, setItemsForSale] = useState<Item[]>([]);
  const [itemsBidding, setItemsBidding] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !currentUser) return;

        // Fetch all items
        const response = await axios.get<Item[]>('http://localhost:5001/api/items', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Process items to ensure sellerId is a string
        const processedItems = response.data.map(item => ({
          ...item,
          sellerId: typeof item.sellerId === 'object' ? item.sellerId._id : item.sellerId
        }));

        // Filter items for sale (items where current user is seller)
        const forSale = processedItems.filter(item => item.sellerId === currentUser.id);
        setItemsForSale(forSale);

        // Filter items being bid on (items where current user has placed a bid)
        const bidding = processedItems.filter(item => 
          item.bids?.some(bid => bid.bidderId === currentUser.id)
        );
        setItemsBidding(bidding);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching items:', err);
        setLoading(false);
      }
    };

    fetchItems();
  }, [currentUser]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" />;
      case 'sold':
        return <Chip label="Sold" color="error" />;
      case 'ended':
        return <Chip label="Ended" color="warning" />;
      default:
        return <Chip label={status} />;
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Please log in to view your profile
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Typography variant="h6" gutterBottom>
          Username: {currentUser.username}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Email: {currentUser.email}
        </Typography>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="My Items for Sale" />
          <Tab label="Items I'm Bidding On" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3} direction="row" flexWrap="wrap" useFlexGap>
          {itemsForSale.map((item) => (
            <Box key={item._id} sx={{ width: { xs: '100%', sm: '48%', md: '31%' } }}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl}
                  alt={item.title}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {item.title}
                    </Typography>
                    {getStatusChip(item.status)}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Current Bid: ${item.currentBid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ends: {new Date(item.endTime).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
          {itemsForSale.length === 0 && !loading && (
            <Box sx={{ width: '100%', p: 3 }}>
              <Typography variant="h6" align="center">
                You haven't listed any items for sale yet.
              </Typography>
            </Box>
          )}
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3} direction="row" flexWrap="wrap" useFlexGap>
          {itemsBidding.map((item) => (
            <Box key={item._id} sx={{ width: { xs: '100%', sm: '48%', md: '31%' } }}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl}
                  alt={item.title}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {item.title}
                    </Typography>
                    {getStatusChip(item.status)}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Current Bid: ${item.currentBid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ends: {new Date(item.endTime).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
          {itemsBidding.length === 0 && !loading && (
            <Box sx={{ width: '100%', p: 3 }}>
              <Typography variant="h6" align="center">
                You haven't placed any bids yet.
              </Typography>
            </Box>
          )}
        </Stack>
      </TabPanel>
    </Container>
  );
};

export default Profile; 