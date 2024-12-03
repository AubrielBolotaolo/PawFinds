import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import '../../styles/consultation.css';

function ConsultationForm() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [consultationData, setConsultationData] = useState({
        diagnosis: '',
        treatment: '',
        notes: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch('http://localhost:3001/furPatients');
            const data = await response.json();
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            toast.error('Failed to load patients');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const patient = patients.find(p => p.id === selectedPatient);
            const vetId = localStorage.getItem('userId');
            const vetRes = await fetch(`http://localhost:3001/veterinarians/${vetId}`);
            const vetData = await vetRes.json();

            const newRecord = {
                date: new Date().toISOString(),
                diagnosis: consultationData.diagnosis,
                treatment: consultationData.treatment,
                veterinarian: vetData.fullName,
                vetId: vetData.id,
                notes: consultationData.notes
            };

            const updatedHistory = [...patient.medicalHistory, newRecord];

            await fetch(`http://localhost:3001/furPatients/${selectedPatient}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    medicalHistory: updatedHistory,
                    updatedAt: new Date().toISOString()
                })
            });

            toast.success('Consultation record added successfully');
            setConsultationData({ diagnosis: '', treatment: '', notes: '' });
            setSelectedPatient('');
        } catch (error) {
            console.error('Error saving consultation:', error);
            toast.error('Failed to save consultation');
        }
    };

    return (
        <div className="consultation-form">
            <h2>NEW CONSULTATION RECORD</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Select Patient:</label>
                    <select 
                        value={selectedPatient} 
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        required
                    >
                        <option value="">Select a patient</option>
                        {patients.map(patient => (
                            <option key={patient.id} value={patient.id}>
                                {patient.name} ({patient.ownerName})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Diagnosis:</label>
                    <input
                        type="text"
                        value={consultationData.diagnosis}
                        onChange={(e) => setConsultationData({
                            ...consultationData,
                            diagnosis: e.target.value
                        })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Treatment:</label>
                    <input
                        type="text"
                        value={consultationData.treatment}
                        onChange={(e) => setConsultationData({
                            ...consultationData,
                            treatment: e.target.value
                        })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Notes:</label>
                    <textarea
                        value={consultationData.notes}
                        onChange={(e) => setConsultationData({
                            ...consultationData,
                            notes: e.target.value
                        })}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Save Consultation
                </button>
            </form>
        </div>
    );
}

export default ConsultationForm; 