import React, { useState, useEffect } from 'react';
import instance from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const AddGuichet = () => {
  const [formData, setFormData] = useState({
    bank_id: 1, // Hardcoded as per AdminDashboard.js
    service_id: '',
    user_id: '',
    number: '',
    status: 'closed',
    auto_absent_timer: 120,
  });
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }

    // Fetch services and users (guichetiers)
    const fetchData = async () => {
      try {
        const [servicesRes, usersRes] = await Promise.all([
          instance.get('/api/services/?bank_id=1', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          instance.get('/api/users/?role=guichetier', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setServices(servicesRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données: ' + (err.response?.data?.error || err.message));
        console.error(err);
      }
    };
    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }

    try {
      await instance.post('/api/admin/guichets/add/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/admin'); // Redirect back to dashboard
    } catch (err) {
      setError('Erreur lors de l’ajout du guichet: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center py-6">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary-blue">Ajouter un Guichet</h2>
          <button
            onClick={() => navigate('/admin')}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 flex items-center transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retour
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Numéro du Guichet</label>
            <input
              type="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Service</label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue"
            >
              <option value="">-- Sélectionner un service --</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Guichetier</label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue"
            >
              <option value="">-- Sélectionner un guichetier --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue"
            >
              <option value="open">Ouvert</option>
              <option value="closed">Fermé</option>
              <option value="paused">En pause</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Temps d’absence automatique (secondes)</label>
            <input
              type="number"
              name="auto_absent_timer"
              value={formData.auto_absent_timer}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-blue text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center transition-colors"
          >
            {loading ? (
              'Chargement...'
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Ajouter
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGuichet;
