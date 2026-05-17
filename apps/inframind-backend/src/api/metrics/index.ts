import { Router, Request, Response } from 'express';
import { GetMetricsQuerySchema, CreateMetricBodySchema } from './schema';
import { metricsQuery } from './query';
import { metricsMutation } from './mutation';
import prisma from '../../db';

const router = Router();

// GET /api/metrics
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = GetMetricsQuerySchema.parse(req.query);
    const result = await metricsQuery.getMetrics(query);
    res.status(200).json({
      success: true,
      data: result.metrics,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error.name === 'ZodError')
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.errors,
      });
    console.error('Error fetching metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
});

// GET /api/metrics/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const metric = await metricsQuery.getMetricById(req.params.id);
    if (!metric)
      return res
        .status(404)
        .json({ success: false, error: 'Metric not found' });
    res.status(200).json({ success: true, data: metric });
  } catch (error) {
    console.error('Error fetching metric:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch metric' });
  }
});

// POST /api/metrics
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = CreateMetricBodySchema.parse(req.body);
    const result = await metricsMutation.createMetric(body);
    res.status(201).json({
      success: true,
      data: result,
      message:
        result.alerts.length > 0
          ? `Metric created. ${result.alerts.length} anomaly alert(s) generated.`
          : 'Metric created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error.name === 'ZodError')
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.errors,
      });
    if (error.message === 'Server not found')
      return res.status(404).json({ success: false, error: error.message });
    console.error('Error creating metric:', error);
    res.status(500).json({ success: false, error: 'Failed to create metric' });
  }
});

// GET /api/metrics/server/:serverId/latest
router.get('/server/:serverId/latest', async (req: Request, res: Response) => {
  try {
    const server = await prisma.server.findUnique({
      where: { id: req.params.serverId },
    });
    if (!server)
      return res
        .status(404)
        .json({ success: false, error: 'Server not found' });

    const metrics = await metricsQuery.getLatestServerMetrics(
      req.params.serverId,
    );
    res.status(200).json({
      success: true,
      data: metrics,
      count: metrics.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching latest metrics:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch latest metrics' });
  }
});

export default router;
