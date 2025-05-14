import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Vitrine from './pages/Vitrine';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import SuiviTicket from './pages/SuiviTicket';
import AppelTicket from './pages/AppelTicket';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import Profil from './pages/Profil';
import RendezVous from './pages/RendezVous';
import DemoPage from './pages/Demopage';
import AddGuichet from './pages/AddGuichet';
import EditGuichet from './pages/EditGuichet';
import Contact from './pages/Contact';

function App() {
  return (
    <Router basename="/file-attente-frontend/">
      <Routes>
        <Route path="/" element={<Vitrine />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/suivi-ticket" element={<SuiviTicket />} />
        <Route path="/appel-ticket" element={<AppelTicket />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/rendez-vous" element={<RendezVous />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/admin/guichets/add" element={<AddGuichet />} />
        <Route path="/admin/guichets/edit/:guichetId" element={<EditGuichet />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;