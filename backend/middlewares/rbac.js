const rbacMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Anti-Gravity Force Field: Stop unauthorized requests here
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized: User not found in request' });
    }

    if (req.user.status === 'Inactive') {
      return res.status(403).json({ error: 'Forbidden: User account is inactive' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access Denied! Requires roles: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

module.exports = rbacMiddleware;
