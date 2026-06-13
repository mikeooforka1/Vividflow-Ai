import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="home-container">
            {/* Animated Background Elements */}
            <div className="background-grid"></div>
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>

            {/* Premium Top Navigation */}
            <header className={`premium-header ${isLoaded ? 'loaded' : ''}`}>
                <div className="header-content">
                    <div className="header-logo">
                        <img src="/images/vividflow-logo.png" alt="VividFlow AI" />
                    </div>
                    <div className="header-actions">
                        {/* Updated to use React Router Link */}
                        <Link to="/login" className="nav-link">Log In</Link>
                        <Link to="/upload" className="nav-button">Get Started</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className={`hero-section ${isLoaded ? 'loaded' : ''}`}>
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-icon">✨</span>
                        <span>Enterprise AI Video Intelligence</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="title-accent">Intelligent</span>
                        <span> Video Clip </span><br/>
                        <span className="title-accent">Generation</span>
                    </h1>

                    <p className="hero-subtitle">
                        Transform your videos into professionally captioned clips with AI-powered precision. 
                        Upload or link your content and let our advanced algorithms create engaging, shareable moments.
                    </p>

                    {/* Premium Upload Button Section */}
                    <div className="hero-cta">
                        {/* Updated to use React Router Link */}
                        <Link to="/upload" className="upload-button primary">
                            <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <span>Upload Your Video</span>
                        </Link>
                    </div>

                    {/* Glassmorphic Stats Panel */}
                    <div className="hero-stats-panel">
                        <div className="stat">
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Processed</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">99.9%</span>
                            <span className="stat-label">Accuracy</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">&lt;60s</span>
                            <span className="stat-label">Speed</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="video-preview-card">
                        <div className="window-controls">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="preview-inner">
                            <div className="play-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </div>
                            <div className="preview-content">
                                <div className="preview-line"></div>
                                <div className="preview-line short"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="gradient-text">Why Choose Our Platform</h2>
                    <p>Enterprise-grade video processing backed by cutting-edge neural networks</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                        </div>
                        <h3>Precision Captioning</h3>
                        <p>Advanced OCR and speech recognition for pixel-perfect, timing-accurate captions.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <h3>Lightning Fast</h3>
                        <p>Process massive video files in seconds utilizing our distributed GPU infrastructure.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h3>Enterprise Secure</h3>
                        <p>Bank-level AES-256 encryption and strict GDPR-compliant data handling protocols.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                        </div>
                        <h3>Customizable Output</h3>
                        <p>Full granular control over typography, branding, caption styling, and formatting.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </div>
                        <h3>Analytics Dashboard</h3>
                        <p>Track processing history, bandwidth usage, and performance metrics in real-time.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        </div>
                        <h3>Multi-Language</h3>
                        <p>Automatic translation and localization capabilities spanning over 50+ languages.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Scale Your Content?</h2>
                    <p>Join top-tier creators and businesses automating their video pipelines.</p>
                    {/* Updated to use React Router Link */}
                    <Link to="/upload" className="cta-button">
                        <span>Deploy AI Processor</span>
                        <svg className="button-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;