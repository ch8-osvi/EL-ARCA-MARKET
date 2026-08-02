import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@/lib/permissions/rbac";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_el_arca_market_2026";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  storeId?: string;
  organizationId?: string;
}

/**
 * Hashea una contraseña plana usando bcrypt con 10 rondas de salt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compara una contraseña plana con su hash encriptado.
 */
export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

/**
 * Firma un token JWT para el usuario.
 */
export function signToken(payload: TokenPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}

/**
 * Verifica y decodifica un token JWT.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
