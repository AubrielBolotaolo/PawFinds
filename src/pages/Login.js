import React, { useState, useEffect } from "react";
import {Icon} from '@iconify/react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function Login({isOpen, onClose, onHomeScreenClick}) {
  const navigate = useNavigate();
  const [signUpMode, setSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [showClinicForm, setShowClinicForm] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [openingDays, setOpeningDays] = useState({ start: '', end: '' });
  const [openingHours, setOpeningHours] = useState({ open: '', close: '' });
  const [address, setAddress] = useState({
    street: '',
    barangay: '',
    city: '',
    zipCode: ''
});
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [document, setDocument] = useState(null);
  const [fullName, setFullName] = useState('');
  const [clinicPhoto, setClinicPhoto] = useState(null);
  const [showStreetDropdown, setShowStreetDropdown] = useState(false);
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredStreets, setFilteredStreets] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [locations, setLocations] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState(null); // 'email' or 'phone'
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const countryCodes = [
    { code: '+63', country: 'PH', length: 10 },
    { code: '+1', country: 'US', length: 10 },
    { code: '+44', country: 'UK', length: 10 },
    { code: '+81', country: 'JP', length: 10 },
    { code: '+82', country: 'KR', length: 10 },
  ];

  const validatePhoneNumber = () => {
    const selectedCountry = countryCodes.find(country => country.code === countryCode);
    const phoneRegex = /^\d+$/; // Checks if input contains only digits

    // Remove any spaces or special characters from phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    if (!phoneRegex.test(cleanNumber)) {
        toast.error('Phone number should contain only digits');
        return false;
    }

    if (cleanNumber.length !== selectedCountry.length) {
        toast.error(`${selectedCountry.country} phone numbers must be ${selectedCountry.length} digits`);
        return false;
    }

    return true;
};

// Handle phone number input with formatting
const handlePhoneNumberChange = (e) => {
    const input = e.target.value;
    // Only allow digits
    const cleaned = input.replace(/\D/g, '');
    
    // Limit input based on selected country's length
    const selectedCountry = countryCodes.find(country => country.code === countryCode);
    if (cleaned.length <= selectedCountry.length) {
        setPhoneNumber(cleaned);
    }
};

