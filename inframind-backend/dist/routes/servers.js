"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/servers:
 *   get:
 *     tags: [Servers]
 *     summary: List all servers
 *     description: Returns all servers with their latest metric and open alerts
 *     responses:
 *       200:
 *         description: List of servers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Server'
 */
router.get('/', async (req, res) => {
    try {
        const servers = await db_1.default.server.findMany({
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
    }
    catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch servers',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @openapi
 * /api/servers/{id}:
 *   get:
 *     tags: [Servers]
 *     summary: Get server details
 *     description: Returns server details with 100 recent metrics and 50 alerts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Server ID
 *     responses:
 *       200:
 *         description: Server details
 *       404:
 *         description: Server not found
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const server = await db_1.default.server.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching server:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch server',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @openapi
 * /api/servers:
 *   post:
 *     tags: [Servers]
 *     summary: Create a new server
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, hostName, status]
 *             properties:
 *               name:
 *                 type: string
 *                 example: web-prod-01
 *               hostName:
 *                 type: string
 *                 example: 10.0.1.10
 *               status:
 *                 type: string
 *                 enum: [stable, unhealthy, offline]
 *                 example: stable
 *     responses:
 *       201:
 *         description: Server created
 *       400:
 *         description: Missing required fields
 */
router.post('/', async (req, res) => {
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
        const server = await db_1.default.server.create({
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
    }
    catch (error) {
        console.error('Error creating server:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create server',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @openapi
 * /api/servers/{id}:
 *   put:
 *     tags: [Servers]
 *     summary: Update a server
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               hostName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [stable, unhealthy, offline]
 *     responses:
 *       200:
 *         description: Server updated
 *       404:
 *         description: Server not found
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, hostName, status } = req.body;
        // Check if server exists
        const existingServer = await db_1.default.server.findUnique({
            where: { id }
        });
        if (!existingServer) {
            return res.status(404).json({
                success: false,
                error: 'Server not found',
                timestamp: new Date().toISOString()
            });
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (hostName)
            updateData.hostName = hostName;
        if (status)
            updateData.status = status;
        const updatedServer = await db_1.default.server.update({
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
    }
    catch (error) {
        console.error('Error updating server:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update server',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @openapi
 * /api/servers/{id}:
 *   delete:
 *     tags: [Servers]
 *     summary: Delete a server
 *     description: Deletes the server and cascades to related metrics and alerts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Server deleted
 *       404:
 *         description: Server not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check if server exists
        const existingServer = await db_1.default.server.findUnique({
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
        const deletedServer = await db_1.default.server.delete({
            where: { id }
        });
        res.status(200).json({
            success: true,
            data: deletedServer,
            message: 'Server deleted successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error deleting server:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete server',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=servers.js.map