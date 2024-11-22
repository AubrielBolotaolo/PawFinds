import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/LogScreen.css';

function LogScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:3001/appointments?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        const formattedAppointments = data.map(appointment => ({
          id: appointment.id,
          date: new Date(appointment.date),
          time: appointment.time,
          status: appointment.status || 'pending',
          clinic: {
            name: appointment.clinicName || 'Clinic Name',
          },
          pet: {
            name: appointment.petName || 'Pet Name',
            breed: appointment.breed || 'Breed',
          },
          service: appointment.service || 'Service Type'
        }));
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'var(--warning-color, #ffc107)';
      case 'completed': return 'var(--success-color, #28a745)';
      case 'cancelled': return 'var(--danger-color, #dc3545)';
      default: return 'var(--primary-color, #007bff)';
    }
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h2>My Appointments</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="no-appointments">
            <Icon icon="mdi:calendar-blank" />
            <p>No appointments found</p>
          </div>
        ) : (
          filteredAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <div className="date-block">
                  <div className="month">
                    {formatDate(appointment.date)}
                  </div>
                  <div className="day">
                    {new Date(appointment.date).getDate()}
                  </div>
                </div>
                <div className="status-badge" style={{ backgroundColor: getStatusColor(appointment.status) }}>
                  {appointment.status}
                </div>
              </div>

              <div className="appointment-details">
                <div className="detail-item">
                  <Icon icon="mdi:clock-outline" />
                  <span>{appointment.time}</span>
                </div>
                <div className="detail-item">
                  <Icon icon="mdi:hospital-building" />
                  <span>{appointment.clinic.name}</span>
                </div>
                <div className="detail-item">
                  <Icon icon="mdi:paw" />
                  <span>{appointment.pet.name} ({appointment.pet.breed})</span>
                </div>
                <div className="detail-item">
                  <Icon icon="mdi:medical-bag" />
                  <span>{appointment.service}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogScreen; 