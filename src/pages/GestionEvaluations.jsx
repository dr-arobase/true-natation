import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

// ─── Niveaux disponibles ────────────────────────────────────────────────────
const NIVEAUX = [
  'Cours privé',
  'Parent et enfant 1',
  'Parent et enfant 2',
  'Parent et enfant 3',
  'Préscolaire 1',
  'Préscolaire 2',
  'Préscolaire 3',
  'Préscolaire 4',
  'Préscolaire 5',
  'Nageur 1',
  'Nageur 2',
  'Nageur 3',
  'Nageur 4',
  'Nageur 5',
  'Nageur 6',
  'Nageur Adolescent 1',
  'Nageur Adolescent 2',
  'Nageur Adolescent 3',
  'Nageur Adulte 1',
  'Nageur Adulte 2',
  'Nageur Adulte 3',
  'Forme Physique',
  'Forme Physique 1',
  'Jeune Sauveteur Initié',
  'Jeune Sauveteur averti',
  'Jeune sauveteur Expert',
  'Étoile de bronze',
  'Médaille de bronze',
];

// ─── Critères par niveau ────────────────────────────────────────────────────
const CRITERES_PAR_NIVEAU = {
  'Cours privé': ['Libre'],

  'Parent et enfant 1': [
    "Niveau precedent",
    "Entrer et sortir de l'eau avec l'enfant de façon sécuritaire",
    "Se préparer pour l'immersion",
    "Tenir l'enfant sur le ventre en gardant un contact visuel avec lui",
    "Tenir l'enfant sur le dos, en soutenant sa tête et son dos",
    "Flotter sur le ventre, le visage hors de l'eau (avec de l'aide)",
    "Flotter sur le dos (avec de l'aide)",
    "Flotter en vêtu d'un VFI (avec de l'aide)",
    "Allonger les bras vers l'avant, éclabousser l'eau et barboter sur le ventre et sur le dos",
    "Éclabousser l'eau avec les jambes et battre des jambes sur le ventre et sur le dos",
    "Conseil de sécurité aqua bon : Votre enfant à portée de main",
    "Conseil de sécurité aqua bon : Porter un gilet de sauvetage",
    "Conseil de sécurité aqua bon : Nager pour survivre",
  ],

  'Parent et enfant 2': [
    "Niveau precedent",
    "Entrer à l'eau à partir d'une position assise (avec de l'aide)",
    "Tenir l'enfant sur le ventre en gardant un contact visuel avec lui",
    "Tenir l'enfant sur le dos, en soutenant sa tête et son dos",
    "Flotter sur le ventre, le visage hors de l'eau (avec de l'aide)",
    "Flotter sur le dos (avec de l'aide)",
    "Flotter en vêtu d'un VFI (avec de l'aide)",
    "Allonger les bras vers l'avant, éclabousser l'eau et barboter sur le ventre et sur le dos",
    "Éclabousser l'eau avec les jambes et battre des jambes sur le ventre et sur le dos",
    "Conseil de sécurité aqua bon : Votre enfant à portée de main",
    "Conseil de sécurité aqua bon : Porter un gilet de sauvetage",
    "Conseil de sécurité aqua bon : Nager pour survivre",
  ],

  'Parent et enfant 3': [
    'Flottaison autonome courte',
    'Propulsion de base',
    'Immersion complète',
    'Aisance et confiance',
  ],

  'Préscolaire 1': [
    "Entrée à l'eau (marches)",
    'Flottaison ventrale assistée',
    'Battements de jambes',
    'Immersion du visage',
    'Aisance générale',
  ],
  'Préscolaire 2': [
    "Entrée à l'eau (saut)",
    'Flottaison dorsale assistée',
    'Battements de jambes (planche)',
    "Souffle dans l'eau",
    'Déplacement 5 mètres',
  ],
  'Préscolaire 3': [
    "Saut dans l'eau seul",
    'Flottaison ventrale 5 sec',
    'Propulsion bras et jambes',
    'Respiration rythmée',
    'Déplacement 10 mètres',
  ],
  'Préscolaire 4': [
    'Saut et récupération',
    'Flottaison dorsale 5 sec',
    'Crawl de base 10m',
    'Respiration bilatérale de base',
    'Virage de sécurité',
  ],
  'Préscolaire 5': [
    'Plongeon de départ',
    'Crawl 15 mètres',
    'Dos crawlé 10 mètres',
    'Respiration toutes les 2 brasses',
    'Virage touche',
    'Aisance et autonomie',
  ],

  'Nageur 1': [
    'Plongeon de départ',
    'Crawl 25m (technique de bras)',
    'Crawl (battements de jambes)',
    'Respiration toutes les 2 brasses',
    'Dos crawlé 25m',
    'Virage touche (crawl)',
    'Flottaison étoile ventrale 10 sec',
  ],
  'Nageur 2': [
    'Plongeon crawl',
    'Crawl 50m continu',
    'Dos crawlé 50m',
    'Respiration bilatérale (toutes les 3)',
    'Brasse — jambes',
    'Virage culbute (initiation)',
    'Nage sur le côté 25m',
  ],
  'Nageur 3': [
    'Crawl 100m continu',
    'Respiration bilatérale maîtrisée',
    'Dos crawlé 50m (virage)',
    'Brasse — coordination bras/jambes',
    'Brasse 25m',
    'Virage culbute crawl',
    'Départ plongeon dos',
  ],
  'Nageur 4': [
    'Crawl 200m continu',
    'Dos crawlé 100m',
    'Brasse 50m',
    'Papillon — jambes dauphin',
    'Papillon — coordination',
    'Virage culbute (crawl + dos)',
    'Endurance générale',
  ],
  'Nageur 5': [
    'Crawl 400m (technique)',
    'Dos crawlé 200m',
    'Brasse 100m (virage)',
    'Papillon 25m',
    'Quatre nages 100m',
    'Départs et virages (tous styles)',
    'Régularité du rythme',
  ],
  'Nageur 6': [
    'Crawl 800m',
    'Dos 200m (performance)',
    'Brasse 200m (performance)',
    'Papillon 50m',
    'Quatre nages 200m',
    'Virages culbute (tous styles)',
    'Maîtrise technique globale',
    'Endurance et régularité',
  ],

  'Nageur Adolescent 1': [
    'Crawl 25m (technique)',
    'Dos crawlé 25m',
    'Battements de jambes efficaces',
    'Respiration toutes les 2',
    'Plongeon de départ',
    'Confiance en milieu aquatique',
  ],
  'Nageur Adolescent 2': [
    'Crawl 100m continu',
    'Dos crawlé 50m',
    'Brasse — jambes et bras',
    'Respiration bilatérale',
    'Virage culbute initiation',
    'Nage libre 200m',
  ],
  'Nageur Adolescent 3': [
    'Crawl 400m',
    'Dos 200m',
    'Brasse 100m',
    'Papillon 25m',
    'Quatre nages 100m',
    'Virages crawl et dos',
    'Endurance et performance',
  ],

  'Nageur Adulte 1': [
    "Aisance dans l'eau",
    'Crawl 25m',
    'Dos crawlé 25m',
    'Respiration rythmée',
    'Flottaison autonome',
    'Plongeon ou entrée sécuritaire',
  ],
  'Nageur Adulte 2': [
    'Crawl 100m (technique bras)',
    'Dos crawlé 50m',
    'Brasse jambes/bras',
    'Respiration toutes les 3 brasses',
    'Endurance 200m nage libre',
    'Virage touche',
  ],
  'Nageur Adulte 3': [
    'Crawl 400m',
    'Dos 200m',
    'Brasse 100m coordonnée',
    'Papillon initiation',
    'Quatre nages 200m',
    'Virages et départs',
    'Performance et régularité',
  ],

  'Forme Physique': [
    'Endurance (500m continu)',
    'Régularité du rythme',
    'Technique crawl',
    'Technique dos',
    'Respiration efficace',
    'Progression générale',
  ],
  'Forme Physique 1': [
    'Endurance (1000m continu)',
    'Technique crawl avancée',
    'Technique dos avancée',
    'Brasse intégrée',
    'Régularité et rythme',
    'Objectif personnel atteint',
  ],

  'Jeune Sauveteur Initié': [
    'Nage 200m continu',
    'Plongeon de sauvetage',
    "Remorquage d'un mannequin",
    "Récupération d'objet (fond)",
    'Flottaison survie 5 min',
    'Connaissance des règles de sécurité',
  ],
  'Jeune Sauveteur averti': [
    'Nage 400m continu',
    'Entrée de sauvetage',
    'Remorquage 25m (victime)',
    'Plongée en apnée 2m',
    'Récupération fond (2m)',
    'Premiers secours de base',
    "Communication d'urgence",
  ],
  'Jeune sauveteur Expert': [
    'Nage 800m continu',
    'Remorquage 50m',
    'Plongée apnée 3m',
    'Victime inconsciente (PLS)',
    'RCR de base',
    "Gestion d'une situation d'urgence",
    'Leadership et communication',
  ],

  'Étoile de bronze': [
    'Nage 500m continu (temps)',
    'Plongeon de sauvetage (3m)',
    'Remorquage victime 25m',
    'Récupération fond (2m)',
    'Survie flottaison 10 min',
    'RCR 1 sauveteur',
    "Gestion d'une urgence aquatique",
  ],
  'Médaille de bronze': [
    'Nage 1000m (performance)',
    'Remorquage 50m (avec obstacle)',
    'Plongée apnée 4m',
    'Techniques de sauvetage avancées',
    'RCR 2 sauveteurs',
    'DEA (défibrillateur)',
    "Plan d'action d'urgence",
    "Rapport d'incident",
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const RESULTATS = [
  { value: 'en_cours',  label: 'En cours',  color: 'is-warning' },
  { value: 'reussi',    label: 'Réussi',    color: 'is-success' },
  { value: 'echec',     label: 'Échec',     color: 'is-danger'  },
  { value: 'absent',    label: 'Absent',    color: 'is-light'   },
];

const NOTES_LABEL = {
  1: { label: 'Non acquis',      color: 'is-danger'  },
  2: { label: 'En apprentissage', color: 'is-warning' },
  3: { label: 'Presque acquis',  color: 'is-info'    },
  4: { label: 'Acquis',          color: 'is-success' },
};

const PER_PAGE = 15;
const EMPTY_FORM = {
  nageur_id: '',
  groupe_id: '',
  instructeur_id: '',
  session: '',
  niveau_evalue: '',
  date_evaluation: '',
  notes: {},
  commentaires: '',
  resultat: 'en_cours',
};

function getCriteres(niveau) {
  return CRITERES_PAR_NIVEAU[niveau] || [];
}

function resultatTag(val) {
  const r = RESULTATS.find(x => x.value === val);
  if (!r) return <span className="tag is-light">—</span>;
  return <span className={`tag ${r.color}`}>{r.label}</span>;
}

function moyenneNotes(notes) {
  if (!notes || typeof notes !== 'object') return null;
  const vals = Object.values(notes).filter(v => typeof v === 'number' && v >= 1 && v <= 4);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

// ─── Composant principal ────────────────────────────────────────────────────
export default function GestionEvaluations() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Utilisateur';
  const role = localStorage.getItem('role');

  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

  const [evaluations, setEvaluations] = useState([]);
  const [nageurs, setNageurs] = useState([]);
  const [instructeurs, setInstructeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterResultat, setFilterResultat] = useState('');
  const [filterNom, setFilterNom] = useState('');
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──
  async function fetchAll() {
    setLoading(true); setFetchError('');
    try {
      const [rEval, rNag, rInst] = await Promise.all([
        fetch('/api/evaluations', { headers: authHeaders }),
        fetch('/api/nageurs', { headers: authHeaders }),
        fetch('/api/instructeurs', { headers: authHeaders }),
      ]);
      if (rEval.status === 401 || rEval.status === 403) { navigate('/'); return; }
      const [ev, na, inst] = await Promise.all([rEval.json(), rNag.json(), rInst.json()]);
      setEvaluations(Array.isArray(ev) ? ev : []);
      setNageurs(Array.isArray(na) ? na : []);
      setInstructeurs(Array.isArray(inst) ? inst : []);
    } catch { setFetchError('Impossible de contacter le serveur.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (!token) { navigate('/'); return; } fetchAll(); }, []);
  useEffect(() => { setPage(1); }, [filterNiveau, filterResultat, filterNom]);

  // ── Filtrage ──
  const filtered = evaluations.filter(e => {
    const nomMatch = !filterNom || (e.nageur_nom || '').toLowerCase().includes(filterNom.toLowerCase())
      || (e.nageur_prenom || '').toLowerCase().includes(filterNom.toLowerCase());
    const niveauMatch = !filterNiveau || (e.niveau_evalue || '') === filterNiveau;
    const resultatMatch = !filterResultat || (e.resultat || '') === filterResultat;
    return nomMatch && niveauMatch && resultatMatch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasFilters = filterNiveau || filterResultat || filterNom;

  // ── Nageurs groupés par niveau pour le sélecteur ──
  const niveauxAvecNageurs = NIVEAUX.filter(niv => nageurs.some(n => n.niveau === niv));
  const nageursSansNiveau = nageurs.filter(n => !n.niveau);

  // ── Modal helpers ──
  function openAdd() { setForm(EMPTY_FORM); setFormError(''); setModal('add'); }

  function openEdit(ev) {
    setEditTarget(ev);
    setForm({
      nageur_id: ev.nageur_id || '',
      groupe_id: ev.groupe_id || '',
      instructeur_id: ev.instructeur_id || '',
      session: ev.session || '',
      niveau_evalue: ev.niveau_evalue || '',
      date_evaluation: ev.date_evaluation || '',
      notes: ev.notes && typeof ev.notes === 'object' ? { ...ev.notes } : {},
      commentaires: ev.commentaires || '',
      resultat: ev.resultat || 'en_cours',
    });
    setFormError(''); setModal('edit');
  }

  function openView(ev) { setEditTarget(ev); setModal('view'); }
  function closeModal() { setModal(null); setEditTarget(null); setFormError(''); }

  function handleNageurChange(e) {
    const nid = e.target.value;
    const nageur = nageurs.find(n => n.id === nid);
    const nouveauNiveau = nageur?.niveau || form.niveau_evalue;
    setForm(prev => ({
      ...prev,
      nageur_id: nid,
      niveau_evalue: nouveauNiveau,
      notes: {},
    }));
  }

  function handleNiveauChange(e) {
    setForm(prev => ({ ...prev, niveau_evalue: e.target.value, notes: {} }));
  }

  function setNote(critere, val) {
    setForm(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [critere]: prev.notes[critere] === val ? undefined : val,
      },
    }));
  }

  // ── Sauvegarde ──
  async function handleSave() {
    if (!form.nageur_id) { setFormError('Veuillez sélectionner un nageur.'); return; }
    setSaving(true); setFormError('');
    try {
      const url = modal === 'edit' ? `/api/evaluations/${editTarget.id}` : '/api/evaluations';
      const method = modal === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err.error || err.message || 'Erreur lors de la sauvegarde.');
        return;
      }
      await fetchAll(); closeModal();
    } catch { setFormError('Erreur de connexion.'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/evaluations/${deleteTarget.id}`, { method: 'DELETE', headers: authHeaders });
      setDeleteTarget(null); await fetchAll();
    } catch { /* silent */ }
    finally { setDeleting(false); }
  }

  function handleLogout() { localStorage.clear(); navigate('/'); }

  function pageRange() {
    const delta = 2, range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
    return range;
  }

  const criteresActifs = getCriteres(form.niveau_evalue);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar is-info" role="navigation">
        <div className="navbar-brand">
          <span className="navbar-item">
            <span className="icon mr-2"><i className="fas fa-water"></i></span>
            <strong>Club Natation</strong>
          </span>
        </div>
        <div className="navbar-menu is-active">
          <div className="navbar-start">
            <Link to="/dashboard" className="navbar-item">
              <span className="icon mr-1"><i className="fas fa-tachometer-alt"></i></span>
              Tableau de bord
            </Link>
            <Link to="/gestion-nageurs" className="navbar-item">
              <span className="icon mr-1"><i className="fas fa-users"></i></span>
              Nageurs
            </Link>
            <Link to="/gestion-sauveteurs" className="navbar-item">
              <span className="icon mr-1"><i className="fas fa-life-ring"></i></span>
              Sauveteurs
            </Link>
            <Link to="/gestion-evaluations" className="navbar-item is-active has-text-white has-background-info-dark">
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
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Contenu ── */}
      <section className="section">
        <div className="container">

          <div className="level mb-4">
            <div className="level-left">
              <div>
                <h1 className="title is-3">
                  <span className="icon mr-2"><i className="fas fa-clipboard-check"></i></span>
                  Évaluations des nageurs
                </h1>
                {!loading && (
                  <p className="subtitle is-6 has-text-grey">
                    {filtered.length} évaluation{filtered.length !== 1 ? 's' : ''}
                    {hasFilters ? ` trouvée${filtered.length !== 1 ? 's' : ''}` : ' au total'}
                  </p>
                )}
              </div>
            </div>
            <div className="level-right">
              <button className="button is-success" onClick={openAdd}>
                <span className="icon"><i className="fas fa-plus"></i></span>
                <span>Nouvelle évaluation</span>
              </button>
            </div>
          </div>

          {fetchError && (
            <div className="notification is-danger is-light mb-4">
              <span className="icon mr-2"><i className="fas fa-exclamation-circle"></i></span>
              {fetchError}
            </div>
          )}

          {/* ── Filtres ── */}
          <div className="box mb-4 py-4">
            <div className="columns is-multiline is-vcentered">
              <div className="column is-4">
                <label className="label is-small mb-1">Nom / Prénom</label>
                <div className="control has-icons-right">
                  <input className="input is-small" type="text" placeholder="Rechercher..."
                    value={filterNom} onChange={e => setFilterNom(e.target.value)} />
                  {filterNom && (
                    <span className="icon is-right" style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => setFilterNom('')}>
                      <i className="fas fa-times"></i>
                    </span>
                  )}
                </div>
              </div>
              <div className="column is-4">
                <label className="label is-small mb-1">Niveau</label>
                <div className="select is-small is-fullwidth">
                  <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)}>
                    <option value="">— Tous les niveaux —</option>
                    {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="column is-3">
                <label className="label is-small mb-1">Résultat</label>
                <div className="select is-small is-fullwidth">
                  <select value={filterResultat} onChange={e => setFilterResultat(e.target.value)}>
                    <option value="">— Tous —</option>
                    {RESULTATS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="column is-1">
                <label className="label is-small mb-1" style={{ visibility: 'hidden' }}>_</label>
                {hasFilters && (
                  <button className="button is-light is-small is-fullwidth"
                    onClick={() => { setFilterNiveau(''); setFilterResultat(''); setFilterNom(''); }}>
                    <span className="icon"><i className="fas fa-times"></i></span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Tableau ── */}
          {loading ? (
            <div className="has-text-centered py-6">
              <span className="icon is-large has-text-info"><i className="fas fa-spinner fa-pulse fa-2x"></i></span>
              <p className="has-text-grey mt-3">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="box has-text-centered py-6">
              <span className="icon is-large has-text-grey-light"><i className="fas fa-clipboard-check fa-3x"></i></span>
              <p className="has-text-grey mt-3 mb-3">
                {hasFilters ? 'Aucune évaluation ne correspond aux filtres.' : 'Aucune évaluation enregistrée.'}
              </p>
              {!hasFilters && (
                <button className="button is-success" onClick={openAdd}>
                  <span className="icon"><i className="fas fa-plus"></i></span>
                  <span>Créer la première évaluation</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table is-fullwidth is-hoverable is-striped">
                  <thead>
                    <tr>
                      <th>Nageur</th>
                      <th>Groupe</th>
                      <th>Niveau évalué</th>
                      <th>Date</th>
                      <th>Critères</th>
                      <th>Moy.</th>
                      <th>Résultat</th>
                      <th style={{ width: 130 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(ev => {
                      const moy = moyenneNotes(ev.notes);
                      const critList = getCriteres(ev.niveau_evalue);
                      const nbNotes = critList.filter(c => ev.notes && ev.notes[c]).length;
                      return (
                        <tr key={ev.id}>
                          <td>
                            <strong>{ev.nageur_prenom} {ev.nageur_nom}</strong>
                            {ev.session && <span className="tag is-light is-small ml-2">{ev.session}</span>}
                          </td>
                          <td>{ev.groupe_nom || <span className="has-text-grey">—</span>}</td>
                          <td>
                            {ev.niveau_evalue
                              ? <span className="tag is-info is-light">{ev.niveau_evalue}</span>
                              : <span className="has-text-grey">—</span>}
                          </td>
                          <td>{ev.date_evaluation || <span className="has-text-grey">—</span>}</td>
                          <td>
                            <span className="has-text-grey is-size-7">
                              {nbNotes}/{critList.length} critères
                            </span>
                          </td>
                          <td>
                            {moy ? (() => {
                              const color = moy >= 3.5 ? 'is-success' : moy >= 2.5 ? 'is-info' : moy >= 1.5 ? 'is-warning' : 'is-danger';
                              return <span className={`tag ${color}`}>{moy} / 4</span>;
                            })() : <span className="has-text-grey">—</span>}
                          </td>
                          <td>{resultatTag(ev.resultat)}</td>
                          <td>
                            <div className="buttons are-small">
                              <button className="button is-info is-light" title="Voir" onClick={() => openView(ev)}>
                                <span className="icon"><i className="fas fa-eye"></i></span>
                              </button>
                              <button className="button is-warning is-light" title="Modifier" onClick={() => openEdit(ev)}>
                                <span className="icon"><i className="fas fa-pen"></i></span>
                              </button>
                              <button className="button is-danger is-light" title="Supprimer" onClick={() => setDeleteTarget(ev)}>
                                <span className="icon"><i className="fas fa-trash"></i></span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav className="pagination is-centered mt-4" role="navigation">
                  <button className="pagination-previous" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</button>
                  <button className="pagination-next" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant</button>
                  <ul className="pagination-list">
                    {page > 3 && (
                      <>
                        <li><button className="pagination-link" onClick={() => setPage(1)}>1</button></li>
                        <li><span className="pagination-ellipsis">&hellip;</span></li>
                      </>
                    )}
                    {pageRange().map(p => (
                      <li key={p}>
                        <button className={`pagination-link${p === page ? ' is-current' : ''}`} onClick={() => setPage(p)}>{p}</button>
                      </li>
                    ))}
                    {page < totalPages - 2 && (
                      <>
                        <li><span className="pagination-ellipsis">&hellip;</span></li>
                        <li><button className="pagination-link" onClick={() => setPage(totalPages)}>{totalPages}</button></li>
                      </>
                    )}
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {/* ◆◆◆ Modal Ajout / Édition ◆◆◆ */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeModal}></div>
          <div className="modal-card" style={{ maxWidth: 740, width: '95%' }}>
            <header className="modal-card-head">
              <p className="modal-card-title">
                <span className="icon mr-2"><i className={`fas ${modal === 'add' ? 'fa-plus' : 'fa-pen'}`}></i></span>
                {modal === 'add' ? 'Nouvelle évaluation' : "Modifier l'évaluation"}
              </p>
              <button className="delete" onClick={closeModal}></button>
            </header>
            <section className="modal-card-body">
              {formError && (
                <div className="notification is-danger is-light mb-4">
                  <span className="icon mr-1"><i className="fas fa-exclamation-circle"></i></span>
                  {formError}
                </div>
              )}

              <p className="has-text-weight-bold mb-3">
                <span className="icon mr-1 has-text-info"><i className="fas fa-info-circle"></i></span>
                Informations générales
              </p>
              <div className="columns">
                <div className="column is-6">
                  <div className="field">
                    <label className="label">Nageur <span className="has-text-danger">*</span></label>
                    <div className="select is-fullwidth">
                      <select name="nageur_id" value={form.nageur_id} onChange={handleNageurChange}>
                        <option value="">— Sélectionner —</option>
                        {niveauxAvecNageurs.map(niv => {
                          const membres = nageurs.filter(n => n.niveau === niv);
                          return (
                            <optgroup key={niv} label={`🏊 ${niv}`}>
                              {membres.map(n => (
                                <option key={n.id} value={n.id}>
                                  {n.prenom} {n.nom}{n.horaire ? ` — ${n.horaire}` : ''}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                        {nageursSansNiveau.length > 0 && (
                          <optgroup label="Sans niveau">
                            {nageursSansNiveau.map(n => (
                              <option key={n.id} value={n.id}>
                                {n.prenom} {n.nom}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column is-4">
                  <div className="field">
                    <label className="label">
                      Niveau évalué
                      {form.niveau_evalue && (
                        <span className="tag is-info is-light ml-2 is-small">{criteresActifs.length} critères</span>
                      )}
                    </label>
                    <div className="select is-fullwidth">
                      <select value={form.niveau_evalue} onChange={handleNiveauChange}>
                        <option value="">— Sélectionner —</option>
                        {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="column is-4">
                  <div className="field">
                    <label className="label">{"Date d'évaluation"}</label>
                    <input className="input" type="date" value={form.date_evaluation}
                      onChange={e => setForm(p => ({ ...p, date_evaluation: e.target.value }))} />
                  </div>
                </div>
                <div className="column is-4">
                  <div className="field">
                    <label className="label">Session</label>
                    <input className="input" type="text" placeholder="ex: Hiver 2026"
                      value={form.session} onChange={e => setForm(p => ({ ...p, session: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column is-6">
                  <div className="field">
                    <label className="label">Instructeur</label>
                    <div className="select is-fullwidth">
                      <select value={form.instructeur_id} onChange={e => setForm(p => ({ ...p, instructeur_id: e.target.value }))}>
                        <option value="">— Aucun —</option>
                        {instructeurs.map(i => <option key={i.id} value={i.id}>{i.prenom} {i.nom}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="column is-6">
                  <div className="field">
                    <label className="label">Résultat global</label>
                    <div className="select is-fullwidth">
                      <select value={form.resultat} onChange={e => setForm(p => ({ ...p, resultat: e.target.value }))}>
                        {RESULTATS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              {/* ── Critères selon le niveau ── */}
              {!form.niveau_evalue ? (
                <div className="notification is-warning is-light">
                  <span className="icon mr-2"><i className="fas fa-exclamation-triangle"></i></span>
                  {"Sélectionnez un niveau pour afficher les critères d'évaluation spécifiques."}
                </div>
              ) : (
                <>
                  <p className="has-text-weight-bold mb-1">
                    <span className="icon mr-1 has-text-success"><i className="fas fa-list-check"></i></span>
                    Critères — <span className="has-text-info">{form.niveau_evalue}</span>
                  </p>
                  <p className="is-size-7 has-text-grey mb-3">
                    1 = Non acquis &nbsp;·&nbsp; 2 = En apprentissage &nbsp;·&nbsp; 3 = Presque acquis &nbsp;·&nbsp; 4 = Acquis
                  </p>

                  {/* Barre de progression */}
                  {(() => {
                    const total = criteresActifs.length;
                    const remplis = criteresActifs.filter(c => form.notes[c]).length;
                    const pct = total ? Math.round((remplis / total) * 100) : 0;
                    return (
                      <div className="mb-4">
                        <div className="is-flex is-justify-content-space-between mb-1">
                          <span className="is-size-7 has-text-grey">{remplis}/{total} critères remplis</span>
                          <span className="is-size-7 has-text-grey">{pct}%</span>
                        </div>
                        <progress className="progress is-small is-info" value={remplis} max={total}>{pct}%</progress>
                      </div>
                    );
                  })()}

                  <div className="columns is-multiline">
                    {criteresActifs.map((critere, idx) => (
                      <div key={critere} className="column is-6">
                        <div className="box p-3" style={{ borderLeft: `3px solid ${form.notes[critere] ? ['','#f14668','#ffdd57','#3298dc','#48c774'][form.notes[critere]] : '#dbdbdb'}` }}>
                          <p className="is-size-7 has-text-weight-semibold mb-2">
                            <span className="has-text-grey mr-1">{idx + 1}.</span> {critere}
                          </p>
                          <div className="buttons has-addons">
                            {[1, 2, 3, 4].map(v => (
                              <button
                                key={v}
                                type="button"
                                className={`button is-small${form.notes[critere] === v ? ` ${NOTES_LABEL[v].color} is-selected` : ' is-light'}`}
                                onClick={() => setNote(critere, form.notes[critere] === v ? undefined : v)}
                              >
                                {v}
                              </button>
                            ))}
                            {form.notes[critere] && (
                              <span className={`tag ml-2 is-small ${NOTES_LABEL[form.notes[critere]]?.color}`}>
                                {NOTES_LABEL[form.notes[critere]]?.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <hr />

              <div className="field">
                <label className="label">
                  <span className="icon mr-1"><i className="fas fa-comment"></i></span>
                  Commentaires
                </label>
                <textarea className="textarea" rows="3"
                  placeholder="Observations, points à améliorer, progrès notés..."
                  value={form.commentaires}
                  onChange={e => setForm(p => ({ ...p, commentaires: e.target.value }))}
                />
              </div>
            </section>
            <footer className="modal-card-foot">
              <button className={`button is-success${saving ? ' is-loading' : ''}`} onClick={handleSave} disabled={saving}>
                <span className="icon"><i className="fas fa-save"></i></span>
                <span>{modal === 'add' ? 'Enregistrer' : 'Mettre à jour'}</span>
              </button>
              <button className="button" onClick={closeModal} disabled={saving}>Annuler</button>
            </footer>
          </div>
        </div>
      )}

      {/* ◆◆◆ Modal Détail ◆◆◆ */}
      {modal === 'view' && editTarget && (() => {
        const critList = getCriteres(editTarget.niveau_evalue);
        const moy = moyenneNotes(editTarget.notes);
        return (
          <div className="modal is-active">
            <div className="modal-background" onClick={closeModal}></div>
            <div className="modal-card" style={{ maxWidth: 700, width: '95%' }}>
              <header className="modal-card-head">
                <p className="modal-card-title">
                  <span className="icon mr-2"><i className="fas fa-clipboard-check"></i></span>
                  {editTarget.nageur_prenom} {editTarget.nageur_nom}
                  {editTarget.niveau_evalue && <span className="tag is-info is-light ml-2">{editTarget.niveau_evalue}</span>}
                </p>
                <button className="delete" onClick={closeModal}></button>
              </header>
              <section className="modal-card-body">
                <div className="columns is-multiline mb-4">
                  <div className="column is-3">
                    <p className="is-size-7 has-text-grey">Groupe</p>
                    <p><strong>{editTarget.groupe_nom || '—'}</strong></p>
                  </div>
                  <div className="column is-3">
                    <p className="is-size-7 has-text-grey">Date</p>
                    <p>{editTarget.date_evaluation || '—'}</p>
                  </div>
                  <div className="column is-3">
                    <p className="is-size-7 has-text-grey">Session</p>
                    <p>{editTarget.session || '—'}</p>
                  </div>
                  <div className="column is-3">
                    <p className="is-size-7 has-text-grey">Instructeur</p>
                    <p>{editTarget.instructeur_nom || '—'}</p>
                  </div>
                  <div className="column is-3">
                    <p className="is-size-7 has-text-grey">Résultat</p>
                    <p>{resultatTag(editTarget.resultat)}</p>
                  </div>
                  <div className="column is-3">
                    <p className="is-size-7 has-text-grey">Moyenne</p>
                    <p>{moy ? (() => {
                      const color = moy >= 3.5 ? 'is-success' : moy >= 2.5 ? 'is-info' : moy >= 1.5 ? 'is-warning' : 'is-danger';
                      return <span className={`tag ${color}`}>{moy} / 4</span>;
                    })() : '—'}</p>
                  </div>
                </div>

                <hr />

                <p className="has-text-weight-bold mb-3">
                  <span className="icon mr-1 has-text-success"><i className="fas fa-list-check"></i></span>
                  Critères — <span className="has-text-info">{editTarget.niveau_evalue || 'général'}</span>
                </p>

                {critList.length === 0 ? (
                  <p className="has-text-grey">Aucun critère pour ce niveau.</p>
                ) : (
                  <div className="columns is-multiline">
                    {critList.map((critere, idx) => {
                      const note = editTarget.notes?.[critere];
                      const info = note ? NOTES_LABEL[note] : null;
                      return (
                        <div key={critere} className="column is-6">
                          <div className="is-flex is-align-items-center is-justify-content-space-between"
                            style={{ borderLeft: `3px solid ${note ? ['','#f14668','#ffdd57','#3298dc','#48c774'][note] : '#dbdbdb'}`, paddingLeft: 8, gap: 8, minHeight: 32 }}>
                            <span className="is-size-7">
                              <span className="has-text-grey mr-1">{idx + 1}.</span>{critere}
                            </span>
                            {note
                              ? <span className={`tag is-small ${info.color}`}>{note} — {info.label}</span>
                              : <span className="tag is-light is-small">—</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {editTarget.commentaires && (
                  <>
                    <hr />
                    <p className="has-text-weight-bold mb-2">
                      <span className="icon mr-1"><i className="fas fa-comment"></i></span>
                      Commentaires
                    </p>
                    <p className="is-size-6" style={{ whiteSpace: 'pre-wrap' }}>{editTarget.commentaires}</p>
                  </>
                )}
              </section>
              <footer className="modal-card-foot">
                <button className="button is-warning" onClick={() => { closeModal(); setTimeout(() => openEdit(editTarget), 50); }}>
                  <span className="icon"><i className="fas fa-pen"></i></span>
                  <span>Modifier</span>
                </button>
                <button className="button" onClick={closeModal}>Fermer</button>
              </footer>
            </div>
          </div>
        );
      })()}

      {/* ◆◆◆ Modal Suppression ◆◆◆ */}
      {deleteTarget && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setDeleteTarget(null)}></div>
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <header className="modal-card-head">
              <p className="modal-card-title has-text-danger">
                <span className="icon mr-2"><i className="fas fa-trash"></i></span>
                {"Supprimer l'évaluation"}
              </p>
              <button className="delete" onClick={() => setDeleteTarget(null)}></button>
            </header>
            <section className="modal-card-body">
              <p>
                {"Supprimer l'évaluation de"} <strong>{deleteTarget.nageur_prenom} {deleteTarget.nageur_nom}</strong>
                {deleteTarget.date_evaluation ? ` du ${deleteTarget.date_evaluation}` : ''} ?
              </p>
              <p className="has-text-grey is-size-7 mt-2">Cette action est irréversible.</p>
            </section>
            <footer className="modal-card-foot">
              <button className={`button is-danger${deleting ? ' is-loading' : ''}`} onClick={handleDelete} disabled={deleting}>
                <span className="icon"><i className="fas fa-trash"></i></span>
                <span>Supprimer</span>
              </button>
              <button className="button" onClick={() => setDeleteTarget(null)} disabled={deleting}>Annuler</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
