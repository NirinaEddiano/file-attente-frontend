import React, { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CountUp from 'react-countup';
import axios from '../utils/axiosConfig';
import './styles.css';

const Vitrine = () => {
  const navigate = useNavigate();
  const [liveStats, setLiveStats] = useState({ tickets: 0, banks: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);
  const [typedText, setTypedText] = useState('');
  const fullText = "Gérez vos files d’attente facilement : prenez un ticket, suivez votre position en temps réel et recevez des alertes.";

  // Typing effect for hero subtitle
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

  // Fetch live stats
  useEffect(() => {
    axios.get('/api/stats/')
      .then((res) => setLiveStats(res.data))
      .catch(() => setLiveStats({ tickets: 1234, banks: 50 })); // Fallback data

    // Sticky CTA visibility
    const handleScroll = () => {
      const cta = document.querySelector('.fixed-cta');
      if (cta) {
        if (window.scrollY > 500) cta.classList.remove('hidden');
        else cta.classList.add('hidden');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Testimonial carousel
  const testimonials = [
    { text: "“QueueMaster a transformé mes visites en banque. Fini les longues attentes !”", author: "Jean D." },
    { text: "“Les alertes en temps réel sont un game-changer. Super pratique !”", author: "Amina K." },
    { text: "“Une interface simple et efficace. Je recommande !”", author: "Marc L." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Toggle FAQ accordion
  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-bg-light text-primary-blue relative overflow-hidden">
      <Helmet>
        <title>QueueMaster - Gérez vos files d’attente en banque</title>
        <meta name="description" content="Prenez un ticket, suivez votre position en temps réel et recevez des alertes avec QueueMaster." />
        <meta name="keywords" content="queue management, bank queue, ticket system, QueueMaster" />
        <meta property="og:title" content="QueueMaster" />
        <meta property="og:description" content="Simplifiez vos visites en banque avec QueueMaster." />
        <meta property="og:image" content="/images/queuemaster-preview.jpg" />
        <meta property="og:url" content="https://queuemaster.com" />
        <link rel="preload" href="/styles.css" as="style" />
      </Helmet>
      {/* Video Background */}
      <div className="absolute inset-0">
        <div className="w-full h-full object-cover opacity-50 bg-gradient-to-r from-blue-900 to-blue-700"></div>
      </div>
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-primary-blue flex items-center animate-slide-in" aria-label="QueueMaster Logo">
          <i className="fas fa-ticket-alt mr-2 text-accent-gold animate-pulse"></i> QueueMaster
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="secondary-button"
            aria-label="Se connecter à QueueMaster"
          >
            <i className="fas fa-sign-in-alt mr-2"></i> Se connecter
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="cta-button"
            aria-label="S'inscrire à QueueMaster"
          >
            <i className="fas fa-user-plus mr-2"></i> S'inscrire
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-8 animate-slide-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-blue mb-4 font-poppins">
            Simplifiez vos visites en banque
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6 animate-fade-in">
            {typedText}
            <span className="animate-blink">|</span>
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="cta-button text-lg animate-pulse"
              aria-label="Commencer à utiliser QueueMaster"
            >
              <i className="fas fa-rocket mr-2"></i> Commencer maintenant
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="secondary-button text-lg"
              aria-label="Essayer une démo de QueueMaster"
            >
              <i className="fas fa-play-circle mr-2"></i> Essayer la démo
            </button>
          </div>
          <div className="mt-6 flex justify-center space-x-8 text-primary-blue animate-slide-in">
            <div>
              <p className="text-2xl font-semibold text-accent-gold">
                <CountUp end={10000} duration={2} suffix="+" />
              </p>
              <p>Utilisateurs</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-accent-gold">
                <CountUp end={50} duration={2} suffix="+" />
              </p>
              <p>Banques</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-accent-gold">
                <CountUp end={99.9} duration={2} suffix="%" decimals={1} />
              </p>
              <p>Fiabilité</p>
            </div>
          </div>
          <p className="text-lg text-accent-gold mt-4">
            Actuellement : <CountUp end={liveStats.tickets} duration={2} /> tickets servis dans <CountUp end={liveStats.banks} duration={2} /> banques
          </p>
        </section>
        {/* Features Section */}
        <section id="features" className="mb-8 parallax-section">
          <h3 className="text-3xl font-bold text-primary-blue mb-6 text-center flex items-center justify-center animate-slide-in font-poppins">
            <i className="fas fa-star mr-2 text-accent-gold animate-pulse"></i> Pourquoi QueueMaster ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: 'fa-bolt', title: 'Simplicité', text: 'Prenez un ticket en 3 clics et suivez votre tour en temps réel.' },
              { icon: 'fa-shield-alt', title: 'Fiabilité', text: 'Partenariats avec des banques de confiance pour une expérience fluide.' },
              { icon: 'fa-bell', title: 'Confort', text: 'Recevez des alertes pour ne jamais manquer votre tour.' },
              { icon: 'fa-mobile-alt', title: 'Mobilité', text: 'Gérez vos files d’attente depuis votre smartphone, où que vous soyez.' },
            ].map((feature, index) => (
              <div
                key={index}
                className="card gold-border text-primary-blue animate-slide-in hover:scale-105 transition-transform feature-card"
              >
                <i className={`fas ${feature.icon} text-4xl text-accent-gold mb-4 animate-pulse`} aria-hidden="true"></i>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Partners Section */}
        <section className="mb-8 parallax-section">
          <h3 className="text-3xl font-bold text-primary-blue mb-6 text-center flex items-center justify-center animate-slide-in font-poppins">
            <i className="fas fa-handshake mr-2 text-accent-gold animate-pulse"></i> Nos Partenaires
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {['Banque A', 'Banque B', 'Banque C'].map((bank, index) => (
              <div key={index} className="card gold-border p-4 animate-slide-in hover:scale-105 transition-transform">
                <div className="h-16 mx-auto flex items-center justify-center text-accent-gold font-bold text-xl">
                  {bank}
                </div>
                <p className="text-primary-blue mt-2">{bank}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Testimonials Section (Carousel) */}
        <section className="mb-8 parallax-section">
          <h3 className="text-3xl font-bold text-primary-blue mb-6 text-center flex items-center justify-center animate-slide-in font-poppins">
            <i className="fas fa-quote-left mr-2 text-accent-gold animate-pulse"></i> Ce qu’ils disent de nous
          </h3>
          <div className="relative">
            <div className="card gold-border text-primary-blue mx-auto max-w-md animate-fade-in">
              <i className="fas fa-quote-right text-3xl text-accent-gold mb-4 animate-pulse" aria-hidden="true"></i>
              <p className="mb-4">{testimonials[currentTestimonial].text}</p>
              <p className="font-semibold">— {testimonials[currentTestimonial].author}</p>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${index === currentTestimonial ? 'bg-accent-gold' : 'bg-gray-300'}`}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`Aller au témoignage ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
        {/* FAQ Section (Accordion) */}
        <section className="mb-8">
          <h3 className="text-3xl font-bold text-primary-blue mb-6 text-center flex items-center justify-center animate-slide-in font-poppins">
            <i className="fas fa-question-circle mr-2 text-accent-gold animate-pulse"></i> Questions Fréquentes
          </h3>
          <div className="space-y-4">
            {[
              { question: 'Comment prendre un ticket ?', answer: 'Inscrivez-vous, choisissez une banque et un service, et obtenez un ticket en un clic.' },
              { question: 'Les alertes sont-elles fiables ?', answer: 'Oui, notre système envoie des notifications précises basées sur votre position.' },
              { question: 'Puis-je annuler un ticket ?', answer: 'Oui, vous pouvez annuler à tout moment depuis la page File d’attente.' },
            ].map((faq, index) => (
              <div
                key={index}
                className="card gold-border text-primary-blue animate-slide-in"
              >
                <button
                  className="w-full text-left flex justify-between items-center p-4 focus:outline-none"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={faqOpen === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h4 className="text-lg font-semibold">{faq.question}</h4>
                  <i className={`fas ${faqOpen === index ? 'fa-chevron-up' : 'fa-chevron-down'} text-accent-gold`}></i>
                </button>
                {faqOpen === index && (
                  <div id={`faq-answer-${index}`} className="p-4 pt-0 animate-fade-in">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        {/* Final CTA */}
        <section className="text-center mb-8 animate-slide-in">
          <h3 className="text-3xl font-bold text-primary-blue mb-4 font-poppins">
            Prêt à simplifier vos visites ?
          </h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="cta-button text-lg animate-pulse"
              aria-label="Rejoignez QueueMaster"
            >
              <i className="fas fa-user-plus mr-2"></i> Rejoignez-nous
            </button>
          </div>
        </section>
      </main>
      {/* Floating Navigation Buttons */}
      <div className="fixed bottom-20 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
          className="bg-accent-gold text-primary-blue p-3 rounded-full shadow-lg hover:bg-yellow-400 transition-all"
          aria-label="Aller à la section Fonctionnalités"
        >
          <i className="fas fa-star"></i>
        </button>
        <button
          onClick={() => document.querySelector('#features + section').scrollIntoView({ behavior: 'smooth' })}
          className="bg-accent-gold text-primary-blue p-3 rounded-full shadow-lg hover:bg-yellow-400 transition-all"
          aria-label="Aller à la section Partenaires"
        >
          <i className="fas fa-handshake"></i>
        </button>
        <button
          onClick={() => document.querySelector('#features + section + section').scrollIntoView({ behavior: 'smooth' })}
          className="bg-accent-gold text-primary-blue p-3 rounded-full shadow-lg hover:bg-yellow-400 transition-all"
          aria-label="Aller à la section Témoignages"
        >
          <i className="fas fa-quote-left"></i>
        </button>
        <button
          onClick={() => document.querySelector('#features + section + section + section').scrollIntoView({ behavior: 'smooth' })}
          className="bg-accent-gold text-primary-blue p-3 rounded-full shadow-lg hover:bg-yellow-400 transition-all"
          aria-label="Aller à la section FAQ"
        >
          <i className="fas fa-question-circle"></i>
        </button>
      </div>
      {/* Sticky CTA */}
      <div className="fixed bottom-4 right-4 z-20 hidden fixed-cta">
        <button
          onClick={() => navigate('/signup')}
          className="cta-button text-lg animate-pulse"
          aria-label="S'inscrire à QueueMaster"
        >
          S'inscrire
        </button>
      </div>
      <footer className="bg-primary-blue text-white p-6 text-center relative z-10">
  <p className="mb-2">© 2025 QueueMaster par RAMIADANARIVO Nirina Eddiano. Tous droits réservés.</p>
  <div className="flex justify-center space-x-4">
    <Link to="/contact" className="text-accent-gold hover:text-accent-turquoise" aria-label="Contacter QueueMaster">
      <i className="fas fa-envelope mr-1"></i> Contact
    </Link>
  </div>
</footer>
    </div>
  );
};

export default Vitrine;