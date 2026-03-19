import type { RefreshToken, User } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const authRepository = {
  findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data: { email: string; passwordHash: string; name?: string }): Promise<User> {
    return prisma.user.create({ data });
  },

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    jti: string;
    family: string;
    expiresAt: Date;
    ip?: string;
    userAgent?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revokeRefreshToken(tokenHash: string, replacedBy?: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        revokedAt: new Date(),
        replacedBy: replacedBy ?? null
      }
    });
  },

  revokeTokenFamily(userId: string, family: string) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        family,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  },

  async rotateRefreshToken(params: {
    oldTokenHash: string;
    userId: string;
    newTokenHash: string;
    jti: string;
    family: string;
    expiresAt: Date;
    ip?: string;
    userAgent?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const oldToken = await tx.refreshToken.findUnique({ where: { tokenHash: params.oldTokenHash } });
      if (!oldToken) {
        return null;
      }

      const newRecord = await tx.refreshToken.create({
        data: {
          userId: params.userId,
          tokenHash: params.newTokenHash,
          jti: params.jti,
          family: params.family,
          expiresAt: params.expiresAt,
          ip: params.ip,
          userAgent: params.userAgent
        }
      });

      await tx.refreshToken.update({
        where: { tokenHash: params.oldTokenHash },
        data: {
          revokedAt: new Date(),
          replacedBy: newRecord.id
        }
      });

      return newRecord;
    });
  }
};
