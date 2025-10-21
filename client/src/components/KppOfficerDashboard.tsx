import React, { useState, useEffect } from 'react';
import { User, VehicleCheckResponse } from '../types';
import apiService from '../services/api';

interface KppOfficerDashboardProps {
  user: User;
}

const KppOfficerDashboard: React.FC<KppOfficerDashboardProps> = ({ user }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState<VehicleCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentVehiclesCount, setCurrentVehiclesCount] = useState(0);

  useEffect(() => {
    loadCurrentVehiclesCount();
  }, []);

  const loadCurrentVehiclesCount = async () => {
    try {
      const stats = await apiService.getCurrentVehiclesOnSite();
      setCurrentVehiclesCount(stats.count);
    } catch (err) {
      console.error('Помилка завантаження статистики:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');
    setVehicleInfo(null);

    try {
      const response = await apiService.checkVehicle(licensePlate.trim());
      setVehicleInfo(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка перевірки автомобіля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEntry = async () => {
    if (!vehicleInfo) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.toggleEntry(vehicleInfo.vehicle.licensePlate);
      setSuccess(response.message);
      
      // Оновлюємо інформацію про автомобіль
      const updatedInfo = await apiService.checkVehicle(vehicleInfo.vehicle.licensePlate);
      setVehicleInfo(updatedInfo);
      
      // Оновлюємо лічильник
      loadCurrentVehiclesCount();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка обробки проїзду');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setLicensePlate('');
    setVehicleInfo(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="kpp-dashboard">
      <div className="dashboard-header">
        <h2>Пульт чергового КПП</h2>
        <div className="stats-card">
          <h3>Автомобілів на території</h3>
          <div className="stats-number">{currentVehiclesCount}</div>
        </div>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label htmlFor="licensePlate">Номер автомобіля:</label>
            <input
              type="text"
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="Введіть номер авто (наприклад: АА1234ВВ)"
              required
              disabled={isLoading}
              className="license-input"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={isLoading || !licensePlate.trim()}
              className="search-button"
            >
              {isLoading ? 'Перевірка...' : 'Перевірити'}
            </button>
            
            <button 
              type="button" 
              onClick={clearForm}
              className="clear-button"
              disabled={isLoading}
            >
              Очистити
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="message error-message">
          <h3>❌ Доступ заборонено</h3>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <h3>✅ Операція виконана</h3>
          <p>{success}</p>
        </div>
      )}

      {vehicleInfo && !error && (
        <div className={`vehicle-info ${vehicleInfo.allowed ? 'allowed' : 'denied'}`}>
          <div className="info-header">
            <h3>
              {vehicleInfo.allowed ? '✅ Дозвіл на проїзд' : '❌ Доступ заборонено'}
            </h3>
            <p className="info-message">{vehicleInfo.message}</p>
          </div>

          <div className="vehicle-details">
            <div className="detail-row">
              <span className="label">Номер:</span>
              <span className="value">{vehicleInfo.vehicle.licensePlate}</span>
            </div>
            <div className="detail-row">
              <span className="label">Марка/Модель:</span>
              <span className="value">{vehicleInfo.vehicle.brand} {vehicleInfo.vehicle.model}</span>
            </div>
            <div className="detail-row">
              <span className="label">Власник:</span>
              <span className="value">{vehicleInfo.vehicle.owner}</span>
            </div>
            <div className="detail-row">
              <span className="label">Тип доступу:</span>
              <span className="value">
                {vehicleInfo.vehicle.accessType === 'permanent' ? 'Постійний' :
                 vehicleInfo.vehicle.accessType === 'temporary_24h' ? 'Тимчасовий (24 год)' :
                 'Тимчасовий (до дати)'}
              </span>
            </div>
            {vehicleInfo.vehicle.validUntil && (
              <div className="detail-row">
                <span className="label">Дійсний до:</span>
                <span className="value">
                  {new Date(vehicleInfo.vehicle.validUntil).toLocaleString('uk-UA')}
                </span>
              </div>
            )}
          </div>

          {vehicleInfo.lastEntry && (
            <div className="last-entry">
              <h4>Останній проїзд:</h4>
              <div className="entry-details">
                <div className="detail-row">
                  <span className="label">Статус:</span>
                  <span className={`value status-${vehicleInfo.lastEntry.status}`}>
                    {vehicleInfo.lastEntry.status === 'entered' ? 'На території' : 'Покинув територію'}
                  </span>
                </div>
                {vehicleInfo.lastEntry.entryTime && (
                  <div className="detail-row">
                    <span className="label">Час в'їзду:</span>
                    <span className="value">
                      {new Date(vehicleInfo.lastEntry.entryTime).toLocaleString('uk-UA')}
                    </span>
                  </div>
                )}
                {vehicleInfo.lastEntry.exitTime && (
                  <div className="detail-row">
                    <span className="label">Час виїзду:</span>
                    <span className="value">
                      {new Date(vehicleInfo.lastEntry.exitTime).toLocaleString('uk-UA')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {vehicleInfo.allowed && (
            <div className="action-section">
              <button 
                onClick={handleToggleEntry}
                disabled={isLoading}
                className="toggle-button"
              >
                {isLoading ? 'Обробка...' : 
                 vehicleInfo.lastEntry?.status === 'entered' ? 
                 'Відмітити виїзд' : 'Відмітити в\'їзд'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KppOfficerDashboard;