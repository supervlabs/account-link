import jwt, { JwtPayload } from "jsonwebtoken";

export interface JwtPayloadX extends JwtPayload {
  iss: string;
  sub: string;
  id?: number; // user's id
  name: string;
  email: string;
  role?: string;
}

export const generateToken = (payload: JwtPayloadX): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "24h" });
};

export const verifyAndDecodeToken = (token: string): JwtPayloadX => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayloadX;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("token_expired");
    }
    throw new Error("invalid_token");
  }
};

export const createSessionToken = generateToken;
export const verifySessionToken = verifyAndDecodeToken;

export function signUserLink<T>(userLink: T): string {
  return jwt.sign(userLink as object, process.env.SHARED_API_KEY!, {
    expiresIn: "1m",
  });
}

export function verifyUserLink<T>(token: string): T {
  try {
    return jwt.verify(token, process.env.SHARED_API_KEY!) as T;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("user_link_token_expired");
    }
    throw new Error("invalid_user_link_token");
  }
}

/**
 * Decodes a user link token without verifying its signature
 * @param token The JWT token to decode
 * @returns The decoded token payload without verification
 * @throws Error if the token is malformed
 */
export function decodeUserLink<T>(token: string): T {
  try {
    // jwt.decode just decodes the token without verifying the signature
    const decoded = jwt.decode(token);

    if (!decoded) {
      throw new Error("invalid_user_link_token_format");
    }

    return decoded as T;
  } catch (error) {
    console.error("Error decoding user link token:", error);
    throw new Error("failed_to_decode_user_link_token");
  }
}
