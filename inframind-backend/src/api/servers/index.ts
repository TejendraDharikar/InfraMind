import { Router, Request, Response } from 'express';
import { GetServersQuerySchema, CreateServerBodySchema, UpdateServerBodySchema } from './schema';
import { serversQuery } from './query';
import { serversMutation } from './mutation';

const router = Router();

// GET /api/servers
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = GetServersQuerySchema.parse(req.query);
    const result = await serversQuery.getServers(query);
    res.status(200).json({
      success: true, data: result.servers,
      pagination: { total: result.total, limit: result.limit, offset: result.offset },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
    console.error('Error fetching servers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch servers' });
  }
});

// GET /api/servers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const server = await serversQuery.getServerById(req.params.id);
    if (!server) return res.status(404).json({ success: false, error: 'Server not found' });
    res.status(200).json({ success: true, data: server });
  } catch (error) {
    console.error('Error fetching server:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch server' });
  }
});

// POST /api/servers
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = CreateServerBodySchema.parse(req.body);
    const server = await serversMutation.createServer(body);
    res.status(201).json({ success: true, data: server, message: 'Server created successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
    console.error('Error creating server:', error);
    res.status(500).json({ success: false, error: 'Failed to create server' });
  }
});

// PUT /api/servers/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const body = UpdateServerBodySchema.parse(req.body);
    const server = await serversMutation.updateServer(req.params.id, body);
    res.status(200).json({ success: true, data: server, message: 'Server updated successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
    if (error.message === 'Server not found') return res.status(404).json({ success: false, error: error.message });
    console.error('Error updating server:', error);
    res.status(500).json({ success: false, error: 'Failed to update server' });
  }
});

// DELETE /api/servers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await serversMutation.deleteServer(req.params.id);
    res.status(200).json({ success: true, data: deleted, message: 'Server deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Server not found') return res.status(404).json({ success: false, error: error.message });
    console.error('Error deleting server:', error);
    res.status(500).json({ success: false, error: 'Failed to delete server' });
  }
});

export default router;
