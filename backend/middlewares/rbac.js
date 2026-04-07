module.exports = function rbac(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};
