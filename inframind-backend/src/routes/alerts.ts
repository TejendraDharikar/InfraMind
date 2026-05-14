import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/alerts - List all alerts with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { serverId, severity, status, limit = 100, offset = 0 } = req.query;

    const where: any = {};
    if (serverId) {
      where.serverId = serverId as string;
    }
    if (severity) {
      where.severity = severity as string;
    }
    if (status) {
      where.status = status as string;
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: { server: true },
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(limit as string) || 100, 1000),
        skip: parseInt(offset as string) || 0
      }),
      prisma.alert.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: alerts,
      pagination: {
        total,
        limit: Math.min(parseInt(limit as string) || 100, 1000),
        offset: parseInt(offset as string) || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/alerts/:id - Get alert details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: { server: true }
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: alert,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/alerts - Create alert
router.post('/', async (req: Request, res: Response) => {
  try {
    const { serverId, type, message, severity, status } = req.body;

    // Validation
    if (!serverId || !type || !message || !severity || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: serverId, type, message, severity, status',
        timestamp: new Date().toISOString()
      });
    }

    // Verify server exists
    const server = await prisma.server.findUnique({
      where: { id: serverId }
    });

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found',
        timestamp: new Date().toISOString()
      });
    }

    const alert = await prisma.alert.create({
      data: {
        serverId,
        type,
        message,
        severity,
        status
      },
      include: { server: true }
    });

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Alert created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create alert',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/alerts/:id - Update alert status
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, message, severity } = req.body;

    // Check if alert exists
    const existingAlert = await prisma.alert.findUnique({
      where: { id }
    });

    if (!existingAlert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
        timestamp: new Date().toISOString()
      });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (message) updateData.message = message;
    if (severity) updateData.severity = severity;
    
    // If status is being set to 'resolved', set resolvedAt timestamp
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: { server: true }
    });

    res.status(200).json({
      success: true,
      data: updatedAlert,
      message: 'Alert updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update alert',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if alert exists
    const existingAlert = await prisma.alert.findUnique({
      where: { id }
    });

    if (!existingAlert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
        timestamp: new Date().toISOString()
      });
    }

    const deletedAlert = await prisma.alert.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      data: deletedAlert,
      message: 'Alert deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
