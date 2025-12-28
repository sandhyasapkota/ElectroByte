import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authenticateToken = (req, res, next) => {
    // Public paths that don't require authentication
    const publicPaths = ['/api/login', '/api/register', '/api/forgot-password'];
    
    // Allow public paths
    if (publicPaths.includes(req.path)) {
        return next();
    }
    
    // Allow POST to /api/users for user registration
    if (req.path === '/api/users' && req.method === 'POST') {
        return next();
    }
    
    // For all other routes, require token
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid access token' });
        }
        req.user = decoded;
        next();
    });
};

export { authenticateToken };