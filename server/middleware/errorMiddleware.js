
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
    const errorDetails = err.original?.message || err.parent?.message || err.message || "Internal Server Error";
    logger.error(`${errorDetails} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`, {
        stack: err.stack,
    });

    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
        error: errorDetails,
        data : null,
    });
};

module.exports = errorMiddleware;