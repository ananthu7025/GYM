// errorMiddleware.js

const errorMiddleware = (err, req, res, next) => {
    // Check if the error has a specific status code, otherwise default to 500
    const statusCode = err.statusCode || 500;

    // Respond with the error message
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        // Optionally include error details if in development mode
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorMiddleware;
