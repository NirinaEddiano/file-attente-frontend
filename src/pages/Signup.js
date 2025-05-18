import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fourPeopleWithClock from '../assets/images/four_people_with_clock.png';
import './styles.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      toast.error('Mot de passe trop court');
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/users/register/', {
        username,
        password,
        role: 'client'
      });
      toast.success('Inscription réussie ! Connectez-vous maintenant.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l’inscription');
      toast.error('Échec de l’inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-bg relative">
      
      <Link to="/" className="back-button" aria-label="Retour à la page d'accueil">Retour</Link>
      <div className="card w-full max-w-md animate-slide-in relative z-10">
        <h2 className="text-3xl font-bold text-primary-blue mb-6 text-center flex items-center">
          <i className="fas fa-user-plus mr-2 text-accent-gold animate-pulse"></i> Inscription Client
        </h2>
        {error && (
          <p className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-primary-blue mb-2 font-medium">Nom d’utilisateur</label>
            <input
              type="text"
              placeholder="Choisissez un nom d’utilisateur"
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
              placeholder="Choisissez un mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-turquoise"
              required
            />
          </div>
          <button type="submit" className="cta-button w-full" aria-label="S'inscrire">
            <FontAwesomeIcon icon="fa-solid fa-user-plus" className="mr-2" /> S’inscrire
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-accent-turquoise hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;