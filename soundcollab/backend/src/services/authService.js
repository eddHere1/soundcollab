const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register({ username, email, password, role, genres, location }) {
  const existing = await User.findByUsernameOrEmail(username, email);
  if (existing) {
    throw { status: 400, message: 'Email or username already in use' };
  }

  const row = await User.create({
    username,
    email,
    password,
    role: role || 'artist',
    genres: genres || [],
    location: location || null,
  });

  const user = User.serialize(row);
  return { user, token: signToken(user) };
}

async function login({ email, password }) {
  const row = await User.findByEmail(email);
  if (!row) throw { status: 401, message: 'Invalid credentials' };

  const valid = await User.verifyPassword(row, password);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };

  const user = User.serialize(row);
  return { user, token: signToken(user) };
}

async function getCurrentUser(id) {
  const row = await User.findById(id);
  return User.serialize(row);
}

module.exports = { register, login, getCurrentUser, signToken };
