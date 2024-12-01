import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/profile.css';

// Add this helper function at the top of your file, outside the component
const convertTo12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const convertTo24Hour = (time12) => {
  if (!time12) return '';
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

function VetProfile({ isOpen, onClose }) {
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
    // Vet-specific fields
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    clinicName: '',
    education: '',
    availableHours: '',
    consultationFee: '',
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
        const response = await fetch(`http://localhost:3001/veterinarians/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch vet data');
        
        const data = await response.json();
        
        // Convert the hours to 12-hour format
        const openTime = convertTo12Hour(data.clinic?.schedule?.hours?.open);
        const closeTime = convertTo12Hour(data.clinic?.schedule?.hours?.close);

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
            street: data.clinic.address.street || '',
            barangay: data.clinic.address.barangay || '',
            city: data.clinic.address.city || '',
            zipCode: data.clinic.address.zipCode || ''
          },
          birthDate: data.birthDate || '',
          gender: data.gender || '',
          licenseNumber: data.licenseNumber || '',
          specialization: data.specialization || '',
          yearsOfExperience: data.yearsOfExperience || '',
          clinicName: data.clinic.name || '',
          education: data.education || '',
          availableHours: `${openTime} - ${closeTime}`,
          consultationFee: data.consultationFee || '',
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

  const updateUserProfile = async (updatedData) => {
    try {
      const storedRole = localStorage.getItem('userRole');
      const endpoint = storedRole === 'veterinarian' ? 'veterinarians' : 'petOwners';
      
      const response = await fetch(`http://localhost:3001/${endpoint}/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      // Fetch updated data after successful update
      const updatedResponse = await fetch(`http://localhost:3001/${endpoint}/${userData.id}`);
      const updatedUserData = await updatedResponse.json();
      
      // Update local state with new data
      setUserData(prevData => ({
        ...prevData,
        ...updatedUserData
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
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

  const handleSaveChanges = async () => {
    try {
      if (newPassword && newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const userId = localStorage.getItem('userId');
      
      // Split and convert times back to 24-hour format for storage
      const [openTime, closeTime] = userData.availableHours.split(' - ');
      const open24 = convertTo24Hour(openTime);
      const close24 = convertTo24Hour(closeTime);

      const updateData = {
        ...userData,
        street: userData.address.street,
        barangay: userData.address.barangay,
        city: userData.address.city,
        zipCode: userData.address.zipCode,
        address: undefined,
        ...(newPassword && { password: newPassword }),
        clinic: {
          schedule: {
            hours: {
              open: open24,
              close: close24
            }
          }
        }
      };

      const response = await fetch(`http://localhost:3001/veterinarians/${userId}`, {
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

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result;
          
          // Only update the profile photo, keeping all other data unchanged
          await updateUserProfile({ 
            ...userData,
            profilePhoto: base64Image 
          });
          
          // Update local state
          setUserData(prev => ({ 
            ...prev, 
            profilePhoto: base64Image 
          }));
          
          toast.success('Profile photo updated successfully');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast.error('Error uploading photo');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal">
      <div className="profile-content">
        <div className="profile-header">
          <h2>EDIT VETERINARIAN PROFILE</h2>
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
              value={userData.gender}
              onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={userData.bio}
            className="bio-input"
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            placeholder="Tell us about your professional experience..."
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>License Number</label>
            <input
              type="text"
              value={userData.licenseNumber}
              onChange={(e) => setUserData({ ...userData, licenseNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input
              type="text"
              value={userData.specialization}
              onChange={(e) => setUserData({ ...userData, specialization: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              value={userData.yearsOfExperience}
              onChange={(e) => setUserData({ ...userData, yearsOfExperience: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Clinic Name</label>
            <input
              type="text"
              value={userData.clinicName}
              onChange={(e) => setUserData({ ...userData, clinicName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Education</label>
            <input
              type="text"
              value={userData.education}
              onChange={(e) => setUserData({ ...userData, education: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Available Hours</label>
            <input
              type="text"
              value={userData.availableHours}
              onChange={(e) => setUserData({ ...userData, availableHours: e.target.value })}
              placeholder="9:00 AM - 5:00 PM"
            />
          </div>
          <div className="form-group">
            <label>Consultation Fee</label>
            <input
              type="number"
              value={userData.consultationFee}
              onChange={(e) => setUserData({ ...userData, consultationFee: e.target.value })}
            />
          </div>
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
            <label>Emergency Contact Phone</label>
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

export default VetProfile;
