import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/servers - List all servers
router.get('/', async (req: Request, res: Response) => {
  try {
    const servers = await prisma.server.findMany({
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        alerts: {
          where: { status: 'open' },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: servers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch servers',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/servers/:id - Get server details with recent metrics and alerts
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const server = await prisma.server.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 100
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: server,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch server',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/servers - Create a new server
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, hostName, status } = req.body;

    // Validation
    if (!name || !hostName || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, hostName, status',
        timestamp: new Date().toISOString()
      });
    }

    const server = await prisma.server.create({
      data: {
        name,
        hostName,
        status
      }
    });

    res.status(201).json({
      success: true,
      data: server,
      message: 'Server created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create server',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/servers/:id - Update server status
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, hostName, status } = req.body;

    // Check if server exists
    const existingServer = await prisma.server.findUnique({
      where: { id }
    });

    if (!existingServer) {
      return res.status(404).json({
        success: false,
        error: 'Server not found',
        timestamp: new Date().toISOString()
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (hostName) updateData.hostName = hostName;
    if (status) updateData.status = status;

    const updatedServer = await prisma.server.update({
      where: { id },
      data: updateData,
      include: {
        metrics: { orderBy: { timestamp: 'desc' }, take: 1 },
        alerts: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedServer,
      message: 'Server updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update server',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/servers/:id - Delete server and related data
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if server exists
    const existingServer = await prisma.server.findUnique({
      where: { id }
    });

    if (!existingServer) {
      return res.status(404).json({
        success: false,
        error: 'Server not found',
        timestamp: new Date().toISOString()
      });
    }

    // Delete server (cascading deletes will handle metrics and alerts)
    const deletedServer = await prisma.server.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      data: deletedServer,
      message: 'Server deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete server',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
