import prisma from '../../db';

export const webhooksQuery = {
  getAllWebhooks: async () => {
    return prisma.webhook.findMany({ orderBy: { createdAt: 'desc' } });
  },

  getWebhookById: async (id: string) => {
    return prisma.webhook.findUnique({ where: { id } });
  },
};
