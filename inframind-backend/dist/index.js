"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
// Import routes
const servers_1 = __importDefault(require("./routes/servers"));
const metrics_1 = __importDefault(require("./routes/metrics"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
// Health check endpoint (backward compatible)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
// Server metrics endpoint (backward compatible - returns system metrics)
app.get('/api/metrics', (req, res) => {
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    res.status(200).json({
        success: true,
        data: {
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external
            }
        },
        timestamp: new Date().toISOString()
    });
});
// Mount route handlers
// Servers endpoints
app.use('/api/servers', servers_1.default);
// Metrics endpoints
app.use('/api/metrics', metrics_1.default);
// Alerts endpoints
app.use('/api/alerts', alerts_1.default);
// Dashboard endpoints
app.use('/api/dashboard', dashboard_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Inframind Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            servers: '/api/servers',
            metrics: '/api/metrics',
            alerts: '/api/alerts',
            dashboard: '/api/dashboard'
        }
    });
});
// Error handling middleware
app.use((err, req, res) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});
// Start server
const server = app.listen(port, () => {
    console.log(`✓ Server is running at http://localhost:${port}`);
    console.log(`✓ Health check: http://localhost:${port}/api/health`);
    console.log(`✓ API Root: http://localhost:${port}`);
    console.log('\n📡 Available endpoints:');
    console.log('   GET  /api/servers              - List all servers');
    console.log('   GET  /api/servers/:id          - Get server details');
    console.log('   POST /api/servers              - Create new server');
    console.log('   PUT  /api/servers/:id          - Update server');
    console.log('   DELETE /api/servers/:id        - Delete server');
    console.log('\n📊 Metrics endpoints:');
    console.log('   GET  /api/metrics              - List all metrics');
    console.log('   GET  /api/metrics/:id          - Get specific metric');
    console.log('   POST /api/metrics              - Create metric');
    console.log('   GET  /api/metrics/server/:serverId/latest - Latest 24 metrics');
    console.log('\n⚠️  Alerts endpoints:');
    console.log('   GET  /api/alerts               - List alerts');
    console.log('   GET  /api/alerts/:id           - Get alert details');
    console.log('   POST /api/alerts               - Create alert');
    console.log('   PUT  /api/alerts/:id           - Update alert');
    console.log('   DELETE /api/alerts/:id         - Delete alert');
    console.log('\n📈 Dashboard endpoints:');
    console.log('   GET  /api/dashboard/summary    - Dashboard summary');
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        await db_1.default.$disconnect();
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    server.close(async () => {
        await db_1.default.$disconnect();
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map