const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { jwtSecret } = require('../config/config');

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username et password requis.' });

  const user = await db('users').where({ username }).first();
  if (!user) return res.status(401).json({ error: 'Identifiants invalides.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Identifiants invalides.' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '8h' });
  res.json({ token, role: user.role, username: user.username, avatar: user.avatar || null });
}

async function register(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username et password requis.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Le mot de passe doit avoir au moins 6 caractères.' });

  const exists = await db('users').where({ username }).first();
  if (exists) return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris.' });

  const crypto = require('crypto');
  const hashed = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  await db('users').insert({ id, username, password: hashed, role: 'employe' });

  const token = jwt.sign({ id, username, role: 'employe' }, jwtSecret, { expiresIn: '8h' });
  res.status(201).json({ token, username, role: 'employe' });
}

async function getMe(req, res) {
  const user = await db('users').where({ id: req.user.id }).select('id', 'username', 'role', 'avatar').first();
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  res.json(user);
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis.' });
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'Le nouveau mot de passe doit avoir au moins 6 caractères.' });

  const user = await db('users').where({ id: req.user.id }).first();
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await db('users').where({ id: req.user.id }).update({ password: hashed });
  res.json({ message: 'Mot de passe mis à jour.' });
}

async function updateAvatar(req, res) {
  const { avatar } = req.body;
  if (!avatar) return res.status(400).json({ error: 'Image requise.' });
  // Validate it's a base64 data URL (image only)
  if (!/^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(avatar))
    return res.status(400).json({ error: 'Format image invalide.' });
  // Limit size ~1MB (base64 ~1.37x original)
  if (avatar.length > 1_500_000)
    return res.status(400).json({ error: 'Image trop grande (max ~1 Mo).' });

  await db('users').where({ id: req.user.id }).update({ avatar });
  res.json({ avatar });
}

module.exports = { login, register, getMe, changePassword, updateAvatar };
