true-natation/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── nageur.csv
│
├── public/
│   └── vite.svg
│
├── src/                          # Frontend React
│   ├── main.jsx
│   ├── App.jsx
│   ├── ThemeContext.jsx           # Contexte clair/sombre (localStorage)
│   ├── theme.css                 # CSS dark mode (Bulma overrides)
│   └── pages/
│       ├── Login.jsx             # Page de connexion
│       ├── Dashboard.jsx         # Tableau de bord + graphiques recharts
│       ├── GestionNageurs.jsx    # CRUD nageurs + filtres + pagination
│       ├── GestionSauveteurs.jsx # CRUD sauveteurs + filtres + pagination
│       ├── AjouterNageur.jsx     # Import CSV / ajout manuel
│       ├── Profil.jsx            # Changement mdp + photo de profil
│       └── Inscription.jsx       # Inscription publique
│
└── backend/                      # Backend Node.js + Express
    ├── server.js
    ├── natation.sqlite3           # Base de données SQLite
    ├── .env
    ├── package.json
    └── src/
        ├── app.js                 # Express app + routes
        ├── config/
        │   ├── config.js          # Port, JWT secret, DB file
        │   └── db.js              # Knex + création des tables
        ├── controllers/
        │   ├── auth.controller.js        # login, register, me, changePassword, updateAvatar
        │   ├── nageurs.controller.js     # CRUD + import CSV
        │   ├── sauveteurs.controller.js  # CRUD
        │   ├── cours.controller.js
        │   ├── groupes.controller.js
        │   ├── instructeurs.controller.js
        │   ├── inscriptions.controller.js
        │   └── paiements.controller.js
        ├── middleware/
        │   └── auth.middleware.js   # JWT auth + adminOnly
        └── routes/
            ├── auth.routes.js           # POST /login /register, GET /me, PUT /change-password /avatar
            ├── nageurs.routes.js        # GET POST PUT DELETE + POST /import
            ├── sauveteurs.routes.js     # GET POST PUT DELETE
            ├── cours.routes.js
            ├── groupes.routes.js
            ├── instructeurs.routes.js
            ├── inscriptions.routes.js
            └── paiements.routes.js

# ─────────────────────────────────────────────────────────────
# BASE DE DONNÉES (SQLite — natation.sqlite3)
# ─────────────────────────────────────────────────────────────
# users          → id, username, password, role, avatar, created_at
# nageurs        → id, nom, prenom, niveau, horaire, session, commentaires, created_at
# sauveteurs     → id, nom, prenom, certification, statut, horaire, session, date_expiration, commentaires, created_at
# cours          → id, titre, groupe_id, instructeur_id, jour, heure_debut, heure_fin, created_at
# groupes        → id, nom, niveau, capacite_max, created_at
# instructeurs   → id, nom, prenom, courriel, telephone, created_at
# inscriptions   → id, nageur_id, cours_id, statut, created_at
# paiements      → id, nageur_id, montant, statut, date_paiement, description, created_at

# ─────────────────────────────────────────────────────────────
# DÉMARRAGE
# ─────────────────────────────────────────────────────────────
# Backend  (port 3001) :  cd backend && node server.js
# Frontend (port 5173) :  npm run dev
# Login admin          :  admin / admin123
