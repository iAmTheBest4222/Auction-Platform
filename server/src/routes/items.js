const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Item = require('../models/Item');

// Get all active items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find({ status: 'active' })
      .populate('sellerId', 'username')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('sellerId', 'username')
      .populate('bids.bidderId', 'username');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new item (protected route)
router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('imageUrl')
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('startingBid')
    .isFloat({ min: 0 })
    .withMessage('Starting bid must be a positive number'),
  body('endTime')
    .isISO8601()
    .withMessage('Please provide a valid end time')
], async (req, res) => {
  try {
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

    const { title, description, imageUrl, startingBid, endTime } = req.body;

    // Create new item
    const item = new Item({
      title,
      description,
      imageUrl,
      currentBid: startingBid,
      startingBid,
      sellerId: req.user.id,
      endTime: new Date(endTime),
      status: 'active'
    });

    await item.save();

    res.status(201).json({
      success: true,
      item: {
        id: item._id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        currentBid: item.currentBid,
        startingBid: item.startingBid,
        sellerId: item.sellerId,
        endTime: item.endTime,
        status: item.status
      }
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while adding item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update item (protected route - only seller can update)
router.put('/:id', [
  auth,
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('imageUrl').optional().isURL(),
  body('endTime').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ message: 'Cannot update ended or cancelled item' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(update => {
      item[update] = updates[update];
    });

    await item.save();
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item (protected route - only seller can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await item.remove();
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sell item at current bid (protected route - only seller can sell)
router.post('/:id/sell', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    if (item.sellerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to sell this item' 
      });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot sell an ended or cancelled item' 
      });
    }

    if (!item.currentBid || item.currentBid <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No valid bids on this item' 
      });
    }

    // Update item status and mark as sold
    item.status = 'sold';
    item.soldTo = item.lastBidderId;
    item.soldAt = new Date();
    item.soldPrice = item.currentBid;
    await item.save();

    res.json({
      success: true,
      message: 'Item sold successfully',
      item: {
        id: item._id,
        title: item.title,
        soldPrice: item.soldPrice,
        soldTo: item.soldTo,
        soldAt: item.soldAt
      }
    });
  } catch (error) {
    console.error('Error selling item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while selling item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 