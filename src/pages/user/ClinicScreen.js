import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../styles/ClinicScreen.css';
import { Icon } from '@iconify/react';

const ClinicScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await fetch('http://localhost:3001/veterinarians');
      if (!response.ok) {
        throw new Error('Failed to fetch clinics');
      }
      const data = await response.json();
      setClinics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const filteredClinics = clinics.filter(clinic => {
    if (!clinic || !clinic.clinic || !clinic.clinic.name) return false;
    return clinic.clinic.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="loading">Loading clinics...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (clinics.length === 0) return <div className="no-clinics">No clinics found</div>;

  return (
    <div className="clinic-screen">
      <div className="clinic-screen-layout">
        <div className="left-section">
          <div className="search-container">
            <div className="search-wrapper">
              <Icon icon="mdi:search" className="search-icon" />
              <input
                type="text"
                className="search-bar"
                placeholder="Search for Clinics"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="clinics-swiper-container">
            <Swiper
              modules={[Pagination]}
              spaceBetween={8}
              slidesPerView={3}
              direction="vertical"
              pagination={{ clickable: true }}
              style={{ height: 'calc(100vh - 120px)' }}
            >
              {filteredClinics.map(vet => (
                <SwiperSlide key={vet.id}>
                  <div
                    className={`clinic-card ${selectedClinic?.id === vet.id ? 'selected' : ''}`}
                    onClick={() => setSelectedClinic(vet)}
                  >
                    <div className="clinic-card-content">
                      <h3>Clinic: {vet.clinic.name}</h3>
                      <p>Address: {vet.clinic.address.street}</p>
                      <p>City: {vet.clinic.address.city}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <div className="right-section">
          <div className="clinic-details-section">
            <h2>SELECTED CLINIC</h2>
            {selectedClinic ? (
              <div className="selected-clinic-info">
                <div className="clinic-image">
                  <img 
                    src={selectedClinic.clinic.photo} 
                    alt={selectedClinic.clinic.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Clinic+Photo';
                    }}
                  />
                </div>
                <div className="info-section">
                  <h3>Veterinarian</h3>
                  <p>Dr. {selectedClinic.fullName}</p>
                  <p>License: {selectedClinic.licenseNumber}</p>
                </div>
                
                <div className="info-section">
                  <h3>Contact Information</h3>
                  <p>{selectedClinic.phoneNumber}</p>
                  <p>{selectedClinic.email}</p>
                </div>

                <div className="info-section">
                  <h3>Address</h3>
                  <p>
                    {selectedClinic.clinic.address.street}<br />
                    {selectedClinic.clinic.address.barangay}<br />
                    {selectedClinic.clinic.address.city}, {selectedClinic.clinic.address.zipCode}
                  </p>
                </div>

                <div className="info-section">
                  <h3>Schedule</h3>
                  <p>
                    {selectedClinic.clinic.schedule.days.start} - {selectedClinic.clinic.schedule.days.end}<br />
                    {selectedClinic.clinic.schedule.hours.open} - {selectedClinic.clinic.schedule.hours.close}
                  </p>
                </div>

                <div className="info-section">
                  <h3>Services</h3>
                  <ul>
                    {selectedClinic.clinic?.services?.map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="no-selection-message">
                Please select a clinic to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicScreen;
