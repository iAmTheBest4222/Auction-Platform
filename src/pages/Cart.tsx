import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface CartItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: string;
  status: string;
  bids: Array<{
    bidderId: string;
    amount: number;
    timestamp: string;
  }>;
}

const Cart: React.FC = () => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (!currentUser?.id) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const response = await axios.get<CartItem[]>('http://localhost:5001/api/items', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Filter items where the current user has placed a bid
        const itemsWithBids = response.data.filter(item => 
          item.bids?.some(bid => bid.bidderId === currentUser.id)
        );

        setCartItems(itemsWithBids);
      } catch (err) {
        console.error('Error fetching cart items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [currentUser?.id]);

  const handlePurchase = async (itemId: string) => {
    if (!currentUser?.id) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        `http://localhost:5001/api/items/${itemId}/purchase`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh the items list
      const response = await axios.get<CartItem[]>('http://localhost:5001/api/items', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const itemsWithBids = response.data.filter(item => 
        item.bids?.some(bid => bid.bidderId === currentUser.id)
      );

      setCartItems(itemsWithBids);
    } catch (error) {
      console.error('Error purchasing item:', error);
    }
  };

  if (!currentUser) {
    return (
      <Container>
        <Typography variant="h5" align="center">
          Please log in to view your cart
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Typography variant="h5" align="center">
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            My Cart
          </Typography>
          {cartItems.length === 0 ? (
            <Typography variant="body1" align="center">
              Your cart is empty
            </Typography>
          ) : (
            <List>
              {cartItems.map((item) => {
                const userBid = item.bids?.find(bid => bid.bidderId === currentUser.id);
                const isWinning = item.bids?.length > 0 && 
                  item.bids[item.bids.length - 1].bidderId === currentUser.id;
                const isEnded = new Date(item.endTime) < new Date();

                return (
                  <React.Fragment key={item._id}>
                    <ListItem>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Your Bid: ${userBid?.amount}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              Status: {isEnded ? (isWinning ? 'Won' : 'Lost') : (isWinning ? 'Currently Winning' : 'Outbid')}
                              <br />
                              Ends: {new Date(item.endTime).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      {isEnded && isWinning && item.status === 'active' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handlePurchase(item._id)}
                        >
                          Purchase
                        </Button>
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Cart; 