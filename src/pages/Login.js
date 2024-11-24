import React, { useState } from "react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
                services: ["General Checkup", "Vaccination"]
              },
              credentials: base64Document,
              role: 'veterinarian',
              createdAt: new Date().toISOString()
            };
  
            try {
              const response = await fetch('http://localhost:3001/veterinarians', {
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
              console.log('Registration successful:', result);
  
              toast.success('Registration successful!');
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>   
        <button className="modal-close" onClick={onClose}>
          <Icon icon="mdi:close" />
        </button>
      
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

                <div className="forgot-password">Forgot Password?</div>
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
                    <input type="text" placeholder="Street" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})}/>
                  </div>
                  <div className="input-field">
                    <input type="text" placeholder="Barangay" value={address.barangay} onChange={(e) => setAddress({...address, barangay: e.target.value})}/>
                  </div>
                  <div className="input-field">
                    <input type="text" placeholder="Municipality/City" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})}/>
                  </div>
                  <div className="input-field">
                    <input type="text" placeholder="Zip Code" value={address.zipCode} onChange={(e) => setAddress({...address, zipCode: e.target.value})}/>
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
    </div>
  );
};

export default Login;