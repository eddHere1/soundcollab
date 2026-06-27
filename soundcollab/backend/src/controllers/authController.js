const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { username, email, password, role, genres, location } = req.body;
    const result = await authService.register({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      genres: Array.isArray(genres) ? genres : genres ? [genres] : [],
      location,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({
      email: email.trim().toLowerCase(),
      password,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Login failed' });
  }
}

async function getMe(req, res) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

module.exports = { register, login, getMe };
