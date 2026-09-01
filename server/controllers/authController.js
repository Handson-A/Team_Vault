import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const sendTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction, // HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// Password policy validator: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && (hasDigit || hasSpecial);
};

export const registerUser = async (req, res) => {
  try {
    const { username, name, email, password } = req.body || {};
    const effectiveUsername = (username || name || '').trim();

    if (!effectiveUsername || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain a mix of uppercase, lowercase letters, and numbers or symbols.',
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const existingUser = await User.findOne({
      $or: [{ email: emailNormalized }, { username: effectiveUsername }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const newUser = new User({
      username: effectiveUsername,
      email: emailNormalized,
      password,
    });
    await newUser.save();

    const token = generateToken(newUser._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('registerUser error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const foundUser = await User.findOne({ email: emailNormalized });
    if (!foundUser) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await foundUser.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(foundUser._id);
    sendTokenCookie(res, token);

    res.json({
      token,
      user: {
        _id: foundUser._id,
        id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
      },
    });
  } catch (error) {
    console.error('loginUser error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      expires: new Date(0),
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('logoutUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json({
      _id: req.user._id,
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
