import prisma from '../../db';
import { CreateWebhookBody } from './schema';

export const webhooksMutation = {
  createWebhook: async (data: CreateWebhookBody) => {
    return prisma.webhook.create({
      data: {
        name: data.name,
        url: data.url,
        events: data.events,
        isActive: data.isActive ?? true
      }
    });
  },

  deleteWebhook: async (id: string) => {
    const existing = await prisma.webhook.findUnique({ where: { id } });
    if (!existing) throw new Error('Webhook not found');
    return prisma.webhook.delete({ where: { id } });
  },

  toggleWebhook: async (id: string) => {
    const existing = await prisma.webhook.findUnique({ where: { id } });
    if (!existing) throw new Error('Webhook not found');
    return prisma.webhook.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });
  }
};
