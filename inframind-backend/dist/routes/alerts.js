"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const socket_1 = require("../socket");
const router = (0, express_1.Router)();
/** @openapi
 * /api/alerts:
 *   get:
 *     tags: [Alerts]
 *     summary: List alerts with filtering
 *     parameters:
 *       - in: query
 *         name: serverId
 *         schema: { type: string }
 *       - in: query
 *         name: severity
 *         schema: { type: string, enum: [info, warning, critical] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, acknowledged, resolved, closed] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Filtered list of alerts }
 */
router.get('/', async (req, res) => {
    try {
        const { serverId, severity, status, limit = 100, offset = 0 } = req.query;
        const where = {};
        if (serverId)
            where.serverId = serverId;
        if (severity)
            where.severity = severity;
        if (status)
            where.status = status;
        const [alerts, total] = await Promise.all([
            db_1.default.alert.findMany({
                where, include: { server: true }, orderBy: { createdAt: 'desc' },
                take: Math.min(parseInt(limit) || 100, 1000),
                skip: parseInt(offset) || 0
            }),
            db_1.default.alert.count({ where })
        ]);
        res.status(200).json({
            success: true, data: alerts,
            pagination: { total, limit: Math.min(parseInt(limit) || 100, 1000), offset: parseInt(offset) || 0 },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch alerts', timestamp: new Date().toISOString() });
    }
});
/** @openapi
 * /api/alerts/{id}:
 *   get:
 *     tags: [Alerts]
 *     summary: Get alert details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Alert details }
 *       404: { description: Not found }
 */
router.get('/:id', async (req, res) => {
    try {
        const alert = await db_1.default.alert.findUnique({ where: { id: req.params.id }, include: { server: true } });
        if (!alert)
            return res.status(404).json({ success: false, error: 'Alert not found', timestamp: new Date().toISOString() });
        res.status(200).json({ success: true, data: alert, timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('Error fetching alert:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch alert', timestamp: new Date().toISOString() });
    }
});
/** @openapi
 * /api/alerts:
 *   post:
 *     tags: [Alerts]
 *     summary: Create an alert
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serverId, type, message, severity, status]
 *             properties:
 *               serverId: { type: string }
 *               type: { type: string, example: cpu }
 *               message: { type: string }
 *               severity: { type: string, enum: [info, warning, critical] }
 *               status: { type: string, enum: [open, acknowledged, resolved, closed] }
 *     responses:
 *       201: { description: Alert created }
 *       400: { description: Missing fields }
 *       404: { description: Server not found }
 */
router.post('/', async (req, res) => {
    try {
        const { serverId, type, message, severity, status } = req.body;
        if (!serverId || !type || !message || !severity || !status) {
            return res.status(400).json({ success: false, error: 'Missing required fields: serverId, type, message, severity, status', timestamp: new Date().toISOString() });
        }
        const server = await db_1.default.server.findUnique({ where: { id: serverId } });
        if (!server)
            return res.status(404).json({ success: false, error: 'Server not found', timestamp: new Date().toISOString() });
        const alert = await db_1.default.alert.create({ data: { serverId, type, message, severity, status }, include: { server: true } });
        res.status(201).json({ success: true, data: alert, message: 'Alert created successfully', timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ success: false, error: 'Failed to create alert', timestamp: new Date().toISOString() });
    }
});
/** @openapi
 * /api/alerts/{id}:
 *   put:
 *     tags: [Alerts]
 *     summary: Update alert status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [open, acknowledged, resolved, closed] }
 *               message: { type: string }
 *               severity: { type: string, enum: [info, warning, critical] }
 *     responses:
 *       200: { description: Alert updated }
 *       404: { description: Not found }
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, message, severity } = req.body;
        const existingAlert = await db_1.default.alert.findUnique({ where: { id } });
        if (!existingAlert)
            return res.status(404).json({ success: false, error: 'Alert not found', timestamp: new Date().toISOString() });
        const updateData = {};
        if (status)
            updateData.status = status;
        if (message)
            updateData.message = message;
        if (severity)
            updateData.severity = severity;
        if (status === 'resolved' || status === 'closed')
            updateData.resolvedAt = new Date();
        const updatedAlert = await db_1.default.alert.update({ where: { id }, data: updateData, include: { server: true } });
        (0, socket_1.getIo)().emit('alert_updated', updatedAlert);
        res.status(200).json({ success: true, data: updatedAlert, message: 'Alert updated successfully', timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('Error updating alert:', error);
        res.status(500).json({ success: false, error: 'Failed to update alert', timestamp: new Date().toISOString() });
    }
});
/** @openapi
 * /api/alerts/{id}:
 *   delete:
 *     tags: [Alerts]
 *     summary: Delete an alert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Alert deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existingAlert = await db_1.default.alert.findUnique({ where: { id } });
        if (!existingAlert)
            return res.status(404).json({ success: false, error: 'Alert not found', timestamp: new Date().toISOString() });
        const deletedAlert = await db_1.default.alert.delete({ where: { id } });
        (0, socket_1.getIo)().emit('alert_deleted', id);
        res.status(200).json({ success: true, data: deletedAlert, message: 'Alert deleted successfully', timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ success: false, error: 'Failed to delete alert', timestamp: new Date().toISOString() });
    }
});
exports.default = router;
//# sourceMappingURL=alerts.js.map