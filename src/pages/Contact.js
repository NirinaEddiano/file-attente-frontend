import React from 'react';
import { Helmet } from 'react-helmet';
import './styles.css';

const Contact = () => {
  return (
    <div className="min-h-screen bg-bg-light text-primary-blue p-6">
      <Helmet>
        <title>Contactez QueueMaster</title>
        <meta name="description" content="Contactez l'équipe de QueueMaster pour toute question ou assistance." />
      </Helmet>
      <h2 className="text-3xl font-bold text-primary-blue mb-6 text-center">Contactez-nous</h2>
      <div className="max-w-md mx-auto">
        <p className="mb-4">Pour toute question, contactez-nous via :</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Email : <a href="https://mail.google.com/mail/anoeddi@gmail.com" className="text-accent-gold">support@queuemaster.com</a></li>
          <li>Téléphone : <a href="tel:+261344431987" className="text-accent-gold">+261 123 456 789</a></li>
          <li>WhatsApp : <a href="https://wa.me/+261334334846" className="text-accent-gold">+261 123 456 789</a></li>
          <li>Facebook : <a href="https://www.facebook.com/eddian.radic/?_rdc=1&_rdr#" className="text-accent-gold">@QueueMaster</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Contact;