// Validate on blur
const handlePhoneBlur = () => {
    if (phoneNumber) {
        validatePhoneNumber();
    }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = async (email) => {
    if (!email.endsWith('@gmail.com')) {
      toast.error('Please use a valid Gmail address');
      return false;
    }

    if (signUpMode) {
      try {
        // Check both collections for existing email
        const [petOwnersRes, veterinariansRes] = await Promise.all([
          fetch(`http://localhost:3001/petOwners?email=${email}`),
          fetch(`http://localhost:3001/veterinarians?email=${email}`)
        ]);

        const petOwners = await petOwnersRes.json();
        const veterinarians = await veterinariansRes.json();

        if (petOwners.length > 0 || veterinarians.length > 0) {
          toast.error('Email already exists');
          return false;
        }
      } catch (error) {
        console.error('Email validation error:', error);
        return false;
      }
    }
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
        return false;
    }
    return true;
  };

  const handleSignUp = async (userData, userType) => {
    try {
      const endpoint = userType === 'pet-owner' ? 'petOwners' : 'veterinarians';
      const response = await fetch(`http://localhost:3001/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        toast.success('Registration successful!');
        setSignUpMode(false);
        // Store user info after successful registration
        localStorage.setItem('username', userData.fullName);
        localStorage.setItem('userRole', userType);
        localStorage.setItem('fullName', userData.fullName);
        // Clear form fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPhoneNumber('');
        // Navigate to HomeScreen
        navigate('/HomeScreen');
      } else {
        toast.error('Registration failed');
      }
    } catch (error) {
      toast.error('Error during registration');
      console.error('Registration error:', error);
    }
  };

  const handleSubmit = async () => {
    if (signUpMode && showDocumentUpload) {
      if (!document) {
        toast.error('Please upload your credentials');
        return;
      }

      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Document = reader.result;
          let base64ClinicPhoto = null;
          
          if (clinicPhoto) {
            const photoReader = new FileReader();
            await new Promise((resolve) => {
              photoReader.onloadend = () => {
                base64ClinicPhoto = photoReader.result;
                resolve();
              };
              photoReader.readAsDataURL(clinicPhoto);
            });
          }

          const id = Date.now().toString();
          
          // Store media data separately
          const mediaResponse = await fetch('http://localhost:3001/media', {
            method: 'GET'
          });
          const mediaData = await mediaResponse.json();
          
          // Add new media entries
          const updatedMedia = {
            ...mediaData,
            clinicPhotos: [
              ...mediaData.clinicPhotos,
              {
                id: id,
                data: base64ClinicPhoto
              }
            ],
            credentials: [
              ...mediaData.credentials,
              {
                id: id,
                data: base64Document
              }
            ]
          };

          // Update media.json
          await fetch('http://localhost:3001/media', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedMedia)
          });

          // Create user data without base64 strings
          const userData = {
            id,
            fullName,
            email,
            phoneNumber: countryCode + phoneNumber,
            password,
            clinic: {
              name: clinicName,
              photoId: id, // Reference to media.json
              address: {
                street: address.street,
                barangay: address.barangay,
                city: address.city,
                zipCode: address.zipCode
              },
              schedule: {
                days: {
                  start: openingDays.start,
                  end: openingDays.end
                },
                hours: {
                  open: openingHours.open,
                  close: openingHours.close
                }
              },
              services: selectedServices
            },
            credentialId: id, // Reference to media.json
            status: 'pending',
            role: 'veterinarian',
            createdAt: new Date().toISOString()
          };

          // Store user data in db.json
          const response = await fetch('http://localhost:3001/veterinarianRequests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
          });

          if (!response.ok) {
            throw new Error('Registration failed');
          }

          toast.success('Registration submitted successfully! Please wait for admin approval.');
          onClose();
          
          // Reset form fields...
          // (existing reset code remains the same)
        };

        reader.readAsDataURL(document);
      } catch (error) {
        console.error('Registration error:', error);
        toast.error('Registration failed. Please try again.');
      }
      return;
    }

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Check for admin login
      if (email === 'admin@gmail.com') {
        const response = await fetch('http://localhost:3001/admin');
        const adminData = await response.json();

        if (password === adminData.password) {
          toast.success('Welcome Administrator!');
          navigate('/admin/dashboard');
          return;
        } else {
          toast.error('Invalid admin credentials');
          return;
        }
      }

      // Sign up
      if (signUpMode && showDocumentUpload) {
        if (!document) {
          toast.error('Please upload your credentials');
          return;
        }
  
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Document = reader.result;
            
            let base64ClinicPhoto = null;
            if (clinicPhoto) {
              const photoReader = new FileReader();
              await new Promise((resolve) => {
                photoReader.onloadend = () => {
                  base64ClinicPhoto = photoReader.result;
                  resolve();
                };
                photoReader.readAsDataURL(clinicPhoto);
              });
            }

            // Create a unique ID
            const id = Date.now().toString();
            
            const userData = {
              id,
              fullName,
              email,
              phoneNumber: countryCode + phoneNumber,
              password,
              clinic: {
                name: clinicName,
                photo: base64ClinicPhoto,
                address: {
                  street: address.street,
                  barangay: address.barangay,
                  city: address.city,
                  zipCode: address.zipCode
                },
                schedule: {
                  days: {
                    start: openingDays.start,
                    end: openingDays.end
                  },
                  hours: {
                    open: openingHours.open,
                    close: openingHours.close
                  }
                },
                services: selectedServices
              },
              document: base64Document,
              status: 'pending',
              role: 'veterinarian',
              createdAt: new Date().toISOString()
            };
  
            try {
              const response = await fetch('http://localhost:3001/veterinarianRequests', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
              });
  
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
  
              const result = await response.json();
              console.log('Registration request submitted:', result);
  
              toast.success('Registration request submitted! Please wait for admin approval.');
              // Reset all form states
              setSignUpMode(false);
              setShowDocumentUpload(false);
              setShowClinicForm(false);
              setShowSignUpForm(false);
              setSelectedRole(null);
              setClinicPhoto(null);
              setFullName('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setPhoneNumber('');
              setClinicName('');
              setOpeningDays({ start: '', end: '' });
              setOpeningHours({ open: '', close: '' });
              setAddress({
                street: '',
                barangay: '',
                city: '',
                zipCode: ''
              });
              setDocument(null);
              setSelectedServices([]);
              
            } catch (error) {
              console.error('Registration error:', error);
              toast.error('Registration failed. Please try again.');
            }
          };
  
          reader.readAsDataURL(document);
        } catch (error) {
          console.error('File reading error:', error);
          toast.error('Error processing document. Please try again.');
        }
        return;
      }
  
      // Sign in
      if (!signUpMode) {
        const isEmailValid = await validateEmail(email);
        const isPasswordValid = validatePassword(password);
    
        if (isEmailValid && isPasswordValid) {
          try {
            // Check both collections for the user
            const [petOwnersRes, veterinariansRes] = await Promise.all([
              fetch(`http://localhost:3001/petOwners?email=${email}`),
              fetch(`http://localhost:3001/veterinarians?email=${email}`)
            ]);
  
            const petOwners = await petOwnersRes.json();
            const veterinarians = await veterinariansRes.json();
  
            const user = [...petOwners, ...veterinarians].find(u => u.email === email && u.password === password);
  
            if (user) {
              const isVeterinarian = !!user.clinic;
              // Store user data in localStorage
              localStorage.setItem('userRole', user.clinic ? 'veterinarian' : 'pet-owner');
              localStorage.setItem('fullName', user.fullName);
              localStorage.setItem('userId', user.id.toString());
              localStorage.setItem('username', user.fullName.split(' ')[0]);
  
              toast.success('Login successful!');
              onClose();

              if (isVeterinarian) {
                navigate('/vet/vetDashboard');
              } else {
                onHomeScreenClick(email);
              }
            } else {
              toast.error('Invalid email or password');
            }
          } catch (error) {
            console.error('Login error:', error);
            toast.error('Error during login');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error during login');
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole && !showSignUpForm) {
      setShowSignUpForm(true);
      return;
    }

    // Add validation for the signup form
    if (showSignUpForm && !showClinicForm) {
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      const doPasswordsMatch = validatePasswordMatch();
      const isPhoneValid = validatePhoneNumber();

      if (isEmailValid && isPasswordValid && doPasswordsMatch && isPhoneValid) {
        if (selectedRole === 'veterinarian') {
          setShowClinicForm(true);
        }
      }
      return;
    }

    // Add validation for clinic form
    if (showClinicForm) {
      if (!clinicName || !openingDays.start || !openingDays.end || 
          !openingHours.open || !openingHours.close || 
          !address.street || !address.barangay || 
          !address.city || !address.zipCode) {
        toast.error('Please fill in all clinic details');
        return;
      }
      setShowDocumentUpload(true);
      setShowClinicForm(false);
      return;
    }
  };

  const validatePasswordMatch = () => {
    if (confirmPassword && password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setDocument(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleClinicPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setClinicPhoto(file);
    } else {
      toast.error('Please upload an image file');
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:3001/caragaLocations');
        const data = await response.json();
        setLocations(data);
        setFilteredCities(data.cities.map(city => city.name));
        setFilteredStreets(data.cities.flatMap(city => city.streets));
        setFilteredBarangays(data.cities.flatMap(city => city.barangays));
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const handleStreetSearch = (value) => {
    setAddress({ ...address, street: value });
    if (locations) {
      setFilteredStreets(locations.cities.flatMap(city => 
        city.streets.filter(street => 
          street.toLowerCase().includes(value.toLowerCase())
        )
      ));
    }
  };

  const handleBarangaySearch = (value) => {
    setAddress({ ...address, barangay: value });
    if (locations) {
      setFilteredBarangays(locations.cities.flatMap(city => 
        city.barangays.filter(barangay => 
          barangay.toLowerCase().includes(value.toLowerCase())
        )
      ));
    }
  };

  const handleCitySearch = (value) => {
    setAddress({ ...address, city: value });
    if (locations) {
      setFilteredCities(locations.cities
        .map(city => city.name)
        .filter(city => 
          city.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  const ForgotPasswordModal = () => {
    const handleVerificationSubmit = () => {
        // Simulate sending OTP
        toast.success(`OTP sent to your ${verificationMethod}`);
        setShowOtpInput(true);
    };

    const handleOtpSubmit = () => {
        // Accept any OTP as this is a dummy implementation
        setShowOtpInput(false);
        setShowNewPasswordInput(true);
    };

    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!validatePassword(newPassword)) {
            return;
        }

        try {
            // Find user based on verification method
            const identifier = verificationMethod === 'email' ? resetEmail : resetPhone;
            const searchParam = verificationMethod === 'email' ? 'email' : 'phoneNumber';

            const [petOwnersRes, veterinariansRes] = await Promise.all([
                fetch(`http://localhost:3001/petOwners?${searchParam}=${identifier}`),
                fetch(`http://localhost:3001/veterinarians?${searchParam}=${identifier}`)
            ]);

            const petOwners = await petOwnersRes.json();
            const veterinarians = await veterinariansRes.json();

            const user = [...petOwners, ...veterinarians][0];

            if (user) {
                const endpoint = petOwners.length > 0 ? 'petOwners' : 'veterinarians';
                const response = await fetch(`http://localhost:3001/${endpoint}/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPassword })
                });

                if (!response.ok) {
                    throw new Error('Failed to update password');
                }

                // Show success state instead of closing modal
                setShowNewPasswordInput(false);
                setShowSuccessMessage(true);
            } else {
                toast.error('User not found');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error('Failed to reset password');
        }
    };

    const handleDone = () => {
        setShowForgotPassword(false);
        navigate('/');
    };

    const handleModalClick = (e) => {
        // Prevent click from reaching the overlay
        e.stopPropagation();
    };

    return (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
            <div className="forgot-password-modal" onClick={handleModalClick}>
                <button className="close-button" onClick={() => setShowForgotPassword(false)}>×</button>
                
                {!verificationMethod && (
                    <div className="verification-method">
                        <h2>Verification</h2>
                        <p>Please select one option to send your OTP:</p>
                        <div className="verification-buttons">
                            <button onClick={() => setVerificationMethod('email')}>
                                Verify using Email Address
                            </button>
                            <button onClick={() => setVerificationMethod('phone')}>
                                Verify using Phone Number
                            </button>
                        </div>
                    </div>
                )}

                {verificationMethod && !showOtpInput && !showNewPasswordInput && !showSuccessMessage && (
                    <div className="verification-form">
                        <h2>Enter your {verificationMethod}</h2>
                        {verificationMethod === 'email' ? (
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                        ) : (
                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={resetPhone}
                                onChange={(e) => setResetPhone(e.target.value)}
                            />
                        )}
                        <button onClick={handleVerificationSubmit}>Send OTP</button>
                    </div>
                )}

                {showOtpInput && !showNewPasswordInput && !showSuccessMessage && (
                    <div className="otp-form">
                        <h2>{verificationMethod === 'email' ? 'Email Verification' : 'Phone Verification'}</h2>
                        <p>Please enter the six digit code sent to</p>
                        <p className="sent-to">{verificationMethod === 'email' ? resetEmail : resetPhone}</p>
                        
                        <div className="otp-input-container">
                            {[...Array(6)].map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={otpCode[index] || ''}
                                    onChange={(e) => {
                                        const newOtp = otpCode.split('');
                                        newOtp[index] = e.target.value;
                                        setOtpCode(newOtp.join(''));
                                        
                                        // Auto-focus next input
                                        if (e.target.value && index < 5) {
                                            e.target.nextElementSibling?.focus();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // Handle backspace
                                        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                                            const prevInput = e.target.previousElementSibling;
                                            prevInput?.focus();
                                        }
                                    }}
                                />
                            ))}
                        </div>

                        <div className="resend-timer">
                            <span>Didn't receive it? Resend Code in </span>
                            <span className="timer">00:59 (0/3)</span>
                        </div>

                        <button className="verify-btn" onClick={handleOtpSubmit}>
                            Verify
                        </button>
                    </div>
                )}

                {showNewPasswordInput && !showSuccessMessage && (
                    <div className="new-password-form">
                        <h2>New Password</h2>
                        <p>Set your new password for your account</p>
                        
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Icon 
                                icon={showPassword ? "mdi:eye-off" : "mdi:eye"} 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>

                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                            />
                            <Icon 
                                icon={showPassword ? "mdi:eye-off" : "mdi:eye"} 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>

                        <button className="update-btn" onClick={handlePasswordReset}>
                            Update
                        </button>
                    </div>
                )}

                {showSuccessMessage && (
                    <div className="success-message">
                        <div className="success-icon">
                            <Icon icon="mdi:check" className="check-icon" />
                        </div>
                        <h2>Successfully Updated!</h2>
                        <p>Your new password has been reset successfully</p>
                        <button className="proceed-btn" onClick={handleDone}>
                            Proceed
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>   
          <Icon icon="mdi:close" className="close-icon" onClick={onClose}/>
      
        <div className="modal-side-panel">
          <h2>{signUpMode ? 'Already have an account?' : 'Are you still a newbie?'}</h2>
          <p>
            {signUpMode
              ? 'Click the login button to sign in your account.' 
              : 'Click the signup button to create an account.'}
          </p>
          <button className="btn" onClick={() => setSignUpMode(!signUpMode)}>
            {signUpMode ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div className="modal-main-content">
          {!signUpMode ? (
            <>
              <div className="login-form">
                <h2>LOGIN NOW</h2>
                <p>Welcome back, Fur Parent! Get started.</p>

                <form onSubmit={handleSubmit}>
                  <div className="input-field">
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => validateEmail(email)}/>
                    <Icon icon="mdi:email" className="icon" style={{pointerEvents: 'none'}}/>
                  </div>
                  <div className="input-field">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => validatePassword(password)}/>
                    <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} className="icon" onClick={togglePasswordVisibility}/>
                  </div>
                </form>

                <div className="forgot-password-link">
                  <span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span>
                </div>
                <button type="submit" className="btn" onClick={handleSubmit}>Sign In</button>
              </div>
            </>

          ) : !showSignUpForm ? (
                <div className="signup-form">
                  <h2>REGISTER NOW</h2>
                  <p>Hi there, Fur Parent! Please create an account.</p>

                  <div className="role-selection">
                    <div className={`role-option ${selectedRole === 'veterinarian' ? 'selected' : ''}`} onClick={() => handleRoleSelect('veterinarian')}>
                      <Icon icon="healthicons:doctor-male" className="role-icon"/>
                      <span>Veterinarian</span>
                      <p>Register as a veterinary professional</p>
                    </div>

                    <div className={`role-option ${selectedRole === 'pet-owner' ? 'selected' : ''}`} onClick={() => handleRoleSelect('pet-owner')}>
                      <Icon icon="mdi:dog" className="role-icon"/>
                      <span>Pet Owner</span>
                      <p>Register as a pet owner</p>
                    </div>

                    <button className={`btn continue-btn ${!selectedRole ? 'disabled' : ''}`} onClick={handleContinue} disabled={!selectedRole}>Continue</button>
                  </div>
                </div>

          ) : showSignUpForm && selectedRole === 'pet-owner' ? (
            <div className="signup-form">
              <h2>REGISTER NOW</h2>
              <p>Hi there, Fur Parent! Please create an account.</p>

              <form onSubmit={handleSubmit}>
                  <div className="input-field">
                      <input type="text" placeholder="Full Name"/>
                      <Icon icon="mdi:user" className="icon" style={{pointerEvents:'none'}}/>
                  </div>
                  <div className="input-field">
                      <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => validateEmail(email)}/>
                      <Icon icon="mdi:email" className="icon" style={{pointerEvents:'none'}}/>
                  </div> 
                  <div className="input-field phone-input-container">
                    <div className="country-select-wrapper">
                        <select className="country-select" value={countryCode} onChange={(e) => {setCountryCode(e.target.value); setPhoneNumber('');}}>
                            {countryCodes.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.country} {country.code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={handlePhoneNumberChange} onBlur={handlePhoneBlur} className="phone-input" maxLength={countryCodes.find(c => c.code === countryCode).length}/>
                    <Icon icon="mdi:phone" className="icon" style={{pointerEvents:'none'}}/>
                  </div>
                  <div className="input-field">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => validatePassword(password)}/>
                    <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} className="icon" onClick={togglePasswordVisibility}/>
                  </div>
                  <div className="input-field">
                    <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={validatePasswordMatch}/>
                    <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} className="icon" onClick={togglePasswordVisibility}/>
                  </div>
                  
                <button type="submit" className="btn">Signup</button>
              </form>
            </div>
          ) : showSignUpForm && !showClinicForm && !showDocumentUpload ? (
            <div className="signup-form">
              <h2>REGISTER NOW</h2>
              <p>Hi there, Fur Parent! Please create an account.</p>

              <div className="input-field">
                <input type="text" placeholder="Full Name" />
                <Icon icon="mdi:user" className="icon" style={{pointerEvents:'none'}}/>
              </div>
              <div className="input-field">
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => validateEmail(email)}/>
                <Icon icon="mdi:email" className="icon" style={{pointerEvents:'none'}}/>
              </div>
              <div className="input-field phone-input-container">
                <div className="country-select-wrapper">
                  <select className="country-select" value={countryCode} onChange={(e) => {setCountryCode(e.target.value); setPhoneNumber('');}}>
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.country} {country.code}
                      </option>
                    ))}
                  </select>
                </div>
                    <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={handlePhoneNumberChange} onBlur={handlePhoneBlur} className="phone-input" maxLength={countryCodes.find(c => c.code === countryCode).length}/>
                    <Icon icon="mdi:phone" className="icon" style={{pointerEvents:'none'}}/>
              </div>

                  <div className="input-field">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => validatePassword(password)}/>
                    <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} className="icon" onClick={togglePasswordVisibility}/>
                  </div>
                  <div className="input-field">
                    <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={validatePasswordMatch}/>
                    <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} className="icon" onClick={togglePasswordVisibility}/>
                  </div>
              
                <button className="btn continue-btn" onClick={handleContinue}>Continue</button>
              </div>
          ) : showClinicForm ? (
            <div className="signup-form">
              <h2>CLINIC DETAILS</h2>
              <p>Please provide your clinic information</p>

              <div className="clinic-info-container">
                <div className="input-field clinic-name">
                  <input type="text" placeholder="Clinic Name" value={clinicName} onChange={(e) => setClinicName(e.target.value)}/>
                </div>
                
                <div className="clinic-photo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleClinicPhotoChange}
                    className="file-input"
                  />
                  <label className="photo-upload-label">
                    <Icon icon="mdi:camera" className="camera-icon" />
                    <span>Add Photo</span>
                  </label>
                  {clinicPhoto && (
                    <div className="photo-selected-indicator"></div>
                  )}
                </div>
              </div>

              <div className="day-input">
                <div className="input-field">
                  <select value={openingDays.start} onChange={(e) => setOpeningDays({...openingDays, start: e.target.value})}>
                    <option value="">Open Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <span className="to-text">to</span>
                <div className="input-field">
                  <select value={openingDays.end} onChange={(e) => setOpeningDays({...openingDays, end: e.target.value})}>
                    <option value="">Open Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

                <div className="time-inputs">
                  <div className="input-field">
                    <input type="time" placeholder="Opening Time" value={openingHours.open} onChange={(e) => setOpeningHours({...openingHours, open: e.target.value})}/>
                  </div>

                  <span className="to-text">to</span>
                  <div className="input-field">
                    <input type="time" placeholder="Closing Time" value={openingHours.close} onChange={(e) => setOpeningHours({...openingHours, close: e.target.value})}/>
                  </div>
                </div>

                <div className="address-container">
                  <div className="input-field">
                    <input 
                      type="text"
                      placeholder="Street"
                      value={address.street}
                      onChange={(e) => handleStreetSearch(e.target.value)}
                      onClick={() => setShowStreetDropdown(true)}
                    />
                    <Icon 
                      icon="mdi:chevron-down" 
                      className="down-icon"
                      onClick={() => setShowStreetDropdown(!showStreetDropdown)}
                    />
                    {showStreetDropdown && (
                      <div className="dropdown-list">
                        {filteredStreets.map((street, index) => (
                          <div 
                            key={index}
                            className="dropdown-item"
                            onClick={() => {
                              setAddress({ ...address, street });
                              setShowStreetDropdown(false);
                            }}
                          >
                            {street}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="input-field">
                    <input 
                      type="text"
                      placeholder="Barangay"
                      value={address.barangay}
                      onChange={(e) => handleBarangaySearch(e.target.value)}
                      onClick={() => setShowBarangayDropdown(true)}
                    />
                    <Icon 
                      icon="mdi:chevron-down" 
                      className="down-icon"
                      onClick={() => setShowBarangayDropdown(!showBarangayDropdown)}
                    />
                    {showBarangayDropdown && (
                      <div className="dropdown-list">
                        {filteredBarangays.map((barangay, index) => (
                          <div 
                            key={index}
                            className="dropdown-item"
                            onClick={() => {
                              setAddress({ ...address, barangay });
                              setShowBarangayDropdown(false);
                            }}
                          >
                            {barangay}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="input-field">
                    <input 
                      type="text"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => handleCitySearch(e.target.value)}
                      onClick={() => setShowCityDropdown(true)}
                    />
                    <Icon 
                      icon="mdi:chevron-down" 
                      className="down-icon"
                      onClick={() => setShowCityDropdown(!showCityDropdown)}
                    />
                    {showCityDropdown && (
                      <div className="dropdown-list">
                        {filteredCities.map((city, index) => (
                          <div 
                            key={index}
                            className="dropdown-item"
                            onClick={() => {
                              setAddress({ ...address, city });
                              setShowCityDropdown(false);
                            }}
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="input-field">
                    <input 
                      type="text"
                      placeholder="Zip Code"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                    />
                  </div>
                </div>

                <button className="btn continue-btn" onClick={handleContinue}>Continue</button>
            </div>
          ) : showDocumentUpload ? (
            <div className="signup-form">
              <h2>UPLOAD CREDENTIALS</h2>
              <p>Please upload your veterinary license or credentials</p>

              <div className="document-upload">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {document && (
                  <p className="file-name">Selected file: {document.name}</p>
                )}
              </div>

              <button className="btn submit-btn" onClick={handleSubmit}>
                Submit Registration
              </button>
            </div>
          ) : null }
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
      {showForgotPassword && <ForgotPasswordModal />}
    </div>
  );
};

export default Login;