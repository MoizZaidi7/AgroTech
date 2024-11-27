// middlewares/authorize.js
import roles from '../config/roles.js';

const authorize = (requiredPermissions) => {
  return (req, res, next) => {
    const userRole = req.user.userType; // Assuming user role is stored in req.user
    if (!roles[userRole]) {
      return res.status(403).json({ message: 'Role not recognized' });
    }

    const userPermissions = roles[userRole];
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

export default authorize;