const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Item = require('../models/Item');
const mongoose = require('mongoose');

// Place a bid (protected route)
router.post('/:itemId', [
  auth,
  body('amount').isFloat({ min: 0 })
], async (req, res) => {
  try {
    // Validate itemId
    if (!req.params.itemId || !mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid item ID'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const item = await Item.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Auction has ended' 
      });
    }

    if (item.endTime < new Date()) {
      item.status = 'ended';
      await item.save();
      return res.status(400).json({ 
        success: false,
        message: 'Auction has ended' 
      });
    }

    if (item.sellerId.toString() === req.user.id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot bid on your own item' 
      });
    }

    const amount = parseFloat(req.body.amount);
    
    if (amount <= item.currentBid) {
      return res.status(400).json({ 
        success: false,
        message: 'Bid amount must be higher than current bid' 
      });
    }

    // Add bid to item
    item.bids.push({
      bidderId: req.user.id,
      amount,
      timestamp: new Date()
    });

    item.currentBid = amount;
    item.lastBidderId = req.user.id;
    await item.save();

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      bid: {
        amount,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while placing bid',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all bids for an item
router.get('/:itemId', async (req, res) => {
  try {
    // Validate itemId
    if (!req.params.itemId || !mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid item ID'
      });
    }

    const item = await Item.findById(req.params.itemId)
      .populate('bids.bidderId', 'username')
      .select('bids');
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    res.json({
      success: true,
      bids: item.bids
    });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching bids',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 