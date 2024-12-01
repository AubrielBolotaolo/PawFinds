import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/patients.css';

function MedicalHistoryModal({ patient, onClose }) {
    if (!patient) return null;

    return (
        <div className="medical-history-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{patient.name}'s Medical History</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                        <div className="history-list">
                            {patient.medicalHistory.map((record, index) => (
                                <div key={index} className="history-item">
                                    <div className="history-date">
                                        {new Date(record.date).toLocaleDateString()}
                                    </div>
                                    <div className="history-details">
                                        <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                        <p><strong>Treatment:</strong> {record.treatment}</p>
                                        <p><strong>Veterinarian:</strong> {record.veterinarian}</p>
                                        <p><strong>Notes:</strong> {record.notes}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-history">No medical history available</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function FurPatients() {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const currentVetId = localStorage.getItem('userId');
            
            // Fetch fur patients and vet data
            const [furPatientsRes, vetRes] = await Promise.all([
                fetch('http://localhost:3001/furPatients'),
                fetch(`http://localhost:3001/veterinarians/${currentVetId}`)
            ]);

            if (!furPatientsRes.ok || !vetRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const furPatients = await furPatientsRes.json();
            const vetData = await vetRes.json();

            // Filter patients for the current vet's clinic
            const clinicPatients = furPatients.filter(patient => 
                patient.medicalHistory?.some(record => 
                    record.vetId === currentVetId || 
                    record.veterinarian === vetData.fullName
                )
            );

            setPatients(clinicPatients);
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
                                    <strong>Weight:</strong> {patient.weight}
                                </div>
                            </div>
                            <div className="patient-details">
                                <div className="details-section">
                                    <h4>Allergies</h4>
                                    <p>{patient.allergies || 'None'}</p>
                                </div>
                                <div className="details-section">
                                    <h4>Existing Conditions</h4>
                                    <p>{patient.existingConditions || 'None'}</p>
                                </div>
                                <div className="details-section">
                                    <h4>Latest Medical Record</h4>
                                    {patient.medicalHistory && patient.medicalHistory.length > 0
                                        ? (
                                            <p>{patient.medicalHistory[patient.medicalHistory.length - 1].description}</p>
                                        ) : (
                                            <p>No medical records available</p>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="patient-actions">
                                <button 
                                    className="medical-history-btn"
                                    onClick={() => setSelectedPatient(patient)}
                                >
                                    <Icon icon="mdi:history" className="button-icon" />
                                    Medical History
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Medical History Modal */}
            {selectedPatient && (
                <MedicalHistoryModal 
                    patient={selectedPatient} 
                    onClose={() => setSelectedPatient(null)} 
                />
            )}
        </div>
    );
}

export default FurPatients;
