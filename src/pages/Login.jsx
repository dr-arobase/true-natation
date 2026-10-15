import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur de connexion.');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        if (data.avatar) localStorage.setItem('avatar', data.avatar);
        else localStorage.removeItem('avatar');
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
                  <p className="subtitle is-6 has-text-grey">Connexion au panneau de gestion</p>
                </div>

                {error && (
                  <div className="notification is-danger is-light">
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
                        placeholder="admin"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                      />
                      <span className="icon is-left">
                        <i className="fas fa-user"></i>
                      </span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Mot de passe</label>
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <span className="icon is-left">
                        <i className="fas fa-lock"></i>
                      </span>
                    </div>
                  </div>

                  <div className="field mt-5">
                    <button
                      className={`button is-info is-fullwidth is-medium ${loading ? 'is-loading' : ''}`}
                      type="submit"
                    >
                      <span className="icon"><i className="fas fa-sign-in-alt"></i></span>
                      <span>Se connecter</span>
                    </button>
                  </div>
                </form>

                <p className="has-text-centered mt-4 has-text-grey">
                  Pas encore inscrit ?{' '}
                  <a href="/inscription" className="has-text-info has-text-weight-semibold">
                    S'inscrire maintenant
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
