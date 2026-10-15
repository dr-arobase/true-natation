const { db } = require('../config/db');
const crypto = require('crypto');

function parseNotes(row) {
  if (!row) return row;
  try { row.notes = row.notes_json ? JSON.parse(row.notes_json) : {}; }
  catch { row.notes = {}; }
  return row;
}

const _UNUSED = [
  'critere_entree_eau',
  'critere_flottaison',
  'critere_propulsion',
  'critere_respiration',
  'critere_coordination',
  'critere_endurance',
  'critere_securite',
  'critere_aisance',
];

// GET /api/evaluations  — toutes les évaluations (jointure nageur + groupe + instructeur)
async function getAll(req, res) {
  try {
    const rows = await db('evaluations as e')
      .leftJoin('nageurs as n', 'e.nageur_id', 'n.id')
      .leftJoin('groupes as g', 'e.groupe_id', 'g.id')
      .leftJoin('instructeurs as i', 'e.instructeur_id', 'i.id')
      .select(
        'e.*',
        'n.nom as nageur_nom', 'n.prenom as nageur_prenom',
        'g.nom as groupe_nom', 'g.niveau as groupe_niveau',
        db.raw("(i.prenom || ' ' || i.nom) as instructeur_nom")
      )
      .orderBy('e.date_evaluation', 'desc');
    res.json(rows.map(parseNotes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/evaluations/groupe/:groupeId  — évaluations d'un groupe
async function getByGroupe(req, res) {
  try {
    const rows = await db('evaluations as e')
      .leftJoin('nageurs as n', 'e.nageur_id', 'n.id')
      .leftJoin('groupes as g', 'e.groupe_id', 'g.id')
      .leftJoin('instructeurs as i', 'e.instructeur_id', 'i.id')
      .where('e.groupe_id', req.params.groupeId)
      .select(
        'e.*',
        'n.nom as nageur_nom', 'n.prenom as nageur_prenom',
        'g.nom as groupe_nom', 'g.niveau as groupe_niveau',
        db.raw("(i.prenom || ' ' || i.nom) as instructeur_nom")
      )
      .orderBy('n.nom')
      .orderBy('e.date_evaluation', 'desc');
    res.json(rows.map(parseNotes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/evaluations/nageur/:nageurId  — historique d'un nageur
async function getByNageur(req, res) {
  try {
    const rows = await db('evaluations as e')
      .leftJoin('nageurs as n', 'e.nageur_id', 'n.id')
      .leftJoin('groupes as g', 'e.groupe_id', 'g.id')
      .leftJoin('instructeurs as i', 'e.instructeur_id', 'i.id')
      .where('e.nageur_id', req.params.nageurId)
      .select(
        'e.*',
        'n.nom as nageur_nom', 'n.prenom as nageur_prenom',
        'g.nom as groupe_nom',
        db.raw("(i.prenom || ' ' || i.nom) as instructeur_nom")
      )
      .orderBy('e.date_evaluation', 'desc');
    res.json(rows.map(parseNotes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/evaluations/:id
async function getById(req, res) {
  try {
    const row = await db('evaluations as e')
      .leftJoin('nageurs as n', 'e.nageur_id', 'n.id')
      .leftJoin('groupes as g', 'e.groupe_id', 'g.id')
      .leftJoin('instructeurs as i', 'e.instructeur_id', 'i.id')
      .where('e.id', req.params.id)
      .select(
        'e.*',
        'n.nom as nageur_nom', 'n.prenom as nageur_prenom',
        'g.nom as groupe_nom',
        db.raw("(i.prenom || ' ' || i.nom) as instructeur_nom")
      )
      .first();
    if (!row) return res.status(404).json({ error: 'Évaluation introuvable.' });
    res.json(parseNotes(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/evaluations
async function create(req, res) {
  try {
    const {
      nageur_id, groupe_id, instructeur_id,
      session, niveau_evalue, date_evaluation,
      commentaires, resultat,
      notes,
    } = req.body;

    if (!nageur_id) return res.status(400).json({ error: 'nageur_id est requis.' });

    const id = crypto.randomUUID();
    await db('evaluations').insert({
      id,
      nageur_id,
      groupe_id: groupe_id || null,
      instructeur_id: instructeur_id || null,
      session: session || null,
      niveau_evalue: niveau_evalue || null,
      date_evaluation: date_evaluation || null,
      commentaires: commentaires || null,
      resultat: resultat || 'en_cours',
      notes_json: notes ? JSON.stringify(notes) : null,
    });

    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/evaluations/:id
async function update(req, res) {
  try {
    const {
      nageur_id, groupe_id, instructeur_id,
      session, niveau_evalue, date_evaluation,
      commentaires, resultat,
      notes,
    } = req.body;

    const count = await db('evaluations').where({ id: req.params.id }).update({
      nageur_id,
      groupe_id: groupe_id || null,
      instructeur_id: instructeur_id || null,
      session: session || null,
      niveau_evalue: niveau_evalue || null,
      date_evaluation: date_evaluation || null,
      commentaires: commentaires || null,
      resultat: resultat || 'en_cours',
      notes_json: notes ? JSON.stringify(notes) : null,
    });

    if (!count) return res.status(404).json({ error: 'Évaluation introuvable.' });
    res.json({ message: 'Évaluation mise à jour.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/evaluations/:id
async function remove(req, res) {
  try {
    const count = await db('evaluations').where({ id: req.params.id }).delete();
    if (!count) return res.status(404).json({ error: 'Évaluation introuvable.' });
    res.json({ message: 'Évaluation supprimée.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAll, getByGroupe, getByNageur, getById, create, update, remove };
