const beatService = require('../services/beatService');

async function purchase(req, res) {
  try {
    const result = await beatService.purchaseBeat(parseInt(req.params.postId), req.user.id);
    res.status(201).json({
      message: 'Purchase successful (mock transaction)',
      ...result,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Purchase failed' });
  }
}

async function getMarketplace(req, res) {
  try {
    const items = await beatService.getMarketplace({
      category: req.query.category,
      genre: req.query.genre,
      mood: req.query.mood,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch marketplace' });
  }
}

async function getMyPurchases(req, res) {
  try {
    const purchases = await beatService.getMyPurchases(req.user.id);
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
}

async function getMySales(req, res) {
  try {
    const sales = await beatService.getMySales(req.user.id);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
}

module.exports = { purchase, getMarketplace, getMyPurchases, getMySales };
