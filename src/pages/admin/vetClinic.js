import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/vetClinic.css';

function VetClinic() {
    const [clinics, setClinics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            const response = await fetch('http://localhost:3001/veterinarians');
            if (!response.ok) throw new Error('Failed to fetch clinics');
            const data = await response.json();
            
            // Filter only approved veterinarians
            const approvedClinics = data.filter(vet => vet.status === 'approved');
            setClinics(approvedClinics);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load clinics');
            setLoading(false);
        }
    };

    const filteredClinics = clinics.filter(clinic =>
        (clinic.clinic?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.clinic?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
    );

    return (
        <div className="clinics-container">
            {/* Search Bar */}
            <div className="search-bar">
                <Icon icon="mdi:magnify" className="search-icon" />
                <input
                    type="text"
                    placeholder="Search clinics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Clinics Table */}
            <div className="table-container">
                <table className="clinics-table">
                    <thead>
                        <tr>
                            <th>Clinic Name</th>
                            <th>Veterinarian</th>
                            <th>Address</th>
                            <th>Contact</th>
                            <th>Schedule</th>
                            <th>Services</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="loading">Loading clinics...</td>
                            </tr>
                        ) : filteredClinics.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-clinics">No clinics found</td>
                            </tr>
                        ) : (
                            filteredClinics.map((clinic, index) => (
                                <tr key={`${clinic.id}-${index}`}>
                                    <td>{clinic.clinic?.name || 'N/A'}</td>
                                    <td>{clinic.fullName || 'N/A'}</td>
                                    <td>
                                        {clinic.clinic?.address ? 
                                            `${clinic.clinic.address.street || ''}, ${clinic.clinic.address.barangay || ''}, ${clinic.clinic.address.city || ''}`
                                            : 'No address provided'
                                        }
                                    </td>
                                    <td>{clinic.phoneNumber || 'N/A'}</td>
                                    <td>
                                        {clinic.clinic?.schedule?.days ? (
                                            <>
                                                {`${clinic.clinic.schedule.days.start || 'N/A'} - ${clinic.clinic.schedule.days.end || 'N/A'}`}
                                                <br />
                                                {`${clinic.clinic.schedule.hours.open || 'N/A'} - ${clinic.clinic.schedule.hours.close || 'N/A'}`}
                                            </>
                                        ) : (
                                            'Schedule not provided'
                                        )}
                                    </td>
                                    <td>
                                        <ul className="services-list">
                                            {clinic.clinic?.services ? 
                                                clinic.clinic.services.map((service, serviceIndex) => (
                                                    <li key={`${clinic.id}-service-${serviceIndex}`}>{service}</li>
                                                ))
                                                : <li>No services listed</li>
                                            }
                                        </ul>
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

export default VetClinic;
