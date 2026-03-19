import { prisma } from '../../lib/prisma';

export const usersService = {
  async findPublicProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return user;
  }
};
