import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import '../styles/AdminDashboard.scss';

const AdminDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'unit_officer'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getUsers({
        search: searchTerm,
        page: currentPage,
        limit: 10
      });
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('Load users error:', err);
      let errorMessage = 'Помилка завантаження користувачів';
      
      if (err.response?.status === 401) {
        errorMessage = 'Помилка автентифікації. Перезавантажте сторінку та увійдіть заново.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Недостатньо прав для перегляду користувачів';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      role: 'unit_officer'
    });
    setShowModal(true);
  };

  const openEditModal = (userToEdit) => {
    setModalMode('edit');
    setEditingUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      password: '',
      fullName: userToEdit.fullName,
      role: userToEdit.role
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'add') {
        await apiService.createUser(formData);
        setSuccess('Користувача успішно створено');
      } else if (editingUser) {
        const updateData = {
          username: formData.username,
          fullName: formData.fullName,
          role: formData.role
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await apiService.updateUser(editingUser.id, updateData);
        setSuccess('Користувача успішно оновлено');
      }
      
      loadUsers();
      setTimeout(() => closeModal(), 1500);
    } catch (err) {
      console.error('Save user error:', err);
      let errorMessage = 'Помилка збереження користувача';
      
      if (err.response?.status === 401) {
        errorMessage = 'Помилка автентифікації. Перезавантажте сторінку та увійдіть заново.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Недостатньо прав для збереження користувача';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userToDelete) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити користувача "${userToDelete.fullName}"?`)) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await apiService.deleteUser(userToDelete.id);
      setSuccess('Користувача успішно видалено');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete user error:', err);
      let errorMessage = 'Помилка видалення користувача';
      
      if (err.response?.status === 401) {
        errorMessage = 'Помилка автентифікації. Перезавантажте сторінку та увійдіть заново.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Недостатньо прав для видалення користувача';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Адміністратор';
      case 'unit_officer': return 'Черговий інституту';
      case 'kpp_officer': return 'Черговий КПП';
      default: return role;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Управління користувачами</h1>
        <p>Вітаю, {user.fullName}!</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="controls-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Пошук за іменем користувача або повним іменем..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Пошук
          </button>
        </form>

        <button 
          onClick={openAddModal}
          className="btn btn-success"
          disabled={isLoading}
        >
          Додати користувача
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Ім'я користувача</th>
              <th>Повне ім'я</th>
              <th>Роль</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userItem) => (
              <tr key={userItem.id}>
                <td>{userItem.username}</td>
                <td>{userItem.fullName}</td>
                <td>{getRoleDisplayName(userItem.role)}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => openEditModal(userItem)}
                    className="btn btn-sm btn-primary"
                    disabled={isLoading}
                  >
                    Редагувати
                  </button>
                  {userItem.id !== user.id && (
                    <button
                      onClick={() => handleDelete(userItem)}
                      className="btn btn-sm btn-danger"
                      disabled={isLoading}
                    >
                      Видалити
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Завантаження...</p>
          </div>
        )}

        {users.length === 0 && !isLoading && (
          <div className="no-data">
            <p>Користувачів не знайдено</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            className="btn btn-secondary"
          >
            Попередня
          </button>
          
          <span className="page-info">
            Сторінка {currentPage} з {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="btn btn-secondary"
          >
            Наступна
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Додати користувача' : 'Редагувати користувача'}</h3>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="username">Ім'я користувача:</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  {modalMode === 'add' ? 'Пароль:' : 'Новий пароль (залиште порожнім, щоб не змінювати):'}
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={modalMode === 'add'}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Повне ім'я:</label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Роль:</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                  disabled={isLoading}
                >
                  <option value="unit_officer">Черговий інституту</option>
                  <option value="kpp_officer">Черговий КПП</option>
                  <option value="admin">Адміністратор</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Скасувати
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
