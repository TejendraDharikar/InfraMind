"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const anomaly_1 = require("../services/anomaly");
const socket_1 = require("../socket");
const router = (0, express_1.Router)();
/** @openapi
 * /api/metrics:
 *   get:
 *     tags: [Metrics]
 *     summary: List all metrics
 *     parameters:
 *       - in: query
 *         name: serverId
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: List of metrics }
 */
router.get('/', async (req, res) => {
    try {
        const { serverId, limit = 100, offset = 0 } = req.query;
        const where = {};
        if (serverId)
            where.serverId = serverId;
        const [metrics, total] = await Promise.all([
            db_1.default.metric.findMany({
                where, include: { server: true },
                orderBy: { timestamp: 'desc' },
                take: Math.min(parseInt(limit) || 100, 1000),
                skip: parseInt(offset) || 0
            }),
            db_1.default.metric.count({ where })
        ]);
        res.status(200).json({
            success: true, data: metrics,
            pagination: { total, limit: Math.min(parseInt(limit) || 100, 1000), offset: parseInt(offset) || 0 },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch metrics', timestamp: new Date().toISOString() });
    }
});
/** @openapi
 * /api/metrics/{id}:
 *   get:
 *     tags: [Metrics]
 *     summary: Get specific metric
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Metric details }
 *       404: { description: Not found }
 */
router.get('/:id', async (req, res) => {
    try {
        const metric = await db_1.default.metric.findUnique({ where: { id: req.params.id }, include: { server: true } });
        if (!metric)
            return res.status(404).json({ success: false, error: 'Metric not found', timestamp: new Date().toISOString() });
        res.status(200).json({ success: true, data: metric, timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('Error fetching metric:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch metric', timestamp: new Date().toISOString() });
    }
});
/** @openapi
 * /api/metrics:
 *   post:
 *     tags: [Metrics]
 *     summary: Create metric (with AI anomaly detection)
 *     description: Auto-generates alerts when anomalies detected
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serverId, cpuUsage, memoryUsage, networkUsage, diskUsage]
 *             properties:
 *               serverId: { type: string }
 *               cpuUsage: { type: number, example: 45.2 }
 *               memoryUsage: { type: number, example: 62.1 }
 *               networkUsage: { type: number, example: 28.5 }
 *               diskUsage: { type: number, example: 71.3 }
 *     responses:
 *       201: { description: Metric created with any auto-generated alerts }
 *       400: { description: Missing fields }
 *       404: { description: Server not found }
 */
router.post('/', async (req, res) => {
    try {
        const { serverId, cpuUsage, memoryUsage, networkUsage, diskUsage } = req.body;
        if (!serverId || cpuUsage === undefined || memoryUsage === undefined || networkUsage === undefined || diskUsage === undefined) {
            return res.status(400).json({ success: false, error: 'Missing required fields: serverId, cpuUsage, memoryUsage, networkUsage, diskUsage', timestamp: new Date().toISOString() });
        }
        const server = await db_1.default.server.findUnique({ where: { id: serverId } });
        if (!server)
            return res.status(404).json({ success: false, error: 'Server not found', timestamp: new Date().toISOString() });
        const metric = await db_1.default.metric.create({
            data: { serverId, cpuUsage: parseFloat(cpuUsage), memoryUsage: parseFloat(memoryUsage), networkUsage: parseFloat(networkUsage), diskUsage: parseFloat(diskUsage) },
            include: { server: true }
        });
        // AI Anomaly Detection
        const anomalies = (0, anomaly_1.analyzeMetrics)({ cpuUsage: parseFloat(cpuUsage), memoryUsage: parseFloat(memoryUsage), networkUsage: parseFloat(networkUsage), diskUsage: parseFloat(diskUsage), serverName: server.name });
        const generatedAlerts = [];
        for (const anomaly of anomalies) {
            const alert = await db_1.default.alert.create({ data: { serverId, type: anomaly.type, message: anomaly.message, severity: anomaly.severity, status: 'open' } });
            generatedAlerts.push(alert);
            (0, socket_1.getIo)().emit('new_alert', alert);
        }
        if (anomalies.some(a => a.severity === 'critical')) {
            const updatedServer = await db_1.default.server.update({ where: { id: serverId }, data: { status: 'unhealthy' } });
            (0, socket_1.getIo)().emit('server_updated', updatedServer);
        }
        (0, socket_1.getIo)().emit('new_metric', metric);
        res.status(201).json({
            success: true,
            data: { metric, alerts: generatedAlerts },
            message: generatedAlerts.length > 0 ? `Metric created. ${generatedAlerts.length} anomaly alert(s) generated.` : 'Metric created successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error creating metric:', error);
        res.status(500).json({ success: false, error: 'Failed to create metric', timestamp: new Date().toISOString() });
    }
});
/** @openapi
 * /api/metrics/server/{serverId}/latest:
 *   get:
 *     tags: [Metrics]
 *     summary: Get latest 24 metrics for a server
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Latest 24 metrics in chronological order }
 *       404: { description: Server not found }
 */
router.get('/server/:serverId/latest', async (req, res) => {
    try {
        const { serverId } = req.params;
        const server = await db_1.default.server.findUnique({ where: { id: serverId } });
        if (!server)
            return res.status(404).json({ success: false, error: 'Server not found', timestamp: new Date().toISOString() });
        const metrics = await db_1.default.metric.findMany({ where: { serverId }, orderBy: { timestamp: 'desc' }, take: 24, include: { server: true } });
        res.status(200).json({ success: true, data: metrics.reverse(), count: metrics.length, timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('Error fetching latest metrics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch latest metrics', timestamp: new Date().toISOString() });
    }
});
exports.default = router;
//# sourceMappingURL=metrics.js.map