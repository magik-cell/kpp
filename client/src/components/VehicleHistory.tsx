import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/VehicleHistory.scss';

interface Entry {
  _id: string;
  timestamp: string;
  action: 'entry' | 'exit';
  officerName: string;
}

interface VehicleHistoryProps {
  plateNumber: string;
  onClose: () => void;
}

const VehicleHistory: React.FC<VehicleHistoryProps> = ({ plateNumber, onClose }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [plateNumber]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/entries/history/${plateNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
      setError('');
    } catch (err: any) {
      setError('Помилка завантаження історії');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('uk-UA');
  };

  const getActionText = (action: string) => {
    return action === 'entry' ? 'В\'їзд' : 'Виїзд';
  };

  const getActionClass = (action: string) => {
    return action === 'entry' ? 'entry' : 'exit';
  };

  return (
    <div className="vehicle-history-overlay">
      <div className="vehicle-history-modal">
        <div className="modal-header">
          <h2>Історія руху автомобіля {plateNumber}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {loading ? (
            <div className="loading">Завантаження...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : entries.length === 0 ? (
            <div className="no-entries">
              <p>Історія руху для цього автомобіля відсутня</p>
            </div>
          ) : (
            <>
              <div className="entries-summary">
                <p>Всього записів: <strong>{entries.length}</strong></p>
              </div>
              <div className="entries-list">
                {entries.map((entry) => (
                  <div key={entry._id} className={`entry-item ${getActionClass(entry.action)}`}>
                    <div className="entry-action">
                      <span className={`action-badge ${getActionClass(entry.action)}`}>
                        {getActionText(entry.action)}
                      </span>
                    </div>
                    <div className="entry-details">
                      <div className="entry-time">
                        {formatDate(entry.timestamp)}
                      </div>
                      <div className="entry-officer">
                        Черговий: {entry.officerName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleHistory;