import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inscription from './pages/Inscription';
import AjouterNageur from './pages/AjouterNageur';
import GestionNageurs from './pages/GestionNageurs';
import GestionSauveteurs from './pages/GestionSauveteurs';
import GestionEvaluations from './pages/GestionEvaluations';
import Profil from './pages/Profil';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/ajouter-nageur" element={<PrivateRoute><AjouterNageur /></PrivateRoute>} />
        <Route path="/gestion-nageurs" element={<PrivateRoute><GestionNageurs /></PrivateRoute>} />
        <Route path="/gestion-sauveteurs" element={<PrivateRoute><GestionSauveteurs /></PrivateRoute>} />
        <Route path="/gestion-evaluations" element={<PrivateRoute><GestionEvaluations /></PrivateRoute>} />
        <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
