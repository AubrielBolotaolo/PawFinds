import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/patients.css';

function FurPatients() {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const currentVetId = localStorage.getItem('userId');
            
            // Fetch appointments and pet owners
            const [appointmentsRes, petOwnersRes] = await Promise.all([
                fetch('http://localhost:3001/appointments'),
                fetch('http://localhost:3001/petOwners')
            ]);

            const appointments = await appointmentsRes.json();
            const petOwners = await petOwnersRes.json();

            // Get unique pets from appointments for this vet
            const vetAppointments = appointments.filter(apt => apt.clinicId === currentVetId);
            const uniquePetIds = [...new Set(vetAppointments.map(apt => apt.petId))];

            // Get pet details
            const patientsData = uniquePetIds.map(petId => {
                const petOwner = petOwners.find(owner => 
                    owner.pets.some(pet => pet.id === petId)
                );
                const pet = petOwner?.pets.find(pet => pet.id === petId);
                
                if (pet) {
                    return {
                        ...pet,
                        ownerName: petOwner.fullName,
                        ownerPhone: petOwner.phoneNumber
                    };
                }
                return null;
            }).filter(pet => pet !== null);

            setPatients(patientsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching patients:', error);
            toast.error('Failed to load patients');
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patients-container">
            {/* Search Bar */}
            <div className="search-bar">
                <Icon icon="mdi:magnify" className="search-icon" />
                <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patients Grid */}
            {loading ? (
                <div className="loading">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
                <div className="no-patients">No patients found</div>
            ) : (
                <div className="patients-grid">
                    {filteredPatients.map((patient) => (
                        <div key={patient.id} className="patient-card">
                            <div className="patient-image">
                                {patient.image ? (
                                    <img src={patient.image} alt={patient.name} />
                                ) : (
                                    <Icon icon="mdi:paw" className="default-image" />
                                )}
                            </div>
                            <div className="patient-info">
                                <div className="info-row">
                                    <strong>Name:</strong> {patient.name}
                                </div>
                                <div className="info-row">
                                    <strong>Age:</strong> {patient.age}
                                </div>
                                <div className="info-row">
                                    <strong>Breed:</strong> {patient.breed}
                                </div>
                                <div className="info-row">
                                    <strong>Species:</strong> {patient.species}
                                </div>
                                <div className="info-row">
                                    <strong>Owner:</strong> {patient.ownerName}
                                </div>
                                <div className="info-row">
                                    <strong>Contact:</strong> {patient.ownerPhone}
                                </div>
                            </div>
                            <div className="patient-details">
                                <div className="details-section">
                                    <h4>Special Needs</h4>
                                    <p>{patient.specialNeeds || 'None'}</p>
                                </div>
                                <div className="details-section">
                                    <h4>Medical History</h4>
                                    <p>{patient.medicalHistory || 'None'}</p>
                                </div>
                                <div className="details-section">
                                    <h4>Other Info</h4>
                                    <p>{patient.otherInfo || 'None'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FurPatients;
