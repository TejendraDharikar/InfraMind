import prisma from '../db';
import { Role, Plan } from '@prisma/client';

// Helper to handle unexpected errors gracefully in controllers
const catchErrors = async <T>(
  fn: () => Promise<T>,
): Promise<T | { status: 500; body: { error: string } }> => {
  try {
    return await fn();
  } catch (error: any) {
    console.error('Controller error:', error);
    return {
      status: 500,
      body: { error: error.message || 'Internal server error' },
    } as any;
  }
};

/** ------------------------------------------------
 *  1️⃣ Users Controllers
 * ------------------------------------------------ */
export const getUsers = async (c: any) => {
  return catchErrors(async () => {
    const users = await prisma.user.findMany();
    return { status: 200, body: users };
  });
};

export const getUserById = async (c: any) => {
  return catchErrors(async () => {
    const user = await prisma.user.findUnique({
      where: { id: c.params.id },
    });
    if (!user) {
      return { status: 404, body: null };
    }
    return { status: 200, body: user };
  });
};

export const createUser = async (c: any) => {
  return catchErrors(async () => {
    const user = await prisma.user.create({
      data: {
        email: c.body.email,
        name: c.body.name,
        role: c.body.role as Role,
      },
    });
    return { status: 201, body: user };
  });
};

export const updateUser = async (c: any) => {
  return catchErrors(async () => {
    const user = await prisma.user.update({
      where: { id: c.params.id },
      data: {
        email: c.body.email,
        name: c.body.name,
        role: c.body.role as Role,
      },
    });
    return { status: 200, body: user };
  });
};

export const deleteUser = async (c: any) => {
  return catchErrors(async () => {
    await prisma.user.delete({
      where: { id: c.params.id },
    });
    return { status: 204, body: null };
  });
};

/** ------------------------------------------------
 *  2️⃣ Projects Controllers
 * ------------------------------------------------ */
export const getProjects = async (c: any) => {
  return catchErrors(async () => {
    const projects = await prisma.project.findMany({
      include: { owner: true },
    });
    return { status: 200, body: projects };
  });
};

export const getProjectById = async (c: any) => {
  return catchErrors(async () => {
    const project = await prisma.project.findUnique({
      where: { id: c.params.id },
      include: { owner: true },
    });
    if (!project) {
      return { status: 404, body: null } as any;
    }
    return { status: 200, body: project };
  });
};

export const createProject = async (c: any) => {
  return catchErrors(async () => {
    const project = await prisma.project.create({
      data: {
        name: c.body.name,
        ownerId: c.body.ownerId,
      },
    });
    return { status: 201, body: project };
  });
};

export const updateProject = async (c: any) => {
  return catchErrors(async () => {
    const project = await prisma.project.update({
      where: { id: c.params.id },
      data: {
        name: c.body.name,
        ownerId: c.body.ownerId,
      },
    });
    return { status: 200, body: project };
  });
};

export const deleteProject = async (c: any) => {
  return catchErrors(async () => {
    await prisma.project.delete({
      where: { id: c.params.id },
    });
    return { status: 204, body: null };
  });
};

/** ------------------------------------------------
 *  3️⃣ Subscriptions Controllers
 * ------------------------------------------------ */
export const getSubscriptions = async (c: any) => {
  return catchErrors(async () => {
    const subscriptions = await prisma.subscription.findMany({
      include: { user: true },
    });
    return { status: 200, body: subscriptions };
  });
};

export const createSubscription = async (c: any) => {
  return catchErrors(async () => {
    const subscription = await prisma.subscription.create({
      data: {
        userId: c.body.userId,
        plan: c.body.plan as Plan,
        status: c.body.status || 'ACTIVE',
        endsAt: c.body.endsAt ? new Date(c.body.endsAt) : null,
      },
    });
    return { status: 201, body: subscription };
  });
};

export const cancelSubscription = async (c: any) => {
  return catchErrors(async () => {
    const subscription = await prisma.subscription.update({
      where: { id: c.params.id },
      data: {
        status: 'CANCELLED',
        endsAt: new Date(),
      },
    });
    return { status: 204, body: null };
  });
};

/** ------------------------------------------------
 *  4️⃣ Servers Controllers
 * ------------------------------------------------ */
