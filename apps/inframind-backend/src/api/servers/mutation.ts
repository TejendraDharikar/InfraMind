import prisma from '../../db';
import { CreateServerBody, UpdateServerBody } from './schema';
import { getIo } from '../../socket';

export const serversMutation = {
  createServer: async (data: CreateServerBody) => {
    const server = await prisma.server.create({ data });
    return server;
  },

  updateServer: async (id: string, data: UpdateServerBody) => {
    const existing = await prisma.server.findUnique({ where: { id } });
    if (!existing) throw new Error('Server not found');

    const updatedServer = await prisma.server.update({
      where: { id },
      data,
    });

    getIo().emit('server_updated', updatedServer);
    return updatedServer;
  },

  deleteServer: async (id: string) => {
    const existing = await prisma.server.findUnique({ where: { id } });
    if (!existing) throw new Error('Server not found');

    return prisma.server.delete({ where: { id } });
  },
};
