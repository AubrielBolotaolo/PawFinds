import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination} from 'swiper/modules';
import {Icon} from '@iconify/react';
import Login from './components/Login';

/* Home */
import Logo from './assets/logo.png';
import Icon1 from './assets/login-icon.png';
import Image1 from './assets/home-1.png';
import Curve1 from './assets/white-bottom.png';

/* Offers */
import Curve2 from './assets/blue-bottom.png';
import Photo1 from './assets/offer-1.png';
import Photo2 from './assets/offer-2.png';
import Photo3 from './assets/offer-3.png';
import Photo4 from './assets/offer-4.png';

/* About */
import Image2 from './assets/about-1.png';

/* Contact */
import Image3 from './assets/contact-1.png';

function Navbar({onLoginClick}) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <a href='/'>
                <img src={Logo} alt="Logo" className="logo"/>
            </a>
            <ul className="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#offers">Offers</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul> 
            <div className='icon-container'>
              <img src={Icon1} alt="Login-Icon" className="icon" onClick={onLoginClick}/>
            </div>
        </nav>
    );
}

function Home({onLoginClick}) {
    return (
        <section className="home" id="home">
            <div className="home-content">
                <h1>Your Best Option for Pet Care Solution</h1>
                <p>Instantly connects you to the nearest vet clinic, ensuring your</p>
                <p>pets get the care they need, right when they need it.</p>
                <button className="button" onClick={onLoginClick}>Get Started</button>
            </div>
            <div className="home-images">
                <img src={Image1} alt="Dog and Cat" />
            </div>
            <div className='home-curve-bottom'>
                <img src={Curve1} alt="White Curve" />
            </div>
        </section>
    );
}

function Offers() {
    return (
        <section className="offers" id="offers">
            <h2>What does our website offer?</h2>
            <Swiper
                spaceBetween={5}
                slidesPerView={3}
                pagination={{
                    clickable: true,
                    dynamicBullets: false,
                    renderBullet: function (index, className) {
                        return '<span class="' + className + '"></span>';
                    },
                }}
                navigation={false}
                modules={[Pagination]}
                className="offers-swiper"
            >
                <SwiperSlide>
                    <div className="offer-card" style={{ backgroundImage: `url(${Photo1})` }}>
                        <h3>Find the nearest vet clinic for you!</h3>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="offer-card" style={{ backgroundImage: `url(${Photo2})` }}>
                        <h3>Easily book an appointment!</h3>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="offer-card" style={{ backgroundImage: `url(${Photo3})` }}>
                        <h3>Get the best expert advice!</h3>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="offer-card" style={{ backgroundImage: `url(${Photo4})` }}>
                        <h3>Set for the best pamper day!</h3>
                    </div>
                </SwiperSlide>
            </Swiper>
            <div className='offers-curve-bottom'>
                <img src={Curve2} alt="Blue Curve" />
            </div>
        </section>
    );
}

function About() {
    return (
        <section className="about">
            <div className='about-content'>
                <h2>Know more about our website</h2>
                <p>Pet Finds is designed to simplify pet care by offering a seamless way for pet owners to connect with nearby vet clinics. Book appointments and access expert advice for your pet's health. Whether it's routine care or an emergency, we're here to ensure your pets receive the attention they deserve.</p>
            </div>
            <div className='about-image'>
                <img src={Image2} alt="Happy Dog"/>
            </div>
            <div className='home-curve-bottom'>
                <img src={Curve1} alt="White Curve" />
            </div>
        </section>
    );
}

function Contact() {
    return (
        <div className="team-intro-container">
            <h2>Keep in touch with the core team behind</h2>
            <p>Stay connected with the passionate team behind Paw Finds, dedicated to
            making pet care easier and more accessible for you and your furry companions.
            We’re here to listen, support, and continuously improve your experience.</p>
            <div className="contact-images">
                <img src={Image3} alt="Team" />
            </div>
            <div className="footer">
                <p>2024. Made by Group 7.</p>
                <div className="social-icons">
                    <Icon icon="mdi:gmail" />
                    <Icon icon="mdi:instagram" />
                    <Icon icon="mdi:linkedin" />
                    <Icon icon="mdi:telegram" />
                    <Icon icon="mdi:facebook" />
                    <Icon icon="mdi:github" />
                </div>
            </div>
        </div>
    );
}

function LandingPage() {
    const navigate = useNavigate();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [username, setUsername] = useState('');

    const handleLoginClick = () => {
        setIsLoginModalOpen(true);
      };

    const handleHomeScreenClick = (email) => {
        if (email) {
            const name = email.split('@')[0];
            setUsername(name);
            navigate('/HomeScreen');
        }
    };

    return (
        <div>
            <Navbar onLoginClick={handleLoginClick} />
            <Home onLoginClick={handleLoginClick} />
            <Offers />
            <About />
            <Contact />
            <Login isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onHomeScreenClick={handleHomeScreenClick}/>
        </div>
    );
}

export default LandingPage;
