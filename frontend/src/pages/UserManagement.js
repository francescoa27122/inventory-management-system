import React, { useState, useEffect } from 'react';
import { usersService } from '../services/api';
import Navigation from '../components/Navigation';
import { useToast } from '../context/ToastContext';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'user'
  });

  const [newPassword, setNewPassword] = useState('');

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersService.getAll();
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        showError(response.data.message);
      }
    } catch (err) {
      showError('Failed to fetch users. Make sure you are logged in as an admin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await usersService.create(newUser);

      if (response.data.success) {
        showSuccess('User created successfully!');
        setShowAddModal(false);
        setNewUser({ username: '', password: '', full_name: '', email: '', role: 'user' });
        fetchUsers();
      } else {
        showError(response.data.message);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create user');
      console.error(err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      const response = await usersService.changePassword(selectedUser.id, newPassword);

      if (response.data.success) {
        showSuccess('Password changed successfully!');
        setShowPasswordModal(false);
        setNewPassword('');
        setSelectedUser(null);
      } else {
        showError(response.data.message);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password');
      console.error(err);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const response = await usersService.update(user.id, {
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active ? 0 : 1
      });

      if (response.data.success) {
        showSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully!`);
        fetchUsers();
      } else {
        showError(response.data.message);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update user');
      console.error(err);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      const response = await usersService.update(user.id, {
        full_name: user.full_name,
        email: user.email,
        role: newRole,
        is_active: user.is_active
      });

      if (response.data.success) {
        showSuccess('User role updated successfully!');
        fetchUsers();
      } else {
        showError(response.data.message);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update user role');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">Loading users...</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="user-management">
        <div className="header">
          <h1>User Management</h1>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add New User
          </button>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className={!user.is_active ? 'inactive' : ''}>
                    <td>{user.username}</td>
                    <td>{user.full_name}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-small"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPasswordModal(true);
                        }}
                      >
                        Change Password
                      </button>
                      <button
                        className={`btn-small ${user.is_active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Add New User</h2>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Change Password for {selectedUser.username}</h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setSelectedUser(null);
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserManagement;
