import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import './styles.css';

const ClientNavbar = () => {
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/users/user/');
        setUsername(response.data.username);
      } catch (err) {
        console.error('Erreur récupération utilisateur:', err);
        toast.error('Erreur lors du chargement du profil');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
    toast.success('Déconnexion réussie');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md relative z-[1005]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <span className="text-xl font-bold flex items-center">
          <i className="fas fa-ticket-alt mr-2 text-accent-gold animate-pulse"></i> QueueMaster
        </span>
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none focus:ring-2 focus:ring-accent-turquoise"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
        <div
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } md:flex flex-col md:flex-row md:items-center md:space-x-6 absolute md:static top-16 left-0 right-0 bg-blue-600 md:bg-transparent p-4 md:p-0 z-[1004]`}
        >
          <span className="font-medium mb-2 md:mb-0 flex items-center">
            <i className="fas fa-user-circle mr-2 text-accent-gold"></i> Bienvenue, {username || 'Client'}
          </span>
          <button
            onClick={() => navigate('/home')}
            className={`hover:text-blue-200 transition-colors mb-2 md:mb-0 flex items-center ${
              isActive('/home') ? 'bg-blue-800 rounded px-2 py-1' : ''
            }`}
          >
            <i className="fas fa-home mr-2 text-accent-turquoise"></i> Accueil
          </button>
          <button
            onClick={() => navigate('/profil')}
            className={`hover:text-blue-200 transition-colors mb-2 md:mb-0 flex items-center ${
              isActive('/profil') ? 'bg-blue-800 rounded px-2 py-1' : ''
            }`}
          >
            <i className="fas fa-user mr-2 text-accent-turquoise"></i> Profil
          </button>
          <button
            onClick={() => navigate('/suivi-ticket')}
            className={`hover:text-blue-200 transition-colors mb-2 md:mb-0 flex items-center ${
              isActive('/suivi-ticket') ? 'bg-blue-800 rounded px-2 py-1' : ''
            }`}
          >
            <i className="fas fa-list-ul mr-2 text-accent-turquoise"></i> File d'attente
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className={`hover:text-blue-200 transition-colors mb-2 md:mb-0 flex items-center ${
              isActive('/notifications') ? 'bg-blue-800 rounded px-2 py-1' : ''
            }`}
          >
            <i className="fas fa-bell mr-2 text-accent-turquoise"></i> Notifications
          </button>
          <button
            onClick={() => navigate('/rendez-vous')}
            className={`hover:text-blue-200 transition-colors mb-2 md:mb-0 flex items-center ${
              isActive('/rendez-vous') ? 'bg-blue-800 rounded px-2 py-1' : ''
            }`}
          >
            <i className="fas fa-calendar-alt mr-2 text-accent-turquoise"></i> Rendez-vous
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors flex items-center"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Déconnexion
          </button>
        </div>
        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-[1003] transition-opacity ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } md:hidden`}
          onClick={() => setIsMenuOpen(false)}
        ></div>
      </div>
    </nav>
  );
};

export default ClientNavbar;