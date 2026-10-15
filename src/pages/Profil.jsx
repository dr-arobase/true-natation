import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const MAX_SIZE = 1_100_000; // ~800 Ko base64

export default function Profil() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Utilisateur';
  const role = localStorage.getItem('role');

  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

  // ── Avatar ────────────────────────────────────────────────────────────────
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // ── Password ──────────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  // ── Avatar handlers ───────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarError('');
    setAvatarSuccess('');

    if (!file.type.startsWith('image/')) {
      setAvatarError('Veuillez sélectionner une image (JPG, PNG, GIF, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      if (b64.length > MAX_SIZE) {
        setAvatarError('Image trop grande. Choisissez une image de moins de 800 Ko.');
        return;
      }
      setAvatarPreview(b64);
      setAvatarFile(b64);
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveAvatar() {
    if (!avatarFile) return;
    setSavingAvatar(true);
    setAvatarError('');
    setAvatarSuccess('');
    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ avatar: avatarFile }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAvatarError(data.error || 'Erreur lors de la sauvegarde.');
        return;
      }
      setAvatar(data.avatar);
      localStorage.setItem('avatar', data.avatar);
      setAvatarPreview(null);
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setAvatarSuccess('Photo de profil mise à jour !');
    } catch {
      setAvatarError('Erreur de connexion.');
    } finally {
      setSavingAvatar(false);
    }
  }

  function handleRemoveAvatar() {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Password handlers ─────────────────────────────────────────────────────
  function handlePwChange(e) {
    setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSavePassword(e) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError('Tous les champs sont requis.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Le nouveau mot de passe doit avoir au moins 6 caractères.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (pwForm.newPassword === pwForm.currentPassword) {
      setPwError('Le nouveau mot de passe doit être différent de l\'actuel.');
      return;
    }

    setSavingPw(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || 'Erreur lors du changement.');
        return;
      }
      setPwSuccess('Mot de passe changé avec succès !');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setPwError('Erreur de connexion.');
    } finally {
      setSavingPw(false);
    }
  }

  const displayAvatar = avatarPreview || avatar;

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
          </div>
          <div className="navbar-end">
            <div className="navbar-item">
              <span className="icon mr-1"><i className="fas fa-user"></i></span>
              <strong>{username}</strong>
              <span className="tag is-light ml-2">{role}</span>
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

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <h1 className="title is-3 mb-5">
            <span className="icon mr-2 has-text-info"><i className="fas fa-user-cog"></i></span>
            Mon profil
          </h1>

          {/* ── Carte profil ── */}
          <div className="box mb-5">
            <div className="is-flex is-align-items-center mb-4">
              {displayAvatar ? (
                <figure className="image is-96x96 mr-4" style={{ borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={displayAvatar} alt="Avatar" style={{ width: 96, height: 96, objectFit: 'cover' }} />
                </figure>
              ) : (
                <div
                  className="is-flex is-align-items-center is-justify-content-center mr-4 has-background-info-light has-text-info"
                  style={{ width: 96, height: 96, borderRadius: '50%', fontSize: 40, flexShrink: 0 }}
                >
                  <i className="fas fa-user"></i>
                </div>
              )}
              <div>
                <p className="title is-4 mb-1">{username}</p>
                <span className={`tag is-medium is-${role === 'admin' ? 'info' : 'success'} is-light`}>
                  <span className="icon mr-1"><i className={`fas ${role === 'admin' ? 'fa-shield-alt' : 'fa-id-badge'}`}></i></span>
                  {role}
                </span>
                {avatarPreview && (
                  <p className="is-size-7 has-text-warning mt-2">
                    <span className="icon is-small"><i className="fas fa-circle-info"></i></span>
                    Aperçu — non encore sauvegardé
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Photo de profil ── */}
          <div className="box mb-5">
            <h2 className="title is-5 mb-4">
              <span className="icon mr-2 has-text-info"><i className="fas fa-camera"></i></span>
              Photo de profil
            </h2>

            {avatarError && (
              <div className="notification is-danger is-light py-2 px-3 mb-4">
                <span className="icon"><i className="fas fa-exclamation-triangle"></i></span>
                {avatarError}
              </div>
            )}
            {avatarSuccess && (
              <div className="notification is-success is-light py-2 px-3 mb-4">
                <span className="icon"><i className="fas fa-check-circle"></i></span>
                {avatarSuccess}
              </div>
            )}

            <div className="field">
              <label className="label">Choisir une image</label>
              <div className="control">
                <input
                  ref={fileInputRef}
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ paddingTop: '0.4rem' }}
                />
              </div>
              <p className="help">Formats acceptés : JPG, PNG, GIF, WebP — Max 800 Ko</p>
            </div>

            <div className="buttons mt-3">
              <button
                className={`button is-info${savingAvatar ? ' is-loading' : ''}`}
                onClick={handleSaveAvatar}
                disabled={!avatarFile || savingAvatar}
              >
                <span className="icon"><i className="fas fa-save"></i></span>
                <span>Enregistrer la photo</span>
              </button>
              {avatarPreview && (
                <button className="button is-light" onClick={handleRemoveAvatar} disabled={savingAvatar}>
                  <span className="icon"><i className="fas fa-times"></i></span>
                  <span>Annuler</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Changer le mot de passe ── */}
          <div className="box">
            <h2 className="title is-5 mb-4">
              <span className="icon mr-2 has-text-warning"><i className="fas fa-lock"></i></span>
              Changer le mot de passe
            </h2>

            {pwError && (
              <div className="notification is-danger is-light py-2 px-3 mb-4">
                <span className="icon"><i className="fas fa-exclamation-triangle"></i></span>
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="notification is-success is-light py-2 px-3 mb-4">
                <span className="icon"><i className="fas fa-check-circle"></i></span>
                {pwSuccess}
              </div>
            )}

            <form onSubmit={handleSavePassword}>
              <div className="field">
                <label className="label">Mot de passe actuel</label>
                <div className="control has-icons-left has-icons-right">
                  <input
                    className="input"
                    type={showCurrent ? 'text' : 'password'}
                    name="currentPassword"
                    placeholder="Entrez votre mot de passe actuel"
                    value={pwForm.currentPassword}
                    onChange={handlePwChange}
                    autoComplete="current-password"
                  />
                  <span className="icon is-left"><i className="fas fa-lock"></i></span>
                  <span
                    className="icon is-right"
                    style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    onClick={() => setShowCurrent(v => !v)}
                  >
                    <i className={`fas ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
              </div>

              <div className="field">
                <label className="label">Nouveau mot de passe</label>
                <div className="control has-icons-left has-icons-right">
                  <input
                    className="input"
                    type={showNew ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="Au moins 6 caractères"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    autoComplete="new-password"
                  />
                  <span className="icon is-left"><i className="fas fa-key"></i></span>
                  <span
                    className="icon is-right"
                    style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    onClick={() => setShowNew(v => !v)}
                  >
                    <i className={`fas ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
                {pwForm.newPassword.length > 0 && pwForm.newPassword.length < 6 && (
                  <p className="help is-danger">Minimum 6 caractères</p>
                )}
              </div>

              <div className="field">
                <label className="label">Confirmer le nouveau mot de passe</label>
                <div className="control has-icons-left">
                  <input
                    className="input"
                    type="password"
                    name="confirmPassword"
                    placeholder="Répétez le nouveau mot de passe"
                    value={pwForm.confirmPassword}
                    onChange={handlePwChange}
                    autoComplete="new-password"
                  />
                  <span className="icon is-left"><i className="fas fa-check-double"></i></span>
                </div>
                {pwForm.confirmPassword.length > 0 && pwForm.newPassword !== pwForm.confirmPassword && (
                  <p className="help is-danger">Les mots de passe ne correspondent pas</p>
                )}
                {pwForm.confirmPassword.length > 0 && pwForm.newPassword === pwForm.confirmPassword && pwForm.newPassword.length >= 6 && (
                  <p className="help is-success">Les mots de passe correspondent ✓</p>
                )}
              </div>

              <div className="field mt-4">
                <button
                  type="submit"
                  className={`button is-warning${savingPw ? ' is-loading' : ''}`}
                  disabled={savingPw}
                >
                  <span className="icon"><i className="fas fa-save"></i></span>
                  <span>Changer le mot de passe</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}
