import React, { useState } from 'react';
import { useNavigate,Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faBars, faArrowRight,faTicketAlt ,faSignInAlt,faUserPlus} from '@fortawesome/free-solid-svg-icons';
import faqBg from '../assets/images/faq_bg.jpg';
import './styles.css';

const FAQ = () => {
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
            <Link to="/nos-partenaires" className={location.pathname === '/nos-partenaires' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Partenaires</Link>
            <Link to="/faq" className={location.pathname === '/faq' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>FAQ</Link>
            <button onClick={() => navigate('/login')} className="secondary-button" aria-label="Se connecter à QueueMaster">
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
        <section className="section-bg">
          <img src={faqBg} alt="FAQ Background" />
          <div className="container">
            <h3>Questions Fréquentes</h3>
            <div className="faq-grid">
              <div className="faq-card">
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Comment prendre un ticket ?</h4>
                <p style={{ color: '#000' }}>Inscrivez-vous sur QueueMaster, choisissez une banque et un service, puis cliquez sur "Prendre un ticket". Votre ticket numérique sera généré instantanément.</p>
              </div>
              <div className="faq-card">
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Les alertes sont-elles fiables ?</h4>
                <p style={{ color: '#000' }}>Oui, notre système utilise une synchronisation en temps réel avec les banques pour envoyer des alertes précises lorsque votre tour approche.</p>
              </div>
              <div className="faq-card">
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Puis-je annuler un ticket ?</h4>
                <p style={{ color: '#000' }}>Absolument ! Vous pouvez annuler votre ticket à tout moment depuis la page "File d’attente" de l’application.</p>
              </div>
              <div className="faq-card">
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Quels types de services puis-je sélectionner ?</h4>
                <p style={{ color: '#000' }}>QueueMaster vous permet de choisir parmi une variété de services bancaires, comme les dépôts, retraits, ouverture de compte, ou consultations avec un conseiller.</p>
              </div>
              <div className="faq-card">
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Comment suivre ma position dans la file ?</h4>
                <p style={{ color: '#000' }}>Une fois votre ticket pris, vous pouvez voir votre position actuelle dans la file ainsi que le temps d’attente estimé directement sur l’application.</p>
              </div>
            </div>
            <button onClick={() => navigate('/faq')} className="cta-button w-full sm:w-auto mt-6" aria-label="Voir toutes les FAQ">
              <FontAwesomeIcon icon={faArrowRight} /> Voir toutes les FAQ
            </button>
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

export default FAQ;