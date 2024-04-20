// middleware/authMiddleware.js

/**
 * Middleware to check if the user is authenticated.
 * If authenticated, proceeds to the next middleware/route handler.
 * If not authenticated, redirects to the login page.
 */
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
      next();
    } else {
      res.redirect('/login');
    }
  };
  
  /**
   * Middleware to check if the user has admin privileges.
   * If the user is an admin, proceeds to the next middleware/route handler.
   * If not an admin, sends a 403 Forbidden response.
   */
  const isAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
  };
  
  /**
   * Middleware to check if the user has donor privileges.
   * If the user is a donor, proceeds to the next middleware/route handler.
   * If not a donor, sends a 403 Forbidden response.
   */
  const isDonor = (req, res, next) => {
    if (req.session.role === 'donor') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Donor privileges required.' });
    }
  };
  
  /**
   * Middleware to check if the user has pantry privileges.
   * If the user is a pantry, proceeds to the next middleware/route handler.
   * If not a pantry, sends a 403 Forbidden response.
   */
  const isPantry = (req, res, next) => {
    if (req.session.role === 'pantry') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Pantry privileges required.' });
    }
  };
  
  module.exports = {
    isAuthenticated,
    isAdmin,
    isDonor,
    isPantry,
  };