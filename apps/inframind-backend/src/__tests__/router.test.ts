import express from 'express';
import supertest from 'supertest';
import router from '../router';
import prisma from '../db';

// Mock the prisma database client
jest.mock('../db', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    server: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    metric: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    webhook: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api', router);

describe('Inframind Centralized TS-Rest Router Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Users Endpoints', () => {
    it('GET /api/users should return a list of users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'admin@inframind.io',
          name: 'Admin',
          role: 'SUPER_ADMIN',
        },
        {
          id: '2',
          email: 'member@inframind.io',
          name: 'Member',
          role: 'MEMBER',
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const response = await supertest(app).get('/api/users').expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('GET /api/users/:id should return 404 if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await supertest(app).get('/api/users/999').expect(404);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });

    it('POST /api/users should successfully create a new user', async () => {
      const newUser = {
        email: 'test@inframind.io',
        name: 'Test User',
        role: 'VIEWER',
      };
      const createdUser = { id: '3', ...newUser };

      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      const response = await supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toEqual(createdUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    });
  });

  describe('Servers Endpoints', () => {
    it('GET /api/servers should return list of servers', async () => {
      const mockServers = [
        {
          id: 's1',
          name: 'Production Node',
          hostName: 'prod-01',
          status: 'ONLINE',
        },
      ];

      (prisma.server.findMany as jest.Mock).mockResolvedValue(mockServers);

      const response = await supertest(app).get('/api/servers').expect(200);

      expect(response.body).toEqual(mockServers);
    });

    it('POST /api/servers should successfully create a server', async () => {
      const newServer = {
        name: 'Backup Node',
        hostName: 'backup-01',
        status: 'ONLINE',
      };
      const createdServer = { id: 's2', ...newServer };

      (prisma.server.create as jest.Mock).mockResolvedValue(createdServer);

      const response = await supertest(app)
        .post('/api/servers')
        .send(newServer)
        .expect(201);

      expect(response.body).toEqual(createdServer);
    });
  });

  describe('Metrics Endpoints', () => {
    it('POST /api/metrics should successfully record metric data', async () => {
      const newMetric = {
        serverId: 's1',
        cpuUsage: 45.5,
        memoryUsage: 62.1,
        networkUsage: 12.4,
        diskUsage: 35.8,
      };
      const recordedMetric = {
        id: 'm1',
        timestamp: new Date().toISOString(),
        ...newMetric,
      };

      (prisma.metric.create as jest.Mock).mockResolvedValue(recordedMetric);

      const response = await supertest(app)
        .post('/api/metrics')
        .send(newMetric)
        .expect(201);

      expect(response.body).toEqual(recordedMetric);
    });
  });
});
