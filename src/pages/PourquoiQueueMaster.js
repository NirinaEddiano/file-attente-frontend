import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faArrowRight, faTicketAlt, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import simplicityBg from '../assets/images/simplicity-bg.jpg';
import reliabilityBg from '../assets/images/reliability-bg.jpg';
import comfortBg from '../assets/images/comfort-bg.jpg';
import mobilityBg from '../assets/images/mobility-bg.jpg';
import './styles.css';

const PourquoiQueueMaster = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-bg-light text-primary-blue relative overflow-hidden">
      <header className="header">
        <div className="container header-content">
          <h1>
            <FontAwesomeIcon icon={faTicketAlt} className="mr-2" /> QueueMaster
          </h1>
          <nav className={isMenuOpen ? 'active' : ''}>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Accueil</Link>
            <Link to="/pourquoi-queuemaster" className={location.pathname === '/pourquoi-queuemaster' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>QueueMaster</Link>
            <Link to="/nos-partenaires" className={location.pathname === '/nos-partenaires' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}> Partenaires</Link>
            <Link to="/faq" className={location.pathname === '/faq' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>FAQ</Link>
            <button onClick={() => navigate('/login')} className="adjusted-secondary-button" aria-label="Se connecter à QueueMaster">
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Connexion
            </button>
            <button onClick={() => navigate('/signup')} className="cta-button" aria-label="S'inscrire à QueueMaster">
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> S'inscrire
            </button>
          </nav>
          <FontAwesomeIcon icon={faBars} className="menu-toggle" onClick={toggleMenu} />
        </div>
      </header>
      <main>
        <section className="features animate-fade-in">
          <div className="container">
            <h3 className="text-3xl font-bold text-primary-blue mb-12 text-center">Pourquoi choisir QueueMaster ?</h3>
            <div className="features-grid">
              <div className="feature-card">
                <img src={simplicityBg} alt="Simplicity" className="w-full h-48 object-cover mb-4 rounded-lg" />
                <h4>Simplicité</h4>
                <p>Avec QueueMaster, prendre un ticket est un jeu d’enfant. En seulement trois clics, vous pouvez sélectionner votre banque, choisir le service dont vous avez besoin, et obtenir un ticket numérique. Notre interface utilisateur est conçue pour être claire et accessible, même pour les utilisateurs novices. Suivez votre position dans la file en temps réel grâce à une visualisation simple et intuitive, et recevez des mises à jour instantanées sur votre tour.</p>
              </div>
              <div className="feature-card">
                <img src={reliabilityBg} alt="Reliability" className="w-full h-48 object-cover mb-4 rounded-lg" />
                <h4>Fiabilité</h4>
                <p>QueueMaster s’associe avec des banques de confiance pour garantir une expérience fluide et sans accroc. Nous collaborons avec des établissements financiers qui partagent notre vision d’un service client amélioré. Nos systèmes sont intégrés directement avec les infrastructures des banques, assurant une synchronisation parfaite entre votre ticket numérique et la gestion des files d’attente sur place. Vous pouvez compter sur QueueMaster pour une expérience fiable à chaque visite.</p>
              </div>
              <div className="feature-card">
                <img src={comfortBg} alt="Comfort" className="w-full h-48 object-cover mb-4 rounded-lg" />
                <h4>Confort</h4>
                <p>Fini le stress d’attendre sans savoir quand sera votre tour. QueueMaster vous envoie des alertes en temps réel pour vous informer lorsque votre tour approche. Que vous soyez en train de prendre un café à proximité ou de faire des courses, vous recevrez une notification sur votre smartphone pour vous rappeler de revenir à la banque juste à temps. Profitez d’un confort inégalé et d’une gestion de votre temps optimisée avec QueueMaster.</p>
              </div>
              <div className="feature-card">
                <img src={mobilityBg} alt="Mobility" className="w-full h-48 object-cover mb-4 rounded-lg" />
                <h4>Mobilité</h4>
                <p>QueueMaster est conçu pour s’adapter à votre style de vie mobile. Notre application est disponible sur iOS et Android, vous permettant de gérer vos files d’attente depuis n’importe où. Que vous soyez au travail, à la maison, ou en déplacement, vous pouvez prendre un ticket, suivre votre position, et recevoir des alertes directement sur votre smartphone. Avec QueueMaster, la gestion des files d’attente devient aussi mobile que vous l’êtes.</p>
              </div>
            </div>
            <Link to="/signup" className="cta-button w-full sm:w-auto mt-12 mx-auto block text-center">
              <FontAwesomeIcon icon={faArrowRight} className="mr-2" /> Commencer maintenant
            </Link>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">
          <p>© 2025 QueueMaster par RAMIADANARIVO Nirina Eddiano. Tous droits réservés.</p>
          <div className="footer-links">
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PourquoiQueueMaster;