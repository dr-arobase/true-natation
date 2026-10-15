const { db } = require('../config/db');
const crypto = require('crypto');

async function getAll(req, res) {
  const instructeurs = await db('instructeurs').select('*').orderBy('nom');
  res.json(instructeurs);
}

async function getById(req, res) {
  const instructeur = await db('instructeurs').where({ id: req.params.id }).first();
  if (!instructeur) return res.status(404).json({ error: 'Instructeur introuvable.' });
  res.json(instructeur);
}

async function create(req, res) {
  const { nom, prenom, courriel, telephone } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis.' });

  const id = crypto.randomUUID();
  await db('instructeurs').insert({ id, nom, prenom, courriel, telephone });
  res.status(201).json({ id, nom, prenom, courriel, telephone });
}

async function update(req, res) {
  const { nom, prenom, courriel, telephone } = req.body;
  const count = await db('instructeurs').where({ id: req.params.id }).update({ nom, prenom, courriel, telephone });
  if (!count) return res.status(404).json({ error: 'Instructeur introuvable.' });
  res.json({ message: 'Instructeur mis à jour.' });
}

async function remove(req, res) {
  const count = await db('instructeurs').where({ id: req.params.id }).delete();
  if (!count) return res.status(404).json({ error: 'Instructeur introuvable.' });
  res.json({ message: 'Instructeur supprimé.' });
}

module.exports = { getAll, getById, create, update, remove };
