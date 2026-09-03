import prisma from '../../db';
import { CreateAlertBody, UpdateAlertBody } from './schema';
import { getIo } from '../../socket';

export const alertsMutation = {
  createAlert: async (data: CreateAlertBody) => {
    const server = await prisma.server.findUnique({
      where: { id: data.serverId },
    });
    if (!server) throw new Error('Server not found');

    const alert = await prisma.alert.create({
      data: { ...data },
      include: { server: true },
    });

    getIo().emit('new_alert', alert);
    return alert;
  },

  updateAlert: async (id: string, data: UpdateAlertBody) => {
    const existingAlert = await prisma.alert.findUnique({ where: { id } });
    if (!existingAlert) throw new Error('Alert not found');

    const updateData: any = { ...data };
    if (data.status === 'resolved' || data.status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: { server: true },
    });

    getIo().emit('alert_updated', updatedAlert);
    return updatedAlert;
  },

  deleteAlert: async (id: string) => {
    const existingAlert = await prisma.alert.findUnique({ where: { id } });
    if (!existingAlert) throw new Error('Alert not found');

    const deletedAlert = await prisma.alert.delete({ where: { id } });
    getIo().emit('alert_deleted', id);
    return deletedAlert;
  },
};
