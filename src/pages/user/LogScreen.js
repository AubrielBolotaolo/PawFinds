import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/LogScreen.css';

function LogScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first (default)
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userId = localStorage.getItem('userId');
        
        // Fetch all required data
        const [appointmentsRes, veterinariansRes, petOwnersRes] = await Promise.all([
          fetch(`http://localhost:3001/appointments`),
          fetch(`http://localhost:3001/veterinarians`),
          fetch(`http://localhost:3001/petOwners/${userId}`)
        ]);

        const appointments = await appointmentsRes.json();
        const veterinarians = await veterinariansRes.json();
        const petOwnerData = await petOwnersRes.json();

        // Create maps for quick lookup
        const clinicsMap = new Map(
          veterinarians.map(vet => [vet.id, vet.clinic])
        );
        const petsMap = new Map(
          petOwnerData.pets.map(pet => [pet.id, pet])
        );

        // Filter and format appointments
        const userAppointments = appointments
          .filter(apt => apt.userId === userId)
          .map(appointment => ({
            id: appointment.id,
            date: new Date(appointment.date),
            time: appointment.time,
            status: appointment.status || 'pending',
            clinic: {
              name: clinicsMap.get(appointment.clinicId)?.name || 'Unknown Clinic',
              address: {
                street: clinicsMap.get(appointment.clinicId)?.address?.street || 'Unknown Street',
                barangay: clinicsMap.get(appointment.clinicId)?.address?.barangay || 'Unknown Barangay',
                city: clinicsMap.get(appointment.clinicId)?.address?.city || 'Unknown City'
              }
            },
            pet: {
              name: petsMap.get(appointment.petId)?.name || 'Unknown Pet',
              breed: petsMap.get(appointment.petId)?.breed || 'Unknown Breed'
            },
            service: appointment.service || 'Service Type'
          }));

        console.log('Final formatted appointments:', userAppointments);
        setAppointments(userAppointments);
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

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const searchedAppointments = sortedAppointments.filter(appointment => {
    const searchString = searchTerm.toLowerCase();
    const appointmentDate = new Date(appointment.date);
    
    // Format date in different ways for flexible searching
    const formattedDate = {
      full: appointmentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }).toLowerCase(),
      short: appointmentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }).toLowerCase(),
      monthDay: `${appointmentDate.getDate()} ${appointmentDate.toLocaleDateString('en-US', { month: 'short' })}`.toLowerCase(),
      monthOnly: appointmentDate.toLocaleDateString('en-US', { month: 'long' }).toLowerCase(),
      monthShort: appointmentDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()
    };

    return (
      appointment.clinic.name.toLowerCase().includes(searchString) ||
      appointment.pet.name.toLowerCase().includes(searchString) ||
      appointment.service.toLowerCase().includes(searchString) ||
      appointment.status.toLowerCase().includes(searchString) ||
      formattedDate.full.includes(searchString) ||
      formattedDate.short.includes(searchString) ||
      formattedDate.monthDay.includes(searchString) ||
      formattedDate.monthOnly.includes(searchString) ||
      formattedDate.monthShort.includes(searchString)
    );
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
          <div className="search-container">
            <div className="search-bar">
              <Icon icon="mdi:magnify" className="search-icon" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button 
            className="filter-btn sort-btn"
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          >
            <Icon 
              icon={sortOrder === 'desc' ? "mdi:sort-descending" : "mdi:sort-ascending"} 
              className="sort-icon"
            />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      <div className="appointments-list">
        {searchedAppointments.length === 0 ? (
          <div className="no-appointments">
            <Icon icon="mdi:calendar-blank" />
            <p>No appointments found</p>
          </div>
        ) : (
          searchedAppointments.map(appointment => (
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
                  <span>{appointment.clinic.name} ({appointment.clinic.address.street}, {appointment.clinic.address.barangay}, {appointment.clinic.address.city})</span>
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