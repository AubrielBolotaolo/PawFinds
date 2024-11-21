import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/AppointmentScreen.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TimePicker } from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

function AppointmentScreen() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const petsPerPage = 3;
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('pet-selection'); // ['pet-selection', 'service-selection', 'symptoms', 'clinic-selection', 'schedule']
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          toast.error('User not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3001/petOwners/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setPets(userData.pets || []);
      } catch (error) {
        console.error('Error fetching pets:', error);
        toast.error('Failed to load pets');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await fetch('http://localhost:3001/veterinarians');
        if (!response.ok) throw new Error('Failed to fetch clinics');
        const data = await response.json();
        setClinics(data);
      } catch (error) {
        console.error('Error fetching clinics:', error);
        toast.error('Failed to load veterinary clinics');
      }
    };

    if (step === 'clinic-selection') {
      fetchClinics();
    }
  }, [step]);

  const totalPages = Math.ceil(pets.length / petsPerPage);
  const displayedPets = pets.slice(
    currentPage * petsPerPage,
    (currentPage + 1) * petsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
  };

  const symptoms = [
    { id: 'fever', label: 'Fever' },
    { id: 'appetite-loss', label: 'Loss of Appetite' },
    { id: 'vomiting', label: 'Vomiting' },
    { id: 'diarrhea', label: 'Diarrhea' },
    { id: 'coughing', label: 'Coughing' },
    { id: 'sneezing', label: 'Sneezing' },
    { id: 'lethargy', label: 'Lethargy', description: '(unusually tired or inactive)' },
    { id: 'behavior-changes', label: 'Changes in Behavior', description: '(e.g., aggression or anxiety)' },
    { id: 'thirst-urination', label: 'Increased in thirst or urination' },
    { id: 'limping', label: 'Limping or difficulty in walking' },
    { id: 'skin-issues', label: 'Skin abnormalities', description: '(rashes, lumps, or sores)' },
    { id: 'eye-discharge', label: 'Eye discharge or redness' },
    { id: 'drooling', label: 'Excessive Drooling' },
    { id: 'weight-loss', label: 'Weight loss' },
    { id: 'weight-gain', label: 'Weight gain' },
    { id: 'breathing', label: 'Breathing difficulties', description: '(rapid or labored breathing)' },
  ];

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const isWithinWorkingHours = (time) => {
    if (!time || !selectedClinic) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    const clinicHours = selectedClinic.clinic.openingHours || selectedClinic.clinic.schedule?.hours;
    if (!clinicHours) return false;

    const [openHours, openMinutes] = clinicHours.open.split(':').map(Number);
    const [closeHours, closeMinutes] = clinicHours.close.split(':').map(Number);
    
    const timeValue = hours * 60 + minutes;
    const openValue = openHours * 60 + openMinutes;
    const closeValue = closeHours * 60 + closeMinutes;
    
    return timeValue >= openValue && timeValue <= closeValue;
  };

  const isWorkingDay = (date) => {
    if (!selectedClinic) return false;
    const day = date.getDay();
    const workingDays = {
      'Mon-Sat': [1, 2, 3, 4, 5, 6],
      'Mon-Fri': [1, 2, 3, 4, 5],
    };
    
    return workingDays[`${selectedClinic.clinic.schedule.days.start}-${selectedClinic.clinic.schedule.days.end}`]?.includes(day);
  };

  const renderContent = () => {
    switch (step) {
      case 'pet-selection':
        return (
          <>
            <h2>Select Your Pet</h2>
            <p>Select the pet you want to schedule an appointment for.</p>
            
            <Swiper
              modules={[Pagination, Navigation]}
              spaceBetween={20}
              slidesPerView={5}
              pagination={{
                clickable: true,
                el: '.swiper-pagination',
                type: 'bullets',
              }}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              className="pets-swiper"
              breakpoints={{
                320: {
                  slidesPerView: 1,
                },
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
                1280: {
                  slidesPerView: 5,
                },
              }}
            >
              {pets.map((pet) => (
                <SwiperSlide key={pet.id}>
                  <div
                    className={`pet-card ${selectedPet?.id === pet.id ? 'selected' : ''}`}
                    onClick={() => handlePetSelect(pet)}
                  >
                    <img 
                      src={pet.image || 'default-pet-image.jpg'} 
                      alt={pet.name} 
                      className="pet-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'default-pet-image.jpg';
                      }}
                    />
                    <div className="pet-info">
                      <p><strong>Name:</strong> {pet.name}</p>
                      <p><strong>Age:</strong> {pet.age}</p>
                      <p><strong>Breed:</strong> {pet.breed}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="swiper-pagination"></div>
            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>

            <button 
              className="next-button"
              disabled={!selectedPet}
              onClick={() => setStep('service-selection')}
            >
              Next
            </button>
          </>
        );

      case 'service-selection':
        return (
          <div className="service-selection">
            <h2>Select Service Type</h2>
            <p>What type of service does your pet need?</p>
            
            <div className="service-options">
              <div 
                className={`service-card ${selectedService === 'health' ? 'selected' : ''}`}
                onClick={() => setSelectedService('health')}
              >
                <Icon icon="mdi:heart-pulse" className="service-icon" />
                <h3>Health</h3>
                <p>For medical check-ups and treatments</p>
              </div>
              
              <div 
                className={`service-card ${selectedService === 'care' ? 'selected' : ''}`}
                onClick={() => setSelectedService('care')}
              >
                <Icon icon="mdi:pet" className="service-icon" />
                <h3>Care</h3>
                <p>For grooming and general care services</p>
              </div>
            </div>

            <button 
              className="next-button"
              disabled={!selectedService}
              onClick={() => {
                if (selectedService === 'health') {
                  setStep('symptoms');
                } else {
                  // Navigate to care services page
                  navigate('/care-services');
                }
              }}
            >
              Next
            </button>
          </div>
        );

      case 'symptoms':
        return (
          <div className="symptoms-section">
            <h2>Pet Encountered Symptoms</h2>
            <p>Select the box if your pet encountered the given symptoms. Select all that apply.</p>
            
            <div className="symptoms-grid">
              {symptoms.map(symptom => (
                <div
                  key={symptom.id}
                  className={`symptom-box ${selectedSymptoms.includes(symptom.id) ? 'selected' : ''}`}
                  onClick={() => handleSymptomToggle(symptom.id)}
                >
                  {symptom.label}
                  {symptom.description && <span className="description">{symptom.description}</span>}
                </div>
              ))}
            </div>

            <textarea
              className="symptoms-notes"
              placeholder="Provide more information of your pet's symptoms..."
              rows={4}
            />

            <button 
              className="next-button"
              onClick={() => setStep('clinic-selection')}
            >
              Next
            </button>
          </div>
        );

      case 'clinic-selection':
        return (
          <div className="clinic-selection">
            <h2>Select a Clinic</h2>
            <div className="clinics-grid">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className={`clinic-card ${selectedClinic?.id === clinic.id ? 'selected' : ''}`}
                  onClick={() => setSelectedClinic(clinic)}
                >
                  <h3>{clinic.clinic?.name || 'Unnamed Clinic'}</h3>
                  {clinic.clinic?.schedule && (
                    <>
                      <p>
                        <Icon icon="mdi:clock-outline" />
                        {clinic.clinic.schedule.hours?.open} - {clinic.clinic.schedule.hours?.close}
                      </p>
                      <p>
                        <Icon icon="mdi:calendar" />
                        {clinic.clinic.schedule.days?.start} - {clinic.clinic.schedule.days?.end}
                      </p>
                    </>
                  )}
                  <p>
                    <Icon icon="mdi:map-marker" />
                    {clinic.clinic?.address?.city || 'No address'}
                  </p>
                </div>
              ))}
            </div>
            <div className="navigation-buttons">
              <button className="back-button" onClick={() => setStep('symptoms')}>
                Back
              </button>
              <button
                className="next-button"
                onClick={() => {
                  if (!selectedClinic) {
                    toast.error('Please select a clinic');
                    return;
                  }
                  setStep('schedule');
                }}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="schedule-booking">
            <div className="schedule-grid">
              <div className="booking-section">
                <h2>Book Schedule</h2>
                <p>Select your available appointment date and time.</p>

                <div className="calendar-container">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    minDate={new Date()}
                    tileDisabled={({ date }) => !isWorkingDay(date)}
                    view="month"
                  />
                </div>

                <div className="time-picker-container">
                  <label>Time</label>
                  <TimePicker
                    onChange={setSelectedTime}
                    value={selectedTime}
                    format="HH:mm"
                    clearIcon={null}
                    disableClock={true}
                    minTime={selectedClinic?.clinic.schedule.hours.open}
                    maxTime={selectedClinic?.clinic.schedule.hours.close}
                  />
                </div>

                <button 
                  className="next-button"
                  disabled={!selectedDate || !selectedTime || !isWithinWorkingHours(selectedTime)}
                  onClick={() => setStep('confirmation')}
                >
                  Next
                </button>
              </div>

              <div className="selected-clinic-card">
                <h3>Selected Clinic</h3>
                <div className="clinic-details">
                  <img 
                    src={selectedClinic?.clinic.image || 'default-clinic-image.jpg'} 
                    alt={selectedClinic?.clinic.name}
                    className="clinic-image"
                  />
                  <div className="clinic-info">
                    <h4>Clinic: {selectedClinic?.clinic.name}</h4>
                    <p>
                      <strong>Address:</strong> {selectedClinic?.clinic.address.street}, 
                      {selectedClinic?.clinic.address.barangay}, {selectedClinic?.clinic.address.city}
                    </p>
                    <p>
                      <strong>Working Hours:</strong> {selectedClinic?.clinic.schedule.hours.open} - {selectedClinic?.clinic.schedule.hours.close}
                    </p>
                    <p>
                      <strong>Working Days:</strong> {selectedClinic?.clinic.schedule.days.start}-{selectedClinic?.clinic.schedule.days.end}
                    </p>
                    <p>
                      <strong>Ratings:</strong> {selectedClinic?.clinic.ratings || '4.5'} Stars
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="confirmation-section">
            <h2>Confirm Your Appointment</h2>
            <div className="appointment-summary">
              <div className="summary-details">
                {selectedClinic?.clinic?.schedule && (
                  <>
                    <div className="detail-item">
                      <Icon icon="mdi:clock-outline" />
                      <span>
                        {selectedTime}
                        <span className="hours-note">
                          (Open Hours: {selectedClinic.clinic.schedule.hours?.open} - {selectedClinic.clinic.schedule.hours?.close})
                        </span>
                      </span>
                    </div>
                    <div className="detail-item">
                      <Icon icon="mdi:map-marker" />
                      <span>
                        {selectedClinic.clinic.address?.street}, 
                        {selectedClinic.clinic.address?.barangay}, 
                        {selectedClinic.clinic.address?.city}
                      </span>
                    </div>
                    <div className="detail-item">
                      <Icon icon="mdi:hospital-building" />
                      <span>{selectedClinic.clinic.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="confirmation-actions">
              <button 
                className="back-button"
                onClick={() => setStep('schedule')}
              >
                Back
              </button>
              <button 
                className="confirm-button"
                onClick={async () => {
                  try {
                    const appointmentData = {
                      petId: selectedPet.id,
                      clinicId: selectedClinic.id,
                      userId: localStorage.getItem('userId'),
                      service: selectedService,
                      symptoms: selectedSymptoms,
                      date: selectedDate,
                      time: selectedTime,
                      status: 'pending',
                      createdAt: new Date()
                    };

                    const response = await fetch('http://localhost:3001/appointments', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(appointmentData)
                    });

                    if (!response.ok) throw new Error('Failed to schedule appointment');

                    setStep('success');
                  } catch (error) {
                    console.error('Error scheduling appointment:', error);
                    toast.error('Failed to schedule appointment');
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="success-section">
            <div className="success-content">
              <div className="success-icon">
                <Icon icon="mdi:check" />
              </div>
              <h2>Successfully Scheduled!</h2>
              <p>Your appointment is now being scheduled successfully. Don't forget your appointment, Fur Parent!</p>
              <button 
                className="view-appointments-button"
                onClick={() => navigate('/logs')}
              >
                View My Appointments
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading pets...</div>;
  }

  return (
    <div className="appointment-container">
      <div className="fur-patient-section">
        {renderContent()}
      </div>
    </div>
  );
}

export default AppointmentScreen;
