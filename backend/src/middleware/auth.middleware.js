const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'Token manquant.' });

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide ou expiré.' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux admins.' });
  next();
}

module.exports = { auth, adminOnly };
