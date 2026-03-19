import crypto from 'crypto';
import type { Request } from 'express';
import { env } from '../../config/env';
import { compareValue, hashValue } from '../../lib/bcrypt';
import { conflict, unauthorized } from '../../lib/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { authRepository } from './auth.repository';
import type { LoginInput, RegisterInput } from './auth.schemas';

interface TokenBundle {
  accessToken: string;
  accessTokenExpiresIn: string;
  refreshToken: string;
}

const parseExpiryToMs = (value: string): number => {
  const trimmed = value.trim();
  const match = /^(\d+)([smhd])$/.exec(trimmed);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * unitMs[unit];
};

const getRefreshExpiry = () => new Date(Date.now() + parseExpiryToMs(env.JWT_REFRESH_EXPIRES_IN));

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const randomId = () => crypto.randomUUID();

const buildTokenBundle = (params: {
  userId: string;
  email: string;
  jti: string;
  family: string;
}): TokenBundle => {
  const accessToken = signAccessToken({
    sub: params.userId,
    email: params.email
  });

  const refreshToken = signRefreshToken({
    sub: params.userId,
    jti: params.jti,
    family: params.family
  });

  return {
    accessToken,
    accessTokenExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshToken
  };
};

const getClientMeta = (req: Request) => ({
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

export const authService = {
  async register(input: RegisterInput, req: Request) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw conflict('Email already in use');
    }

    const passwordHash = await hashValue(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      name: input.name
    });

    const jti = randomId();
    const family = randomId();
    const tokens = buildTokenBundle({ userId: user.id, email: user.email, jti, family });

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: sha256(tokens.refreshToken),
      jti,
      family,
      expiresAt: getRefreshExpiry(),
      ...getClientMeta(req)
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      ...tokens
    };
  },

  async login(input: LoginInput, req: Request) {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw unauthorized('Invalid credentials');
    }

    const ok = await compareValue(input.password, user.passwordHash);
    if (!ok) {
      throw unauthorized('Invalid credentials');
    }

    const jti = randomId();
    const family = randomId();
    const tokens = buildTokenBundle({ userId: user.id, email: user.email, jti, family });

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: sha256(tokens.refreshToken),
      jti,
      family,
      expiresAt: getRefreshExpiry(),
      ...getClientMeta(req)
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      ...tokens
    };
  },

  async refresh(rawToken: string | undefined, req: Request) {
    if (!rawToken) {
      throw unauthorized('Missing refresh token');
    }

    let payload;
    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      throw unauthorized('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh' || !payload.jti || !payload.family) {
      throw unauthorized('Invalid refresh token payload');
    }

    const tokenHash = sha256(rawToken);
    const existingToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!existingToken) {
      throw unauthorized('Refresh token not recognized');
    }

    if (existingToken.jti !== payload.jti || existingToken.family !== payload.family) {
      throw unauthorized('Refresh token claims mismatch');
    }

    if (existingToken.revokedAt) {
      await authRepository.revokeTokenFamily(existingToken.userId, existingToken.family);
      throw unauthorized('Refresh token reuse detected');
    }

    if (existingToken.expiresAt < new Date()) {
      throw unauthorized('Refresh token expired');
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user) {
      throw unauthorized('User not found for token');
    }

    const nextJti = randomId();
    const tokens = buildTokenBundle({
      userId: user.id,
      email: user.email,
      jti: nextJti,
      family: existingToken.family
    });

    const rotated = await authRepository.rotateRefreshToken({
      oldTokenHash: tokenHash,
      userId: user.id,
      newTokenHash: sha256(tokens.refreshToken),
      jti: nextJti,
      family: existingToken.family,
      expiresAt: getRefreshExpiry(),
      ...getClientMeta(req)
    });

    if (!rotated) {
      throw unauthorized('Refresh token rotation failed');
    }

    return {
      accessToken: tokens.accessToken,
      accessTokenExpiresIn: tokens.accessTokenExpiresIn,
      refreshToken: tokens.refreshToken
    };
  },

  async logout(rawToken: string | undefined) {
    if (!rawToken) {
      return;
    }

    const tokenHash = sha256(rawToken);
    const existing = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!existing || existing.revokedAt) {
      return;
    }

    await authRepository.revokeRefreshToken(tokenHash);
  },

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw unauthorized('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };
  }
};
