"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const db_1 = __importDefault(require("./db"));
const swagger_1 = require("./config/swagger");
const servers_1 = __importDefault(require("./api/servers"));
const metrics_1 = __importDefault(require("./api/metrics"));
const alerts_1 = __importDefault(require("./api/alerts"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const webhooks_1 = __importDefault(require("./api/webhooks"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const httpServer = http_1.default.createServer(app);
// Initialize Socket.io
(0, socket_1.initSocket)(httpServer);
// Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
// Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Inframind API Docs',
}));
app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
});
/** @openapi
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200: { description: Server is healthy }
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Mount route handlers
app.use('/api/servers', servers_1.default);
app.use('/api/metrics', metrics_1.default);
app.use('/api/alerts', alerts_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/webhooks', webhooks_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true, message: 'Inframind Backend API', version: '1.0.0',
        endpoints: { health: '/api/health', servers: '/api/servers', metrics: '/api/metrics', alerts: '/api/alerts', dashboard: '/api/dashboard', webhooks: '/api/webhooks', docs: '/api-docs' }
    });
});
// Error handling middleware
app.use((err, req, res) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error', timestamp: new Date().toISOString() });
});
// Start server
const server = httpServer.listen(port, () => {
    console.log(`\n🚀 Inframind Backend API`);
    console.log(`   Server:  http://localhost:${port}`);
    console.log(`   Swagger: http://localhost:${port}/api-docs`);
    console.log(`   Health:  http://localhost:${port}/api/health\n`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    server.close(async () => { await db_1.default.$disconnect(); process.exit(0); });
});
process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    server.close(async () => { await db_1.default.$disconnect(); process.exit(0); });
});
//# sourceMappingURL=index.js.map