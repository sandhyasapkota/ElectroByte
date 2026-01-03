import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();

const generateToken = (payload) => {
    const options = {
      expiresIn: process.env.EXPIRES_IN || '24h', // Fallback to 24h if not set
    };
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  };
  
  export {
    generateToken,
  };