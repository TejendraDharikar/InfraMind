import { Router, Request, Response } from 'express';
import { CreateWebhookBodySchema } from './schema';
import { webhooksQuery } from './query';
import { webhooksMutation } from './mutation';

const router = Router();

// GET /api/webhooks
router.get('/', async (req: Request, res: Response) => {
  try {
    const webhooks = await webhooksQuery.getAllWebhooks();
    res.status(200).json({ success: true, data: webhooks, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch webhooks' });
  }
});

// POST /api/webhooks
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = CreateWebhookBodySchema.parse(req.body);
    const webhook = await webhooksMutation.createWebhook(body);
    res.status(201).json({ success: true, data: webhook, message: 'Webhook created successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
    console.error('Error creating webhook:', error);
    res.status(500).json({ success: false, error: 'Failed to create webhook' });
  }
});

// DELETE /api/webhooks/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await webhooksMutation.deleteWebhook(req.params.id);
    res.status(200).json({ success: true, data: deleted, message: 'Webhook deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Webhook not found') return res.status(404).json({ success: false, error: error.message });
    console.error('Error deleting webhook:', error);
    res.status(500).json({ success: false, error: 'Failed to delete webhook' });
  }
});

// PUT /api/webhooks/:id/toggle
router.put('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const updated = await webhooksMutation.toggleWebhook(req.params.id);
    res.status(200).json({ success: true, data: updated, message: `Webhook ${updated.isActive ? 'activated' : 'deactivated'}` });
  } catch (error: any) {
    if (error.message === 'Webhook not found') return res.status(404).json({ success: false, error: error.message });
    console.error('Error toggling webhook:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle webhook' });
  }
});

export default router;
