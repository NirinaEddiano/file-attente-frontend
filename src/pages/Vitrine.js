import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import CountUp from 'react-countup';
import axios from '../utils/axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faStar, faHandshake, faQuestionCircle, faArrowRight, faPlayCircle, faBars,faSignInAlt,faUserPlus } from '@fortawesome/free-solid-svg-icons';
import queueBackgroundVideo1 from '../assets/video/queue-background-video1.mp4';
import queueBackgroundVideo2 from '../assets/video/queue-background-video2.mp4';
import queueBackgroundVideo3 from '../assets/video/queue-background-video3.mp4';
import bankAlphaLogo from '../assets/images/bank-alpha-logo.jpg';
import bankBetaLogo from '../assets/images/bank-beta-logo.jpg';
import bankGammaLogo from '../assets/images/bank-gamma-logo.jpg';
import simplicityBg from '../assets/images/simplicity-bg.jpg';
import reliabilityBg from '../assets/images/reliability-bg.jpg';
import comfortBg from '../assets/images/comfort-bg.jpg';
import mobilityBg from '../assets/images/mobility-bg.jpg';
import './vitrine.css';

const Vitrine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [liveStats, setLiveStats] = useState({ tickets: 0, banks: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const videos = [queueBackgroundVideo1, queueBackgroundVideo2, queueBackgroundVideo3];

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    axios.get('/api/stats/')
      .then((res) => setLiveStats(res.data))
      .catch(() => setLiveStats({ tickets: 1, banks: 5 })); // Updated default values
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    const videoInterval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 10000);
    return () => {
      clearInterval(interval);
      clearInterval(videoInterval);
    };
  }, []);

  const testimonials = [
    { text: "“QueueMaster a transformé mes visites en banque. Fini les longues attentes !”", author: "Jean D." },
    { text: "“Les alertes en temps réel sont un game-changer. Super pratique !”", author: "Amina K." },
    { text: "“Une interface simple et efficace. Je recommande !”", author: "Marc L." },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const fullText = "Gérez vos files d’attente facilement : prenez un ticket, suivez votre position en temps réel et recevez des alertes.";

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
            <button onClick={() => navigate('/login')} className="adjusted-secondary-button" aria-label="Se connecter à QueueMaster">
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />  Connexion
            </button>
            <button onClick={() => navigate('/signup')} className="cta-button" aria-label="S'inscrire à QueueMaster">
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />  S'inscrire
            </button>
          </nav>
          <FontAwesomeIcon icon={faBars} className="menu-toggle" onClick={toggleMenu} />
        </div>
      </header>
      <main>
        <section className="hero animate-fade-in">
          <video autoPlay loop muted playsInline>
            <source src={videos[currentVideo]} type="video/mp4" />
          </video>
          <div className="container">
            <h2>Simplifiez vos visites en banque</h2>
            <p className="text-bold-black">
              {typedText}
              <span className="animate-blink">|</span>
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => navigate('/signup')} className=" adjusted-secondary-button " aria-label="Commencer à utiliser QueueMaster">
                <FontAwesomeIcon icon="fa-solid fa-rocket" className="mr-2" /> Commencer maintenant
              </button>
              <button onClick={() => navigate('/demo')} className="secondary-button" aria-label="Essayer une démo de QueueMaster">
                <FontAwesomeIcon icon={faPlayCircle} className="mr-2 " /> Tester la démo
              </button>
            </div>
            <div className="mt-6 flex justify-center space-x-8 text-primary-blue animate-slide-in">
              <div>
                <p className="text-2xl font-semibold text-accent-gold text-bold-black">
                  <CountUp end={10000} duration={2} suffix="+" />+
                </p>
                <p className="text-bold-black">Utilisateurs</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-accent-gold text-bold-black">
                  <CountUp end={50} duration={2} suffix="+" />+
                </p>
                <p className="text-bold-black">Banques</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-accent-gold text-bold-black">
                  <CountUp end={99.9} duration={2} suffix="%" decimals={1} />
                </p>
                <p className="text-bold-black">Fiabilité</p>
              </div>
            </div>
            <p className="text-lg text-accent-gold text-bold-black mt-4">
              Actuellement : <CountUp end={liveStats.tickets} duration={2} /> tickets servis dans <CountUp end={liveStats.banks} duration={2} /> banques
            </p>
          </div>
        </section>
        <section className="features animate-fade-in">
          <div className="container">
            <h3>Pourquoi QueueMaster ?</h3>
            <div className="features-grid">
              <div className="feature-card">
                <img src={simplicityBg} alt="Simplicity" className="w-full h-48 object-cover mb-4" />
                <FontAwesomeIcon icon="fa-solid fa-bolt" className="fa-icon" />
                <h4>Simplicité</h4>
                <p>Prenez un ticket en 3 clics et suivez votre tour en temps réel.</p>
              </div>
              <div className="feature-card">
                <img src={reliabilityBg} alt="Reliability" className="w-full h-48 object-cover mb-4" />
                <FontAwesomeIcon icon="fa-solid fa-shield-alt" className="fa-icon" />
                <h4>Fiabilité</h4>
                <p>Partenariats avec des banques de confiance pour une expérience fluide.</p>
              </div>
              <div className="feature-card">
                <img src={comfortBg} alt="Comfort" className="w-full h-48 object-cover mb-4" />
                <FontAwesomeIcon icon="fa-solid fa-bell" className="fa-icon" />
                <h4>Confort</h4>
                <p>Recevez des alertes pour ne jamais manquer votre tour.</p>
              </div>
              <div className="feature-card">
                <img src={mobilityBg} alt="Mobility" className="w-full h-48 object-cover mb-4" />
                <FontAwesomeIcon icon="fa-solid fa-mobile-alt" className="fa-icon" />
                <h4>Mobilité</h4>
                <p>Gérez vos files d’attente depuis votre smartphone, où que vous soyez.</p>
              </div>
            </div>
            <button onClick={() => navigate('/pourquoi-queuemaster')} className="cta-button w-full sm:w-auto mt-6" aria-label="En savoir plus sur QueueMaster">
              <FontAwesomeIcon icon={faArrowRight} /> En savoir plus
            </button>
          </div>
        </section>
        <section className="partners animate-fade-in">
          <div className="container">
            <h3>Nos Partenaires</h3>
            <div className="partners-grid">
              <div className="partner-card">
                <img src={bankAlphaLogo} alt="Bank Alpha" className="w-full h-48 object-cover mb-4" />
                <h4>Bank Trust</h4>
              </div>
              <div className="partner-card">
                <img src={bankBetaLogo} alt="Bank Beta" className="w-full h-48 object-cover mb-4" />
                <h4>Bank Horizon</h4>
              </div>
              <div className="partner-card">
                <img src={bankGammaLogo} alt="Bank Gamma" className="w-full h-48 object-cover mb-4" />
                <h4>Bank NovaBank</h4>
              </div>
            </div>
            <button onClick={() => navigate('/nos-partenaires')} className="cta-button w-full sm:w-auto mt-6" aria-label="En savoir plus sur nos partenaires">
              <FontAwesomeIcon icon={faArrowRight} /> En savoir plus
            </button>
          </div>
        </section>
        <section className="testimonials animate-fade-in">
          <div className="container">
            <h3>Ce qu’ils disent de nous</h3>
            <div className="testimonials-carousel">
              <div className="testimonials-track">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="testimonial-card">
                    <p>{testimonial.text}</p>
                    <p className="author">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="faq animate-fade-in">
          <div className="container">
            <h3>Questions Fréquentes</h3>
            <div className="faq-grid">
              <div className="faq-card" onClick={() => navigate('/faq')}>
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Comment prendre un ticket ?</h4>
              </div>
              <div className="faq-card" onClick={() => navigate('/faq')}>
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Les alertes sont-elles fiables ?</h4>
              </div>
              <div className="faq-card" onClick={() => navigate('/faq')}>
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Puis-je annuler un ticket ?</h4>
              </div>
              <div className="faq-card" onClick={() => navigate('/faq')}>
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Quels types de services puis-je sélectionner ?</h4>
              </div>
              <div className="faq-card" onClick={() => navigate('/faq')}>
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Comment suivre ma position dans la file ?</h4>
              </div>
              <div className="faq-card" onClick={() => navigate('/faq')}>
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Comment contacter le support ?</h4>
              </div>
              <div className="faq-card" onClick={() => navigate('/faq')}>
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Y a-t-il des frais pour utiliser QueueMaster ?</h4>
              </div>
              <div className="faq-card" onClick={() => navigate('/faq')}>
                <FontAwesomeIcon icon={faQuestionCircle} className="fa-icon" />
                <h4>Comment mettre à jour mes informations ?</h4>
              </div>
            </div>
            <button onClick={() => navigate('/faq')} className="cta-button w-full sm:w-auto mt-6" aria-label="Voir toutes les FAQ">
              <FontAwesomeIcon icon={faArrowRight} /> Voir toutes les FAQ
            </button>
          </div>
        </section>
        <section className="cta animate-fade-in">
          <div className="container">
            <h3>Prêt à simplifier vos visites ?</h3>
            <p>Rejoignez QueueMaster et gérez vos files d’attente en toute simplicité.</p>
            <div className="cta-buttons">
              <button onClick={() => navigate('/signup')} className="secondary-button text-lg cta-button w-full sm:w-auto mt-6 " aria-label="Rejoignez QueueMaster">
                <FontAwesomeIcon icon="fa-solid fa-user-plus" className="mr-2" /> S’inscrire
              </button>
              <button onClick={() => navigate('/login')} className="secondary-button text-lg w-full sm:w-auto mt-6" aria-label="Se connecter à QueueMaster">
                <FontAwesomeIcon icon="fa-solid fa-sign-in-alt" className=" mr-2  secondary-button text-lg" /> Se connecter
              </button>
            </div>
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

export default Vitrine;