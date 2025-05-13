import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import Chart from 'chart.js/auto';
import 'ldrs/ring';
import { Spiral } from 'ldrs/react';
import './styles.css';

const AppelTicket = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const [guichet, setGuichet] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [treatedTickets, setTreatedTickets] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('closed');
  const [error, setError] = useState('');
  const [ws, setWs] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isPris, setIsPris] = useState(false);
  const [absentTimer, setAbsentTimer] = useState(120);
  const [countdown, setCountdown] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [specificTicketId, setSpecificTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    ticketsProcessedToday: 0,
    averageWaitTime: 0,
    satisfactionRate: 0,
  });
  const [showHistory, setShowHistory] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('attente');
  const [dateFilter, setDateFilter] = useState('');
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = useRef(5000);
  const isConnecting = useRef(false);
  const isMounted = useRef(true);
  const connectionLock = useRef(false);
  const countdownTimerRef = useRef(null);
  const lastStatsFetch = useRef(0);

  // Utiliser l'IP correcte pour le WebSocket
  const WS_BASE_URL = 'ws://192.168.137.123:8000';

  const handleApiError = (err, setError, defaultMessage) => {
    const message = err.response?.data?.error || defaultMessage;
    setError(message);
    toast.error(message);
    console.error('API Error:', err);
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('/api/token/refresh/', { refresh: refreshToken });
      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (err) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return null;
    }
  };

  const handleLogout = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'User logged out');
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setWs(null);
    wsRef.current = null;
    setGuichet(null);
    setTickets([]);
    setTreatedTickets([]);
    setHistory([]);
    setCurrentTicket(null);
    setError('');
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  const fetchStats = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastStatsFetch.current < 60000) return;
    lastStatsFetch.current = now;
    try {
      const today = new Date().toISOString().split('T')[0];
      const historyResponse = await axios.get('/api/guichet/history/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const history = historyResponse.data;

      const ticketsProcessedToday = history.filter(
        (entry) =>
          entry.action === 'traite' &&
          new Date(entry.created_at).toISOString().split('T')[0] === today
      ).length;

      const processedTickets = history.filter((entry) => entry.action === 'traite');
      const waitTimes = [];
      for (const entry of processedTickets) {
        const calledEntry = history.find(
          (h) =>
            h.ticket_numero === entry.ticket_numero &&
            h.action === 'appelé' &&
            new Date(h.created_at) < new Date(entry.created_at)
        );
        if (calledEntry) {
          const waitTime =
            (new Date(entry.created_at) - new Date(calledEntry.created_at)) / 1000 / 60;
          waitTimes.push(waitTime);
        }
      }
      const averageWaitTime =
        waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0;

      const satisfactionRate = 92;

      setStats({
        ticketsProcessedToday,
        averageWaitTime: averageWaitTime.toFixed(1),
        satisfactionRate,
      });

      if (chartRef.current) chartRef.current.destroy();
      if (canvasRef.current) {
        chartRef.current = new Chart(canvasRef.current, {
          type: 'bar',
          data: {
            labels: ['Tickets Traités', 'Temps Moyen (min)', 'Satisfaction (%)'],
            datasets: [
              {
                label: 'Statistiques',
                data: [ticketsProcessedToday, averageWaitTime, satisfactionRate],
                backgroundColor: [
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Valeur' } },
            },
            plugins: { legend: { display: false } },
          },
        });
      }
    } catch (err) {
      console.error('Erreur lors du calcul des statistiques:', err);
    }
  };

  const sendBroadcastNotification = async () => {
    if (!broadcastMessage) {
      toast.error('Veuillez entrer un message à diffuser.');
      return;
    }
    if (!guichet) {
      toast.error('Guichet non chargé.');
      return;
    }
    try {
      await axios.post(
        '/api/notifications/custom/',
        { message: broadcastMessage, bank_id: guichet.bank_id, service_id: guichet.service_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Notification diffusée à tous les clients en attente.');
      setBroadcastMessage('');
    } catch (err) {
      handleApiError(err, setError, 'Erreur lors de l’envoi de la notification');
    }
  };

  const sendSpecificNotification = async () => {
    if (!customMessage || !specificTicketId) {
      toast.error('Veuillez sélectionner un ticket et entrer un message.');
      return;
    }
    if (!guichet) {
      toast.error('Guichet non chargé.');
      return;
    }
    try {
      await axios.post(
        '/api/notifications/custom/',
        { ticket_id: specificTicketId, message: customMessage, bank_id: guichet.bank_id, service_id: guichet.service_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Notification envoyée au ticket ${specificTicketId}.`);
      setCustomMessage('');
      setSpecificTicketId('');
    } catch (err) {
      handleApiError(err, setError, 'Erreur lors de l’envoi de la notification');
    }
  };

  const refreshData = async () => {
    if (!guichet) return;
    try {
      const [ticketsResponse, historyResponse] = await Promise.all([
        axios.get('/api/tickets/list/', {
          params: { bank_id: guichet.bank_id, service_id: guichet.service_id },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/guichet/history/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const waitingTickets = ticketsResponse.data.filter((t) => t.statut === 'attente');
      const treatedTickets = ticketsResponse.data.filter((t) => t.statut === 'traite');
      const positionCounts = {};
      waitingTickets.forEach((t) => {
        if (t.position) positionCounts[t.position] = (positionCounts[t.position] || 0) + 1;
      });
      const duplicates = Object.entries(positionCounts)
        .filter(([_, count]) => count > 1)
        .map(([pos]) => pos);
      if (duplicates.length > 0) {
        console.warn('Duplicate positions detected:', { duplicates, positionCounts });
        toast.warn('Problème de positions en double détecté. Actualisation des données.');
        setTimeout(refreshData, 2000);
      }

      setTickets(
        waitingTickets
          .map((ticket) => ({ ...ticket, notified: false }))
          .sort((a, b) => (a.position || 9999) - (b.position || 9999))
      );
      setTreatedTickets(
        treatedTickets
          .map((ticket) => ({ ...ticket, notified: false }))
          .sort((a, b) => (a.position || 9999) - (b.position || 9999))
      );
      setHistory(historyResponse.data);
      await fetchStats();
      toast.success('Données actualisées.');
    } catch (err) {
      handleApiError(err, setError, 'Erreur lors de l’actualisation des données');
    }
  };

  const deleteTicket = async (ticketId) => {
    const ticket = treatedTickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.statut !== 'traite') {
      toast.error('Seuls les tickets traités peuvent être supprimés.');
      return;
    }
    try {
      await axios.post(`/api/tickets/${ticketId}/delete/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTreatedTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setHistory((prev) => [
        {
          id: Date.now(),
          ticket_id: ticketId,
          ticket_numero: ticket.numero,
          action: 'supprime',
          created_at: new Date(),
        },
        ...prev.slice(0, 50),
      ]);
      toast.success(`Ticket ${ticket.numero} supprimé`);
      setError('');
    } catch (err) {
      const message = err.response?.status === 404
        ? 'Ticket non trouvé ou déjà supprimé.'
        : err.response?.data?.error || 'Erreur lors de la suppression du ticket';
      setError(message);
      toast.error(message);
      console.error('API Error:', err);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error('Veuillez vous connecter');
      navigate('/login');
      return;
    }

    const fetchGuichetAndUser = async () => {
      setIsLoading(true);
      try {
        const guichetResponse = await axios.get('/api/guichets/me/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const guichetData = guichetResponse.data;
        if (!guichetData) {
          setError('Aucun guichet assigné. Contactez l’administrateur.');
          navigate('/login');
          return;
        }
        setGuichet({
          ...guichetData,
          bank_id: guichetData.bank_id || guichetData.bank?.id,
          service_id: guichetData.service_id || guichetData.service?.id,
        });
        setStatus(guichetData.status || 'closed');
        setAbsentTimer(guichetData.auto_absent_timer || 120);

        const userResponse = await axios.get('/api/users/user/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(userResponse.data.username || 'Utilisateur');
      } catch (err) {
        if (err.response?.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) fetchGuichetAndUser();
        } else {
          handleApiError(err, setError, 'Erreur lors du chargement des données');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuichetAndUser();

    return () => {
      isMounted.current = false;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      clearInterval(countdownTimerRef.current);
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [token, navigate]);

  useEffect(() => {
    if (!guichet) return;
    refreshData();
  }, [guichet, token, ticketFilter]);

  useEffect(() => {
    if (!guichet || !token || !isMounted.current) return;

    const connectWebSocket = async () => {
      if (
        connectionLock.current ||
        isConnecting.current ||
        (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
      ) return;

      connectionLock.current = true;
      isConnecting.current = true;

      let currentToken = token;
      if (reconnectAttempts.current > 0) {
        currentToken = await refreshAccessToken();
        if (!currentToken) {
          isConnecting.current = false;
          connectionLock.current = false;
          return;
        }
      }

      const wsUrl = `${WS_BASE_URL}/ws/tickets/?token=${encodeURIComponent(currentToken)}&bank_id=${guichet.bank_id}&service_id=${guichet.service_id}`;
      console.log('Connexion WebSocket:', wsUrl);
      const websocket = new WebSocket(wsUrl);
      wsRef.current = websocket;
      if (isMounted.current) setWs(websocket);

      websocket.onopen = () => {
        if (!isMounted.current) return;
        isConnecting.current = false;
        connectionLock.current = false;
        reconnectAttempts.current = 0;
        reconnectInterval.current = 5000;
        setError('');
        toast.success('Connexion WebSocket établie');
        console.log('WebSocket connecté');
      };

      websocket.onmessage = (event) => {
        if (!isMounted.current) return;
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu:', data);
          if (data.type === 'ticket_update') {
            const ticket = data.ticket;
            const historyAction = data.history_action || ticket.statut;

            // Gérer les tickets annulés
            if (ticket.statut === 'annule' || ticket.statut === 'absent') {
              setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
              setTreatedTickets((prev) => prev.filter((t) => t.id !== ticket.id));
              if (currentTicket?.id === ticket.id) {
                setCurrentTicket(null);
                setCountdown(null);
                setIsPris(false);
                clearInterval(countdownTimerRef.current);
              }
            } else {
              // Mettre à jour les tickets en attente
              setTickets((prev) => {
                let updatedTickets = prev.filter((t) => t.id !== ticket.id);
                if (ticket.statut === 'attente') {
                  updatedTickets.push({ ...ticket, notified: false });
                }
                return updatedTickets.sort((a, b) => (a.position || 9999) - (b.position || 9999));
              });
              // Mettre à jour les tickets traités
              setTreatedTickets((prev) => {
                let updatedTreated = prev.filter((t) => t.id !== ticket.id);
                if (ticket.statut === 'traite') {
                  updatedTreated.push({ ...ticket, notified: false });
                }
                return updatedTreated.sort((a, b) => (a.position || 9999) - (b.position || 9999));
              });
            }

            // Mettre à jour l'historique
            setHistory((prev) => [
              {
                id: Date.now(),
                ticket_id: ticket.id,
                ticket_numero: ticket.numero,
                action: historyAction,
                created_at: new Date(),
              },
              ...prev.slice(0, 50),
            ]);

            // Mettre à jour les statistiques si nécessaire
            if (['traite', 'annule', 'absent'].includes(ticket.statut)) {
              fetchStats(true);
            }

            // Gérer le ticket actuel
            if (ticket.id === currentTicket?.id) {
              setIsPris(ticket.statut === 'traite');
              if (['absent', 'annule', 'traite'].includes(ticket.statut)) {
                setCurrentTicket(null);
                setCountdown(null);
                setIsPris(false);
                clearInterval(countdownTimerRef.current);
              }
            }
          } else if (data.type === 'ticket_delete') {
            setTickets((prev) => prev.filter((t) => t.id !== data.ticket_id));
            setTreatedTickets((prev) => prev.filter((t) => t.id !== data.ticket_id));
            setHistory((prev) => [
              {
                id: Date.now(),
                ticket_id: data.ticket_id,
                ticket_numero: data.ticket_numero,
                action: 'supprime',
                created_at: new Date(),
              },
              ...prev.slice(0, 50),
            ]);
            if (currentTicket?.id === data.ticket_id) {
              setCurrentTicket(null);
              setCountdown(null);
              setIsPris(false);
              clearInterval(countdownTimerRef.current);
              fetchStats(true);
            }
          } else if (data.type === 'guichet_update') {
            setStatus(data.guichet.status);
          } else if (data.type === 'notification_update') {
            toast.info(`Notification: ${data.message}`);
          } else if (data.type === 'heartbeat') {
            console.log('Heartbeat reçu:', data.message);
          }
        } catch (err) {
          console.error('Erreur traitement message WebSocket:', err);
          setError('Erreur de traitement des messages WebSocket');
          toast.error('Erreur de traitement des messages WebSocket');
        }
      };

      websocket.onclose = async (event) => {
        if (!isMounted.current) return;
        isConnecting.current = false;
        connectionLock.current = false;
        let errorMessage = `Connexion WebSocket fermée (code: ${event.code})`;
        console.warn(errorMessage, event.reason);
        if (event.code === 4001) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            connectWebSocket();
            return;
          }
        }
        setError(errorMessage);
        toast.warn(errorMessage);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = reconnectInterval.current + Math.random() * 200;
          reconnectAttempts.current += 1;
          reconnectInterval.current = Math.min(reconnectInterval.current * 2, 30000);
          setTimeout(() => {
            if (isMounted.current) connectWebSocket();
          }, delay);
        } else {
          toast.error('Échec de reconnexion WebSocket.');
          setError('Impossible de maintenir la connexion WebSocket.');
        }
      };

      websocket.onerror = (error) => {
        if (!isMounted.current) return;
        isConnecting.current = false;
        connectionLock.current = false;
        setError('Erreur WebSocket détectée');
        toast.error('Erreur WebSocket détectée.');
        console.error('Erreur WebSocket:', error);
      };
    };

    connectWebSocket();
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      setWs(null);
      wsRef.current = null;
    };
  }, [guichet, token]);

  const toggleGuichet = async (newStatus) => {
    try {
      await axios.post(`/api/guichet/status/`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus(newStatus);
      toast.success(`Guichet ${newStatus === 'open' ? 'ouvert' : newStatus === 'paused' ? 'en pause' : 'fermé'}`);
    } catch (err) {
      handleApiError(err, setError, 'Erreur lors de la mise à jour du guichet');
    }
  };

  const callTicket = async (ticketId = null) => {
    if (!guichet || status !== 'open') {
      const message = !guichet ? 'Guichet non chargé' : 'Ouvrez le guichet avant d’appeler';
      setError(message);
      toast.error(message);
      return;
    }

    const ticket = ticketId
      ? tickets.find((t) => t.id === ticketId && t.statut === 'attente')
      : tickets.find((t) => t.statut === 'attente');
    if (!ticket) {
      setError('Aucun ticket en attente disponible');
      toast.error('Aucun ticket en attente disponible');
      return;
    }

    try {
      const response = await axios.post(
        `/api/tickets/${ticket.id}/call/`,
        { custom_message: customMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentTicket({ ...ticket, ...response.data });
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      setCountdown(absentTimer);
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            markAbsent(ticket.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setCustomMessage('');
      toast.success(`Ticket ${ticket.numero} appelé`);
      setError('');
    } catch (err) {
      handleApiError(err, setError, 'Erreur lors de l’appel du ticket');
    }
  };

  const markPris = async () => {
    if (!currentTicket) return;
    try {
      await axios.post(
        `/api/tickets/${currentTicket.id}/taken/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPris(true);
      setCountdown(null);
      clearInterval(countdownTimerRef.current);
      setTreatedTickets((prev) => [...prev, { ...currentTicket, statut: 'traite' }]);
      setHistory((prev) => [
        {
          id: Date.now(),
          ticket_id: currentTicket.id,
          ticket_numero: currentTicket.numero,
          action: 'traite',
          created_at: new Date(),
        },
        ...prev.slice(0, 50),
      ]);
      toast.success(`Ticket ${currentTicket.numero} marqué comme traité`);
      setCurrentTicket(null);
      setError('');
      fetchStats(true);
    } catch (err) {
      handleApiError(err, setError, 'Erreur lors du marquage comme traité');
    }
  };

  const markAbsent = async (ticketId) => {
    try {
      await axios.post(
        `/api/tickets/${ticketId}/absent/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory((prev) => [
        {
          id: Date.now(),
          ticket_id: ticketId,
          ticket_numero: currentTicket?.numero || tickets.find((t) => t.id === ticketId)?.numero,
          action: 'absent',
          created_at: new Date(),
        },
        ...prev.slice(0, 50),
      ]);
      if (currentTicket?.id === ticketId) {
        setCurrentTicket(null);
        setCountdown(null);
        setIsPris(false);
        clearInterval(countdownTimerRef.current);
      }
      toast.success(`Ticket marqué comme absent`);
      setError('');
      fetchStats(true);
    } catch (err) {
      handleApiError(err, setError, 'Erreur lors du marquage comme absent');
    }
  };

  const statusColor = {
    attente: 'bg-yellow-100 text-yellow-700',
    traite: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    annule: 'bg-gray-100 text-gray-700',
  };

  const filteredHistory = dateFilter
    ? history.filter((entry) => {
        const entryDate = new Date(entry.created_at).toLocaleDateString();
        const filterDate = new Date(dateFilter).toLocaleDateString();
        return entryDate === filterDate;
      })
    : history;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-gray-600 text-lg">Chargement...</div>
        <Spiral size="40" speed="0.9" color="blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      <nav className="bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <div>
            <span className="text-lg font-semibold text-primary-blue">
              Bonjour {userName} - Guichet {guichet?.number || 'N/A'}
            </span>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Déconnexion
        </button>
      </nav>
      <main className="p-8 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 animate-slide-in flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
          </div>
        )}
        {guichet ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="card gold-border mb-8 animate-slide-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-primary-blue flex items-center">
                      <i className="fas fa-desktop mr-2 text-accent-gold animate-pulse"></i>
                      Guichet {guichet.number}
                    </h1>
                    <p className="text-gray-600">{guichet.service?.name || 'Service non défini'}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      status === 'open'
                        ? 'bg-green-100 text-green-700'
                        : status === 'paused'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {status === 'open' ? 'Ouvert' : status === 'paused' ? 'En pause' : 'Fermé'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleGuichet('open')}
                    className={`flex-1 ${
                      status === 'open' ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'
                    } text-white px-4 py-2 rounded flex items-center justify-center`}
                    disabled={status === 'open'}
                  >
                    <i className="fas fa-lock-open mr-2"></i> Ouvrir
                  </button>
                  <button
                    onClick={() => toggleGuichet('paused')}
                    className={`flex-1 ${
                      status === 'paused' ? 'bg-gray-300' : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white px-4 py-2 rounded flex items-center justify-center`}
                    disabled={status === 'paused'}
                  >
                    <i className="fas fa-pause mr-2"></i> Pause
                  </button>
                  <button
                    onClick={() => toggleGuichet('closed')}
                    className={`flex-1 ${
                      status === 'closed' ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600'
                    } text-white px-4 py-2 rounded flex items-center justify-center`}
                    disabled={status === 'closed'}
                  >
                    <i className="fas fa-lock mr-2"></i> Fermer
                  </button>
                </div>
              </div>

              <div className="card gold-border mb-8 animate-slide-in">
                <h2 className="text-xl font-semibold text-primary-blue mb-4">Client Actuel</h2>
                {currentTicket ? (
                  <div className="text-center">
                    <p className="text-5xl font-bold text-primary-blue mb-4">
                      {currentTicket.numero}
                    </p>
                    {countdown !== null && (
                      <p className="text-red-600 mb-4">
                        Temps restant: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                    <div className="flex justify-center space-x-4">
                      {!isPris ? (
                        <>
                          <button
                            onClick={() => callTicket(currentTicket.id)}
                            className="bg-primary-blue text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                            disabled
                          >
                            <i className="fas fa-bullhorn mr-2"></i> Appeler
                          </button>
                          <button
                            onClick={markPris}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                          >
                            <i className="fas fa-check mr-2"></i> Traité
                          </button>
                        </>
                      ) : (
                        <></>
                      )}
                      <button
                        onClick={() => markAbsent(currentTicket.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                      >
                        <i className="fas fa-user-times mr-2"></i> Absent
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-5xl font-bold text-gray-400 mb-4">---</p>
                    <button
                      onClick={() => callTicket()}
                      className="bg-primary-blue text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center mx-auto"
                      disabled={status !== 'open' || tickets.length === 0}
                    >
                      <i className="fas fa-bullhorn mr-2"></i> Appeler suivant
                    </button>
                  </div>
                )}
                {treatedTickets.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-primary-blue mb-2">Tickets Traités</h3>
                    <div className="space-y-2">
                      {treatedTickets.map((ticket) => (
                        <div key={ticket.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span>{ticket.numero} - {ticket.service?.name}</span>
                          <button
                            onClick={() => deleteTicket(ticket.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card gold-border mb-8 animate-slide-in">
                <h2 className="text-xl font-semibold text-primary-blue mb-4">Statistiques</h2>
                <canvas ref={canvasRef} className="w-full h-64"></canvas>
                <div className="mt-4 text-gray-600">
                  <p>Tickets traités aujourd’hui: {stats.ticketsProcessedToday}</p>
                  <p>Temps d’attente moyen: {stats.averageWaitTime} min</p>
                  <p>Taux de satisfaction: {stats.satisfactionRate}%</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="card gold-border mb-8 animate-slide-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-primary-blue">Liste des Tickets</h2>
                  <div className="flex space-x-2">
                    <select
                      value={ticketFilter}
                      onChange={(e) => setTicketFilter(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="attente">En attente</option>
                      <option value="absent">Absent</option>
                      <option value="annule">Annulé</option>
                    </select>
                    <button
                      onClick={refreshData}
                      className="bg-primary-blue text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center"
                    >
                      <i className="fas fa-sync-alt mr-2"></i> Actualiser
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2">Numéro</th>
                        <th className="p-2">Position</th>
                        <th className="p-2">Service</th>
                        <th className="p-2">Statut</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.length > 0 ? (
                        tickets.map((ticket) => (
                          <tr key={ticket.id} className="border-b">
                            <td className="p-2">{ticket.numero}</td>
                            <td className="p-2">{ticket.position ? `${ticket.position}e` : '-'}</td>
                            <td className="p-2">{ticket.service?.name}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded ${statusColor[ticket.statut]}`}>
                                {ticket.statut}
                              </span>
                            </td>
                            <td className="p-2">
                              {ticket.statut === 'attente' && (
                                <button
                                  onClick={() => callTicket(ticket.id)}
                                  className="bg-primary-blue text-white px-2 py-1 rounded hover:bg-blue-700"
                                  disabled={status !== 'open'}
                                >
                                  Appeler
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-2 text-center text-gray-500">
                            Aucun ticket disponible
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card gold-border mb-8 animate-slide-in">
                <h2 className="text-xl font-semibold text-primary-blue mb-4">Notifications</h2>
                <div className="mb-4">
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Message à diffuser à tous les clients..."
                    className="w-full p-2 border rounded"
                    rows="3"
                  ></textarea>
                  <button
                    onClick={sendBroadcastNotification}
                    className="bg-primary-blue text-white px-4 py-2 rounded hover:bg-blue-700 mt-2 flex items-center"
                  >
                    <i className="fas fa-bullhorn mr-2"></i> Diffuser
                  </button>
                </div>
                <div>
                  <select
                    value={specificTicketId}
                    onChange={(e) => setSpecificTicketId(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  >
                    <option value="">Sélectionner un ticket</option>
                    {tickets
                      .filter((t) => t.statut === 'attente')
                      .map((ticket) => (
                        <option key={ticket.id} value={ticket.id}>
                          {ticket.numero}
                        </option>
                      ))}
                  </select>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Message personnalisé pour le ticket sélectionné..."
                    className="w-full p-2 border rounded"
                    rows="3"
                  ></textarea>
                  <button
                    onClick={sendSpecificNotification}
                    className="bg-primary-blue text-white px-4 py-2 rounded hover:bg-blue-700 mt-2 flex items-center"
                  >
                    <i className="fas fa-envelope mr-2"></i> Envoyer
                  </button>
                </div>
              </div>

              <div className="card gold-border animate-slide-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-primary-blue">Historique</h2>
                  <div className="flex space-x-2 items-center">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                    <button
                      onClick={() => setDateFilter('')}
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 flex items-center"
                    >
                      <i className="fas fa-times mr-2"></i> Réinitialiser
                    </button>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-primary-blue hover:underline flex items-center"
                    >
                      {showHistory ? (
                        <>
                          <i className="fas fa-eye-slash mr-2"></i> Masquer
                        </>
                      ) : (
                        <>
                          <i className="fas fa-eye mr-2"></i> Afficher
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {showHistory && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2">Ticket</th>
                          <th className="p-2">Action</th>
                          <th className="p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.length > 0 ? (
                          filteredHistory.map((entry) => (
                            <tr key={entry.id} className="border-b">
                              <td className="p-2">{entry.ticket_numero}</td>
                              <td className="p-2">{entry.action}</td>
                              <td className="p-2">
                                {new Date(entry.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="p-2 text-center text-gray-500">
                              Aucun historique disponible pour cette date
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Chargement des données du guichet...
          </div>
        )}
      </main>
    </div>
  );
};

export default AppelTicket;