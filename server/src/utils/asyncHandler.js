/**
 * A wrapper for asynchronous Express route handlers.
 * It ensures that any errors (rejected promises) are automatically
 * caught and passed to the next() function to be handled by the 
 * global error middleware.
 *
 * @param {Function} fn The asynchronous route handler function.
 * @returns {Function} A standard Express route handler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
