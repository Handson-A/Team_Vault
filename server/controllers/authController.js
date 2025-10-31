import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body || {};
    const userName = username || name;

    if (!userName || !email || !password) {
      return res.status(400).json({ msg: 'Username, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const newUser = new User({ username: userName, email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: newUser._id, username: newUser.username, email: newUser.email } });
  } catch (error) {
    console.error('registerUser error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required' });

    const foundUser = await User.findOne({ email });
    if (!foundUser) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await foundUser.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: foundUser._id, name: foundUser.name, email: foundUser.email } });
  } catch (error) {
    console.error('loginUser error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
