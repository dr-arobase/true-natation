const { db } = require('../config/db');
const crypto = require('crypto');

async function getAll(req, res) {
  const cours = await db('cours')
    .leftJoin('groupes', 'cours.groupe_id', 'groupes.id')
    .leftJoin('instructeurs', 'cours.instructeur_id', 'instructeurs.id')
    .select(
      'cours.*',
      'groupes.nom as groupe_nom',
      'instructeurs.nom as instructeur_nom',
      'instructeurs.prenom as instructeur_prenom'
    )
    .orderBy('cours.titre');
  res.json(cours);
}

async function getById(req, res) {
  const cours = await db('cours').where({ 'cours.id': req.params.id }).first();
  if (!cours) return res.status(404).json({ error: 'Cours introuvable.' });
  res.json(cours);
}

async function create(req, res) {
  const { titre, groupe_id, instructeur_id, jour, heure_debut, heure_fin } = req.body;
  if (!titre) return res.status(400).json({ error: 'Titre requis.' });

  const id = crypto.randomUUID();
  await db('cours').insert({ id, titre, groupe_id, instructeur_id, jour, heure_debut, heure_fin });
  res.status(201).json({ id, titre, groupe_id, instructeur_id, jour, heure_debut, heure_fin });
}

async function update(req, res) {
  const { titre, groupe_id, instructeur_id, jour, heure_debut, heure_fin } = req.body;
  const count = await db('cours').where({ id: req.params.id }).update({ titre, groupe_id, instructeur_id, jour, heure_debut, heure_fin });
  if (!count) return res.status(404).json({ error: 'Cours introuvable.' });
  res.json({ message: 'Cours mis à jour.' });
}

async function remove(req, res) {
  const count = await db('cours').where({ id: req.params.id }).delete();
  if (!count) return res.status(404).json({ error: 'Cours introuvable.' });
  res.json({ message: 'Cours supprimé.' });
}

module.exports = { getAll, getById, create, update, remove };
