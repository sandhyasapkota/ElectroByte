import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authenticateToken = (req, res, next) => {
    // Public paths that don't require authentication
    const publicPaths = [
        '/api/login', 
        '/api/register', 
        '/api/forgot-password',
        '/api/resend-verification',
        '/api/faqs',
        '/api/tickets/contact',
        '/api/products',
        '/api/categories',
        '/api/brands'
    ];
    
    // Check if path starts with any public path
    const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
    
    // Check for verify-email and reset-password with tokens
    if (req.path.startsWith('/api/verify-email/') || req.path.startsWith('/api/reset-password/')) {
        return next();
    }
    
    // Allow public paths with GET method for products, categories, brands, faqs
    if (isPublicPath && (req.method === 'GET' || req.path === '/api/login' || req.path === '/api/register' || req.path === '/api/forgot-password' || req.path === '/api/resend-verification' || req.path === '/api/tickets/contact')) {
        return next();
    }
    
    // For all other routes, require token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token is missing' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid access token' });
        }
        req.user = decoded;
        next();
    });
};

// Role-based access control middleware
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!roles.includes(req.user.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        
        next();
    };
};

// Admin only middleware
const requireAdmin = requireRole('admin');

// Technician or Admin middleware
const requireTechnician = requireRole('admin', 'technician');

export { authenticateToken, requireRole, requireAdmin, requireTechnician };
