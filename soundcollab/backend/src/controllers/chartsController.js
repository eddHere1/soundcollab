const chartsService = require('../services/chartsService');

async function getCharts(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [artists, beats, growing, collaborators, newArtists] = await Promise.all([
      chartsService.getTrendingArtists(limit),
      chartsService.getTrendingBeats(limit),
      chartsService.getFastestGrowingCreators(limit),
      chartsService.getMostActiveCollaborators(limit),
      chartsService.getNewArtists(limit),
    ]);
    res.json({ artists, beats, growing, collaborators, newArtists });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charts' });
  }
}

module.exports = { getCharts };
