import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import ApprovalRequests from './approval';
import Image from '../assets/logo.png';
import VetClinic from './vetClinic';

function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [statistics, setStatistics] = useState({
    totalPetOwners: 0,
    totalVeterinarians: 0,
    totalAppointments: 0,
    pendingApprovals: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [petOwnersRes, vetsRes, appointmentsRes, vetRequestsRes] = await Promise.all([
        fetch('http://localhost:3001/petOwners'),
        fetch('http://localhost:3001/veterinarians'),
        fetch('http://localhost:3001/appointments'),
        fetch('http://localhost:3001/veterinarianRequests')
      ]);

      if (!petOwnersRes.ok || !vetsRes.ok || !appointmentsRes.ok || !vetRequestsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [petOwners, veterinarians, appointments, vetRequests] = await Promise.all([
        petOwnersRes.json(),
        vetsRes.json(),
        appointmentsRes.json(),
        vetRequestsRes.json()
      ]);

      setStatistics({
        totalPetOwners: Array.isArray(petOwners) ? petOwners.length : 0,
        totalVeterinarians: Array.isArray(veterinarians) ? veterinarians.length : 0,
        totalAppointments: Array.isArray(appointments) ? appointments.length : 0,
        pendingApprovals: Array.isArray(vetRequests) 
          ? vetRequests.filter(req => req.status === 'pending').length 
          : 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="home-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
      <div className="logo-container">
          <img src={Image} alt="Logo" />
        </div>
        
        <div 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <Icon icon="mdi:monitor" className="icon" />
          Dashboard
        </div>

        <div 
          className={`nav-item ${activeView === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveView('approvals')}
        >
          <Icon icon="mdi:account-check" className="icon" />
          Approval Requests
        </div>

        <div 
          className={`nav-item ${activeView === 'clinics' ? 'active' : ''}`}
          onClick={() => setActiveView('clinics')}
        >
          <Icon icon="mdi:hospital-building" className="icon" />
          Approved Clinics
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <Icon icon="mdi:logout" className="icon"/>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeView === 'dashboard' ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:account-group" />
              </div>
              <div className="stat-details">
                <h3>Pet Owners</h3>
                <p>{statistics.totalPetOwners}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:doctor" />
              </div>
              <div className="stat-details">
                <h3>Veterinarians</h3>
                <p>{statistics.totalVeterinarians}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:calendar-check" />
              </div>
              <div className="stat-details">
                <h3>Total Appointments</h3>
                <p>{statistics.totalAppointments}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:account-clock" />
              </div>
              <div className="stat-details">
                <h3>Pending Approvals</h3>
                <p>{statistics.pendingApprovals}</p>
              </div>
            </div>
          </div>
        ) : activeView === 'approvals' ? (
          <ApprovalRequests />
        ) : activeView === 'clinics' ? (
          <VetClinic />
        ) : null}
      </div>

      {/* Header */}
      <div className="header">
        <h2>{activeView.toUpperCase()}</h2>
        <div className="user-info">
          <div className='user-text'>
            <span>Administrator</span>
            <span className="user-type">Admin Panel</span>
          </div>
          <div className="avatar">
            <Icon icon="mdi:account-circle" className="icon"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;