const User = require('../models/User');
const { sendForbidden, sendUnauthorized, sendError } = require('../utils/responseHelper');

/**
 * Middleware to verify if authenticated user has admin role
 * Must be used after verifyJWT middleware
 */
const verifyAdmin = async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.decoded || !req.decoded.email) {
            console.log('No decoded user found in request');
            return sendUnauthorized(res, 'Unauthorized access - Please login first');
        }

        const email = req.decoded.email;
        console.log('Checking admin role for:', email);

        // Find user in database
        const user = await User.findByEmail(email);

        if (!user) {
            console.log('User not found in database:', email);
            return sendForbidden(res, 'Forbidden access - User not found');
        }

        // Check if user has admin role
        if (user.role !== 'admin') {
            console.log('User is not admin:', email, 'Role:', user.role);
            return sendForbidden(res, 'Forbidden access - Admin privileges required');
        }

        console.log('Admin access granted for:', email);
        
        // Attach user info to request
        req.user = user;
        
        next();

    } catch (error) {
        console.error('Admin verification error:', error);
        return sendError(res, 'Error verifying admin access', 500, error);
    }
};

/**
 * Middleware to verify if authenticated user has restaurant_owner role
 * Must be used after verifyJWT middleware
 */
const verifyRestaurantOwner = async (req, res, next) => {
    try {
        if (!req.decoded || !req.decoded.email) {
            return sendUnauthorized(res, 'Unauthorized access - Please login first');
        }

        const email = req.decoded.email;
        console.log('Checking restaurant owner role for:', email);

        const user = await User.findByEmail(email);

        if (!user) {
            return sendForbidden(res, 'Forbidden access - User not found');
        }

        if (user.role !== 'restaurant_owner') {
            console.log('User is not restaurant owner:', email, 'Role:', user.role);
            return sendForbidden(res, 'Forbidden access - Restaurant owner privileges required');
        }

        console.log('Restaurant owner access granted for:', email);
        req.user = user;
        next();

    } catch (error) {
        console.error('Restaurant owner verification error:', error);
        return sendError(res, 'Error verifying restaurant owner access', 500, error);
    }
};

/**
 * Middleware to verify if authenticated user has rider role
 * Must be used after verifyJWT middleware
 */
const verifyRider = async (req, res, next) => {
    try {
        if (!req.decoded || !req.decoded.email) {
            return sendUnauthorized(res, 'Unauthorized access - Please login first');
        }

        const email = req.decoded.email;
        console.log('Checking rider role for:', email);

        const user = await User.findByEmail(email);

        if (!user) {
            return sendForbidden(res, 'Forbidden access - User not found');
        }

        if (user.role !== 'rider') {
            console.log('User is not rider:', email, 'Role:', user.role);
            return sendForbidden(res, 'Forbidden access - Rider privileges required');
        }

        console.log('Rider access granted for:', email);
        req.user = user;
        next();

    } catch (error) {
        console.error('Rider verification error:', error);
        return sendError(res, 'Error verifying rider access', 500, error);
    }
};

/**
 * Middleware to verify if user has admin OR restaurant_owner role
 * Useful for endpoints that both admins and restaurant owners can access
 */
const verifyAdminOrRestaurantOwner = async (req, res, next) => {
    try {
        if (!req.decoded || !req.decoded.email) {
            return sendUnauthorized(res, 'Unauthorized access - Please login first');
        }

        const email = req.decoded.email;
        const user = await User.findByEmail(email);

        if (!user) {
            return sendForbidden(res, 'Forbidden access - User not found');
        }

        if (user.role !== 'admin' && user.role !== 'restaurant_owner') {
            return sendForbidden(res, 'Forbidden access - Admin or Restaurant Owner privileges required');
        }

        console.log('Admin/Restaurant owner access granted for:', email);
        req.user = user;
        next();

    } catch (error) {
        console.error('Admin/Restaurant owner verification error:', error);
        return sendError(res, 'Error verifying access', 500, error);
    }
};

/**
 * Middleware to verify if user has specific role(s)
 * @param {string|Array<string>} allowedRoles - Single role or array of allowed roles
 */
const verifyRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.decoded || !req.decoded.email) {
                return sendUnauthorized(res, 'Unauthorized access - Please login first');
            }

            const email = req.decoded.email;
            const user = await User.findByEmail(email);

            if (!user) {
                return sendForbidden(res, 'Forbidden access - User not found');
            }

            // Convert to array if single role provided
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!roles.includes(user.role)) {
                console.log(`User role '${user.role}' not in allowed roles:`, roles);
                return sendForbidden(res, `Forbidden access - Required roles: ${roles.join(' or ')}`);
            }

            console.log('Role access granted for:', email, 'Role:', user.role);
            req.user = user;
            next();

        } catch (error) {
            console.error('Role verification error:', error);
            return sendError(res, 'Error verifying role access', 500, error);
        }
    };
};

/**
 * Middleware to verify if user's account status is 'active' or 'approved'
 * Must be used after verifyJWT middleware
 */
const verifyActiveUser = async (req, res, next) => {
    try {
        if (!req.decoded || !req.decoded.email) {
            return sendUnauthorized(res, 'Unauthorized access - Please login first');
        }

        const email = req.decoded.email;
        const user = await User.findByEmail(email);

        if (!user) {
            return sendForbidden(res, 'Forbidden access - User not found');
        }

        // Check if user account is active or approved
        if (user.status !== 'active' && user.status !== 'approved') {
            console.log('User account not active:', email, 'Status:', user.status);
            return sendForbidden(res, `Account status is '${user.status}' - Contact administrator`);
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Active user verification error:', error);
        return sendError(res, 'Error verifying user status', 500, error);
    }
};

module.exports = {
    verifyAdmin,
    verifyRestaurantOwner,
    verifyRider,
    verifyAdminOrRestaurantOwner,
    verifyRole,
    verifyActiveUser
};
