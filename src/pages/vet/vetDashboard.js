import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import Image from '../assets/logo.png';
import AppointmentRequests from './appointment';
import FurPatients from './patient';
import VetProfile from './vetProfile';


function VetDashboard() {
    const [userData, setUserData] = useState({
        fullName: '',
        clinic: { name: '' },
        profilePhoto: null
    });
    const [username, setUsername] = useState('');
    const [activeView, setActiveView] = useState('dashboard');
    const [statistics, setStatistics] = useState({
        totalPatients: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        todayAppointments: 0
    });
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    navigate('/login');
                    return;
                }

                // Fetch veterinarian details
                const response = await fetch(`http://localhost:3001/veterinarians/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch veterinarian data');
                
                const user = await response.json();
                setUserData(user);
                setUsername(user.fullName.split(' ')[0]); // Set first name as username

                // Fetch dashboard statistics
                await fetchDashboardData(userId);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load veterinarian data');
            }
        };

        fetchData();
    }, [navigate]);

    const fetchDashboardData = async (vetId) => {
        try {
            const appointmentsRes = await fetch(`http://localhost:3001/appointments?veterinarianId=${vetId}`);
            if (!appointmentsRes.ok) {
                throw new Error('Failed to fetch appointments');
            }
            const appointments = await appointmentsRes.json();

            const today = new Date().toISOString().split('T')[0];

            setStatistics({
                totalPatients: new Set(appointments.map(apt => apt.petId)).size,
                pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
                completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
                todayAppointments: appointments.filter(apt => apt.date.startsWith(today)).length
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="home-container">
            {/* Sidebar Navigation */}
            <div className="sidebar">
                <div className="logo-container">
                    <img src={Image} alt="Logo" />
                </div>
                
                <div 
                    className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveView('dashboard')}
                >
                    <Icon icon="mdi:monitor" className="icon" />
                    Dashboard
                </div>

                <div 
                    className={`nav-item ${activeView === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveView('appointments')}
                >
                    <Icon icon="mdi:calendar-check" className="icon" />
                    Appointment Requests
                </div>

                <div 
                    className={`nav-item ${activeView === 'patients' ? 'active' : ''}`}
                    onClick={() => setActiveView('patients')}
                >
                    <Icon icon="mdi:paw" className="icon" />
                    Fur Patients
                </div>

                <button onClick={handleLogout} className="logout-btn">
                    <Icon icon="mdi:logout" className="icon"/>
                    <span>Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {activeView === 'dashboard' ? (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Icon icon="mdi:paw" />
                            </div>
                            <div className="stat-details">
                                <h3>Total Patients</h3>
                                <p>{statistics.totalPatients}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <Icon icon="mdi:calendar-clock" />
                            </div>
                            <div className="stat-details">
                                <h3>Pending Appointments</h3>
                                <p>{statistics.pendingAppointments}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <Icon icon="mdi:calendar-check" />
                            </div>
                            <div className="stat-details">
                                <h3>Completed Appointments</h3>
                                <p>{statistics.completedAppointments}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <Icon icon="mdi:calendar-today" />
                            </div>
                            <div className="stat-details">
                                <h3>Today's Appointments</h3>
                                <p>{statistics.todayAppointments}</p>
                            </div>
                        </div>
                    </div>
                ) : activeView === 'appointments' ? (
                    <AppointmentRequests />
                ) : (
                    <FurPatients />
                )}
            </div>

            {/* Header */}
            <div className="header">
                <h2>{activeView.toUpperCase()}</h2>
                <div className="user-info" onClick={() => setIsProfileOpen(true)}>
                    <div className='user-text'>
                        <span>Hello, Dr. {username}!</span>
                        <span className="user-type">{userData.clinic.name}</span>
                    </div>
                    <div className="avatar">
                        {userData.profilePhoto ? (
                            <img 
                                src={userData.profilePhoto} 
                                alt="Profile" 
                                className="profile-photo"
                            />
                        ) : (
                            <Icon icon="mdi:account-circle" className="icon"/>
                        )}
                    </div>
                </div>
            </div>

            <VetProfile 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
            />
        </div>
    );
}

export default VetDashboard;
