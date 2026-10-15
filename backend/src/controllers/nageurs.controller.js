const { db } = require('../config/db');
const crypto = require('crypto');

async function getAll(req, res) {
  const nageurs = await db('nageurs').select('*').orderBy('nom');
  res.json(nageurs);
}

async function getById(req, res) {
  const nageur = await db('nageurs').where({ id: req.params.id }).first();
  if (!nageur) return res.status(404).json({ error: 'Nageur introuvable.' });
  res.json(nageur);
}

async function create(req, res) {
  const { nom, prenom, niveau, horaire, session, commentaires, groupe_id } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis.' });

  const id = crypto.randomUUID();
  await db('nageurs').insert({ id, nom, prenom, niveau, horaire, session, commentaires, groupe_id: groupe_id || null });
  res.status(201).json({ id, nom, prenom, niveau, horaire, session, commentaires, groupe_id: groupe_id || null });
}

async function update(req, res) {
  const { nom, prenom, niveau, horaire, session, commentaires, groupe_id } = req.body;
  const count = await db('nageurs').where({ id: req.params.id }).update({ nom, prenom, niveau, horaire, session, commentaires, groupe_id: groupe_id || null });
  if (!count) return res.status(404).json({ error: 'Nageur introuvable.' });
  res.json({ message: 'Nageur mis à jour.' });
}

async function remove(req, res) {
  const count = await db('nageurs').where({ id: req.params.id }).delete();
  if (!count) return res.status(404).json({ error: 'Nageur introuvable.' });
  res.json({ message: 'Nageur supprimé.' });
}

async function importNageurs(req, res) {
  const liste = req.body.nageurs;
  if (!Array.isArray(liste) || liste.length === 0)
    return res.status(400).json({ error: 'Liste de nageurs vide ou invalide.' });

  const resultats = { ajoutes: 0, erreurs: [] };
  for (const n of liste) {
    // Gère "nom complet" → split prénom / nom
    let prenom = n.prenom || '';
    let nom = n.nom || '';
    if (!prenom && !nom && n['nom complet']) {
      const parts = n['nom complet'].trim().split(' ');
      nom = parts.pop();
      prenom = parts.join(' ');
    }
    if (!nom && !prenom) {
      resultats.erreurs.push(`Ligne ignorée (nom manquant) : ${JSON.stringify(n)}`);
      continue;
    }
    try {
      await db('nageurs').insert({
        id: crypto.randomUUID(),
        nom,
        prenom,
        niveau: n.niveau || null,
        horaire: n.horaire || null,
        session: n.session || null,
        commentaires: n.commentaires || null,
      });
      resultats.ajoutes++;
    } catch (e) {
      resultats.erreurs.push(`Erreur pour ${prenom} ${nom} : ${e.message}`);
    }
  }
  res.status(201).json(resultats);
}

module.exports = { getAll, getById, create, update, remove, importNageurs };
