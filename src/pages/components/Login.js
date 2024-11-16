import React, { useState } from "react";
import {Icon} from '@iconify/react';
import { Toaster, toast } from 'sonner';

function Login({isOpen, onClose}) {
  const [signUpMode, setSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+63');

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

  const validateEmail = (email) => {
    if (!email.endsWith('@gmail.com')) {
        toast.error('Please use a valid email address.');
        return false;
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

const handleSubmit = (e) => {
    e.preventDefault();
    
    if (signUpMode) {
      // Register validation
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      const doPasswordsMatch = validatePasswordMatch();
      const isPhoneValid = validatePhoneNumber();

      if (isEmailValid && isPasswordValid && doPasswordsMatch && isPhoneValid) {
          toast.success('Register Successfully!');
          // Proceed with registration logic
      }
  } else {
      // Login validation
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);

      if (isEmailValid && isPasswordValid) {
          toast.success('Login successfully!');
          // Proceed with login logic
      }
  }
};

const handleRoleSelect = (role) => {
  setSelectedRole(role);
};

const handleContinue = () => {
  if (selectedRole) {
      setShowSignUpForm(true);
  }
};

const validatePasswordMatch = () => {
  if (confirmPassword && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
  }
  return true;
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
                <button type="submit" className="btn">Sign In</button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {!showSignUpForm ? (
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
          ) : (
              <>
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
                        <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} className="icon"/>
                      </div>
                  
                      <button type="submit" className="btn">{signUpMode ? 'Sign up' : 'Login'}</button>
                  </div>
                </>
              )}
              </form>
            )}
          </div>
        </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
};

export default Login;
