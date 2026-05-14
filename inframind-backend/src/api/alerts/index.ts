import { Router, Request, Response } from 'express';
import { GetAlertsQuerySchema, CreateAlertBodySchema, UpdateAlertBodySchema } from './schema';
import { alertsQuery } from './query';
import { alertsMutation } from './mutation';

const router = Router();

// GET /api/alerts
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = GetAlertsQuerySchema.parse(req.query);
    const result = await alertsQuery.getAlerts(query);
    
    res.status(200).json({
      success: true, 
      data: result.alerts,
      pagination: { total: result.total, limit: result.limit, offset: result.offset },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
    }
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// GET /api/alerts/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const alert = await alertsQuery.getAlertById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alert' });
  }
});

// POST /api/alerts
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = CreateAlertBodySchema.parse(req.body);
    const alert = await alertsMutation.createAlert(body);
    res.status(201).json({ success: true, data: alert, message: 'Alert created successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
    if (error.message === 'Server not found') return res.status(404).json({ success: false, error: error.message });
    console.error('Error creating alert:', error);
    res.status(500).json({ success: false, error: 'Failed to create alert' });
  }
});

// PUT /api/alerts/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const body = UpdateAlertBodySchema.parse(req.body);
    const alert = await alertsMutation.updateAlert(req.params.id, body);
    res.status(200).json({ success: true, data: alert, message: 'Alert updated successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
    if (error.message === 'Alert not found') return res.status(404).json({ success: false, error: error.message });
    console.error('Error updating alert:', error);
    res.status(500).json({ success: false, error: 'Failed to update alert' });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const alert = await alertsMutation.deleteAlert(req.params.id);
    res.status(200).json({ success: true, data: alert, message: 'Alert deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Alert not found') return res.status(404).json({ success: false, error: error.message });
    console.error('Error deleting alert:', error);
    res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
});

export default router;
