import React, { useState } from "react";
import {Icon} from '@iconify/react';

function Login() {
  const [signUpMode, setSignUpMode] = useState(false);

  const handleBackClick = () => {
    window.location.reload(); // This will refresh the page and return to landing
  };

  return (
    <div className="login-page-container">
      <div className={`container ${signUpMode ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign-In Form */}
            <form action="#" className="sign-in-form">
              <h2>LOGIN NOW</h2>
              <p>Welcome back, Fur Parent! Get started.</p>

              <div className="input-field">
                <input type="email" placeholder="Email" />
                <Icon icon="mdi:email" className="icon"/>
              </div>
              <div className="input-field">
                <input type="password" placeholder="Password" />
                <Icon icon="mdi:eye" className="icon"/>
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
