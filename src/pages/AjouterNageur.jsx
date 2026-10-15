import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  }).filter(r => r['nom complet'] || r.nom || r.prenom);
}

export default function AjouterNageur() {
  const token = localStorage.getItem('token') || '';
  const { dark, toggle } = useTheme();

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    niveau: '',
    horaire: '',
    session: '',
    commentaires: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Import fichier
  const fileRef = useRef();
  const [importData, setImportData] = useState(null); // tableau preview
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  function handleFileChange(e) {
    setImportData(null);
    setImportResult(null);
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let data;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(ev.target.result);
          data = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          data = parseCSV(ev.target.result);
        }
        if (data.length === 0) {
          setError('Aucun nageur trouvé dans le fichier.');
        } else {
          setImportData(data);
        }
      } catch {
        setError('Fichier invalide — vérifiez le format CSV ou JSON.');
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!importData) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/nageurs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nageurs: importData }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur import."); }
      else {
        setImportResult(data);
        setImportData(null);
        if (fileRef.current) fileRef.current.value = '';
      }
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setImportLoading(false);
    }
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/nageurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'ajout.");
      } else {
        setSuccess(`Nageur ${form.prenom} ${form.nom} ajouté avec succès !`);
        setForm({ nom: '', prenom: '', niveau: '', horaire: '', session: '', commentaires: '' });
      }
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  }

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
          <div className="navbar-end">
            <div className="navbar-item">
              <button className="button is-light is-small mr-2" onClick={toggle} title={dark ? 'Mode clair' : 'Mode sombre'}>
                <span className="icon"><i className={`fas ${dark ? 'fa-sun' : 'fa-moon'}`}></i></span>
              </button>
              {token ? (
                <Link to="/dashboard" className="button is-light is-small mr-2">
                  <span className="icon"><i className="fas fa-arrow-left"></i></span>
                  <span>Retour au tableau de bord</span>
                </Link>
              ) : (
                <Link to="/" className="button is-light is-small mr-2">
                  <span className="icon"><i className="fas fa-sign-in-alt"></i></span>
                  <span>Déjà un compte ? Se connecter</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6">
              <h1 className="title is-3">
                <span className="icon mr-2"><i className="fas fa-swimmer"></i></span>
                Ajouter un nageur
              </h1>

              {error && (
                <div className="notification is-danger is-light">
                  <button className="delete" onClick={() => setError('')}></button>
                  <i className="fas fa-exclamation-circle mr-2"></i>{error}
                </div>
              )}
              {success && (
                <div className="notification is-success is-light">
                  <button className="delete" onClick={() => setSuccess('')}></button>
                  <i className="fas fa-check-circle mr-2"></i>{success}
                </div>
              )}

              {/* Section import fichier */}
              <div className="box">
                <h2 className="title is-5">
                  <span className="icon mr-2"><i className="fas fa-file-import"></i></span>
                  Importer depuis un fichier
                </h2>
                <p className="is-size-7 has-text-grey mb-3">
                  Formats acceptés : <strong>.csv</strong> ou <strong>.json</strong><br />
                  Colonnes CSV attendues : <code>nom complet, niveau, horaire, session, commentaires</code>
                </p>

                {importResult && (
                  <div className="notification is-success is-light">
                    <button className="delete" onClick={() => setImportResult(null)}></button>
                    <i className="fas fa-check-circle mr-2"></i>
                    <strong>{importResult.ajoutes} nageur(s) importé(s)</strong>
                    {importResult.erreurs.length > 0 && (
                      <ul className="mt-2">
                        {importResult.erreurs.map((e, i) => <li key={i} className="has-text-danger is-size-7">{e}</li>)}
                      </ul>
                    )}
                  </div>
                )}

                <div className="field">
                  <div className="file has-name is-fullwidth">
                    <label className="file-label">
                      <input
                        className="file-input"
                        type="file"
                        accept=".csv,.json"
                        ref={fileRef}
                        onChange={handleFileChange}
                      />
                      <span className="file-cta">
                        <span className="file-icon"><i className="fas fa-upload"></i></span>
                        <span className="file-label">Choisir un fichier</span>
                      </span>
                      <span className="file-name">
                        {fileRef.current?.files[0]?.name || 'Aucun fichier sélectionné'}
                      </span>
                    </label>
                  </div>
                </div>

                {importData && (
                  <>
                    <p className="is-size-7 has-text-grey mb-2"><strong>{importData.length}</strong> nageur(s) détectés — aperçu :</p>
                    <div style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto' }}>
                      <table className="table is-size-7 is-fullwidth is-bordered">
                        <thead>
                          <tr><th>Nom complet</th><th>Niveau</th><th>Horaire</th><th>Session</th></tr>
                        </thead>
                        <tbody>
                          {importData.slice(0, 10).map((n, i) => {
                            const nomComplet = n['nom complet'] || `${n.prenom || ''} ${n.nom || ''}`.trim();
                            return (
                              <tr key={i}>
                                <td>{nomComplet}</td>
                                <td>{n.niveau || '—'}</td>
                                <td>{n.horaire || '—'}</td>
                                <td>{n.session || '—'}</td>
                              </tr>
                            );
                          })}
                          {importData.length > 10 && <tr><td colSpan={4} className="has-text-grey has-text-centered">+{importData.length - 10} autres...</td></tr>}
                        </tbody>
                      </table>
                    </div>
                    <button
                      className={`button is-success mt-3 ${importLoading ? 'is-loading' : ''}`}
                      onClick={handleImport}
                    >
                      <span className="icon"><i className="fas fa-file-import"></i></span>
                      <span>Importer {importData.length} nageur(s)</span>
                    </button>
                  </>
                )}
              </div>

              <div className="box">
                <h2 className="title is-5">
                  <span className="icon mr-2"><i className="fas fa-user-plus"></i></span>
                  Ajouter manuellement
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="columns">
                    <div className="column">
                      <div className="field">
                        <label className="label">Nom <span className="has-text-danger">*</span></label>
                        <div className="control has-icons-left">
                          <input className="input" type="text" name="nom" placeholder="Tremblay"
                            value={form.nom} onChange={handleChange} required />
                          <span className="icon is-left"><i className="fas fa-user"></i></span>
                        </div>
                      </div>
                    </div>
                    <div className="column">
                      <div className="field">
                        <label className="label">Prénom <span className="has-text-danger">*</span></label>
                        <div className="control has-icons-left">
                          <input className="input" type="text" name="prenom" placeholder="Marie"
                            value={form.prenom} onChange={handleChange} required />
                          <span className="icon is-left"><i className="fas fa-user"></i></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Niveau</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select name="niveau" value={form.niveau} onChange={handleChange}>
                          <option value="">-- Choisir un niveau --</option>
                          {NIVEAUX.map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Horaire</label>
                    <div className="control has-icons-left">
                      <input className="input" type="text" name="horaire"
                        placeholder="ex: Dimanche 13h00 à 14h00"
                        value={form.horaire} onChange={handleChange} />
                      <span className="icon is-left"><i className="fas fa-clock"></i></span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Session</label>
                    <div className="control has-icons-left">
                      <input className="input" type="text" name="session"
                        placeholder="ex: Session Hiver 2026"
                        value={form.session} onChange={handleChange} />
                      <span className="icon is-left"><i className="fas fa-calendar-alt"></i></span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Commentaires</label>
                    <div className="control">
                      <textarea className="textarea" name="commentaires" rows="2"
                        placeholder="Notes optionnelles..."
                        value={form.commentaires} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="field mt-5">
                    <div className="buttons">
                      <button
                        className={`button is-info is-medium ${loading ? 'is-loading' : ''}`}
                        type="submit"
                      >
                        <span className="icon"><i className="fas fa-save"></i></span>
                        <span>Inscrire le nageur</span>
                      </button>
                      <Link to="/dashboard" className="button is-medium is-light">
                        Annuler
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
