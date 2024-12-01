import React, { useState, useEffect, useRef } from 'react';
import {Icon} from '@iconify/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../../styles/PetScreen.css';
import { toast } from 'sonner';

const PetScreen = () => {
  const fileInputRef = useRef(null);
  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState({
    petName: '',
    petAge: '',
    petBreed: '',
    petSpecies: '',
    petSpecialNeeds: '',
    petMedicalHistory: '',
    petOtherInfo: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [petData, setPetData] = useState(null);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [showSpecialNeedsDropdown, setShowSpecialNeedsDropdown] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [filteredSpecialNeeds, setFilteredSpecialNeeds] = useState([]);

  // Fetch pets when component mounts
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          toast.error('User not authenticated');
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
      }
    };

    fetchPets();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  // Add new function to compress image
  const compressImage = (base64String, maxWidth = 800) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // More aggressive resizing if image is large
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Further reduce dimensions if file is still large
        if (width * height > 500000) { // 500k pixels
          const scale = Math.sqrt(500000 / (width * height));
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Compress with lower quality (0.3 instead of 0.6)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.1);
        resolve(compressedBase64);
      };
    });
  };

  // Modified handleImageChange
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressedImage = await compressImage(reader.result);
          setSelectedImage(compressedImage);
        } catch (error) {
          console.error('Error compressing image:', error);
          toast.error('Failed to process image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Modified handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      // Validate required fields
      if (!formData.petName || !formData.petAge || !formData.petBreed || !formData.petSpecies) {
        toast.error('Please fill in all required fields');
        return;
      }

      const userResponse = await fetch(`http://localhost:3001/petOwners/${userId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();

      const newPet = {
        id: Date.now(),
        name: formData.petName,
        age: formData.petAge,
        breed: formData.petBreed,
        species: formData.petSpecies,
        specialNeeds: formData.petSpecialNeeds,
        medicalHistory: formData.petMedicalHistory,
        otherInfo: formData.petOtherInfo,
        image: selectedImage
      };

      const updatedPets = userData.pets ? [...userData.pets, newPet] : [newPet];

      const updateResponse = await fetch(`http://localhost:3001/petOwners/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pets: updatedPets
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update user data');
      }

      setPets(updatedPets);
      toast.success('Pet added successfully!');
      resetForm();
      
    } catch (error) {
      console.error('Error adding pet:', error);
      toast.error('Failed to add pet');
    }
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      petAge: '',
      petBreed: '',
      petSpecies: '',
      petSpecialNeeds: '',
      petMedicalHistory: '',
      petOtherInfo: ''
    });
    setSelectedImage(null);
    setImagePreviewUrl('');
    
    // If you have file input ref, reset it too
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (petId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      // Get current user data
      const userResponse = await fetch(`http://localhost:3001/petOwners/${userId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();

      // Filter out the deleted pet
      const updatedPets = userData.pets.filter(pet => pet.id !== petId);

      // Update user data without the deleted pet
      const updateResponse = await fetch(`http://localhost:3001/petOwners/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pets: updatedPets
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to delete pet');
      }

      // Update local state
      setPets(updatedPets);
      toast.success('Pet deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast.error('Failed to delete pet');
    }
  };

  const handleAddPet = async (newPet) => {
    try {
      const userFullName = localStorage.getItem('fullName');
      
      // First, get the current user's data
      const response = await fetch(`http://localhost:3001/petOwners?fullName=${userFullName}`);
      const owners = await response.json();
      
      if (owners.length === 0) {
        toast.error('User not found');
        return;
      }

      const owner = owners[0];
      const updatedPets = [...(owner.pets || []), newPet];

      // Update the user's pets array
      const updateResponse = await fetch(`http://localhost:3001/petOwners/${owner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pets: updatedPets
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to add pet');
      }

      setPets(updatedPets);
      toast.success('Pet added successfully!');
    } catch (error) {
      console.error('Error adding pet:', error);
      toast.error('Failed to add pet');
    }
  };

  // Add image preview component with loading state
  const ImagePreview = ({ src }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <div className="image-preview">
        {isLoading && <div className="loading-spinner">Loading...</div>}
        <img 
          src={src} 
          alt="Pet preview" 
          onLoad={() => setIsLoading(false)}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      </div>
    );
  };

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await fetch('http://localhost:3001/petData');
        const data = await response.json();
        setPetData(data);
        setFilteredSpecies(data.species);
        setFilteredBreeds(data.breeds.Dog.concat(data.breeds.Cat)); // Combine all breeds initially
        setFilteredSpecialNeeds(data.specialNeeds);
      } catch (error) {
        console.error('Error fetching pet data:', error);
      }
    };
    fetchPetData();
  }, []);

  const handleSpeciesSearch = (value) => {
    setFormData(prev => ({ ...prev, petSpecies: value }));
    if (petData) {
      setFilteredSpecies(petData.species.filter(species => 
        species.toLowerCase().includes(value.toLowerCase())
      ));
    }
  };

  const handleBreedSearch = (value) => {
    setFormData(prev => ({ ...prev, petBreed: value }));
    if (petData) {
      const allBreeds = Object.values(petData.breeds).flat();
      setFilteredBreeds(allBreeds.filter(breed => 
        breed.toLowerCase().includes(value.toLowerCase())
      ));
    }
  };

  const handleSpecialNeedsSearch = (value) => {
    setFormData(prev => ({ ...prev, petSpecialNeeds: value }));
    if (petData) {
      setFilteredSpecialNeeds(petData.specialNeeds.filter(need => 
        need.toLowerCase().includes(value.toLowerCase())
      ));
    }
  };

  return (
    <div className="pet-screen">
      <div className="pet-forms-container">
        {/* Left side - Add Pet Form */}
        <div className="add-pet-form">
          <div className="add-pet-header">
            <h2>Add New Pet</h2>
            <div className="upload-photo-container">
              <label htmlFor="petImage" className="upload-photo-button">
                {fileName ? (
                  <span className="file-name" title={fileName}>
                    {fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
                  </span>
                ) : (
                  <>
                    <span className="camera-icon">📷</span>
                    Upload Photo
                  </>
                )}
              </label>
              <input
                type="file"
                id="petImage"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden-input"
              />
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="basic-info-container">
              <input
                type="text"
                id="petName"
                value={formData.petName}
                onChange={handleInputChange}
                placeholder="Pet's Name"
                required
              />
              <input
                type="text"
                id="petAge"
                value={formData.petAge}
                onChange={handleInputChange}
                placeholder="Age"
                required
              />
              <div className="input-field">
                <input
                  type="text"
                  id="petSpecies"
                  value={formData.petSpecies}
                  onChange={(e) => handleSpeciesSearch(e.target.value)}
                  onClick={() => setShowSpeciesDropdown(true)}
                  placeholder="Species"
                  required
                />
                <Icon 
                  icon="mdi:chevron-down" 
                  className="dropdown-icon"
                  onClick={() => setShowSpeciesDropdown(!showSpeciesDropdown)}
                />
                {showSpeciesDropdown && (
                  <div className="dropdown-list">
                    {filteredSpecies.map((species, index) => (
                      <div 
                        key={index}
                        className="dropdown-item"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, petSpecies: species }));
                          setShowSpeciesDropdown(false);
                        }}
                      >
                        {species}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-field">
                <input
                  type="text"
                  id="petBreed"
                  value={formData.petBreed}
                  onChange={(e) => handleBreedSearch(e.target.value)}
                  onClick={() => setShowBreedDropdown(true)}
                  placeholder="Breed"
                  required
                />
                <Icon 
                  icon="mdi:chevron-down" 
                  className="dropdown-icon"
                  onClick={() => setShowBreedDropdown(!showBreedDropdown)}
                />
                {showBreedDropdown && (
                  <div className="dropdown-list">
                    {filteredBreeds.map((breed, index) => (
                      <div 
                        key={index}
                        className="dropdown-item"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, petBreed: breed }));
                          setShowBreedDropdown(false);
                        }}
                      >
                        {breed}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="additional-info-container">
              <div className="input-field">
                <input
                  type="text"
                  id="petSpecialNeeds"
                  value={formData.petSpecialNeeds}
                  onChange={(e) => handleSpecialNeedsSearch(e.target.value)}
                  onClick={() => setShowSpecialNeedsDropdown(true)}
                  placeholder="Special Needs"
                />
                <Icon 
                  icon="mdi:chevron-down" 
                  className="dropdown-icon"
                  onClick={() => setShowSpecialNeedsDropdown(!showSpecialNeedsDropdown)}
                />
                {showSpecialNeedsDropdown && (
                  <div className="dropdown-list">
                    {filteredSpecialNeeds.map((need, index) => (
                      <div 
                        key={index}
                        className="dropdown-item"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, petSpecialNeeds: need }));
                          setShowSpecialNeedsDropdown(false);
                        }}
                      >
                        {need}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                id="petMedicalHistory"
                value={formData.petMedicalHistory}
                onChange={handleInputChange}
                placeholder="Medical History"
              />
              <textarea
                id="petOtherInfo"
                value={formData.petOtherInfo}
                onChange={handleInputChange}
                placeholder="Other Info"
              />
            </div>

            <button type="submit" className="add-button">
              Add
            </button>
          </form>
        </div>

        {/* Right side - Pet List */}
        <div className="pets-list">
          <Swiper
            modules={[Pagination, Navigation]}
            direction="vertical"
            slidesPerView={5}
            spaceBetween={10}
            navigation={false}

            className="pets-list-swiper"
          >
            {pets.map((pet) => (
              <SwiperSlide key={pet.id}>
                <div className="pet-list-card">
                  <img
                    src={pet.image || 'default-pet-image.jpg'}
                    alt={pet.name}
                    className="pet-list-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'default-pet-image.jpg';
                    }}
                  />
                  <div className="pet-list-info">
                    <p><strong>Name:</strong> {pet.name}</p>
                    <p><strong>Age:</strong> {pet.age}</p>
                    <p><strong>Breed:</strong> {pet.breed}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="delete-button"
                    title="Delete pet"
                  >
                    <Icon icon="mdi:delete" className="delete-icon"/>
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default PetScreen;
