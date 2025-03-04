import { User } from '../models/userModel.js';

/**
 * Middleware to ensure agency isolation
 * This adds the user's agency to the request object and restricts 
 * access to data from other agencies
 */
export const enforceAgencyIsolation = async (req, res, next) => {
  try {
    // Skip for superadmin who can access all data
    if (req.userRole === 'superadmin') {
      return next();
    }
    
    // For regular admins, ensure they only access their agency's data
    if (req.userId) {
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Add the user's agency to the request for use in controllers
      req.userAgency = user.agencyName;
      
      // If there's an agencyName in the query/params/body that doesn't match the user's
      // agency, reject the request (unless user is superadmin)
      const requestedAgency = 
        req.query.agencyName || 
        req.params.agencyName || 
        (req.body && req.body.agencyName);
      
      if (requestedAgency && requestedAgency !== user.agencyName && user.role !== 'superadmin') {
        return res.status(403).json({ 
          message: 'You do not have permission to access data from other agencies' 
        });
      }
      
      return next();
    }
    
    // If no user ID is present, this should be handled by the auth middleware
    // This is a fallback just in case
    return res.status(403).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error('Agency isolation middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};