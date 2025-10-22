import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { EntryRecord } from '../types';
import { formatDateTime } from '../utils/dateTime';
import '../styles/VehicleHistory.scss';

interface VehicleHistoryProps {
  plateNumber: string;
  onClose: () => void;
}

const VehicleHistory: React.FC<VehicleHistoryProps> = ({ plateNumber, onClose }) => {
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await apiService.getEntryHistory(plateNumber);
        
        if (response && response.data && Array.isArray(response.data)) {
          setEntries(response.data);
        } else {
          setEntries([]);
        }
      } catch (err: any) {
        console.error('Error fetching vehicle history:', err);
        setError('Помилка завантаження історії');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    if (plateNumber) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [plateNumber]);

  const getActionText = (status: string) => {
    return status === 'entered' ? 'В\'їзд' : 'Виїзд';
  };

  const getActionClass = (status: string) => {
    return status === 'entered' ? 'entry' : 'exit';
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
          ) : !entries || entries.length === 0 ? (
            <div className="no-entries">
              <p>Історія руху для цього автомобіля відсутня</p>
            </div>
          ) : (
            <>
              <div className="entries-summary">
                <p>Всього записів: <strong>{entries.length}</strong></p>
              </div>
              <div className="entries-list">
                {entries && Array.isArray(entries) && entries.map((entry, index) => {
                  if (!entry) {
                    return null;
                  }
                  
                  return (
                    <div key={entry.id || `entry-${index}`} className={`entry-item ${getActionClass(entry.status)}`}>
                      <div className="entry-action">
                        <span className={`action-badge ${getActionClass(entry.status)}`}>
                          {getActionText(entry.status)}
                        </span>
                      </div>
                      <div className="entry-details">
                        <div className="entry-time">
                          {entry.createdAt ? formatDateTime(entry.createdAt) : 'Невідомий час'}
                        </div>
                        <div className="entry-officer">
                          Черговий: {entry.processedBy?.fullName || 'Невідомий'}
                        </div>
                      </div>
                    </div>
                  );
                })}
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