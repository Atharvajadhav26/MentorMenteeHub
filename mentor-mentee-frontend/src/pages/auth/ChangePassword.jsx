import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Input, Button, Card } from '../../components/common/UIComponents';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }
    
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/change-password', { oldPassword, newPassword });
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setUser({ ...user, requirePasswordChange: false });
        
        // Redirect based on role
        if (user.role === 'ADMIN') navigate('/admin');
        else if (user.role === 'MENTOR') navigate('/mentor');
        else navigate('/mentee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Change Password</h2>
        <p className="text-center text-slate-500 mb-6 text-sm">
          For security reasons, please set a new password to continue.
        </p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
          
          <Input 
            label="Current Password" 
            type="password" 
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required 
          />
          <Input 
            label="New Password" 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required 
          />
          <Input 
            label="Confirm New Password" 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />
          
          <Button type="submit" isLoading={isLoading} className="btn-primary mt-4">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;
