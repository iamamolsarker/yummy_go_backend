const { admin } = require('../config/firebase');
const { sendError, sendUnauthorized } = require('../utils/responseHelper');

/**
 * Custom middleware to verify Firebase JWT token
 * Extracts and verifies the Bearer token from Authorization header
 */
const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // Check if Authorization header exists and has Bearer token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No authorization header or invalid format');
            return sendUnauthorized(res, 'Unauthorized access - No token provided');
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            console.log('Token is empty');
            return sendUnauthorized(res, 'Unauthorized access - Invalid token format');
        }

        try {
            // Verify Firebase ID token
            const decoded = await admin.auth().verifyIdToken(token);
            
            // Attach decoded user info to request object
            req.decoded = decoded;
            
            console.log('Token verified for user:', decoded.email);
            
            // Continue to next middleware
            next();
            
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError.message);
            
            // Handle specific Firebase Auth errors
            if (verifyError.code === 'auth/id-token-expired') {
                return sendUnauthorized(res, 'Token has expired - Please login again');
            } else if (verifyError.code === 'auth/id-token-revoked') {
                return sendUnauthorized(res, 'Token has been revoked - Please login again');
            } else if (verifyError.code === 'auth/argument-error') {
                return sendUnauthorized(res, 'Invalid token format');
            } else {
                return sendUnauthorized(res, 'Unauthorized access - Invalid token');
            }
        }
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        return sendError(res, 'Authentication error', 500, error);
    }
};

/**
 * Optional auth middleware - continues even without valid token
 * Useful for endpoints that work for both authenticated and guest users
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            
            try {
                const decoded = await admin.auth().verifyIdToken(token);
                req.decoded = decoded;
                console.log('Optional auth - Token verified for:', decoded.email);
            } catch (error) {
                console.log('Optional auth - Token verification failed, continuing as guest');
                req.decoded = null;
            }
        } else {
            req.decoded = null;
        }
        
        next();
        
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        req.decoded = null;
        next();
    }
};

module.exports = {
    verifyJWT,
    optionalAuth
};
