import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Box,
  Stack,
  Paper,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
}

const Shop: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: string }>({});
  const [error] = useState<string>('');
  const [bidErrors, setBidErrors] = useState<{ [key: string]: string }>({});
  const [sellErrors, setSellErrors] = useState<{ [key: string]: string }>({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching items with token:', token);
        console.log('Current user:', currentUser);

        const response = await axios.get<Item[]>('http://localhost:5001/api/items', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Raw response data:', response.data);
        
        // Ensure sellerId is properly populated
        const itemsWithSeller = response.data.map(item => ({
          ...item,
          sellerId: typeof item.sellerId === 'object' ? item.sellerId._id : item.sellerId
        }));

        console.log('Processed items:', itemsWithSeller);
        setItems(itemsWithSeller);
      } catch (err) {
        console.error('Error fetching items:', err);
      }
    };

    fetchItems();
  }, [currentUser]);

  const handleBidAmountChange = (itemId: string, value: string) => {
    setBidAmounts(prev => {
      const newBidAmounts = { ...prev };
      newBidAmounts[itemId] = value;
      return newBidAmounts;
    });
    // Clear error when user starts typing
    if (bidErrors[itemId]) {
      setBidErrors(prev => {
        const newBidErrors = { ...prev };
        delete newBidErrors[itemId];
        return newBidErrors;
      });
    }
  };

  const handleBid = async (itemId: string) => {
    if (!currentUser) {
      setBidErrors(prev => ({ ...prev, [itemId]: 'Please log in to place a bid' }));
      return;
    }
    
    const bid = parseFloat(bidAmounts[itemId]);
    if (isNaN(bid)) {
      setBidErrors(prev => ({ ...prev, [itemId]: 'Please enter a valid bid amount' }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setBidErrors(prev => ({ ...prev, [itemId]: 'Please log in to place a bid' }));
        return;
      }

      const item = items.find(i => i._id === itemId);
      if (!item) {
        setBidErrors(prev => ({ ...prev, [itemId]: 'Item not found' }));
        return;
      }

      // Check if item is active
      if (item.status !== 'active') {
        setBidErrors(prev => ({ ...prev, [itemId]: 'Auction has ended' }));
        return;
      }

      // Check if user is the seller
      if (item.sellerId === currentUser.id) {
        setBidErrors(prev => ({ ...prev, [itemId]: 'Cannot bid on your own item' }));
        return;
      }

      // Check if bid is higher than current bid
      if (bid <= item.currentBid) {
        setBidErrors(prev => ({ ...prev, [itemId]: 'Bid must be higher than current bid' }));
        return;
      }

      // Check if auction has ended
      const endTime = new Date(item.endTime);
      if (endTime < new Date()) {
        setBidErrors(prev => ({ ...prev, [itemId]: 'Auction has ended' }));
        return;
      }

      console.log('Placing bid with data:', {
        itemId,
        amount: bid,
        currentBid: item.currentBid,
        sellerId: item.sellerId,
        currentUserId: currentUser.id
      });

      const response = await axios.post(
        `http://localhost:5001/api/bids/${itemId}`,
        { amount: bid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Bid response:', response.data);

      // Clear error for this item
      setBidErrors(prev => {
        const newBidErrors = { ...prev };
        delete newBidErrors[itemId];
        return newBidErrors;
      });
      
      // Refresh items after successful bid
      const itemsResponse = await axios.get<Item[]>('http://localhost:5001/api/items', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(itemsResponse.data);
      
      // Reset bid amount for this item
      setBidAmounts(prev => {
        const newBidAmounts = { ...prev };
        newBidAmounts[itemId] = '';
        return newBidAmounts;
      });
    } catch (err: any) {
      console.error('Error placing bid:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle specific error messages from the server
      const errorMessage = err.response?.data?.message || 'Failed to place bid';
      setBidErrors(prev => ({ ...prev, [itemId]: errorMessage }));
    }
  };

  const handleSell = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSellErrors(prev => ({ ...prev, [itemId]: 'Please log in to sell this item' }));
        return;
      }

      const response = await axios.post(
        `http://localhost:5001/api/items/${itemId}/sell`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Sell response:', response.data);

      // Clear error for this item
      setSellErrors(prev => {
        const newSellErrors = { ...prev };
        delete newSellErrors[itemId];
        return newSellErrors;
      });
      
      // Refresh items after successful sale
      const itemsResponse = await axios.get<Item[]>('http://localhost:5001/api/items', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(itemsResponse.data);
    } catch (err: any) {
      console.error('Error selling item:', err);
      const errorMessage = err.response?.data?.message || 'Failed to sell item';
      setSellErrors(prev => ({ ...prev, [itemId]: errorMessage }));
    }
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="error">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            No Items Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Be the first to add an item for auction!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/add-item')}
          >
            Add Item for Auction
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: 3
      }}>
        {items.map((item) => {
          // Debug logs for seller identification
          console.log('Item details:', {
            itemId: item._id,
            itemSellerId: item.sellerId,
            currentUserId: currentUser?.id,
            isSeller: currentUser && item.sellerId === currentUser.id,
            itemStatus: item.status,
            rawItem: item
          });

          const isSeller = currentUser && item.sellerId === currentUser.id;
          const isActive = item.status === 'active';
          
          return (
            <Card key={item._id}>
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
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {isSeller ? (
                    <>
                      {isActive && (
                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          onClick={() => handleSell(item._id)}
                          disabled={!!sellErrors[item._id]}
                        >
                          Sell Now for ${item.currentBid}
                        </Button>
                      )}
                      {!isActive && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          {item.status === 'sold' ? 'Item has been sold' : 'Auction has ended'}
                        </Typography>
                      )}
                      {sellErrors[item._id] && (
                        <Typography color="error" variant="body2">
                          {sellErrors[item._id]}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <>
                      {isActive ? (
                        <>
                          <TextField
                            type="number"
                            label="Your Bid"
                            value={bidAmounts[item._id] || ''}
                            onChange={(e) => handleBidAmountChange(item._id, e.target.value)}
                            fullWidth
                            error={!!bidErrors[item._id]}
                            helperText={bidErrors[item._id]}
                          />
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleBid(item._id)}
                            disabled={!currentUser}
                          >
                            Place Bid
                          </Button>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          {item.status === 'sold' ? 'Item has been sold' : 'Auction has ended'}
                        </Typography>
                      )}
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Container>
  );
};

export default Shop;