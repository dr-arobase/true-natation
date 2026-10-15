const { db } = require('../config/db');
const crypto = require('crypto');

async function getAll(req, res) {
  const inscriptions = await db('inscriptions')
    .leftJoin('nageurs', 'inscriptions.nageur_id', 'nageurs.id')
    .leftJoin('cours', 'inscriptions.cours_id', 'cours.id')
    .select(
      'inscriptions.*',
      'nageurs.nom as nageur_nom',
      'nageurs.prenom as nageur_prenom',
      'cours.titre as cours_titre'
    )
    .orderBy('inscriptions.created_at', 'desc');
  res.json(inscriptions);
}

async function getById(req, res) {
  const inscription = await db('inscriptions').where({ 'inscriptions.id': req.params.id }).first();
  if (!inscription) return res.status(404).json({ error: 'Inscription introuvable.' });
  res.json(inscription);
}

async function create(req, res) {
  const { nageur_id, cours_id, statut } = req.body;
  if (!nageur_id || !cours_id) return res.status(400).json({ error: 'nageur_id et cours_id requis.' });

  const id = crypto.randomUUID();
  await db('inscriptions').insert({ id, nageur_id, cours_id, statut: statut || 'active' });
  res.status(201).json({ id, nageur_id, cours_id, statut });
}

async function update(req, res) {
  const { statut } = req.body;
  const count = await db('inscriptions').where({ id: req.params.id }).update({ statut });
  if (!count) return res.status(404).json({ error: 'Inscription introuvable.' });
  res.json({ message: 'Inscription mise à jour.' });
}

async function remove(req, res) {
  const count = await db('inscriptions').where({ id: req.params.id }).delete();
  if (!count) return res.status(404).json({ error: 'Inscription introuvable.' });
  res.json({ message: 'Inscription supprimée.' });
}

module.exports = { getAll, getById, create, update, remove };
