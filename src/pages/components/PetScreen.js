import React, { useState, useEffect } from 'react';
import '../../styles/PetScreen.css';

const PetScreen = () => {
  const [pets, setPets] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [newPet, setNewPet] = useState({
    name: '',
    age: '',
    species: '',
    breed: '',
    specialNeeds: '',
    medicalHistory: '',
    otherInfo: '',
    image: ''
  });

  // Fetch pets when component mounts
  useEffect(() => {
    fetchPets();
  }, []);

  // Fetch all pets
  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:3002/pets');
      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPet(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Create FormData object to handle file upload
      const formData = new FormData();
      
      // Add all pet data to FormData
      Object.keys(newPet).forEach(key => {
        formData.append(key, newPet[key]);
      });
      
      // Add the image file if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      formData.append('id', Date.now().toString());

      const response = await fetch('http://localhost:3002/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPet,
          id: Date.now(),
          image: previewUrl || ''
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add pet');
      }

      // Refresh the pets list
      fetchPets();
      
      // Reset form
      setNewPet({
        name: '',
        age: '',
        species: '',
        breed: '',
        specialNeeds: '',
        medicalHistory: '',
        otherInfo: '',
        image: ''
      });
      setSelectedImage(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  return (
    <div className="pet-screen">
      <div className="pet-forms-container">
        <div className="add-pet-form">
          <h2>Add New Pet</h2>
          <form onSubmit={handleSubmit}>
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                id="pet-image"
              />
              <label htmlFor="pet-image" className="image-upload-label">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="image-preview"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <span>Click to upload image</span>
                  </div>
                )}
              </label>
            </div>

            <div className="basic-info-container">
              <input
                type="text"
                name="name"
                placeholder="Pet's Name"
                value={newPet.name}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="age"
                placeholder="Age"
                value={newPet.age}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="species"
                placeholder="Species"
                value={newPet.species}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="breed"
                placeholder="Breed"
                value={newPet.breed}
                onChange={handleInputChange}
              />
            </div>

            <div className="additional-info-container">
              <input
                type="text"
                name="specialNeeds"
                placeholder="Special Needs"
                value={newPet.specialNeeds}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="medicalHistory"
                placeholder="Medical History"
                value={newPet.medicalHistory}
                onChange={handleInputChange}
              />
              <textarea
                name="otherInfo"
                placeholder="Other Info"
                value={newPet.otherInfo}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="add-button">Add</button>
          </form>
        </div>

        <div className="pets-list">
          {pets.map((pet, index) => (
            <div key={index} className="pet-card">
              <img src={pet.image} alt={pet.name} className="pet-image" />
              <div className="pet-info">
                <p><strong>Name:</strong> {pet.name}</p>
                <p><strong>Age:</strong> {pet.age}</p>
                <p><strong>Breed:</strong> {pet.breed}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetScreen;
