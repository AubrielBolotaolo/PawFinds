import React, { useState } from "react";
import {Icon} from '@iconify/react';
import { Toaster, toast } from 'sonner';

function Login() {
  const [signUpMode, setSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    if (!email.endsWith('@gmail.com')) {
        toast.error('Please use a valid Gmail address');
        return false;
    }
    return true;
};

const validatePassword = (password) => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
        return false;
    }
    return true;
};

const handleSubmit = (e) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
        toast.success('Login successfully!');
    }
};

  return (
    <div className="login-page-container">
      <div className={`container ${signUpMode ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <Toaster position="bottom-right" richColors/>
            {/* Sign-In Form */}
            <form action="#" className="sign-in-form" onSubmit={handleSubmit}>
              <h2>LOGIN NOW</h2>
              <p>Welcome back, Fur Parent! Get started.</p>

              <div className="input-field">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => validateEmail(email)}/>
                <Icon icon="mdi:email" className="icon" style={{pointerEvents: 'none'}}/>
              </div>
              <div className="input-field">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => validatePassword(password)}/>
                <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} className="icon" onClick={togglePasswordVisibility}/>
              </div>

              <p className="forgot-password">Forgot Password?</p>
              <input type="submit" value="Login" className="btn" />
              <p className="social-text">Or</p>
              <div className="social-media">
                <a href="#" className="social-icon">
                  <Icon icon="mdi:facebook" />
                </a>
                <a href="#" className="social-icon">
                  <Icon icon="mdi:twitter" />
                </a>
                <a href="#" className="social-icon">
                  <Icon icon="mdi:google" />
                </a>
                <a href="#" className="social-icon">
                  <Icon icon="mdi:linkedin" />
                </a>
              </div>
            </form>

            {/* Sign-Up Form */}
            <form action="#" className="sign-up-form">
              <h2 className="title">Sign up</h2>
              <div className="input-field">
                <Icon icon="mdi:user" />
                <input type="text" placeholder="Username" />
              </div>
              <div className="input-field">
                <Icon icon="mdi:email" />
                <input type="email" placeholder="Email" />
              </div>
              <div className="input-field">
                <Icon icon="mdi:lock" />
                <input type="password" placeholder="Password" />
              </div>
              <input type="submit" className="btn" value="Sign up" />
              <p className="social-text">Or</p>
              <div className="social-media">
                <a href="#" className="social-icon">
                  <Icon icon="mdi:facebook" />
                </a>
                <a href="#" className="social-icon">
                  <Icon icon="mdi:twitter" />
                </a>
                <a href="#" className="social-icon">
                  <Icon icon="mdi:google" />
                </a>
                <a href="#" className="social-icon">
                  <Icon icon="mdi:linkedin" />
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Panels Container */}
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis,
                ex ratione. Aliquid!
              </p>
              <button
                className="btn transparent"
                onClick={() => setSignUpMode(true)}
              >
                Sign up
              </button>
            </div>
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                laboriosam ad deleniti.
              </p>
              <button
                className="btn transparent"
                onClick={() => setSignUpMode(false)}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
