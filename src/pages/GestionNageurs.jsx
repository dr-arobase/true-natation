import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const NIVEAUX = [
  'Cours privé',
  'Parent et enfant 1', 'Parent et enfant 2', 'Parent et enfant 3',
  'Préscolaire 1', 'Préscolaire 2', 'Préscolaire 3', 'Préscolaire 4', 'Préscolaire 5',
  'Nageur 1', 'Nageur 2', 'Nageur 3', 'Nageur 4', 'Nageur 5', 'Nageur 6',
  'Nageur Adolescent 1', 'Nageur Adolescent 2', 'Nageur Adolescent 3',
  'Nageur Adulte 1', 'Nageur Adulte 2', 'Nageur Adulte 3',
  'Forme Physique', 'Forme Physique 1',
  'Jeune Sauveteur Initié', 'Jeune Sauveteur averti', 'Jeune sauveteur Expert',
  'Étoile de bronze', 'Médaille de bronze',
];

const PER_PAGE = 10;

const EMPTY_FORM = { nom: '', prenom: '', niveau: '', horaire: '', session: '', commentaires: '', groupe_id: '' };

export default function GestionNageurs() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Utilisateur';
  const role = localStorage.getItem('role');

  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

  // ── Data ──────────────────────────────────────────────────────────────────
  const [nageurs, setNageurs] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // ── Filters & Pagination ─────────────────────────────────────────────────
  const [filterNom, setFilterNom] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterHoraire, setFilterHoraire] = useState('');
  const [page, setPage] = useState(1);

  const hasFilters = filterNom || filterNiveau || filterSession || filterHoraire;

  function clearFilters() {
    setFilterNom('');
    setFilterNiveau('');
    setFilterSession('');
    setFilterHoraire('');
  }

  // ── Modal Add/Edit ─────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Modal Delete ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  async function fetchNageurs() {
    setLoading(true);
    setFetchError('');
    try {
      const [resN, resG] = await Promise.all([
        fetch('/api/nageurs', { headers: authHeaders }),
        fetch('/api/groupes', { headers: authHeaders }),
      ]);
      if (resN.status === 401 || resN.status === 403) { navigate('/'); return; }
      const [dataN, dataG] = await Promise.all([resN.json(), resG.json()]);
      setNageurs(Array.isArray(dataN) ? dataN : []);
      setGroupes(Array.isArray(dataG) ? dataG : []);
    } catch {
      setFetchError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchNageurs();
  }, []);

  // Reset to page 1 when any filter changes
  useEffect(() => { setPage(1); }, [filterNom, filterNiveau, filterSession, filterHoraire]);

  // ── Filtered + paginated ─────────────────────────────────────────────────
  const filtered = nageurs.filter(n => {
    const nomMatch = !filterNom || (
      (n.nom || '').toLowerCase().includes(filterNom.toLowerCase()) ||
      (n.prenom || '').toLowerCase().includes(filterNom.toLowerCase())
    );
    const niveauMatch = !filterNiveau || (n.niveau || '') === filterNiveau;
    const sessionMatch = !filterSession || (n.session || '') === filterSession;
    const horaireMatch = !filterHoraire ||
      (n.horaire || '').toLowerCase().includes(filterHoraire.toLowerCase());
    return nomMatch && niveauMatch && sessionMatch && horaireMatch;
  });
  // Unique sessions from all nageurs, sorted
  const sessions = [...new Set(nageurs.map(n => n.session).filter(Boolean))].sort();

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal('add');
  }

  function openEdit(n) {
    setEditTarget(n);
    setForm({
      nom: n.nom || '',
      prenom: n.prenom || '',
      niveau: n.niveau || '',
      horaire: n.horaire || '',
      session: n.session || '',
      commentaires: n.commentaires || '',
      groupe_id: n.groupe_id || '',
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

  // ── Save (add or edit) ────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.nom.trim() && !form.prenom.trim()) {
      setFormError('Le nom ou le prénom est requis.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const url = modal === 'edit' ? `/api/nageurs/${editTarget.id}` : '/api/nageurs';
      const method = modal === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err.message || 'Erreur lors de la sauvegarde.');
        return;
      }
      await fetchNageurs();
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
      await fetch(`/api/nageurs/${deleteTarget.id}`, { method: 'DELETE', headers: authHeaders });
      setDeleteTarget(null);
      await fetchNageurs();
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  }

  // ── Navbar logout ─────────────────────────────────────────────────────────
  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  // ── Range helper for pagination ───────────────────────────────────────────
  function pageRange() {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  }

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
            <Link to="/gestion-nageurs" className="navbar-item is-active has-text-white has-background-info-dark">
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
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <section className="section">
        <div className="container">

          {/* Header row */}
          <div className="level mb-4">
            <div className="level-left">
              <div>
                <h1 className="title is-3">
                  <span className="icon mr-2"><i className="fas fa-users"></i></span>
                  Gestion des nageurs
                </h1>
                {!loading && (
                  <p className="subtitle is-6 has-text-grey">
                    {filtered.length} nageur{filtered.length !== 1 ? 's' : ''}
                    {hasFilters ? ` trouvé${filtered.length !== 1 ? 's' : ''}` : ' au total'}
                  </p>
                )}
              </div>
            </div>
            <div className="level-right">
              <button className="button is-success" onClick={openAdd}>
                <span className="icon"><i className="fas fa-user-plus"></i></span>
                <span>Ajouter un nageur</span>
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
                    <span className="icon is-small mr-1"><i className="fas fa-layer-group"></i></span>
                    Niveau
                  </label>
                  <div className="control">
                    <div className="select is-small is-fullwidth">
                      <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)}>
                        <option value="">— Tous les niveaux —</option>
                        {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
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
                  <label className="label is-small mb-1">
                    <span className="icon is-small mr-1"><i className="fas fa-clock"></i></span>
                    Horaire
                  </label>
                  <div className="control has-icons-right">
                    <input
                      className="input is-small"
                      type="text"
                      placeholder="ex: Samedi 9h"
                      value={filterHoraire}
                      onChange={e => setFilterHoraire(e.target.value)}
                    />
                    {filterHoraire && (
                      <span className="icon is-right" style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => setFilterHoraire('')}>
                        <i className="fas fa-times"></i>
                      </span>
                    )}
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
              <span className="icon is-large has-text-info"><i className="fas fa-spinner fa-spin fa-2x"></i></span>
              <p className="has-text-grey mt-3">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="has-text-centered py-6">
              <span className="icon is-large has-text-grey-light"><i className="fas fa-users fa-3x"></i></span>
              <p className="has-text-grey mt-3">
                {hasFilters ? 'Aucun nageur ne correspond aux filtres.' : 'Aucun nageur enregistré.'}
              </p>
              {hasFilters ? (
                <button className="button is-warning is-light mt-3" onClick={clearFilters}>Effacer les filtres</button>
              ) : (
                <button className="button is-info mt-3" onClick={openAdd}>Ajouter le premier nageur</button>
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
                      <th>Groupe</th>
                      <th>Niveau</th>
                      <th>Horaire</th>
                      <th>Session</th>
                      <th>Commentaires</th>
                      <th style={{ width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((n, idx) => (
                      <tr key={n.id}>
                        <td className="has-text-grey is-size-7">{(page - 1) * PER_PAGE + idx + 1}</td>
                        <td><strong>{n.nom || <span className="has-text-grey">—</span>}</strong></td>
                        <td>{n.prenom || <span className="has-text-grey">—</span>}</td>
                        <td>
                          {n.groupe_id
                            ? <span className="tag is-primary is-light">{groupes.find(g => g.id === n.groupe_id)?.nom || n.groupe_id}</span>
                            : <span className="has-text-grey">—</span>}
                        </td>
                        <td>
                          {n.niveau
                            ? <span className="tag is-info is-light">{n.niveau}</span>
                            : <span className="has-text-grey">—</span>}
                        </td>
                        <td>{n.horaire || <span className="has-text-grey">—</span>}</td>
                        <td>{n.session || <span className="has-text-grey">—</span>}</td>
                        <td>
                          <span className="is-size-7 has-text-grey" title={n.commentaires || ''}>
                            {n.commentaires
                              ? (n.commentaires.length > 30 ? n.commentaires.slice(0, 30) + '…' : n.commentaires)
                              : '—'}
                          </span>
                        </td>
                        <td>
                          <div className="buttons are-small">
                            <button
                              className="button is-warning is-light"
                              title="Modifier"
                              onClick={() => openEdit(n)}
                            >
                              <span className="icon"><i className="fas fa-edit"></i></span>
                            </button>
                            <button
                              className="button is-danger is-light"
                              title="Supprimer"
                              onClick={() => setDeleteTarget(n)}
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
                  : 'Ajouter un nageur'}
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
                      <input
                        className="input"
                        name="nom"
                        placeholder="Nom de famille"
                        value={form.nom}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label">Prénom</label>
                    <div className="control">
                      <input
                        className="input"
                        name="prenom"
                        placeholder="Prénom"
                        value={form.prenom}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label">Groupe</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select name="groupe_id" value={form.groupe_id} onChange={handleFormChange}>
                      <option value="">— Aucun groupe —</option>
                      {groupes.map(g => (
                        <option key={g.id} value={g.id}>{g.nom} ({g.niveau})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label">Niveau</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select name="niveau" value={form.niveau} onChange={handleFormChange}>
                      <option value="">— Sélectionner un niveau —</option>
                      {NIVEAUX.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label">Horaire</label>
                    <div className="control">
                      <input
                        className="input"
                        name="horaire"
                        placeholder="ex: Samedi 9h-10h"
                        value={form.horaire}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label">Session</label>
                    <div className="control">
                      <input
                        className="input"
                        name="session"
                        placeholder="ex: Hiver 2026"
                        value={form.session}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
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
                className={`button is-success${saving ? ' is-loading' : ''}`}
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
