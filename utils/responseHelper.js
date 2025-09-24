// Response utility functions for consistent API responses

const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, error = null) => {
    const response = {
        success: false,
        message
    };

    if (error && process.env.NODE_ENV === 'development') {
        response.error = error;
    }

    return res.status(statusCode).json(response);
};

const sendCreated = (res, data, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, 201);
};

const sendNotFound = (res, message = 'Resource not found') => {
    return sendError(res, message, 404);
};

const sendUnauthorized = (res, message = 'Unauthorized access') => {
    return sendError(res, message, 401);
};

const sendForbidden = (res, message = 'Forbidden access') => {
    return sendError(res, message, 403);
};

const sendBadRequest = (res, message = 'Bad request') => {
    return sendError(res, message, 400);
};

module.exports = {
    sendSuccess,
    sendError,
    sendCreated,
    sendNotFound,
    sendUnauthorized,
    sendForbidden,
    sendBadRequest
};