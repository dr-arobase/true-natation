import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Inscription() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm)
      return setError('Les mots de passe ne correspondent pas.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du compte.");
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        navigate('/dashboard');
      }
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hero is-fullheight" style={{ background: 'linear-gradient(135deg, #1a6eb5 0%, #0d4a8a 100%)' }}>
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-4">
              <div className="box">
                <div className="has-text-centered mb-5">
                  <span className="icon is-large has-text-info">
                    <i className="fas fa-water fa-3x"></i>
                  </span>
                  <h1 className="title is-3 mt-3">Club Natation</h1>
                  <p className="subtitle is-6 has-text-grey">Créer un compte</p>
                </div>

                {error && (
                  <div className="notification is-danger is-light">
                    <button className="delete" onClick={() => setError('')}></button>
                    <i className="fas fa-exclamation-circle mr-2"></i>{error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label className="label">Nom d'utilisateur</label>
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="text"
                        name="username"
                        placeholder="moncompte"
                        value={form.username}
                        onChange={handleChange}
                        required
                      />
                      <span className="icon is-left"><i className="fas fa-user"></i></span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Mot de passe</label>
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="password"
                        name="password"
                        placeholder="Minimum 6 caractères"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                      <span className="icon is-left"><i className="fas fa-lock"></i></span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Confirmer le mot de passe</label>
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="password"
                        name="confirm"
                        placeholder="Répéter le mot de passe"
                        value={form.confirm}
                        onChange={handleChange}
                        required
                      />
                      <span className="icon is-left"><i className="fas fa-lock"></i></span>
                    </div>
                  </div>

                  <div className="field mt-5">
                    <button
                      className={`button is-info is-fullwidth is-medium ${loading ? 'is-loading' : ''}`}
                      type="submit"
                    >
                      <span className="icon"><i className="fas fa-user-plus"></i></span>
                      <span>Créer mon compte</span>
                    </button>
                  </div>
                </form>

                <p className="has-text-centered mt-4 has-text-grey">
                  Déjà un compte ?{' '}
                  <Link to="/" className="has-text-info has-text-weight-semibold">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
