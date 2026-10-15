import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const CERTIFICATIONS = [
  'Lauréat du bronze',
  'Croix de bronze',
  'NL Piscine',
  'NL Plage',
  'NL Lac',
  'Premiers Soins Standard',
  'RCR niveau C',
  'Moniteur de natation',
  'Assistant moniteur de natation',
  'Instructeur de natation niveau 1',
  'Instructeur de natation niveau 2',
  'Travail sécuritaire en eau vive (TSEV)',
];

const STATUTS = [
  { value: 'actif', label: 'Actif', color: 'success' },
  { value: 'inactif', label: 'Inactif', color: 'danger' },
  { value: 'en_formation', label: 'En formation', color: 'warning' },
];

const PER_PAGE = 10;

const EMPTY_FORM = {
  nom: '', prenom: '', certification: '', statut: 'actif',
  horaire: '', session: '', date_expiration: '', commentaires: ''
};

export default function GestionSauveteurs() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Utilisateur';
  const role = localStorage.getItem('role');

  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

  // ── Data ──────────────────────────────────────────────────────────────────
  const [sauveteurs, setSauveteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // ── Filters & Pagination ─────────────────────────────────────────────────
  const [filterNom, setFilterNom] = useState('');
  const [filterCert, setFilterCert] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [page, setPage] = useState(1);

  const hasFilters = filterNom || filterCert || filterStatut || filterSession;

  function clearFilters() {
    setFilterNom('');
    setFilterCert('');
    setFilterStatut('');
    setFilterSession('');
  }

  // ── Modal Add/Edit ─────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Modal Delete ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  async function fetchSauveteurs() {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('/api/sauveteurs', { headers: authHeaders });
      if (res.status === 401 || res.status === 403) { navigate('/'); return; }
      const data = await res.json();
      setSauveteurs(Array.isArray(data) ? data : []);
    } catch {
      setFetchError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchSauveteurs();
  }, []);

  useEffect(() => { setPage(1); }, [filterNom, filterCert, filterStatut, filterSession]);

  // ── Filtered + paginated ─────────────────────────────────────────────────
  const filtered = sauveteurs.filter(s => {
    const nomMatch = !filterNom || (
      (s.nom || '').toLowerCase().includes(filterNom.toLowerCase()) ||
      (s.prenom || '').toLowerCase().includes(filterNom.toLowerCase())
    );
    const certMatch = !filterCert || (s.certification || '') === filterCert;
    const statutMatch = !filterStatut || (s.statut || '') === filterStatut;
    const sessionMatch = !filterSession || (s.session || '') === filterSession;
    return nomMatch && certMatch && statutMatch && sessionMatch;
  });

  const sessions = [...new Set(sauveteurs.map(s => s.session).filter(Boolean))].sort();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal('add');
  }

  function openEdit(s) {
    setEditTarget(s);
    setForm({
      nom: s.nom || '',
      prenom: s.prenom || '',
      certification: s.certification || '',
      statut: s.statut || 'actif',
      horaire: s.horaire || '',
      session: s.session || '',
      date_expiration: s.date_expiration || '',
      commentaires: s.commentaires || '',
    });
    setFormError('');
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditTarget(null);
    setFormError('');
  }

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.nom.trim() && !form.prenom.trim()) {
      setFormError('Le nom ou le prénom est requis.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const url = modal === 'edit' ? `/api/sauveteurs/${editTarget.id}` : '/api/sauveteurs';
      const method = modal === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err.message || err.error || 'Erreur lors de la sauvegarde.');
        return;
      }
      await fetchSauveteurs();
      closeModal();
    } catch {
      setFormError('Erreur de connexion.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/sauveteurs/${deleteTarget.id}`, { method: 'DELETE', headers: authHeaders });
      setDeleteTarget(null);
      await fetchSauveteurs();
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  function pageRange() {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  }

  function statutTag(statut) {
    const s = STATUTS.find(x => x.value === statut);
    return s ? (
      <span className={`tag is-${s.color} is-light`}>{s.label}</span>
    ) : <span className="has-text-grey">—</span>;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar is-danger" role="navigation">
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
            <Link to="/gestion-sauveteurs" className="navbar-item is-active has-text-white has-background-danger-dark">
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
              <button className="button is-warning is-light is-small" onClick={handleLogout}>
                <span className="icon"><i className="fas fa-sign-out-alt"></i></span>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <section className="section">
        <div className="container">

          {/* Header */}
          <div className="level mb-4">
            <div className="level-left">
              <div>
                <h1 className="title is-3">
                  <span className="icon mr-2 has-text-danger"><i className="fas fa-life-ring"></i></span>
                  Gestion des sauveteurs
                </h1>
                {!loading && (
                  <p className="subtitle is-6 has-text-grey">
                    {filtered.length} sauveteur{filtered.length !== 1 ? 's' : ''}
                    {hasFilters ? ` trouvé${filtered.length !== 1 ? 's' : ''}` : ' au total'}
                  </p>
                )}
              </div>
            </div>
            <div className="level-right">
              <button className="button is-danger" onClick={openAdd}>
                <span className="icon"><i className="fas fa-user-plus"></i></span>
                <span>Ajouter un sauveteur</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="box mb-4 py-4">
            <div className="columns is-multiline is-vcentered">
              <div className="column is-3">
                <div className="field mb-0">
                  <label className="label is-small mb-1">
                    <span className="icon is-small mr-1"><i className="fas fa-user"></i></span>
                    Nom / Prénom
                  </label>
                  <div className="control has-icons-right">
                    <input
                      className="input is-small"
                      type="text"
                      placeholder="Rechercher..."
                      value={filterNom}
                      onChange={e => setFilterNom(e.target.value)}
                    />
                    {filterNom && (
                      <span className="icon is-right" style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => setFilterNom('')}>
                        <i className="fas fa-times"></i>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="column is-3">
                <div className="field mb-0">
                  <label className="label is-small mb-1">
                    <span className="icon is-small mr-1"><i className="fas fa-certificate"></i></span>
                    Certification
                  </label>
                  <div className="control">
                    <div className="select is-small is-fullwidth">
                      <select value={filterCert} onChange={e => setFilterCert(e.target.value)}>
                        <option value="">— Toutes les certifications —</option>
                        {CERTIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="column is-2">
                <div className="field mb-0">
                  <label className="label is-small mb-1">
                    <span className="icon is-small mr-1"><i className="fas fa-circle"></i></span>
                    Statut
                  </label>
                  <div className="control">
                    <div className="select is-small is-fullwidth">
                      <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
                        <option value="">— Tous les statuts —</option>
                        {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="column is-2">
                <div className="field mb-0">
                  <label className="label is-small mb-1">
                    <span className="icon is-small mr-1"><i className="fas fa-calendar-alt"></i></span>
                    Session
                  </label>
                  <div className="control">
                    <div className="select is-small is-fullwidth">
                      <select value={filterSession} onChange={e => setFilterSession(e.target.value)}>
                        <option value="">— Toutes les sessions —</option>
                        {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="column is-2">
                <div className="field mb-0">
                  <label className="label is-small mb-1" style={{ visibility: 'hidden' }}>_</label>
                  <div className="control">
                    <button
                      className={`button is-small is-fullwidth${hasFilters ? ' is-warning' : ' is-light'}`}
                      onClick={clearFilters}
                      disabled={!hasFilters}
                    >
                      <span className="icon"><i className="fas fa-filter-circle-xmark"></i></span>
                      <span>Réinitialiser</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {fetchError && (
            <div className="notification is-danger is-light">
              <span className="icon"><i className="fas fa-exclamation-triangle"></i></span>
              {fetchError}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="has-text-centered py-6">
              <span className="icon is-large has-text-danger"><i className="fas fa-spinner fa-spin fa-2x"></i></span>
              <p className="has-text-grey mt-3">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="has-text-centered py-6">
              <span className="icon is-large has-text-grey-light"><i className="fas fa-life-ring fa-3x"></i></span>
              <p className="has-text-grey mt-3">
                {hasFilters ? 'Aucun sauveteur ne correspond aux filtres.' : 'Aucun sauveteur enregistré.'}
              </p>
              {hasFilters ? (
                <button className="button is-warning is-light mt-3" onClick={clearFilters}>Effacer les filtres</button>
              ) : (
                <button className="button is-danger mt-3" onClick={openAdd}>Ajouter le premier sauveteur</button>
              )}
            </div>
          ) : (
            <>
              <div className="table-container box p-0">
                <table className="table is-fullwidth is-striped is-hoverable mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '3%' }}>#</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Certification</th>
                      <th>Statut</th>
                      <th>Horaire</th>
                      <th>Session</th>
                      <th>Exp. certification</th>
                      <th>Commentaires</th>
                      <th style={{ width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((s, idx) => (
                      <tr key={s.id}>
                        <td className="has-text-grey is-size-7">{(page - 1) * PER_PAGE + idx + 1}</td>
                        <td><strong>{s.nom || <span className="has-text-grey">—</span>}</strong></td>
                        <td>{s.prenom || <span className="has-text-grey">—</span>}</td>
                        <td>
                          {s.certification
                            ? <span className="tag is-danger is-light">{s.certification}</span>
                            : <span className="has-text-grey">—</span>}
                        </td>
                        <td>{statutTag(s.statut)}</td>
                        <td>{s.horaire || <span className="has-text-grey">—</span>}</td>
                        <td>{s.session || <span className="has-text-grey">—</span>}</td>
                        <td>
                          {s.date_expiration
                            ? <span className={`is-size-7${new Date(s.date_expiration) < new Date() ? ' has-text-danger has-text-weight-bold' : ' has-text-grey'}`}>
                                {s.date_expiration}
                              </span>
                            : <span className="has-text-grey">—</span>}
                        </td>
                        <td>
                          <span className="is-size-7 has-text-grey" title={s.commentaires || ''}>
                            {s.commentaires
                              ? (s.commentaires.length > 25 ? s.commentaires.slice(0, 25) + '…' : s.commentaires)
                              : '—'}
                          </span>
                        </td>
                        <td>
                          <div className="buttons are-small">
                            <button
                              className="button is-warning is-light"
                              title="Modifier"
                              onClick={() => openEdit(s)}
                            >
                              <span className="icon"><i className="fas fa-edit"></i></span>
                            </button>
                            <button
                              className="button is-danger is-light"
                              title="Supprimer"
                              onClick={() => setDeleteTarget(s)}
                            >
                              <span className="icon"><i className="fas fa-trash"></i></span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="pagination is-centered mt-4" role="navigation">
                  <button
                    className="pagination-previous"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Précédent
                  </button>
                  <button
                    className="pagination-next"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Suivant
                  </button>
                  <ul className="pagination-list">
                    {page > 3 && (
                      <>
                        <li><button className="pagination-link" onClick={() => setPage(1)}>1</button></li>
                        <li><span className="pagination-ellipsis">&hellip;</span></li>
                      </>
                    )}
                    {pageRange().map(p => (
                      <li key={p}>
                        <button
                          className={`pagination-link${p === page ? ' is-current' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
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

      {/* ── Modal Ajouter / Modifier ── */}
      {modal && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeModal}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">
                <span className="icon mr-2">
                  <i className={modal === 'edit' ? 'fas fa-edit' : 'fas fa-user-plus'}></i>
                </span>
                {modal === 'edit'
                  ? `Modifier — ${editTarget.prenom} ${editTarget.nom}`
                  : 'Ajouter un sauveteur'}
              </p>
              <button className="delete" onClick={closeModal}></button>
            </header>
            <section className="modal-card-body">
              {formError && (
                <div className="notification is-danger is-light py-2 px-3 mb-4">
                  <span className="icon"><i className="fas fa-exclamation-triangle"></i></span>
                  {formError}
                </div>
              )}
              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label">Nom</label>
                    <div className="control">
                      <input className="input" name="nom" placeholder="Nom de famille" value={form.nom} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label">Prénom</label>
                    <div className="control">
                      <input className="input" name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label">Certification</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select name="certification" value={form.certification} onChange={handleFormChange}>
                          <option value="">— Sélectionner une certification —</option>
                          {CERTIFICATIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label">Statut</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select name="statut" value={form.statut} onChange={handleFormChange}>
                          {STATUTS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label">Horaire</label>
                    <div className="control">
                      <input className="input" name="horaire" placeholder="ex: Samedi 9h-10h" value={form.horaire} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label">Session</label>
                    <div className="control">
                      <input className="input" name="session" placeholder="ex: Hiver 2026" value={form.session} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label">
                  <span className="icon is-small mr-1"><i className="fas fa-calendar-times"></i></span>
                  Date d'expiration de la certification
                </label>
                <div className="control">
                  <input className="input" type="date" name="date_expiration" value={form.date_expiration} onChange={handleFormChange} />
                </div>
              </div>

              <div className="field">
                <label className="label">Commentaires</label>
                <div className="control">
                  <textarea
                    className="textarea"
                    name="commentaires"
                    placeholder="Notes ou informations supplémentaires..."
                    rows="3"
                    value={form.commentaires}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button
                className={`button is-danger${saving ? ' is-loading' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                <span className="icon"><i className="fas fa-save"></i></span>
                <span>{modal === 'edit' ? 'Enregistrer' : 'Ajouter'}</span>
              </button>
              <button className="button" onClick={closeModal} disabled={saving}>Annuler</button>
            </footer>
          </div>
        </div>
      )}

      {/* ── Modal Confirmation Suppression ── */}
      {deleteTarget && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => !deleting && setDeleteTarget(null)}></div>
          <div className="modal-card" style={{ maxWidth: 420 }}>
            <header className="modal-card-head has-background-danger-light">
              <p className="modal-card-title has-text-danger">
                <span className="icon mr-2"><i className="fas fa-exclamation-triangle"></i></span>
                Confirmer la suppression
              </p>
              <button className="delete" onClick={() => setDeleteTarget(null)} disabled={deleting}></button>
            </header>
            <section className="modal-card-body has-text-centered py-5">
              <span className="icon is-large has-text-danger mb-3">
                <i className="fas fa-user-times fa-3x"></i>
              </span>
              <p className="is-size-5 mt-3">
                Supprimer <strong>{deleteTarget.prenom} {deleteTarget.nom}</strong> ?
              </p>
              <p className="has-text-grey is-size-7 mt-2">Cette action est irréversible.</p>
            </section>
            <footer className="modal-card-foot is-justify-content-center">
              <button
                className={`button is-danger${deleting ? ' is-loading' : ''}`}
                onClick={handleDelete}
                disabled={deleting}
              >
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
