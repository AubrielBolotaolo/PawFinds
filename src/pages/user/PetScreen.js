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

        // Calculate new dimensions if width exceeds maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with reduced quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
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
              <input
                type="text"
                id="petSpecies"
                value={formData.petSpecies}
                onChange={handleInputChange}
                placeholder="Species"
                required
              />
              <input
                type="text"
                id="petBreed"
                value={formData.petBreed}
                onChange={handleInputChange}
                placeholder="Breed"
                required
              />
            </div>

            <div className="additional-info-container">
              <input
                type="text"
                id="petSpecialNeeds"
                value={formData.petSpecialNeeds}
                onChange={handleInputChange}
                placeholder="Special Needs"
              />
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
