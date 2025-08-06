// 2024-08-08 : ฟังก์ชั่น authenticateToken เพื่อรองรับการต่ออายุ token
// ทุกครั้งที่มีการร้องขอ API token จะได้รับการตรวจสอบและถ้าใกล้จะหมดอายุ token ใหม่จะถูกสร้างและส่งกลับไปกับ response headers ผ่านทาง x-new-token.
// ต่ออายุเวลาหมดอายุของ token เดิมโดยไม่ต้องสร้าง token ใหม่ โดยการตรวจสอบเวลาหมดอายุของ token 
// และปรับเวลาหมดอายุให้เพิ่มขึ้นทุกครั้งที่มีการร้องขอ API โดยไม่ต้องเปลี่ยนค่าใน token เอง แต่ให้ server บันทึกเวลาหมดอายุใหม่ที่ปรับปรุงในฐานข้อมูลหรือในหน่วยความจำ
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/GlobalConfig.json';

const JWT_SECRET = config.JwtConfig.Key;
const TOKEN_EXPIRE_MINUTES = parseInt(config.JwtConfig.ExpireMinutes);

// Define the shape of the token payload if needed
export interface UserPayload extends JwtPayload {
  user_id: number;
  username: string;
  role_code: string;
  exp: number; // token expiration time
  // Add any additional fields that you store in the token
}

// Extend the Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload; // Optional user property on Request
  }
}

// Middleware to verify the JWT token, attach user info to req.user, and extend expiration time if necessary
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;

    // Check if token needs to extend its expiration time
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const tokenExpireTime = decoded.exp - now;

    // Extend expiration time if less than half of TOKEN_EXPIRE_MINUTES remains
    if (tokenExpireTime < (TOKEN_EXPIRE_MINUTES * 60) / 2) {
      const newExp = now + TOKEN_EXPIRE_MINUTES * 60;
      decoded.exp = newExp;

      // Update token in database or memory (pseudo code)
      // await updateTokenExpiration(decoded.user_id, newExp);

      // Set new expiration time in the response header
      res.setHeader('x-new-expiration-time', newExp);
    }

    next(); // Continue to the next middleware or route handler
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};


// 2024-08-08 : ก่อนปรับ เพิ่มต่ออายุ API
/* 
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/GlobalConfig.json';

const JWT_SECRET = config.JwtConfig.Key;

// Define the shape of the token payload if needed
export interface UserPayload {
  user_id: number;
  username: string;
  role: string;
  // Add any additional fields that you store in the token
}

// Extend the Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload; // Optional user property on Request
  }
}

// Middleware to verify the JWT token and attach user info to req.user
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded as UserPayload; // Type assertion for decoded payload
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
 */


/* import { expressjwt, GetVerificationKey } from 'express-jwt';

const config = require('../config/GlobalConfig.json');
const JWT_SECRET = config.JwtConfig.Key;

// Define the shape of the token payload if needed
export interface UserPayload {
    user_id: number;
    username: string;
    role: string;
    // Add any additional fields that you store in the token
  }

// Middleware for authenticating the token
export const authenticateToken = expressjwt({
    secret: JWT_SECRET as GetVerificationKey,
    algorithms: ['HS256'],
    requestProperty: 'auth', // This will store the decoded token in req.auth
    credentialsRequired: true, // Ensure credentials are required
  });
  
 */