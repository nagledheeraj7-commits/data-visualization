import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { settings: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      include: { settings: true }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const settings = await prisma.userSettings.findUnique({
      where: { userId: decoded.userId }
    });

    if (!settings) {
      // Create default settings if not found
      const defaultSettings = await prisma.userSettings.create({
        data: {
          userId: decoded.userId,
          theme: 'light',
          chartAnimation: true,
          itemsPerPage: 10,
          autoRefresh: 0,
          showNotifications: true,
          notificationDuration: 3,
          autoSave: true
        }
      });

      res.json({
        success: true,
        data: defaultSettings
      });
    } else {
      res.json({
        success: true,
        data: settings
      });
    }
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const {
      theme,
      chartAnimation,
      itemsPerPage,
      autoRefresh,
      showNotifications,
      notificationDuration,
      autoSave
    } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: decoded.userId },
      update: {
        ...(theme !== undefined && { theme }),
        ...(chartAnimation !== undefined && { chartAnimation }),
        ...(itemsPerPage !== undefined && { itemsPerPage }),
        ...(autoRefresh !== undefined && { autoRefresh }),
        ...(showNotifications !== undefined && { showNotifications }),
        ...(notificationDuration !== undefined && { notificationDuration }),
        ...(autoSave !== undefined && { autoSave })
      },
      create: {
        userId: decoded.userId,
        theme: theme || 'light',
        chartAnimation: chartAnimation !== undefined ? chartAnimation : true,
        itemsPerPage: itemsPerPage || 10,
        autoRefresh: autoRefresh || 0,
        showNotifications: showNotifications !== undefined ? showNotifications : true,
        notificationDuration: notificationDuration || 3,
        autoSave: autoSave !== undefined ? autoSave : true
      }
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
