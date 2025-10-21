import React, { useState, useEffect, useCallback } from 'react';
import { User, Vehicle, VehicleCreateRequest } from '../types';
import apiService from '../services/api';
import VehicleHistory from './VehicleHistory';

interface UnitOfficerDashboardProps {
  user: User;
}

const UnitOfficerDashboard: React.FC<UnitOfficerDashboardProps> = ({ user }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Стан для модального вікна
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // Стан форми
  const [formData, setFormData] = useState<VehicleCreateRequest>({
    licensePlate: '',
    brand: '',
    model: '',
    owner: '',
    accessType: 'temporary_24h',
    validUntil: ''
  });

  // Пагінація
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Стан для історії
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
    } catch (err: any) {
      setError('Помилка завантаження списку автомобілів');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleSearch = (e: React.FormEvent) => {
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

  const openEditModal = (vehicle: Vehicle) => {
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

  const handleFormChange = (field: keyof VehicleCreateRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = { ...formData };
      
      // Додаємо validUntil тільки якщо потрібно
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити автомобіль ${vehicle.licensePlate}?`)) {
      return;
    }

    try {
      await apiService.deleteVehicle(vehicle.id);
      setSuccess('Автомобіль успішно видалено');
      loadVehicles();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка видалення');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleShowHistory = (licensePlate: string) => {
    setSelectedVehiclePlate(licensePlate);
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setSelectedVehiclePlate('');
  };

  const getAccessTypeText = (type: string) => {
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
        <h2>Пульт чергового частини</h2>
        <button onClick={openAddModal} className="add-button">
          + Додати автомобіль
        </button>
      </div>

      {/* Пошук */}
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

      {/* Повідомлення */}
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

      {/* Таблиця автомобілів */}
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
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
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
                      new Date(vehicle.validUntil).toLocaleDateString('uk-UA') : 
                      'Безстроково'
                    }
                  </td>
                  <td>{new Date(vehicle.createdAt).toLocaleDateString('uk-UA')}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Пагінація */}
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

      {/* Модальне вікно */}
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
                    placeholder="AA1234BB"
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

      {/* Модальне вікно історії */}
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