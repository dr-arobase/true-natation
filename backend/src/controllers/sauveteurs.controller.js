const { db } = require('../config/db');
const crypto = require('crypto');

async function getAll(req, res) {
  const sauveteurs = await db('sauveteurs').select('*').orderBy('nom');
  res.json(sauveteurs);
}

async function getById(req, res) {
  const s = await db('sauveteurs').where({ id: req.params.id }).first();
  if (!s) return res.status(404).json({ error: 'Sauveteur introuvable.' });
  res.json(s);
}

async function create(req, res) {
  const { nom, prenom, certification, statut, horaire, session, date_expiration, commentaires } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis.' });

  const id = crypto.randomUUID();
  await db('sauveteurs').insert({
    id, nom, prenom, certification, statut: statut || 'actif',
    horaire, session, date_expiration, commentaires
  });
  res.status(201).json({ id, nom, prenom, certification, statut, horaire, session, date_expiration, commentaires });
}

async function update(req, res) {
  const { nom, prenom, certification, statut, horaire, session, date_expiration, commentaires } = req.body;
  const count = await db('sauveteurs').where({ id: req.params.id }).update({
    nom, prenom, certification, statut, horaire, session, date_expiration, commentaires
  });
  if (!count) return res.status(404).json({ error: 'Sauveteur introuvable.' });
  res.json({ message: 'Sauveteur mis à jour.' });
}

async function remove(req, res) {
  const count = await db('sauveteurs').where({ id: req.params.id }).delete();
  if (!count) return res.status(404).json({ error: 'Sauveteur introuvable.' });
  res.json({ message: 'Sauveteur supprimé.' });
}

module.exports = { getAll, getById, create, update, remove };
