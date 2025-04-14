import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddItem: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token || !currentUser) {
        throw new Error('You must be logged in to add an item');
      }

      // Validate input
      if (title.length < 3) {
        throw new Error('Title must be at least 3 characters long');
      }
      if (description.length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }
      if (!imageUrl.startsWith('http')) {
        throw new Error('Please provide a valid image URL');
      }
      if (parseFloat(startingBid) <= 0) {
        throw new Error('Starting bid must be a positive number');
      }
      if (!endTime) {
        throw new Error('Please provide an end time');
      }

      const response = await axios.post('http://localhost:5001/api/items', {
        title,
        description,
        imageUrl,
        startingBid: parseFloat(startingBid),
        endTime: new Date(endTime).toISOString(),
        sellerId: currentUser.id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate('/shop');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add item');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Add Item for Auction
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Item Title"
              name="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="imageUrl"
              label="Image URL"
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="startingBid"
              label="Starting Bid"
              name="startingBid"
              type="number"
              value={startingBid}
              onChange={(e) => setStartingBid(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="endTime"
              label="Auction End Time"
              name="endTime"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              Add Item
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddItem;