import React, { useState } from "react";
import {Icon} from '@iconify/react';
import { Toaster, toast } from 'sonner';

import Login1 from './assets/login-1.png';
import Login2 from './assets/login-2.png';

function Login() {
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

  return (
    <div className="login-page-container">
      <Toaster position="bottom-right" richColors/>
      <div className={`container ${signUpMode ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign-In Form */}
            <form action="#" className="sign-in-form" onSubmit={handleSubmit}>
              <h2>LOGIN NOW</h2>
              <p>Welcome back, Fur Parent! Get started.</p>

              <div className="input-field">
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => validateEmail(email)}/>
                <Icon icon="mdi:email" className="icon" style={{pointerEvents: 'none'}}/>
              </div>
              <div className="input-field">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => validatePassword(password)}/>
                <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} className="icon" onClick={togglePasswordVisibility}/>
              </div>

              <p className="forgot-password">Forgot Password?</p>
              <input type="submit" value="Login" className="btn" />              
            </form>

            {/* Sign-Up Form */}
            <form action="#" className="sign-up-form" onSubmit={handleSubmit}>
              <h2>REGISTER NOW</h2>
              <p>Hi there, Fur Parent! Please create an account.</p>

              {!showSignUpForm ? (
                <>
                  <div className="role-selection">
                    <div 
                      className={`role-option ${selectedRole === 'veterinarian' ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect('veterinarian')}>
                      <Icon icon="healthicons:doctor-male" className="role-icon"/>
                      <span>Veterinarian</span>
                      <p>Register as a veterinary professional</p>
                    </div>

                    <div 
                      className={`role-option ${selectedRole === 'pet-owner' ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect('pet-owner')}>
                      <Icon icon="mdi:dog" className="role-icon"/>
                      <span>Pet Owner</span>
                      <p>Register as a pet owner</p>
                    </div>

                    <button 
                      className={`btn continue-btn ${!selectedRole ? 'disabled' : ''}`}
                      onClick={handleContinue}
                      disabled={!selectedRole}>
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
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
                      <select 
                          className="country-select"
                          value={countryCode}
                          onChange={(e) => {setCountryCode(e.target.value); setPhoneNumber('');}}>
                          {countryCodes.map((country) => (
                              <option key={country.code} value={country.code}>
                                  {country.country} {country.code}
                              </option>
                          ))}
                      </select>
                    </div>
                      <input 
                          type="tel" 
                          placeholder="Phone Number" 
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          onBlur={handlePhoneBlur}
                          className="phone-input"
                          maxLength={countryCodes.find(c => c.code === countryCode).length}/>
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
                  <input type="submit" className="btn" value="Sign up" onClick={handleSubmit}/>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Panels Container */}
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="left-content">
              <h3>Are you still a newbie?</h3>
              <p>Click the sign up button to proceed to the register process.</p>
              <button className="btn transparent" onClick={() => setSignUpMode(true)}>Sign up</button>
              <img src={Login1} className="dog-image" alt="doctor dog"/>
            </div>
          </div>
          <div className="panel right-panel">
            <div className="right-content">
              <h3>Already have an account?</h3>
              <p>Click the login button to proceed on entering your account.</p>
              <button className="btn transparent" onClick={() => setSignUpMode(false)}>Login</button>
              <img src={Login2} className="cat-image" alt="doctor cat"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
