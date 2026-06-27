function requireSelf(req, res, next) {
  const targetId = parseInt(req.params.id, 10);
  if (targetId !== req.user.id) {
    return res.status(403).json({ error: 'You can only update your own profile' });
  }
  next();
}

module.exports = { requireSelf };
