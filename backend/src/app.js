const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const nageursRoutes = require('./routes/nageurs.routes');
const groupesRoutes = require('./routes/groupes.routes');
const instructeursRoutes = require('./routes/instructeurs.routes');
const coursRoutes = require('./routes/cours.routes');
const inscriptionsRoutes = require('./routes/inscriptions.routes');
const paiementsRoutes = require('./routes/paiements.routes');
const sauveteurRoutes = require('./routes/sauveteurs.routes');
const evaluationsRoutes = require('./routes/evaluations.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/nageurs', nageursRoutes);
app.use('/api/groupes', groupesRoutes);
app.use('/api/instructeurs', instructeursRoutes);
app.use('/api/cours', coursRoutes);
app.use('/api/inscriptions', inscriptionsRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/sauveteurs', sauveteurRoutes);
app.use('/api/evaluations', evaluationsRoutes);

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Erreur serveur' });
});

module.exports = app;
