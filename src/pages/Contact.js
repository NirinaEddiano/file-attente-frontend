import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const Contact = () => {
  return (
    <div className="min-h-screen bg-bg-light text-primary-blue p-6 animate-fade-in">
      <meta name="description" content="Contactez l'équipe de QueueMaster pour toute question ou assistance." />
      <h2 className="text-3xl font-bold text-primary-blue mb-6 text-center">Contactez-nous</h2>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-6 text-lg">Pour toute question ou assistance, contactez-nous via :</p>
        <ul className="space-y-4">
          <li className="flex items-center">
            <FontAwesomeIcon icon={faEnvelope} className="text-accent-gold mr-3" />
            <span>Email :</span>
            <a href="mailto:support@queuemaster.com" className="text-accent-gold ml-2 hover:underline">
              support@queuemaster.com
            </a>
          </li>
          <li className="flex items-center">
            <FontAwesomeIcon icon={faPhone} className="text-accent-gold mr-3" />
            <span>Téléphone :</span>
            <a href="tel:+261344431987" className="text-accent-gold ml-2 hover:underline">
              +261 344 431 987
            </a>
          </li>
          <li className="flex items-center">
            
            <span>WhatsApp :</span>
            <a href="https://wa.me/+261334334846" className="text-accent-gold ml-2 hover:underline">
              +261 334 334 846
            </a>
          </li>
          <li className="flex items-center">

            <span>Facebook :</span>
            <a href="https://www.facebook.com/eddian.radic/?_rdc=1&_rdr#" className="text-accent-gold ml-2 hover:underline">
              @QueueMaster
            </a>
          </li>
        </ul>
        <Link to="/" className="mt-6 inline-block cta-button">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Retour à la Vitrine
        </Link>
      </div>
    </div>
  );
};

export default Contact;