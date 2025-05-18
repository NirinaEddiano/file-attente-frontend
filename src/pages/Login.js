import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fourPeopleWithClock from '../assets/images/four_people_with_clock.png';
import './styles.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tokenResponse = await axios.post('http://localhost:8000/api/token/', {
        username,
        password
      });
      localStorage.setItem('access_token', tokenResponse.data.access);
      localStorage.setItem('refresh_token', tokenResponse.data.refresh);

      const userResponse = await axios.get('http://localhost:8000/api/users/user/', {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access}`
        }
      });

      toast.success('Connexion réussie !');
      const role = userResponse.data.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'guichetier') navigate('/appel-ticket');
      else navigate('/home');
    } catch (err) {
      const errorMessage = err.response?.status === 401
        ? 'Identifiants incorrects'
        : err.response?.data?.detail || 'Erreur de connexion';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-bg relative">

      <Link to="/" className="back-button" aria-label="Retour à la page d'accueil">Retour</Link>
      <div className="card w-full max-w-md animate-slide-in relative z-10">
        <h2 className="text-3xl font-bold text-primary-blue mb-6 text-center flex items-center">
          <i className="fas fa-sign-in-alt mr-2 text-accent-gold animate-pulse"></i> Connexion
        </h2>
        {error && (
          <p className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-primary-blue mb-2 font-medium">Nom d’utilisateur</label>
            <input
              type="text"
              placeholder="Entrez votre nom d’utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-turquoise"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-primary-blue mb-2 font-medium">Mot de passe</label>
            <input
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-turquoise"
              required
            />
          </div>
          <button type="submit" className="cta-button w-full" aria-label="Se connecter">
            <FontAwesomeIcon icon="fa-solid fa-sign-in-alt" className="mr-2" /> Se connecter
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Pas de compte ?{' '}
          <Link to="/signup" className="text-accent-turquoise hover:underline">
            S’inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;