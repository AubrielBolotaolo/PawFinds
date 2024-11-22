import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/appointments.css';

function AppointmentRequests() {
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const currentVetId = localStorage.getItem('userId');
            
            // Fetch appointments and related data
            const [appointmentsRes, petOwnersRes] = await Promise.all([
                fetch('http://localhost:3001/appointments'),
                fetch('http://localhost:3001/petOwners')
            ]);

            const appointments = await appointmentsRes.json();
            const petOwners = await petOwnersRes.json();

            // Filter appointments for current vet and map with pet owner details
            const vetAppointments = appointments
                .filter(apt => apt.clinicId === currentVetId)
                .map(apt => {
                    const owner = petOwners.find(owner => 
                        owner.id === apt.userId
                    );
                    const pet = owner?.pets?.find(pet => 
                        pet.id === apt.petId
                    );
                    
                    return {
                        ...apt,
                        ownerName: owner?.fullName || 'Unknown',
                        petName: pet?.name || 'Unknown',
                        petBreed: pet?.breed || 'Unknown'
                    };
                });

            setAppointments(vetAppointments);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments');
            setLoading(false);
        }
    };

    const handleComplete = async (appointmentId) => {
        try {
            const response = await fetch(`http://localhost:3001/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'completed' })
            });

            if (response.ok) {
                toast.success('Appointment marked as completed');
                fetchAppointments(); // Refresh the list
            } else {
                throw new Error('Failed to update appointment');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            toast.error('Failed to update appointment');
        }
    };

    const handleCancel = async (appointmentId) => {
        try {
            const response = await fetch(`http://localhost:3001/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'cancelled' })
            });

            if (response.ok) {
                toast.success('Appointment cancelled');
                fetchAppointments(); // Refresh the list
            } else {
                throw new Error('Failed to cancel appointment');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            toast.error('Failed to cancel appointment');
        }
    };

    const filteredAppointments = appointments.filter(apt =>
        apt.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.petType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="appointments-container">
            {/* Search Bar */}
            <div className="search-bar">
                <Icon icon="mdi:magnify" className="search-icon" />
                <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Appointments Table */}
            <div className="appointments-table">
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Fur Parent</th>
                            <th>Breed</th>
                            <th>Fur Patient</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="loading">Loading appointments...</td>
                            </tr>
                        ) : filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-appointments">No appointments found</td>
                            </tr>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{formatTime(appointment.time)}</td>
                                    <td>{appointment.ownerName}</td>
                                    <td>{appointment.petBreed}</td>
                                    <td>{appointment.petName}</td>
                                    <td>
                                        <span className={`status-badge ${appointment.status}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        {appointment.status === 'pending' && (
                                            <>
                                                <button 
                                                    className="complete-btn"
                                                    onClick={() => handleComplete(appointment.id)}
                                                >
                                                    Complete
                                                </button>
                                                <button 
                                                    className="cancel-btn"
                                                    onClick={() => handleCancel(appointment.id)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AppointmentRequests;
