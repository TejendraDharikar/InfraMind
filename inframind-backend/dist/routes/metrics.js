"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET /api/metrics - Get all metrics with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { serverId, limit = 100, offset = 0 } = req.query;
        const where = {};
        if (serverId) {
            where.serverId = serverId;
        }
        const [metrics, total] = await Promise.all([
            db_1.default.metric.findMany({
                where,
                include: { server: true },
                orderBy: { timestamp: 'desc' },
                take: Math.min(parseInt(limit) || 100, 1000),
                skip: parseInt(offset) || 0
            }),
            db_1.default.metric.count({ where })
        ]);
        res.status(200).json({
            success: true,
            data: metrics,
            pagination: {
                total,
                limit: Math.min(parseInt(limit) || 100, 1000),
                offset: parseInt(offset) || 0
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch metrics',
            timestamp: new Date().toISOString()
        });
    }
});
// GET /api/metrics/:id - Get specific metric
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const metric = await db_1.default.metric.findUnique({
            where: { id },
            include: { server: true }
        });
        if (!metric) {
            return res.status(404).json({
                success: false,
                error: 'Metric not found',
                timestamp: new Date().toISOString()
            });
        }
        res.status(200).json({
            success: true,
            data: metric,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching metric:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch metric',
            timestamp: new Date().toISOString()
        });
    }
});
// POST /api/metrics - Create metric
router.post('/', async (req, res) => {
    try {
        const { serverId, cpuUsage, memoryUsage, networkUsage, diskUsage } = req.body;
        // Validation
        if (!serverId || cpuUsage === undefined || memoryUsage === undefined || networkUsage === undefined || diskUsage === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: serverId, cpuUsage, memoryUsage, networkUsage, diskUsage',
                timestamp: new Date().toISOString()
            });
        }
        // Verify server exists
        const server = await db_1.default.server.findUnique({
            where: { id: serverId }
        });
        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found',
                timestamp: new Date().toISOString()
            });
        }
        const metric = await db_1.default.metric.create({
            data: {
                serverId,
                cpuUsage: parseFloat(cpuUsage),
                memoryUsage: parseFloat(memoryUsage),
                networkUsage: parseFloat(networkUsage),
                diskUsage: parseFloat(diskUsage)
            },
            include: { server: true }
        });
        res.status(201).json({
            success: true,
            data: metric,
            message: 'Metric created successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error creating metric:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create metric',
            timestamp: new Date().toISOString()
        });
    }
});
// GET /api/servers/:serverId/metrics/latest - Get latest 24 metrics for a server
router.get('/server/:serverId/latest', async (req, res) => {
    try {
        const { serverId } = req.params;
        // Verify server exists
        const server = await db_1.default.server.findUnique({
            where: { id: serverId }
        });
        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found',
                timestamp: new Date().toISOString()
            });
        }
        const metrics = await db_1.default.metric.findMany({
            where: { serverId },
            orderBy: { timestamp: 'desc' },
            take: 24,
            include: { server: true }
        });
        res.status(200).json({
            success: true,
            data: metrics.reverse(), // Return in chronological order
            count: metrics.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching latest metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch latest metrics',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=metrics.js.map