import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inframind API',
      version: '1.0.0',
      description: 'AI-Powered DevOps Dashboard — REST API for infrastructure monitoring, metrics collection, and intelligent alerting.',
      contact: {
        name: 'Inframind Team',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Server: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique server ID (CUID)' },
            name: { type: 'string', description: 'Server display name' },
            hostName: { type: 'string', description: 'Server hostname / IP' },
            status: { type: 'string', enum: ['stable', 'unhealthy', 'offline'], description: 'Current server status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Metric: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique metric ID (CUID)' },
            serverId: { type: 'string', description: 'Associated server ID' },
            timestamp: { type: 'string', format: 'date-time' },
            cpuUsage: { type: 'number', description: 'CPU usage percentage (0-100)' },
            memoryUsage: { type: 'number', description: 'Memory usage percentage (0-100)' },
            networkUsage: { type: 'number', description: 'Network usage percentage (0-100)' },
            diskUsage: { type: 'number', description: 'Disk usage percentage (0-100)' },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique alert ID (CUID)' },
            serverId: { type: 'string', description: 'Associated server ID' },
            type: { type: 'string', description: 'Alert type (cpu, memory, network, disk, anomaly)' },
            message: { type: 'string', description: 'Alert message' },
            severity: { type: 'string', enum: ['info', 'warning', 'critical'], description: 'Alert severity level' },
            status: { type: 'string', enum: ['open', 'acknowledged', 'resolved', 'closed'], description: 'Alert status' },
            createdAt: { type: 'string', format: 'date-time' },
            resolvedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
