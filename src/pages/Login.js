import React, { useState } from "react";
import {Icon} from '@iconify/react';

function Login() {
  const [signUpMode, setSignUpMode] = useState(false);

  return (
    <div className={`container ${signUpMode ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign-In Form */}
          <form action="#" className="sign-in-form">
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <Icon icon="mdi:user" />
              <input type="text" placeholder="Username" />
            </div>
            <div className="input-field">
              <Icon icon="mdi:lock" />
              <input type="password" placeholder="Password" />
            </div>
            <input type="submit" value="Login" className="btn solid" />
            <p className="social-text">Or Sign in with social platforms</p>
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
            <p className="social-text">Or Sign up with social platforms</p>
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
  );
}

export default Login;
