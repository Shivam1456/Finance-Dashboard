const User = require('../models/User');

exports.getUsers = async () => {
  return await User.find().select('-password');
};

exports.getUserStats = async () => {
  // Aggregate candidate metrics for the graph
  const users = await User.find({ status: 'Active' }).select('name salary experience role');
  return users;
};

exports.updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
