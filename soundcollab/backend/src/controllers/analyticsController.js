const analyticsService = require('../services/analyticsService');

async function getDashboard(req, res) {
  try {
    const dashboard = await analyticsService.getCreatorDashboard(req.user.id);
    res.json(dashboard);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to load dashboard' });
  }
}

module.exports = { getDashboard };
