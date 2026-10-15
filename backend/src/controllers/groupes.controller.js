const { db } = require('../config/db');
const crypto = require('crypto');

async function getAll(req, res) {
  const groupes = await db('groupes').select('*').orderBy('nom');
  res.json(groupes);
}

async function getById(req, res) {
  const groupe = await db('groupes').where({ id: req.params.id }).first();
  if (!groupe) return res.status(404).json({ error: 'Groupe introuvable.' });
  res.json(groupe);
}

async function create(req, res) {
  const { nom, niveau, capacite_max } = req.body;
  if (!nom || !niveau) return res.status(400).json({ error: 'Nom et niveau requis.' });

  const id = crypto.randomUUID();
  await db('groupes').insert({ id, nom, niveau, capacite_max });
  res.status(201).json({ id, nom, niveau, capacite_max });
}

async function update(req, res) {
  const { nom, niveau, capacite_max } = req.body;
  const count = await db('groupes').where({ id: req.params.id }).update({ nom, niveau, capacite_max });
  if (!count) return res.status(404).json({ error: 'Groupe introuvable.' });
  res.json({ message: 'Groupe mis à jour.' });
}

async function remove(req, res) {
  const count = await db('groupes').where({ id: req.params.id }).delete();
  if (!count) return res.status(404).json({ error: 'Groupe introuvable.' });
  res.json({ message: 'Groupe supprimé.' });
}

module.exports = { getAll, getById, create, update, remove };
