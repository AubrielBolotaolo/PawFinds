import React, { useState } from "react";
import {Icon} from '@iconify/react';
import { Toaster, toast } from 'sonner';

function Login({isOpen, onClose, onHomeScreenClick}) {
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
const [fullName, setFullName] = useState('');
const [showDocumentForm, setShowDocumentForm] = useState(false);
const [document, setDocument] = useState(null);
const [documentName, setDocumentName] = useState('');

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
        // Clear form fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPhoneNumber('');
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
    
    if (signUpMode) {
      // Validation checks
      const isEmailValid = await validateEmail(email);
      const isPasswordValid = validatePassword(password);
      const isPhoneValid = validatePhoneNumber();
      
      if (!isEmailValid || !isPasswordValid || !isPhoneValid) {
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (!fullName.trim()) {
        toast.error('Please enter your full name');
        return;
      }

      // Create user data object based on role
      const userData = {
        fullName: fullName,
        email: email,
        password: password,
        phoneNumber: `${countryCode}${phoneNumber}`,
        role: selectedRole,
        createdAt: new Date().toISOString()
      };

      // Add clinic details if veterinarian
      if (selectedRole === 'veterinarian') {
        if (!clinicName || !openingDays.start || !openingDays.end || 
            !openingHours.open || !openingHours.close || 
            !address.street || !address.barangay || 
            !address.city || !address.zipCode) {
          toast.error('Please fill in all clinic details');
          return;
        }

        userData.clinic = {
          name: clinicName,
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
          address: {
            street: address.street,
            barangay: address.barangay,
            city: address.city,
            zipCode: address.zipCode
          }
        };
      }

      try {
        const endpoint = selectedRole === 'veterinarian' ? 'veterinarians' : 'petOwners';
        const response = await fetch(`http://localhost:3001/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        const newUser = await response.json();
        toast.success('Registration successful!');
        
        // Reset form
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
        
        // Switch back to login mode
        setSignUpMode(false);
        setShowClinicForm(false);
        setShowSignUpForm(false);

      } catch (error) {
        console.error('Registration error:', error);
        toast.error('Registration failed. Please try again.');
      }
    } else {
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
            // Store user data in localStorage
            localStorage.setItem('userRole', user.clinic ? 'veterinarian' : 'pet-owner');
            localStorage.setItem('fullName', user.fullName);
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('username', user.fullName.split(' ')[0]);

            toast.success('Login successful!');
            onClose();
            onHomeScreenClick(email);
          } else {
            toast.error('Invalid email or password');
          }
        } catch (error) {
          toast.error('Error during login');
          console.error('Login error:', error);
        }
      }
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (showSignUpForm) {
      // Validate first form
      if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
        toast.error('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!validatePhoneNumber()) {
        return;
      }
      setShowSignUpForm(false);
      setShowClinicForm(true);
    } else if (showClinicForm) {
      // Validate clinic form
      if (!clinicName || 
          !openingDays.start || 
          !openingDays.end || 
          !openingHours.open || 
          !openingHours.close || 
          !address.street || 
          !address.barangay || 
          !address.city || 
          !address.zipCode) {
        toast.error('Please fill in all clinic details');
        return;
      }
      setShowClinicForm(false);
      setShowDocumentForm(true);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file only');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setDocument(file);
      setDocumentName(file.name);
    }
  };

  const handleFinalSignup = async () => {
    if (!document) {
      toast.error('Please upload your veterinary license');
      return;
    }

    try {
      // Convert PDF to base64
      const base64Document = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(document);
      });

      // Create veterinarian data object
      const veterinarianData = {
        fullName,
        email,
        password,
        phoneNumber: `${countryCode}${phoneNumber}`,
        role: 'veterinarian',
        clinic: {
          name: clinicName,
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
          address: {
            street: address.street,
            barangay: address.barangay,
            city: address.city,
            zipCode: address.zipCode
          }
        },
        license: {
          document: base64Document,
          fileName: documentName,
          uploadDate: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        status: 'pending' // for admin approval
      };

      const response = await fetch('http://localhost:3001/veterinarians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(veterinarianData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      toast.success('Registration successful! Please wait for admin approval.');
      
      // Reset all form states
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
      setDocumentName('');
      setShowDocumentForm(false);
      setShowClinicForm(false);
      setShowSignUpForm(false);
      setSignUpMode(false);

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
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
                      <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}/>
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
          ) : showSignUpForm && !showClinicForm ? (
                <div className="signup-form">
                  <h2>REGISTER NOW</h2>
                  <p>Hi there, Fur Parent! Please create an account.</p>

                  <div className="input-field">
                    <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}/>
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

                  <div className="input-field">
                    <input type="text" placeholder="Clinic Name" value={clinicName} onChange={(e) => setClinicName(e.target.value)}/>
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
              ) : showDocumentForm ? (
                <div className="signup-form">
                  <h2>UPLOAD LICENSE</h2>
                  <p>Please upload your veterinary license (PDF format only)</p>

                  <div className="document-upload">
                    <div className="upload-container">
                      <input
                        type="file"
                        id="document-upload"
                        accept=".pdf"
                        onChange={handleDocumentChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="document-upload" className="upload-label">
                        <Icon icon="mdi:file-upload" className="upload-icon" />
                        <span>{documentName || 'Choose PDF file'}</span>
                      </label>
                    </div>
                    {documentName && (
                      <div className="file-info">
                        <Icon icon="mdi:file-document" className="file-icon" />
                        <span>{documentName}</span>
                        <button 
                          className="remove-file"
                          onClick={() => {
                            setDocument(null);
                            setDocumentName('');
                          }}
                        >
                          <Icon icon="mdi:close" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    className="btn signup-btn" 
                    onClick={handleFinalSignup}
                  >
                    Sign Up
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
