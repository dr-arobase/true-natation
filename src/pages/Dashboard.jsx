import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useTheme } from '../ThemeContext';

const PIE_COLORS = ['#3298dc', '#48c774', '#ffdd57', '#f14668', '#9b59b6', '#1abc9c', '#e67e22', '#e74c3c'];

function StatCard({ icon, color, label, value, loading }) {
  return (
    <div className="column is-3">
      <div className="box has-text-centered">
        <span className={`icon is-large has-text-${color}`}>
          <i className={`fas ${icon} fa-2x`}></i>
        </span>
        <p className="title is-2 mt-3">{loading ? 'â€¦' : value}</p>
        <p className="subtitle is-6 has-text-grey">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const username = localStorage.getItem('username') || 'Utilisateur';
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState({ nageurs: 0, cours: 0, inscriptions: 0, paiements: 0 });
  const [nageurs, setNageurs] = useState([]);
  const [allNageurs, setAllNageurs] = useState([]);
  const [coursList, setCoursList] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/'); return; }

    async function fetchData() {
      try {
        const [rNageurs, rCours, rInscriptions, rPaiements] = await Promise.all([
          fetch('/api/nageurs', { headers }),
          fetch('/api/cours', { headers }),
          fetch('/api/inscriptions', { headers }),
          fetch('/api/paiements', { headers }),
        ]);
        if (rNageurs.status === 401 || rNageurs.status === 403) { handleLogout(); return; }

        const [n, c, i, p] = await Promise.all([
          rNageurs.json(), rCours.json(), rInscriptions.json(), rPaiements.json()
        ]);
        setStats({ nageurs: n.length, cours: c.length, inscriptions: i.length, paiements: p.length });
        setAllNageurs(n);
        setNageurs(n.slice(0, 5));
        setCoursList(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  // â”€â”€ Graphique 1 : nageurs par niveau â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const niveauData = Object.entries(
    allNageurs.reduce((acc, n) => {
      const k = n.niveau || 'Non dÃ©fini';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // â”€â”€ Graphique 2 : nageurs par session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sessionData = Object.entries(
    allNageurs.reduce((acc, n) => {
      const k = n.session || 'Non dÃ©finie';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // â”€â”€ Prochains cours â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const JOURS = { 'dimanche': 0, 'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6 };
  const now = new Date();
  const todayNum = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function parseMinutes(t) {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  const prochainsCours = coursList
    .filter(c => c.jour)
    .map(c => {
      const jourNum = JOURS[c.jour.toLowerCase()] ?? -1;
      if (jourNum === -1) return null;
      const debutMin = parseMinutes(c.heure_debut);
      let daysUntil = (jourNum - todayNum + 7) % 7;
      if (daysUntil === 0 && debutMin <= nowMinutes) daysUntil = 7;
      return { ...c, daysUntil, debutMin };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysUntil !== b.daysUntil ? a.daysUntil - b.daysUntil : a.debutMin - b.debutMin)
    .slice(0, 5);

  function labelJour(c) {
    if (c.daysUntil === 0) return "Aujourd'hui";
    if (c.daysUntil === 1) return 'Demain';
    return c.jour.charAt(0).toUpperCase() + c.jour.slice(1).toLowerCase();
  }

  const axisColor = dark ? '#a0aec0' : '#555';
  const gridColor = dark ? '#2d3748' : '#e0e0e0';
  const tooltipStyle = dark
    ? { backgroundColor: '#0a2540', border: '1px solid #2d3748', color: '#e0e0e0' }
    : {};

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar is-info" role="navigation">
        <div className="navbar-brand">
          <span className="navbar-item">
            <span className="icon mr-2"><i className="fas fa-water"></i></span>
            <strong>Club Natation</strong>
          </span>
        </div>
        <div className="navbar-menu is-active">
          <div className="navbar-start">
            <Link to="/gestion-nageurs" className="navbar-item">
              <span className="icon mr-1"><i className="fas fa-users"></i></span>
              Nageurs
            </Link>
            <Link to="/gestion-sauveteurs" className="navbar-item">
              <span className="icon mr-1"><i className="fas fa-life-ring"></i></span>
              Sauveteurs
            </Link>
            <Link to="/gestion-evaluations" className="navbar-item">
              <span className="icon mr-1"><i className="fas fa-clipboard-check"></i></span>
              Évaluations
            </Link>
            <Link to="/ajouter-nageur" className="navbar-item">
              <span className="icon mr-1"><i className="fas fa-file-import"></i></span>
              Import CSV
            </Link>
          </div>
          <div className="navbar-end">
            <div className="navbar-item">
              <Link to="/profil" className="is-flex is-align-items-center" style={{ gap: 8, textDecoration: 'none', color: 'inherit' }}>
                {localStorage.getItem('avatar')
                  ? <img src={localStorage.getItem('avatar')} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.6)' }} />
                  : <span className="icon"><i className="fas fa-user-circle fa-lg"></i></span>}
                <strong>{username}</strong>
                <span className="tag is-light ml-1">{role}</span>
              </Link>
            </div>
            <div className="navbar-item">
              <button className="button is-light is-small mr-2" onClick={toggle} title={dark ? 'Mode clair' : 'Mode sombre'}>
                <span className="icon"><i className={`fas ${dark ? 'fa-sun' : 'fa-moon'}`}></i></span>
              </button>
              <button className="button is-danger is-light is-small" onClick={handleLogout}>
                <span className="icon"><i className="fas fa-sign-out-alt"></i></span>
                <span>DÃ©connexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="section">
        <div className="container">
          <h1 className="title is-3">
            <span className="icon mr-2"><i className="fas fa-tachometer-alt"></i></span>
            Tableau de bord
          </h1>

          {/* Stats */}
          <div className="columns">
            <StatCard icon="fa-users" color="info" label="Nageurs" value={stats.nageurs} loading={loading} />
            <StatCard icon="fa-chalkboard-teacher" color="success" label="Cours" value={stats.cours} loading={loading} />
            <StatCard icon="fa-clipboard-list" color="warning" label="Inscriptions" value={stats.inscriptions} loading={loading} />
            <StatCard icon="fa-dollar-sign" color="danger" label="Paiements" value={stats.paiements} loading={loading} />
          </div>

          {/* Graphiques */}
          {!loading && allNageurs.length > 0 && (
            <div className="columns mt-2">
              {/* Graphique barres : nageurs par niveau */}
              <div className="column is-7">
                <div className="box">
                  <h2 className="title is-6 mb-4">
                    <span className="icon mr-2 has-text-info"><i className="fas fa-chart-bar"></i></span>
                    Nageurs par niveau
                  </h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={niveauData} margin={{ top: 5, right: 10, left: 0, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: axisColor, fontSize: 11 }}
                        angle={-40}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fill: axisColor, fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" name="Nageurs" fill="#3298dc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique camembert : nageurs par session */}
              <div className="column is-5">
                <div className="box">
                  <h2 className="title is-6 mb-4">
                    <span className="icon mr-2 has-text-success"><i className="fas fa-chart-pie"></i></span>
                    Répartition par session
                  </h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={sessionData}
                        cx="50%"
                        cy="45%"
                        outerRadius={85}
                        dataKey="value"
                        label={({ name, percent }) => `${Math.round(percent * 100)}%`}
                        labelLine={false}
                      >
                        {sessionData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend formatter={(v) => <span style={{ color: axisColor, fontSize: 12 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Derniers nageurs */}
          <div className="box mt-2">
            <div className="level">
              <div className="level-left">
                <h2 className="title is-5">
                  <span className="icon mr-2"><i className="fas fa-users"></i></span>
                  Derniers nageurs inscrits
                </h2>
              </div>
              <div className="level-right">
                <Link to="/gestion-nageurs" className="button is-info is-small">
                  <span className="icon"><i className="fas fa-users"></i></span>
                  <span>Voir tout</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <p className="has-text-grey">Chargement...</p>
            ) : nageurs.length === 0 ? (
              <div className="has-text-centered py-5">
                <span className="icon is-large has-text-grey-light"><i className="fas fa-users fa-3x"></i></span>
                <p className="has-text-grey mt-3">Aucun nageur enregistrÃ©.</p>
                <Link to="/ajouter-nageur" className="button is-info mt-3">Ajouter le premier nageur</Link>
              </div>
            ) : (
              <table className="table is-fullwidth is-hoverable is-striped">
                <thead>
                  <tr>
                    <th>Nom complet</th>
                    <th>Niveau</th>
                    <th>Horaire</th>
                    <th>Session</th>
                  </tr>
                </thead>
                <tbody>
                  {nageurs.map(n => (
                    <tr key={n.id}>
                      <td><strong>{n.prenom} {n.nom}</strong></td>
                      <td><span className="tag is-info is-light">{n.niveau || '—'}</span></td>
                      <td>{n.horaire || '—'}</td>
                      <td>{n.session || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Prochains cours */}
          <div className="box mt-4">
            <div className="level mb-3">
              <div className="level-left">
                <h2 className="title is-5">
                  <span className="icon mr-2"><i className="fas fa-clock"></i></span>
                  Prochains cours à venir
                </h2>
              </div>
            </div>

            {loading ? (
              <p className="has-text-grey">Chargement...</p>
            ) : prochainsCours.length === 0 ? (
              <div className="has-text-centered py-4">
                <span className="icon is-large has-text-grey-light"><i className="fas fa-calendar-times fa-2x"></i></span>
                <p className="has-text-grey mt-2">Aucun cours planifiÃ©.</p>
              </div>
            ) : (
              <div className="columns is-multiline">
                {prochainsCours.map(c => (
                  <div key={c.id} className="column is-one-fifth-desktop is-half-tablet">
                    <div className="box p-4" style={{ borderLeft: `4px solid ${c.daysUntil === 0 ? '#ffdd57' : c.daysUntil === 1 ? '#3298dc' : '#b5b5b5'}` }}>
                      <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
                        <span className={`tag is-${c.daysUntil === 0 ? 'warning' : c.daysUntil === 1 ? 'info' : 'light'} is-medium`}>
                          {labelJour(c)}
                        </span>
                        {c.daysUntil >= 2 && (
                          <span className="tag is-light is-small has-text-grey">dans {c.daysUntil}j</span>
                        )}
                      </div>
                      <p className="has-text-weight-bold">{c.titre}</p>
                      {(c.heure_debut || c.heure_fin) && (
                        <p className="is-size-7 has-text-grey mt-1">
                          <span className="icon is-small mr-1"><i className="fas fa-clock"></i></span>
                          {c.heure_debut}{c.heure_fin ? ` â€“ ${c.heure_fin}` : ''}
                        </p>
                      )}
                      {c.groupe_nom && (
                        <p className="is-size-7 has-text-grey">
                          <span className="icon is-small mr-1"><i className="fas fa-users"></i></span>
                          {c.groupe_nom}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
