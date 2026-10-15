const { db } = require('../config/db');
const crypto = require('crypto');

async function getAll(req, res) {
  const paiements = await db('paiements')
    .leftJoin('nageurs', 'paiements.nageur_id', 'nageurs.id')
    .select(
      'paiements.*',
      'nageurs.nom as nageur_nom',
      'nageurs.prenom as nageur_prenom'
    )
    .orderBy('paiements.created_at', 'desc');
  res.json(paiements);
}

async function getById(req, res) {
  const paiement = await db('paiements').where({ id: req.params.id }).first();
  if (!paiement) return res.status(404).json({ error: 'Paiement introuvable.' });
  res.json(paiement);
}

async function create(req, res) {
  const { nageur_id, montant, statut, date_paiement, description } = req.body;
  if (!nageur_id || !montant) return res.status(400).json({ error: 'nageur_id et montant requis.' });

  const id = crypto.randomUUID();
  await db('paiements').insert({ id, nageur_id, montant, statut: statut || 'en_attente', date_paiement, description });
  res.status(201).json({ id, nageur_id, montant, statut, date_paiement, description });
}

async function update(req, res) {
  const { montant, statut, date_paiement, description } = req.body;
  const count = await db('paiements').where({ id: req.params.id }).update({ montant, statut, date_paiement, description });
  if (!count) return res.status(404).json({ error: 'Paiement introuvable.' });
  res.json({ message: 'Paiement mis à jour.' });
}

async function remove(req, res) {
  const count = await db('paiements').where({ id: req.params.id }).delete();
  if (!count) return res.status(404).json({ error: 'Paiement introuvable.' });
  res.json({ message: 'Paiement supprimé.' });
}

module.exports = { getAll, getById, create, update, remove };
