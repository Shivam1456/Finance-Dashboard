const UserService = require('../services/UserService');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await UserService.getUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await UserService.getUserStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
