import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTicketAlt,
  faClock,
  faSmile,
  faUsers,
  faPlus,
  faEdit,
  faTrash,
  faCalendarAlt,
  faSearch,
  faHistory,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import './styles.css';
import { Spiral } from 'ldrs/react';
import 'ldrs/react/Spiral.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [guichets, setGuichets] = useState([]);
  const [services, setServices] = useState([]);
  const [queueTickets, setQueueTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [guichetHistory, setGuichetHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    avgWaitingTime: 0,
    satisfaction: 0,
    activeGuichets: 0,
  });
  const [frequencyData, setFrequencyData] = useState({ labels: [], datasets: [] });
  const [waitingTimeData, setWaitingTimeData] = useState({ labels: [], datasets: [] });
  const [guichetActivityData, setGuichetActivityData] = useState({ labels: [], datasets: [] });
  const [clientActivityData, setClientActivityData] = useState({ labels: [], datasets: [] });
  // States for date filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredGuichetHistory, setFilteredGuichetHistory] = useState([]);
  // States for search functionality
  const [clientSearch, setClientSearch] = useState('');
  const [guichetierSearch, setGuichetierSearch] = useState('');
  // States for toggling sections
  const [isGuichetSectionOpen, setIsGuichetSectionOpen] = useState(true);
  const [isClientSectionOpen, setIsClientSectionOpen] = useState(true);
  const [isHistorySectionOpen, setIsHistorySectionOpen] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const bankId = 1;

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Fetch current user to verify admin role
      const userResponse = await axios.get('http://localhost:8000/api/users/user/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.data.role !== 'admin') {
        setError('Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.');
        navigate('/login');
        return;
      }

      // Fetch all data concurrently
      const [
        ticketsRes,
        guichetsRes,
        servicesRes,
        queueTicketsRes,
        clientsRes,
        guichetHistoryRes,
      ] = await Promise.all([
        axios.get(`http://localhost:8000/api/tickets/?bank_id=${bankId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          console.error('Error fetching tickets:', err);
          return { data: [] };
        }),
        axios.get(`http://localhost:8000/api/guichets/?bank_id=${bankId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          console.error('Error fetching guichets:', err);
          return { data: [] };
        }),
        axios.get(`http://localhost:8000/api/services/?bank_id=${bankId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          console.error('Error fetching services:', err);
          return { data: [] };
        }),
        axios.get(`http://localhost:8000/api/tickets/?bank_id=${bankId}&statut=attente`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          console.error('Error fetching queue tickets:', err);
          return { data: [] };
        }),
        axios.get(`http://localhost:8000/api/users/?role=client`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          console.error('Error fetching clients:', err);
          return { data: [] };
        }),
        axios.get(`http://localhost:8000/api/guichet/history/?bank_id=${bankId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          console.error('Error fetching guichet history:', err);
          return { data: [] };
        }),
      ]);

      setTickets(ticketsRes.data);
      setGuichets(guichetsRes.data);
      setServices(servicesRes.data);
      setQueueTickets(queueTicketsRes.data);
      setClients(clientsRes.data);
      setGuichetHistory(guichetHistoryRes.data);
      setFilteredGuichetHistory(guichetHistoryRes.data); // Initially show all history

      if (ticketsRes.data.length === 0 && guichetsRes.data.length === 0 && servicesRes.data.length === 0) {
        setError('Aucune donnée disponible. Vérifiez que des données existent pour cette banque.');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des données: ' + (err.response?.data?.error || err.message));
      console.error(err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredGuichetHistory = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }

    try {
      let url = `http://localhost:8000/api/guichet/history/filtered/?bank_id=${bankId}`;
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      if (endDate) {
        url += `&end_date=${endDate}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFilteredGuichetHistory(response.data);
    } catch (err) {
      setError('Erreur lors de la récupération de l’historique filtré: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate, location]);

  useEffect(() => {
    const totalTickets = tickets.length;
    const activeGuichets = guichets.filter((g) => g.status === 'open').length;
    const totalWaitingTime = tickets.reduce((sum, ticket) => sum + (ticket.waiting_time || 0), 0);
    const avgWaitingTime = totalTickets ? Math.round(totalWaitingTime / totalTickets) : 0;
    const satisfaction = totalTickets ? 92 : 0;

    setStats({
      totalTickets,
      avgWaitingTime,
      satisfaction,
      activeGuichets,
    });

    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const ticketCounts = Array(7).fill(0);
    tickets.forEach((ticket) => {
      const ticketDate = new Date(ticket.date_heure);
      const dayIndex = ticketDate.getDay() === 0 ? 6 : ticketDate.getDay() - 1;
      ticketCounts[dayIndex]++;
    });

    setFrequencyData({
      labels: days,
      datasets: [
        {
          label: 'Fréquentation journalière',
          data: ticketCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });

    const waitingTimes = Array(7).fill(0);
    const counts = Array(7).fill(0);
    tickets.forEach((ticket) => {
      const ticketDate = new Date(ticket.date_heure);
      const dayIndex = ticketDate.getDay() === 0 ? 6 : ticketDate.getDay() - 1;
      waitingTimes[dayIndex] += ticket.waiting_time || 0;
      counts[dayIndex]++;
    });
    const avgWaitingTimes = waitingTimes.map((total, index) =>
      counts[index] ? Math.round(total / counts[index]) : 0
    );

    setWaitingTimeData({
      labels: days,
      datasets: [
        {
          label: "Temps d'attente moyen (minutes)",
          data: avgWaitingTimes,
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    });

    const guichetActivity = {};
    guichets.forEach((guichet) => {
      guichetActivity[guichet.id] = { number: guichet.number, count: 0 };
    });
    guichetHistory.forEach((entry) => {
      if (entry.action === 'traite' && guichetActivity[entry.guichet?.id]) {
        guichetActivity[entry.guichet.id].count++;
      }
    });
    setGuichetActivityData({
      labels: Object.values(guichetActivity).map((g) => `Guichet ${g.number}`),
      datasets: [
        {
          label: 'Tickets Traités par Guichet',
          data: Object.values(guichetActivity).map((g) => g.count),
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
        },
      ],
    });

    const clientActivity = {};
    clients.forEach((client) => {
      clientActivity[client.id] = { username: client.username, count: 0 };
    });
    tickets.forEach((ticket) => {
      if (clientActivity[ticket.user?.id]) {
        clientActivity[ticket.user.id].count++;
      }
    });
    setClientActivityData({
      labels: Object.values(clientActivity).map((c) => c.username),
      datasets: [
        {
          label: 'Tickets Créés par Client',
          data: Object.values(clientActivity).map((c) => c.count),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, [tickets, guichets, clients, guichetHistory]);

  const handleGuichetAction = async (guichetId, action) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }

    try {
      if (action === 'edit') {
        navigate(`/admin/guichets/edit/${guichetId}`);
      } else if (action === 'delete') {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce guichet ?')) {
          await axios.delete(`http://localhost:8000/api/guichets/${guichetId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGuichets(guichets.filter((guichet) => guichet.id !== guichetId));
        }
      }
    } catch (err) {
      setError('Erreur lors de la gestion du guichet: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Filter guichets based on guichetier search
  const filteredGuichets = guichets.filter((guichet) =>
    guichet.user?.username?.toLowerCase().includes(guichetierSearch.toLowerCase())
  );

  // Filter clients based on client search
  const filteredClients = clients.filter((client) =>
    client.username.toLowerCase().includes(clientSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-gray-600 text-lg">Chargement...</div>
        <Spiral size="40" speed="0.9" color="blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary-blue flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-2 text-accent-gold animate-pulse" />
            Queue Management System
          </h1>
        </div>
        <nav className="flex space-x-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Déconnexion
          </button>
        </nav>
        <div className="flex items-center text-gray-600">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-accent-turquoise" />
          {new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 animate-slide-in flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="card gold-border flex items-center hover:shadow-lg transition-shadow animate-slide-in">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FontAwesomeIcon icon={faTicketAlt} className="w-6 h-6 text-primary-blue" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-blue">Tickets</h3>
              <p className="text-2xl font-bold text-primary-blue">{stats.totalTickets}</p>
              <p className="text-accent-turquoise text-sm">
                +{Math.round(stats.totalTickets * 0.16)} par rapport à hier
              </p>
            </div>
          </div>
          <div className="card gold-border flex items-center hover:shadow-lg transition-shadow animate-slide-in">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FontAwesomeIcon icon={faClock} className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-blue">Temps d’attente</h3>
              <p className="text-2xl font-bold text-primary-blue">{stats.avgWaitingTime} min</p>
              <p className="text-red-500 text-sm">
                {stats.avgWaitingTime > 0 ? '+3 min par rapport à hier' : 'N/A'}
              </p>
            </div>
          </div>
          <div className="card gold-border flex items-center hover:shadow-lg transition-shadow animate-slide-in">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FontAwesomeIcon icon={faSmile} className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-blue">Satisfaction</h3>
              <p className="text-2xl font-bold text-primary-blue">{stats.satisfaction}%</p>
              <p className="text-accent-turquoise text-sm">
                {stats.satisfaction > 0 ? '+2% par rapport à hier' : 'N/A'}
              </p>
            </div>
          </div>
          <div className="card gold-border flex items-center hover:shadow-lg transition-shadow animate-slide-in">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FontAwesomeIcon icon={faUsers} className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-blue">Guichets actifs</h3>
              <p className="text-2xl font-bold text-primary-blue">
                {stats.activeGuichets}/{guichets.length}
              </p>
            </div>
          </div>
        </div>

        {/* Frequency and Waiting Time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card gold-border hover:shadow-lg transition-shadow animate-slide-in">
            <h3 className="text-lg font-semibold text-primary-blue mb-4">Analyse de la fréquentation</h3>
            <Bar
              data={frequencyData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Fréquentation journalière',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Jours',
                    },
                  },
                },
              }}
            />
          </div>
          <div className="card gold-border hover:shadow-lg transition-shadow animate-slide-in">
            <h3 className="text-lg font-semibold text-primary-blue mb-4">Temps d’attente moyen (minutes)</h3>
            <Line
              data={waitingTimeData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Minutes',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Jours',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Activity History Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card gold-border hover:shadow-lg transition-shadow animate-slide-in">
            <h3 className="text-lg font-semibold text-primary-blue mb-4">Activité des Guichets</h3>
            <Bar
              data={guichetActivityData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Nombre de Tickets Traités',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Guichets',
                    },
                  },
                },
              }}
            />
          </div>
          <div className="card gold-border hover:shadow-lg transition-shadow animate-slide-in">
            <h3 className="text-lg font-semibold text-primary-blue mb-4">Activité des Clients</h3>
            <Bar
              data={clientActivityData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Nombre de Tickets Créés',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Clients',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Guichet Table, Client Table, and Guichet History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Guichet Management */}
            <div className="card gold-border mb-6 hover:shadow-lg transition-shadow animate-slide-in">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsGuichetSectionOpen(!isGuichetSectionOpen)}>
                <h3 className="text-lg font-semibold text-primary-blue">Gestion des guichets</h3>
                <FontAwesomeIcon icon={isGuichetSectionOpen ? faChevronUp : faChevronDown} className="text-primary-blue" />
              </div>
              {isGuichetSectionOpen && (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <label htmlFor="guichetierSearch" className="block text-sm font-medium text-gray-700 mb-1">
                        Rechercher un guichetier
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="guichetierSearch"
                          value={guichetierSearch}
                          onChange={(e) => setGuichetierSearch(e.target.value)}
                          placeholder="Nom du guichetier..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => navigate('/admin/guichets/add')}
                        className="bg-primary-blue text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center transition-colors"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Ajouter
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guichet
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guichetier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGuichets.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                              Aucun guichet disponible.
                            </td>
                          </tr>
                        ) : (
                          filteredGuichets.map((guichet) => (
                            <tr key={guichet.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">{guichet.number}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {guichet.user?.username || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    guichet.status === 'open'
                                      ? 'bg-green-100 text-green-800'
                                      : guichet.status === 'paused'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {guichet.status === 'open' ? 'Ouvert' : guichet.status === 'paused' ? 'En pause' : 'Fermé'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{guichet.service?.name || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleGuichetAction(guichet.id, 'edit')}
                                  className="text-primary-blue hover:text-blue-800 mr-3 transition-colors"
                                  title="Modifier"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  onClick={() => handleGuichetAction(guichet.id, 'delete')}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Supprimer"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Client Management */}
            <div className="card gold-border hover:shadow-lg transition-shadow animate-slide-in">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsClientSectionOpen(!isClientSectionOpen)}>
                <h3 className="text-lg font-semibold text-primary-blue">Gestion des Clients</h3>
                <FontAwesomeIcon icon={isClientSectionOpen ? faChevronUp : faChevronDown} className="text-primary-blue" />
              </div>
              {isClientSectionOpen && (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <label htmlFor="clientSearch" className="block text-sm font-medium text-gray-700 mb-1">
                        Rechercher un client
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="clientSearch"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          placeholder="Nom du client..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tickets Actifs
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                              Aucun client disponible.
                            </td>
                          </tr>
                        ) : (
                          filteredClients.map((client) => {
                            const clientTickets = tickets.filter(
                              (ticket) => ticket.user?.id === client.id && ticket.statut === 'attente'
                            );
                            return (
                              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">{client.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{client.email || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      client.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {client.is_active ? 'Actif' : 'Suspendu'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{clientTickets.length}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Guichet History with Date Filter */}
          <div className="card gold-border hover:shadow-lg transition-shadow animate-slide-in">
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsHistorySectionOpen(!isHistorySectionOpen)}>
              <h3 className="text-lg font-semibold text-primary-blue">Historique des activités des guichets</h3>
              <FontAwesomeIcon icon={isHistorySectionOpen ? faChevronUp : faChevronDown} className="text-primary-blue" />
            </div>
            {isHistorySectionOpen && (
              <>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={fetchFilteredGuichetHistory}
                      className="bg-primary-blue text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center transition-colors"
                    >
                      <FontAwesomeIcon icon={faSearch} className="mr-2" />
                      Filtrer
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Guichet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredGuichetHistory.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            Aucun historique disponible pour cette période.
                          </td>
                        </tr>
                      ) : (
                        filteredGuichetHistory.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {entry.guichet ? `Guichet ${entry.guichet.number}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{entry.ticket_numero || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {entry.action === 'traite' ? 'Traité' : entry.action === 'called' ? 'Appelé' : entry.action}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(entry.created_at).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;