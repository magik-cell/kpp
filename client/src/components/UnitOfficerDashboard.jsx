import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import VehicleHistory from './VehicleHistory';
import { formatDate } from '../utils/dateTime';

const validateUkrainianLicensePlate = (licensePlate) => {
  const ukrainianPlateRegex = /^[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{1,2}[0-9]{3,4}[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{0,2}$|^[0-9]{4}[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{2}$/;
  return ukrainianPlateRegex.test(licensePlate.toUpperCase());
};

const UnitOfficerDashboard = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    owner: '',
    accessType: 'temporary_24h',
    validUntil: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showHistory, setShowHistory] = useState(false);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState('');

  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getVehicles({
        search: searchTerm,
        page: currentPage,
        limit: 10
      });
      setVehicles(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError('Помилка завантаження списку автомобілів');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadVehicles();
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingVehicle(null);
    setFormData({
      licensePlate: '',
      brand: '',
      model: '',
      owner: '',
      accessType: 'temporary_24h',
      validUntil: ''
    });
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setModalMode('edit');
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      owner: vehicle.owner,
      accessType: vehicle.accessType,
      validUntil: vehicle.validUntil ? new Date(vehicle.validUntil).toISOString().slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setError('');
    setSuccess('');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateUkrainianLicensePlate(formData.licensePlate)) {
      setError('Неправильний формат номера автомобіля. Використовуйте українські літери та цифри (наприклад: АА1234ВВ)');
      setIsLoading(false);
      return;
    }

    try {
      const submitData = { ...formData };
      if (formData.accessType === 'temporary_custom' && formData.validUntil) {
        submitData.validUntil = formData.validUntil;
      } else if (formData.accessType === 'permanent') {
        delete submitData.validUntil;
      }

      if (modalMode === 'add') {
        await apiService.createVehicle(submitData);
        setSuccess('Автомобіль успішно додано');
      } else if (editingVehicle) {
        await apiService.updateVehicle(editingVehicle.id, submitData);
        setSuccess('Автомобіль успішно оновлено');
      }

      loadVehicles();
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити автомобіль ${vehicle.licensePlate}?`)) {
      return;
    }

    try {
      await apiService.deleteVehicle(vehicle.id);
      setSuccess('Автомобіль успішно видалено');
      loadVehicles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка видалення');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleShowHistory = (licensePlate) => {
    setSelectedVehiclePlate(licensePlate);
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setSelectedVehiclePlate('');
  };

  const getAccessTypeText = (type) => {
    switch (type) {
      case 'permanent': return 'Постійний';
      case 'temporary_24h': return '24 години';
      case 'temporary_custom': return 'До дати';
      default: return type;
    }
  };

  return (
    <div className="unit-dashboard">
      <div className="dashboard-header">
        <h2>Пульт чергового інституту</h2>
        <button onClick={openAddModal} className="add-button">
          + Додати автомобіль
        </button>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Пошук за номером або власником..."
            className="search-input"
          />
          <button type="submit" disabled={isLoading} className="search-button">
            Пошук
          </button>
        </form>
      </div>

      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="message success-message">
          {success}
        </div>
      )}

      <div className="vehicles-table-container">
        {isLoading ? (
          <div className="loading">Завантаження...</div>
        ) : vehicles.length === 0 ? (
          <div className="no-data">Автомобілі не знайдені</div>
        ) : (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Марка/Модель</th>
                <th>Власник</th>
                <th>Тип доступу</th>
                <th>Дійсний до</th>
                <th>Додано</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle, index) => {
                if (!vehicle.id) {
                  console.warn('Vehicle without id:', vehicle, 'using fallback key:', `vehicle-${index}`);
                }
                return (
                <tr key={vehicle.id || `vehicle-${index}`}>
                  <td className="license-plate">
                    <button 
                      className="license-plate-button"
                      onClick={() => handleShowHistory(vehicle.licensePlate)}
                      title="Переглянути історію руху"
                    >
                      {vehicle.licensePlate}
                    </button>
                  </td>
                  <td>{vehicle.brand} {vehicle.model}</td>
                  <td>{vehicle.owner}</td>
                  <td>
                    <span className={`access-type access-${vehicle.accessType}`}>
                      {getAccessTypeText(vehicle.accessType)}
                    </span>
                  </td>
                  <td>
                    {vehicle.validUntil ? 
                      formatDate(vehicle.validUntil) : 
                      'Безстроково'
                    }
                  </td>
                  <td>{formatDate(vehicle.createdAt)}</td>
                  <td className="actions">
                    <button 
                      onClick={() => openEditModal(vehicle)}
                      className="edit-button"
                      title="Редагувати"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(vehicle)}
                      className="delete-button"
                      title="Видалити"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            ← Попередня
          </button>
          
          <span className="pagination-info">
            Сторінка {currentPage} з {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Наступна →
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === 'add' ? 'Додати автомобіль' : 'Редагувати автомобіль'}
              </h3>
              <button onClick={closeModal} className="close-button">×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && (
                <div className="message error-message">
                  {error}
                </div>
              )}

              {success && (
                <div className="message success-message">
                  {success}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Номер автомобіля *</label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => handleFormChange('licensePlate', e.target.value.toUpperCase())}
                    placeholder="АА1234ВВ"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Марка *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleFormChange('brand', e.target.value)}
                    placeholder="Toyota"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Модель *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleFormChange('model', e.target.value)}
                    placeholder="Camry"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Власник *</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => handleFormChange('owner', e.target.value)}
                    placeholder="Іван Іванович Іванов"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Тип доступу *</label>
                  <select
                    value={formData.accessType}
                    onChange={(e) => handleFormChange('accessType', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="temporary_24h">Тимчасовий (24 години)</option>
                    <option value="temporary_custom">Тимчасовий (до дати)</option>
                    <option value="permanent">Постійний</option>
                  </select>
                </div>

                {formData.accessType === 'temporary_custom' && (
                  <div className="form-group">
                    <label>Дійсний до *</label>
                    <input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => handleFormChange('validUntil', e.target.value)}
                      required
                      disabled={isLoading}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeModal}
                  disabled={isLoading}
                  className="cancel-button"
                >
                  Скасувати
                </button>
                
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="save-button"
                >
                  {isLoading ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistory && (
        <VehicleHistory 
          plateNumber={selectedVehiclePlate}
          onClose={handleCloseHistory}
        />
      )}
    </div>
  );
};

export default UnitOfficerDashboard;
