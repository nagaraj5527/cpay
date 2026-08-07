/**
 * Standard utility wrapper to catch exceptions in async Express route handlers
 * and pass them to the global error handling middleware.
 * Eliminates repetitive try-catch blocks in controllers.
 * 
 * @param {Function} fn - Async controller route handler function
 * @returns {Function} - Wrapped Express middleware
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
