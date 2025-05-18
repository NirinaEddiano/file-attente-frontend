import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faArrowRight, faTicketAlt, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import bankAlphaLogo from '../assets/images/bank-alpha-logo.jpg';
import bankBetaLogo from '../assets/images/bank-beta-logo.jpg';
import bankGammaLogo from '../assets/images/bank-gamma-logo.jpg';
import './styles.css';

const NosPartenaires = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen text-primary-blue relative overflow-hidden partners-page">
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
        <section className="partners animate-fade-in">
          <div className="container">
            <h3 className="text-3xl font-bold text-primary-blue mb-12 text-center">Nos Partenaires</h3>
            <div className="partners-grid">
              <div className="partner-card">
                <img src={bankAlphaLogo} alt="Bank Alpha" className="w-24 h-24 object-contain mb-4 rounded-lg" />
                <h4>Bank Trust</h4>
                <p>Bank Trust est une institution financière de premier plan qui se consacre à offrir des services bancaires innovants à ses clients. Fondée il y a plus de 50 ans, Bank Alpha a toujours été à l’avant-garde de la technologie bancaire, offrant des solutions qui simplifient la vie de ses clients. En partenariat avec QueueMaster, Bank Alpha a intégré notre système de gestion de files d’attente pour réduire les temps d’attente et améliorer l’expérience client dans ses agences. Que vous ayez besoin d’ouvrir un compte, de demander un prêt, ou de gérer vos finances, Bank Alpha vous garantit un service rapide et efficace grâce à QueueMaster.</p>
              </div>
              <div className="partner-card">
                <img src={bankBetaLogo} alt="Bank Beta" className="w-24 h-24 object-contain mb-4 rounded-lg" />
                <h4>Bank Horizon</h4>
                <p>Bank Horizon est connue pour son engagement envers la satisfaction client et ses services bancaires accessibles. Avec des agences réparties dans tout le pays, Bank Beta dessert une clientèle diversifiée, allant des particuliers aux grandes entreprises. En collaborant avec QueueMaster, Bank Beta a transformé la manière dont ses clients interagissent avec ses services en agence. Notre système de ticketing numérique permet aux clients de Bank Beta de planifier leurs visites à l’avance, réduisant ainsi les temps d’attente et augmentant l’efficacité des opérations en agence. Faites confiance à Bank Beta et QueueMaster pour une expérience bancaire sans stress.</p>
              </div>
              <div className="partner-card partner-card-centered">
                <img src={bankGammaLogo} alt="Bank Gamma" className="w-24 h-24 object-contain mb-4 rounded-lg" />
                <h4>Bank NovaBank</h4>
                <p>Bank NovaBank est une banque moderne qui met l’accent sur l’innovation et la durabilité. Depuis sa création, elle s’est engagée à offrir des solutions bancaires qui répondent aux besoins évolutifs de ses clients tout en promouvant des pratiques durables. En intégrant QueueMaster dans ses agences, Bank Gamma a considérablement réduit les files d’attente, permettant à ses clients de gagner du temps et de profiter d’un service plus personnalisé. Que vous soyez un client particulier ou professionnel, Bank Gamma et QueueMaster travaillent ensemble pour vous offrir une expérience bancaire fluide et agréable.</p>
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

export default NosPartenaires;