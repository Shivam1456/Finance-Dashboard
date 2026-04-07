const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'finance_super_secret_key';

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password, role: role || 'Viewer' });
    res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, budget: user.budget },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      data: { token, name: user.name, email: user.email, role: user.role, budget: user.budget }
    });
  } catch (err) {
    next(err);
  }
};
