import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Auction Platform
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Buy and sell items through exciting auctions
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/shop')}
            >
              Browse Auctions
            </Button>
            {currentUser && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/add-item')}
              >
                Sell an Item
              </Button>
            )}
          </Stack>
        </Paper>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          mt: 4
        }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Buy with Confidence
              </Typography>
              <Typography color="text.secondary">
                Browse through a wide selection of items and place your bids. Win auctions and get great deals on unique items.
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Sell Your Items
              </Typography>
              <Typography color="text.secondary">
                List your items for auction and let the market determine their value. Reach potential buyers from around the world.
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Secure Transactions
              </Typography>
              <Typography color="text.secondary">
                Our platform ensures safe and secure transactions between buyers and sellers. Your satisfaction is our priority.
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 