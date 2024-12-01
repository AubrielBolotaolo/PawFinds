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
  const [currentClinicPage, setCurrentClinicPage] = useState(0);
  const CLINICS_PER_PAGE = 4;
  const [selectedCareServices, setSelectedCareServices] = useState([]);
  const [symptomsNotes, setSymptomsNotes] = useState('');

  const handleConfirmAppointment = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      const appointmentData = {
        userId,
        petId: selectedPet.id,
        clinicId: selectedClinic.id,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        service: selectedService,
        symptoms: selectedSymptoms
      };

      console.log('Saving appointment data:', appointmentData);

      const response = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      toast.success('Appointment scheduled successfully!');
      setStep('success');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

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
        
        console.log('Raw clinic data:', data);
        
        const healthClinics = data.filter(vet => 
          vet.role === 'veterinarian' && vet.clinic
        );
        
        console.log('Filtered clinics:', healthClinics);
        
        setClinics(healthClinics);
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

  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
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

  const careServices = [
    { id: 'grooming', label: 'Pet Grooming', description: 'Bath, haircut, nail trimming, and ear cleaning' },
    { id: 'dental', label: 'Dental Care', description: 'Teeth cleaning and oral hygiene' },
    { id: 'spa', label: 'Pet Spa', description: 'Relaxing treatments and massages' },
    { id: 'boarding', label: 'Pet Boarding', description: 'Short-term pet accommodation' },
    { id: 'daycare', label: 'Day Care', description: 'Supervised daily pet care' },
    { id: 'training', label: 'Pet Training', description: 'Behavior training and socialization' },
    { id: 'nutrition', label: 'Nutrition Consultation', description: 'Diet planning and advice' },
    { id: 'exercise', label: 'Exercise Program', description: 'Physical activity and fitness routines' },
  ];

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleCareServiceToggle = (serviceId) => {
    setSelectedCareServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
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
    if (!selectedClinic?.clinic?.schedule?.days) return false;
    
    const dayMap = {
      'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0
    };
    
    const start = dayMap[selectedClinic.clinic.schedule.days.start];
    const end = dayMap[selectedClinic.clinic.schedule.days.end];
    const currentDay = date.getDay();
    
    if (start <= end) {
      return currentDay >= start && currentDay <= end;
    } else {
      // Handles cases like "Sun-Fri"
      return currentDay >= start || currentDay <= end;
    }
  };

  const isDateWithinClinicSchedule = (date) => {
    if (!selectedClinic?.clinic?.schedule?.days?.start || !selectedClinic?.clinic?.schedule?.days?.end) {
        return false;
    }

    const { start: startDay, end: endDay } = selectedClinic.clinic.schedule.days;
    
    const dayToNumber = {
        'Sunday': 0, 'Sun': 0,
        'Monday': 1, 'Mon': 1,
        'Tuesday': 2, 'Tue': 2,
        'Wednesday': 3, 'Wed': 3,
        'Thursday': 4, 'Thu': 4,
        'Friday': 5, 'Fri': 5,
        'Saturday': 6, 'Sat': 6
    };

    const clinicStartDay = dayToNumber[startDay];
    const clinicEndDay = dayToNumber[endDay];
    const currentDayOfWeek = date.getDay();

    if (clinicStartDay <= clinicEndDay) {
        return currentDayOfWeek >= clinicStartDay && currentDayOfWeek <= clinicEndDay;
    } else {
        return currentDayOfWeek >= clinicStartDay || currentDayOfWeek <= clinicEndDay;
    }
  };

  // Helper function to convert 24h to 12h format (add this near your other helper functions)
  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const renderContent = () => {
    switch (step) {
      case 'pet-selection':
        return (
          <>
            <h2>SELECT YOUR PET</h2>
            <p>Select the pet you want to schedule an appointment for.</p>
            
            <Swiper
              modules={[Pagination]}
              spaceBetween={0}
              slidesPerView={5}
              navigation={false}
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
            <h2>SELECT SERVICE TYPE</h2>
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
                <Icon icon="mdi:paw" className="service-icon" />
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
                  setStep('care-services');
                }
              }}
            >
              Next
            </button>
          </div>
        );

      case 'care-services':
        return (
          <div className="care-services-section">
            <h2>SELECT CARE SERVICES</h2>
            <p>Choose the services you'd like for your pet. Select all that apply.</p>
            
            <div className="care-services-grid">
              {careServices.map(service => (
                <div
                  key={service.id}
                  className={`care-service-box ${selectedCareServices.includes(service.id) ? 'selected' : ''}`}
                  onClick={() => handleCareServiceToggle(service.id)}
                >
                  <h3>{service.label}</h3>
                  <p className="description">{service.description}</p>
                </div>
              ))}
            </div>

            <button 
              className="next-button"
              disabled={selectedCareServices.length === 0}
              onClick={() => setStep('clinic-selection')}
            >
              Next
            </button>
          </div>
        );

      case 'symptoms':
        return (
          <div className="care-services-section">
            <h2>SELECT PET SYMPTOMS</h2>
            <p>Choose the symptoms your pet is experiencing. Select all that apply.</p>
            
            <div className="care-services-grid">
              {symptoms.map(symptom => (
                <div
                  key={symptom.id}
                  className={`care-service-box ${selectedSymptoms.includes(symptom.id) ? 'selected' : ''}`}
                  onClick={() => handleSymptomToggle(symptom.id)}
                >
                  <h3>{symptom.label}</h3>
                  {symptom.description && (
                    <p className="description">{symptom.description}</p>
                  )}
                </div>
              ))}
            </div>

            <textarea
              className="symptoms-notes"
              placeholder="Provide more information of your pet's symptoms..."
              value={symptomsNotes}
              onChange={(e) => setSymptomsNotes(e.target.value)}
              rows={4}
            />

            <button 
              className="next-button"
              disabled={selectedSymptoms.length === 0}
              onClick={() => setStep('clinic-selection')}
            >
              Next
            </button>
          </div>
        );

        case 'clinic-selection':
          const totalClinicPages = Math.ceil(clinics.length / CLINICS_PER_PAGE);
          
          const startIndex = currentClinicPage * CLINICS_PER_PAGE;
          const displayedClinics = clinics.slice(startIndex, startIndex + CLINICS_PER_PAGE);

          return (
            <div className="clinic-selection">
              <h2>Select a Clinic</h2>
              <div className="clinics-grid">
                {displayedClinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className={`clinic-card ${selectedClinic?.id === clinic.id ? 'selected' : ''}`}
                    onClick={() => handleClinicSelect(clinic)}
                  >
                   <div className="clinic-card-inner">
                    <img 
                      src={clinic.clinic?.photo || 'default-clinic-image.jpg'} 
                      alt={clinic.clinic?.name}
                      className="clinic-thumbnail"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'default-clinic-image.jpg';
                      }}
                    />
                    <div className="clinic-info">
                      <h3>{clinic.clinic?.name || 'Unnamed Clinic'}</h3>
                      {clinic.clinic?.schedule && (
                      <>
                        <p>
                          <Icon icon="mdi:clock-outline" />
                          {convertTo12Hour(clinic.clinic.schedule.hours?.open)} - 
                          {convertTo12Hour(clinic.clinic.schedule.hours?.close)}
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
                </div>
              </div>
                ))}
              </div>

              {clinics.length > CLINICS_PER_PAGE && (
                <div className="pagination-controls">
                  <button 
                    className="pagination-button"
                    disabled={currentClinicPage === 0}
                    onClick={() => setCurrentClinicPage(prev => Math.max(0, prev - 1))}
                  >
                    Previous
                  </button>
                  <span className="page-indicator">
                    Page {currentClinicPage + 1} of {totalClinicPages}
                  </span>
                  <button 
                    className="pagination-button"
                    disabled={currentClinicPage >= totalClinicPages - 1}
                    onClick={() => setCurrentClinicPage(prev => Math.min(totalClinicPages - 1, prev + 1))}
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="navigation-buttons">
                <button className="back-button" onClick={() => setStep('symptoms')}>
                  Back
                </button>
                <button
                  className="next-button"
                  disabled={!selectedClinic}
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
          <div className="schedule-cards">
            <div className="booking-card">
              <h2>BOOK SCHEDULE</h2>
              <p>Select your available appointment date and time.</p>

              <div className="calendar-container">
                <Calendar
                  onChange={(date) => {
                    if (!selectedClinic?.clinic?.schedule?.days) {
                      toast.error('Clinic schedule not available');
                      return;
                    }

                    if (isDateWithinClinicSchedule(date)) {
                      setSelectedDate(date);
                    } else {
                      const { start, end } = selectedClinic.clinic.schedule.days;
                      toast.error(`This clinic only operates from ${start} to ${end}`);
                    }
                  }}
                  value={selectedDate}
                  minDate={new Date()}
                  tileDisabled={({ date }) => !isDateWithinClinicSchedule(date)}
                  tileClassName={({ date }) => isDateWithinClinicSchedule(date) ? 'available-date' : ''}
                  view="month"
                />
              </div>

              <div className="time-picker-container">
                <label>Time</label>
                <TimePicker
                  onChange={setSelectedTime}
                  value={selectedTime}
                  format="hh:mm a"
                  clearIcon={null}
                  disableClock={true}
                  minTime={selectedClinic?.clinic.schedule.hours.open}
                  maxTime={selectedClinic?.clinic.schedule.hours.close}
                  amPmAriaLabel="Select AM/PM"
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
              <h3>SELECTED CLINIC</h3>
              <div className="clinic-details">
                <img 
                  src={selectedClinic?.clinic?.photo || 'default-clinic-image.jpg'} 
                  alt={selectedClinic?.clinic?.name}
                  className="selected-clinic-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'default-clinic-image.jpg';
                  }}
                />
                <div className="clinic-info">
                  <h4>Clinic: {selectedClinic?.clinic.name}</h4>
                  <p>
                    <strong>Address:</strong> {selectedClinic?.clinic.address.street}, 
                    {selectedClinic?.clinic.address.barangay}, {selectedClinic?.clinic.address.city}
                  </p>
                  <p>
                    <strong>Working Hours:</strong> 
                    {convertTo12Hour(selectedClinic?.clinic.schedule.hours.open)} - 
                    {convertTo12Hour(selectedClinic?.clinic.schedule.hours.close)}
                  </p>
                  <p>
                    <strong>Working Days:</strong> {selectedClinic?.clinic?.schedule?.days?.start}-{selectedClinic?.clinic?.schedule?.days?.end}
                  </p>
                  <p>
                    <strong>Ratings:</strong> {selectedClinic?.clinic.ratings || '4.5'} Stars
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        const appointmentDate = new Date(selectedDate);
        const month = appointmentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = appointmentDate.getDate().toString().padStart(2, '0');
        const fullDate = appointmentDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

        return (
          <div className="confirmation-section">
            <h2>CONFIRMATION</h2>
            
            <div className="header-container">
              <div className="date-badge">
                <div className="month">{month}</div>
                <div className="day">{day}</div>
              </div>
              <div className="note-container">
                <p className="note">Please note your Appointment Schedule.</p>
              </div>
            </div>

            <div className="appointment-summary-card">
              <div className="appointment-details">
                <div className="detail-item">
                  <Icon icon="material-symbols:calendar-month" />
                  {fullDate}
                </div>

                <div className="detail-item">
                  <Icon icon="mdi:map-marker" />
                  {selectedClinic?.clinic?.address?.street}, {selectedClinic?.clinic?.address?.city}, {selectedClinic?.clinic?.address?.barangay}
                </div>

                <div className="detail-item">
                  <Icon icon="mdi:clock-outline" />
                  {selectedTime && convertTo12Hour(selectedTime)}
                  <span className="hours-note">
                    (Open Hours: {convertTo12Hour(selectedClinic?.clinic?.schedule?.hours?.open)} - 
                    {convertTo12Hour(selectedClinic?.clinic?.schedule?.hours?.close)})
                  </span>
                </div>

                <div className="detail-item">
                  <Icon icon="mdi:hospital-building" />
                  {selectedClinic?.clinic?.name}
                </div>
              </div>
            </div>

            <div className="confirmation-actions">
              <button className="back-button" onClick={() => setStep('schedule')}>
                Back
              </button>
              <button className="confirm-button" onClick={handleConfirmAppointment}>
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
      {step === 'schedule' ? (
        renderContent()
      ) : (
        <div className="fur-patient-section">
          {renderContent()}
        </div>
      )}
    </div>
  );
}

export default AppointmentScreen;
