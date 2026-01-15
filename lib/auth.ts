import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'default-secret-key-change-in-production';
const JWT_SECRET = new TextEncoder().encode(SECRET_KEY);

export interface SessionPayload {
  authenticated: boolean;
  exp?: number;
  iat?: number;
}

/**
 * Create a JWT session token
 */
export async function createSession(): Promise<string> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify a JWT session token
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    // Verify the payload has the authenticated property
    if (payload.authenticated === true) {
      return {
        authenticated: true,
        exp: payload.exp,
        iat: payload.iat,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session')?.value;

  if (!sessionToken) {
    return null;
  }

  return verifySession(sessionToken);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null && session.authenticated === true;
}

/**
 * Rate limiting for login attempts
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt || attempt.resetAt < now) {
    // Reset or create new attempt record
    loginAttempts.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 minutes
    return { allowed: true };
  }

  if (attempt.count >= 5) {
    // Max 5 attempts per 15 minutes
    const retryAfter = Math.ceil((attempt.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  attempt.count++;
  return { allowed: true };
}

/**
 * Clear rate limit for an identifier (on successful login)
 */
export function clearRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}
