import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/AppointmentScreen.css';

function AppointmentScreen() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const petsPerPage = 3;
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading pets...</div>;
  }

  return (
    <div className="appointment-container">
      <div className="fur-patient-section">
        <h2>Fur Patient</h2>
        <p>Among your registered fur pets, who needs an attention?</p>

        {pets.length === 0 ? (
          <div className="no-pets-message">
            <p>No pets registered yet. Please add pets first.</p>
          </div>
        ) : (
          <>
            <div className="pets-grid">
              {displayedPets.map((pet) => (
                <div
                  key={pet.id}
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
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={handlePrevious} 
                  disabled={currentPage === 0}
                  className="nav-button"
                >
                  <Icon icon="mdi:chevron-left" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <div
                    key={index}
                    className={`page-dot ${currentPage === index ? 'active' : ''}`}
                  />
                ))}
                <button 
                  onClick={handleNext}
                  disabled={currentPage === totalPages - 1}
                  className="nav-button"
                >
                  <Icon icon="mdi:chevron-right" />
                </button>
              </div>
            )}

            <button 
              className="next-button"
              disabled={!selectedPet}
              onClick={() => {
                if (selectedPet) {
                  toast.success(`Selected ${selectedPet.name} for appointment`);
                  // Add your navigation logic here
                }
              }}
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AppointmentScreen;
