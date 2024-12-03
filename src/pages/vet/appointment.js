import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/appointments.css';

function PatientDetailsModal({ appointment, onClose }) {
    if (!appointment) return null;

    return (
        <div className="medical-history-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Fur Patient Information</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="patient-details-section">
                        <h4>Pet Information</h4>
                        <p><strong>Name:</strong> {appointment.petName}</p>
                        <p><strong>Breed:</strong> {appointment.petBreed}</p>
                        <p><strong>Owner:</strong> {appointment.ownerName}</p>
                    </div>
                    <div className="appointment-details-section">
                        <h4>Appointment Details</h4>
                        <p><strong>Service:</strong> {appointment.service}</p>
                        <p><strong>Symptoms:</strong> {appointment.symptoms.join(', ')}</p>
                        <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {appointment.time}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AppointmentRequests() {
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

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
            // Get the appointment details first
            const appointmentRes = await fetch(`http://localhost:3001/appointments/${appointmentId}`);
            const appointmentData = await appointmentRes.json();

            // Get the pet owner's details to access pet information
            const ownerRes = await fetch(`http://localhost:3001/petOwners/${appointmentData.userId}`);
            const ownerData = await ownerRes.json();

            // Find the specific pet
            const pet = ownerData.pets.find(p => p.id === appointmentData.petId);
            
            if (!pet) {
                throw new Error('Pet not found');
            }

            // Get current vet's details
            const vetId = localStorage.getItem('userId');
            const vetRes = await fetch(`http://localhost:3001/veterinarians/${vetId}`);
            const vetData = await vetRes.json();

            // Create fur patient record
            const furPatientData = {
                id: pet.id,
                name: pet.name,
                species: pet.species,
                breed: pet.breed,
                age: pet.age,
                gender: pet.gender || 'Not specified',
                weight: pet.weight || 'Not specified',
                ownerName: ownerData.fullName,
                ownerId: ownerData.id,
                medicalHistory: [
                    {
                        date: new Date().toISOString(),
                        diagnosis: appointmentData.service,
                        treatment: "Initial consultation",
                        veterinarian: vetData.fullName,
                        vetId: vetData.id,
                        notes: appointmentData.symptoms.join(', ')
                    }
                ],
                allergies: pet.allergies || 'None',
                existingConditions: pet.existingConditions || 'None',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Check if fur patient already exists
            const furPatientsRes = await fetch('http://localhost:3001/furPatients');
            const existingFurPatients = await furPatientsRes.json();
            const existingPatient = existingFurPatients.find(fp => fp.id === pet.id);

            if (existingPatient) {
                // Update existing fur patient's medical history
                await fetch(`http://localhost:3001/furPatients/${pet.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        medicalHistory: [...existingPatient.medicalHistory, ...furPatientData.medicalHistory],
                        updatedAt: furPatientData.updatedAt
                    })
                });
            } else {
                // Create new fur patient
                await fetch('http://localhost:3001/furPatients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(furPatientData)
                });
            }

            // Update appointment status
            await fetch(`http://localhost:3001/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'completed',
                    completedAt: new Date().toISOString()
                })
            });

            toast.success('Appointment completed and patient record updated');
            await fetchAppointments(); // Refresh appointments list

        } catch (error) {
            console.error('Error processing appointment:', error);
            toast.error('Failed to process appointment');
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
            {selectedAppointment && (
                <PatientDetailsModal 
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}
            
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
                            <th>Details</th>
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
                                        <button 
                                            className="view-btn"
                                            onClick={() => setSelectedAppointment(appointment)}
                                        >
                                            View
                                        </button>
                                    </td>
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
