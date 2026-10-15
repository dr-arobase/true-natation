const knex = require('knex');
const path = require('path');
const { dbFile } = require('./config');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, '../../', dbFile)
  },
  useNullAsDefault: true
});

async function createTables() {
  // --- USERS (authentification) ---
  if (!await db.schema.hasTable('users')) {
    await db.schema.createTable('users', (t) => {
      t.string('id').primary();
      t.string('username').notNullable().unique();
      t.string('password').notNullable();
      t.string('role').defaultTo('employe'); // admin | employe
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'users' créée.");

    // Créer l'admin par défaut
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hashed = await bcrypt.hash(password, 10);
    await db('users').insert({ id: crypto.randomUUID(), username, password: hashed, role: 'admin' });
    console.log(`Utilisateur admin '${username}' créé.`);
  }

  // --- NAGEURS ---
  if (!await db.schema.hasTable('nageurs')) {
    await db.schema.createTable('nageurs', (t) => {
      t.string('id').primary();
      t.string('nom').notNullable();
      t.string('prenom').notNullable();
      t.string('niveau');  // ex: Préscolaire 1, Nageur 3, Forme Physique 1
      t.string('horaire');
      t.string('session');
      t.text('commentaires');
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'nageurs' créée.");
  }

  // Migration : ajouter colonne avatar si absente
  const hasAvatar = await db.schema.hasColumn('users', 'avatar');
  if (!hasAvatar) {
    await db.schema.table('users', t => { t.text('avatar'); });
    console.log("Colonne avatar ajoutée à 'users'.");
  }

  // Migration : ajouter colonnes si table existe déjà sans elles
  const hasHoraire = await db.schema.hasColumn('nageurs', 'horaire');
  if (!hasHoraire) {
    await db.schema.table('nageurs', t => {
      t.string('horaire');
      t.string('session');
      t.text('commentaires');
    });
    console.log("Colonnes horaire/session/commentaires ajoutées à 'nageurs'.");
  }

  // Migration : ajouter groupe_id aux nageurs
  const hasGroupeId = await db.schema.hasColumn('nageurs', 'groupe_id');
  if (!hasGroupeId) {
    await db.schema.table('nageurs', t => {
      t.string('groupe_id').references('id').inTable('groupes').onDelete('SET NULL');
    });
    console.log("Colonne groupe_id ajoutée à 'nageurs'.");
  }

  // --- GROUPES ---
  if (!await db.schema.hasTable('groupes')) {
    await db.schema.createTable('groupes', (t) => {
      t.string('id').primary();
      t.string('nom').notNullable();
      t.string('niveau').notNullable(); // debutant | intermediaire | avance
      t.integer('capacite_max').defaultTo(15);
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'groupes' créée.");
  }

  // --- INSTRUCTEURS ---
  if (!await db.schema.hasTable('instructeurs')) {
    await db.schema.createTable('instructeurs', (t) => {
      t.string('id').primary();
      t.string('nom').notNullable();
      t.string('prenom').notNullable();
      t.string('courriel');
      t.string('telephone');
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'instructeurs' créée.");
  }

  // --- COURS ---
  if (!await db.schema.hasTable('cours')) {
    await db.schema.createTable('cours', (t) => {
      t.string('id').primary();
      t.string('titre').notNullable();
      t.string('groupe_id').references('id').inTable('groupes').onDelete('SET NULL');
      t.string('instructeur_id').references('id').inTable('instructeurs').onDelete('SET NULL');
      t.string('jour'); // lundi | mardi | ...
      t.time('heure_debut');
      t.time('heure_fin');
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'cours' créée.");
  }

  // --- INSCRIPTIONS ---
  if (!await db.schema.hasTable('inscriptions')) {
    await db.schema.createTable('inscriptions', (t) => {
      t.string('id').primary();
      t.string('nageur_id').notNullable().references('id').inTable('nageurs').onDelete('CASCADE');
      t.string('cours_id').notNullable().references('id').inTable('cours').onDelete('CASCADE');
      t.string('statut').defaultTo('active'); // active | annulee
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'inscriptions' créée.");
  }

  // --- PAIEMENTS ---
  if (!await db.schema.hasTable('paiements')) {
    await db.schema.createTable('paiements', (t) => {
      t.string('id').primary();
      t.string('nageur_id').notNullable().references('id').inTable('nageurs').onDelete('CASCADE');
      t.float('montant').notNullable();
      t.string('statut').defaultTo('en_attente'); // en_attente | paye | annule
      t.date('date_paiement');
      t.string('description');
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'paiements' créée.");
  }

  // --- SAUVETEURS ---
  if (!await db.schema.hasTable('sauveteurs')) {
    await db.schema.createTable('sauveteurs', (t) => {
      t.string('id').primary();
      t.string('nom').notNullable();
      t.string('prenom').notNullable();
      t.string('certification'); // ex: Lauréat du bronze, Croix de bronze, NL piscine...
      t.string('statut').defaultTo('actif'); // actif | inactif | en_formation
      t.string('horaire');
      t.string('session');
      t.date('date_expiration');
      t.text('commentaires');
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'sauveteurs' créée.");
  }

  // --- EVALUATIONS ---
  if (!await db.schema.hasTable('evaluations')) {
    await db.schema.createTable('evaluations', (t) => {
      t.string('id').primary();
      t.string('nageur_id').notNullable().references('id').inTable('nageurs').onDelete('CASCADE');
      t.string('groupe_id').references('id').inTable('groupes').onDelete('SET NULL');
      t.string('instructeur_id').references('id').inTable('instructeurs').onDelete('SET NULL');
      t.string('session');           // ex: Hiver 2026
      t.string('niveau_evalue');     // niveau au moment de l'évaluation
      t.date('date_evaluation');
      // Critères dynamiques selon le niveau — stockés en JSON
      // ex: { "Entrée à l'eau": 3, "Propulsion": 4, ... }
      t.text('notes_json');
      t.text('commentaires');
      t.string('resultat').defaultTo('en_cours'); // en_cours | reussi | echoue | recommande
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log("Table 'evaluations' créée.");
  }

  // Migration : si ancienne table avec colonnes fixes → ajouter notes_json
  const hasNotesJson = await db.schema.hasColumn('evaluations', 'notes_json');
  if (!hasNotesJson) {
    await db.schema.table('evaluations', t => { t.text('notes_json'); });
    console.log("Colonne notes_json ajoutée à 'evaluations'.");
  }
}

module.exports = { db, createTables };
