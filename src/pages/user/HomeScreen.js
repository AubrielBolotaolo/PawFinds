import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useLocation } from 'react-router-dom';
import Image from '../assets/home-2.png';
import Image2 from '../assets/logo.png';
import { toast } from 'sonner';
import PetScreen from './PetScreen';
import AppointmentScreen from './AppointmentScreen';
import LogScreen from './LogScreen';

function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [activeNavItem, setActiveNavItem] = useState(
    location.state?.activeNavItem || 'dashboard'
  );
  const navItems = [
    { id: 'home', icon: 'mdi:home', label: 'Home' },
    { id: 'pets', icon: 'mdi:paw', label: 'My Pets' },
    { id: 'appointment', icon: 'mdi:calendar', label: 'Book Appointment' },
    { id: 'map', icon: 'mdi:map-marker', label: 'Map' },
    { id: 'logs', icon: 'mdi:calendar-clock', label: 'Appointment Logs' }
  ];
  const getPageTitle = () => {
    const currentPage = navItems.find(item => item.id === activeScreen);
    return currentPage ? currentPage.label.toUpperCase() : 'HOME';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('userRole');
        
        if (!storedUsername || !storedRole) {
          navigate('/');
          return;
        }

        // Get stored full name for display
        setUsername(storedUsername); // This will now be the first name

        // Rest of the fetch logic remains the same
        const endpoint = storedRole === 'veterinarian' ? 'veterinarians' : 'petOwners';
        const response = await fetch(`http://localhost:3001/${endpoint}?fullName_like=${localStorage.getItem('fullName')}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const users = await response.json();

        if (users.length > 0) {
          const user = users[0];
          setUserData(user);
          setUserRole(storedRole);
        } else {
          toast.error('User data not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error loading user data');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (location.state?.activeNavItem) {
      setActiveNavItem(location.state.activeNavItem);
    }
  }, [location]);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>; // Add a proper loading component
  }

  return (
    <div className="home-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={Image2} alt="Logo" />
        </div>
        
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeScreen === item.id ? 'active' : ''}`}
            onClick={() => setActiveScreen(item.id)}
          >
            <Icon icon={item.icon} className="icon" />
            {item.label}
          </div>
        ))}

        <button onClick={handleLogout} className="logout-btn">
          <Icon icon="mdi:logout" className="icon"/>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeScreen === 'pets' ? (
          <PetScreen />
        ) : activeScreen === 'appointment' ? (
          <AppointmentScreen />
        ) : activeScreen === 'logs' ? (
          <LogScreen />
        ) : (
          <div className="welcome-card">
            <div className="welcome-text">
              <h1>
                Welcome, {userRole === 'veterinarian' ? 'Dr.' : ''} {username}!
              </h1>
              <p>
                {userRole === 'veterinarian' 
                  ? "Manage your clinic and appointments with ease."
                  : "We are ready to help you care for your small companions with ease."}
              </p>
            </div>
            <img src={Image} alt="Cat and Dog" className="pets-image" />
          </div>
        )}

        {userRole === 'veterinarian' && userData?.clinic && (
          <div className="clinic-overview">
            <h2>Clinic Information</h2>
            <div className="clinic-details">
              <h3>{userData.clinic.name}</h3>
              <p>{userData.clinic.address.street}, {userData.clinic.address.barangay}</p>
              <p>{userData.clinic.address.city}, {userData.clinic.address.zipCode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="header">
        <h2>{getPageTitle()}</h2>
        <div className="user-info">
          <div className='user-text'>
            <span>Hey, {username}!</span>
            <span className="user-type">
              {userRole === 'veterinarian' ? 'Veterinarian' : 'Fur Parent'}
            </span>
          </div>
          <div className="avatar">
            <Icon icon="mdi:account-circle" className="icon"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen; 