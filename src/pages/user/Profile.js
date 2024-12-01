import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/profile.css';

function Profile({ isOpen, onClose }) {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    bio: '',
    profilePhoto: null,
    address: {
      street: '',
      barangay: '',
      city: '',
      zipCode: ''
    },
    birthDate: '',
    gender: '',
    occupation: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    }
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const storedRole = localStorage.getItem('userRole');
        const endpoint = storedRole === 'veterinarian' ? 'veterinarians' : 'petOwners';
        
        const response = await fetch(`http://localhost:3001/${endpoint}/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const data = await response.json();
        console.log('Fetched user data:', data);
        
        setUserData({
          id: data.id || '',
          firstName: data.fullName.split(' ')[0] || '',
          lastName: data.fullName.split(' ')[1] || '',
          username: data.username || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          bio: data.bio || '',
          profilePhoto: data.profilePhoto || null,
          address: {
            street: data.street || '',
            barangay: data.barangay || '',
            city: data.city || '',
            zipCode: data.zipCode || ''
        },
          birthDate: data.birthDate || '',
          gender: data.gender || '',
          occupation: data.occupation || '',
          emergencyContact: {
            name: data.emergencyContact?.name || '',
            relationship: data.emergencyContact?.relationship || '',
            phoneNumber: data.emergencyContact?.phoneNumber || ''
        }
      });
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Error loading profile data');
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Convert image to base64 for storage
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result;
          setUserData(prev => ({ ...prev, profilePhoto: base64Image }));
          
          // Update the user data in the database
          await updateUserProfile({ ...userData, profilePhoto: base64Image });
          toast.success('Profile photo updated successfully');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error('Error uploading photo');
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (newPassword && newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const userId = localStorage.getItem('userId');
      const storedRole = localStorage.getItem('userRole');
      const endpoint = storedRole === 'veterinarian' ? 'veterinarians' : 'petOwners';

      // Prepare the update data
      const updateData = {
        ...userData,
        street: userData.address.street,
        barangay: userData.address.barangay,
        city: userData.address.city,
        zipCode: userData.address.zipCode,
        address: undefined,
        // Add password update if provided
        ...(newPassword && { password: newPassword }),
      };

      const response = await fetch(`http://localhost:3001/${endpoint}/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const updateUserProfile = async (updatedData) => {
    const storedRole = localStorage.getItem('userRole');
    const endpoint = storedRole === 'veterinarian' ? 'veterinarians' : 'petOwners';
    
    await fetch(`http://localhost:3001/${endpoint}/${userData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      );

      if (!confirmDelete) return;

      const userId = localStorage.getItem('userId');
      const storedRole = localStorage.getItem('userRole');
      const endpoint = storedRole === 'veterinarian' ? 'veterinarians' : 'petOwners';

      const response = await fetch(`http://localhost:3001/${endpoint}/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete account');

      // Clear local storage
      localStorage.clear();
      
      toast.success('Account deleted successfully');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal">
      <div className="profile-content">
        <div className="profile-header">
          <h2>EDIT PROFILE</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="profile-photo-section">
          <div className="photo-container">
            {userData.profilePhoto ? (
              <img src={userData.profilePhoto} alt="Profile" />
            ) : (
              <Icon icon="mdi:account-circle" className="default-avatar" />
            )}
            <label className="edit-photo-button">
              <Icon icon="mdi:pencil" style={{ color: 'white' }}/>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={userData.firstName}
              onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={userData.lastName}
              onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={userData.phoneNumber}
              onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Birth Date</label>
            <input
              type="date"
              value={userData.birthDate}
              onChange={(e) => setUserData({ ...userData, birthDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              className="form-input"
              value={userData.gender}
              onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Occupation</label>
            <input
              type="text"
              value={userData.occupation}
              onChange={(e) => setUserData({ ...userData, occupation: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={userData.bio}
            className="bio-input"
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={userData.address.street}
              onChange={(e) => setUserData({
                ...userData,
                address: { ...userData.address, street: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Barangay</label>
            <input
              type="text"
              value={userData.address.barangay}
              onChange={(e) => setUserData({
                ...userData,
                address: { ...userData.address, barangay: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={userData.address.city}
              onChange={(e) => setUserData({
                ...userData,
                address: { ...userData.address, city: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              value={userData.address.zipCode}
              onChange={(e) => setUserData({
                ...userData,
                address: { ...userData.address, zipCode: e.target.value }
              })}
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Emergency Contact Name</label>
            <input
              type="text"
              value={userData.emergencyContact.name}
              onChange={(e) => setUserData({
                ...userData,
                emergencyContact: { ...userData.emergencyContact, name: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Relationship</label>
            <input
              type="text"
              value={userData.emergencyContact.relationship}
              onChange={(e) => setUserData({
                ...userData,
                emergencyContact: { ...userData.emergencyContact, relationship: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={userData.emergencyContact.phoneNumber}
              onChange={(e) => setUserData({
                ...userData,
                emergencyContact: { ...userData.emergencyContact, phoneNumber: e.target.value }
              })}
            />
          </div>
        </div>

        <div className="password-section">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              className="password-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="password-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="password-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="button-group">
          <button className="delete-account-button" onClick={handleDeleteAccount}>
            Delete Account
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSaveChanges}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