export const getServers = async (c: any) => {
  return catchErrors(async () => {
    const servers = await prisma.server.findMany();
    return { status: 200, body: servers };
  });
};

export const getServerById = async (c: any) => {
  return catchErrors(async () => {
    const server = await prisma.server.findUnique({
      where: { id: c.params.id },
    });
    if (!server) {
      return { status: 404, body: null } as any;
    }
    return { status: 200, body: server };
  });
};

export const createServer = async (c: any) => {
  return catchErrors(async () => {
    const server = await prisma.server.create({
      data: {
        name: c.body.name,
        hostName: c.body.hostName,
        status: c.body.status || 'ONLINE',
        userId: c.body.userId,
        projectId: c.body.projectId,
      },
    });
    return { status: 201, body: server };
  });
};

export const updateServer = async (c: any) => {
  return catchErrors(async () => {
    const server = await prisma.server.update({
      where: { id: c.params.id },
      data: {
        name: c.body.name,
        hostName: c.body.hostName,
        status: c.body.status,
        userId: c.body.userId,
        projectId: c.body.projectId,
      },
    });
    return { status: 200, body: server };
  });
};

export const deleteServer = async (c: any) => {
  return catchErrors(async () => {
    await prisma.server.delete({
      where: { id: c.params.id },
    });
    return { status: 204, body: null };
  });
};

/** ------------------------------------------------
 *  5️⃣ Metrics Controllers
 * ------------------------------------------------ */
export const getMetrics = async (c: any) => {
  return catchErrors(async () => {
    const metrics = await prisma.metric.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    return { status: 200, body: metrics };
  });
};

export const createMetric = async (c: any) => {
  return catchErrors(async () => {
    const metric = await prisma.metric.create({
      data: {
        serverId: c.body.serverId,
        cpuUsage: c.body.cpuUsage,
        memoryUsage: c.body.memoryUsage,
        networkUsage: c.body.networkUsage,
        diskUsage: c.body.diskUsage,
      },
    });
    return { status: 201, body: metric };
  });
};

/** ------------------------------------------------
 *  6️⃣ Alerts Controllers
 * ------------------------------------------------ */
export const getAlerts = async (c: any) => {
  return catchErrors(async () => {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { status: 200, body: alerts };
  });
};

export const createAlert = async (c: any) => {
  return catchErrors(async () => {
    const alert = await prisma.alert.create({
      data: {
        serverId: c.body.serverId,
        type: c.body.type,
        message: c.body.message,
        severity: c.body.severity,
        status: c.body.status || 'TRIGGERED',
        userId: c.body.userId,
      },
    });
    return { status: 201, body: alert };
  });
};

export const updateAlert = async (c: any) => {
  return catchErrors(async () => {
    const alert = await prisma.alert.update({
      where: { id: c.params.id },
      data: {
        status: c.body.status,
        resolvedAt: c.body.status === 'RESOLVED' ? new Date() : undefined,
      },
    });
    return { status: 200, body: alert };
  });
};

export const deleteAlert = async (c: any) => {
  return catchErrors(async () => {
    await prisma.alert.delete({
      where: { id: c.params.id },
    });
    return { status: 204, body: null };
  });
};

/** ------------------------------------------------
 *  7️⃣ Webhooks Controllers
 * ------------------------------------------------ */
export const getWebhooks = async (c: any) => {
  return catchErrors(async () => {
    const webhooks = await prisma.webhook.findMany();
    return { status: 200, body: webhooks };
  });
};

export const createWebhook = async (c: any) => {
  return catchErrors(async () => {
    const webhook = await prisma.webhook.create({
      data: {
        name: c.body.name,
        url: c.body.url,
        events: c.body.events,
        isActive: c.body.isActive ?? true,
      },
    });
    return { status: 201, body: webhook };
  });
};

export const updateWebhook = async (c: any) => {
  return catchErrors(async () => {
    const webhook = await prisma.webhook.update({
      where: { id: c.params.id },
      data: {
        name: c.body.name,
        url: c.body.url,
        events: c.body.events,
        isActive: c.body.isActive,
      },
    });
    return { status: 200, body: webhook };
  });
};

export const deleteWebhook = async (c: any) => {
  return catchErrors(async () => {
    await prisma.webhook.delete({
      where: { id: c.params.id },
    });
    return { status: 204, body: null };
  });
};
