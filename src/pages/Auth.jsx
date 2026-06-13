import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Auth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successAnim, setSuccessAnim] = useState(false); // Controls the redirect animation
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(""); // Clear error when typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const endpoint = isLogin
                ? `${API_BASE_URL}/api/auth/login`
                : `${API_BASE_URL}/api/auth/signup`;

            const payload = isLogin 
                ? { email: formData.email, password: formData.password }
                : { name: formData.name, email: formData.email, password: formData.password };

            const response = await axios.post(endpoint, payload);

            // Store authentication data
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            // Trigger Success Animation instead of immediate jump
            setLoading(false);
            setSuccessAnim(true);

            // Wait for 2 seconds to show the animation, then redirect
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);

        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || "Authentication failed. Please try again.");
        }
    };

    return (
        <div className="auth-container">
            {/* Embedded CSS for premium single-file styling */}
            <style>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a0f;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    position: relative;
                    overflow: hidden;
                    color: #ffffff;
                }

                /* Animated Background Orbs */
                .auth-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.3;
                    z-index: 0;
                    animation: float 20s infinite ease-in-out;
                }
                .orb-1 { width: 500px; height: 500px; background: #667eea; top: -150px; left: -150px; }
                .orb-2 { width: 400px; height: 400px; background: #764ba2; bottom: -100px; right: -100px; animation-delay: -5s; }

                /* Main Glassmorphic Card */
                .auth-card {
                    width: 100%;
                    max-width: 440px;
                    padding: 48px 40px;
                    background: rgba(20, 20, 25, 0.6);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
                    z-index: 1;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .auth-card.success-mode {
                    transform: scale(0.98);
                    border-color: rgba(46, 213, 115, 0.3);
                    box-shadow: 0 30px 60px rgba(46, 213, 115, 0.1);
                }

                /* Header Styling */
                .auth-header {
                    text-align: center;
                    margin-bottom: 32px;
                    transition: opacity 0.3s ease;
                }
                .auth-title {
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                    letter-spacing: -0.5px;
                    background: linear-gradient(135deg, #fff, #a5b4fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .auth-subtitle {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 15px;
                }

                /* Form Layout */
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    transition: opacity 0.4s ease, transform 0.4s ease;
                }
                
                .form-hidden {
                    opacity: 0;
                    transform: scale(0.95);
                    pointer-events: none;
                    position: absolute;
                    visibility: hidden;
                }

                .input-group {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .input-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                    letter-spacing: 0.5px;
                    margin-left: 4px;
                }

                .auth-input {
                    width: 100%;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    color: #fff;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }

                .auth-input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.05);
                    border-color: #667eea;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
                }

                .auth-input::placeholder { color: rgba(255, 255, 255, 0.2); }

                /* Password Toggle */
                .toggle-pass {
                    position: absolute;
                    right: 16px;
                    top: 40px;
                    cursor: pointer;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 18px;
                    transition: color 0.2s;
                }
                .toggle-pass:hover { color: #fff; }

                /* Error Message */
                .error-message {
                    background: rgba(255, 59, 48, 0.1);
                    color: #ff453a;
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    border: 1px solid rgba(255, 59, 48, 0.2);
                    text-align: center;
                    margin-bottom: 16px;
                    animation: shake 0.4s ease-in-out;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                /* Submit Button */
                .auth-submit {
                    margin-top: 8px;
                    width: 100%;
                    padding: 16px;
                    border: none;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                }

                .auth-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
                }

                .auth-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .spinner {
                    width: 20px; height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Toggle Link */
                .auth-toggle {
                    margin-top: 28px;
                    text-align: center;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                }
                .auth-toggle span {
                    color: #a5b4fc;
                    cursor: pointer;
                    font-weight: 600;
                    transition: color 0.2s;
                    margin-left: 4px;
                }
                .auth-toggle span:hover { color: #fff; }

                /* Success Animation Overlay */
                .success-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: rgba(20, 20, 25, 0.95);
                    backdrop-filter: blur(10px);
                    z-index: 10;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.5s ease;
                }

                .success-overlay.active {
                    opacity: 1;
                    pointer-events: all;
                }

                .success-icon {
                    width: 80px; height: 80px;
                    background: rgba(46, 213, 115, 0.15);
                    color: #2ed573;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 20px;
                    transform: scale(0.5);
                    opacity: 0;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
                }

                .success-overlay.active .success-icon {
                    transform: scale(1);
                    opacity: 1;
                }

                .success-text {
                    font-size: 24px;
                    font-weight: 700;
                    color: #fff;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.5s ease 0.4s;
                }
                
                .success-subtext {
                    color: rgba(255,255,255,0.6);
                    margin-top: 8px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.5s ease 0.5s;
                }

                .success-overlay.active .success-text,
                .success-overlay.active .success-subtext {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>

            <div className="auth-orb orb-1"></div>
            <div className="auth-orb orb-2"></div>

            <div className={`auth-card ${successAnim ? 'success-mode' : ''}`}>
                
                {/* Standard Form Content */}
                <div style={{ opacity: successAnim ? 0 : 1, transition: 'opacity 0.3s ease' }}>
                    <div className="auth-header">
                        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="auth-subtitle">{isLogin ? 'Authenticate to access your workspace.' : 'Initialize your new environment today.'}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    className="auth-input" 
                                    placeholder="John Doe"
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required={!isLogin} 
                                />
                            </div>
                        )}
                        
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                className="auth-input" 
                                placeholder="name@company.com"
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                className="auth-input" 
                                placeholder="••••••••"
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                            />
                            <span className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>

                        {!isLogin && (
                            <div className="input-group">
                                <label className="input-label">Confirm Password</label>
                                <input 
                                    type={showConfirm ? "text" : "password"} 
                                    name="confirmPassword" 
                                    className="auth-input" 
                                    placeholder="••••••••"
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    required={!isLogin} 
                                />
                                <span className="toggle-pass" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? '👁️' : '👁️‍🗨️'}
                                </span>
                            </div>
                        )}

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? (
                                <><span className="spinner"></span> Processing...</>
                            ) : (
                                isLogin ? "Initialize Session" : "Create Environment"
                            )}
                        </button>
                    </form>

                    <div className="auth-toggle">
                        {isLogin ? "Don't have an environment?" : "Already initialized?"}
                        <span onClick={toggleMode}>{isLogin ? 'Sign Up' : 'Log In'}</span>
                    </div>
                </div>

                {/* Success Animation Overlay */}
                <div className={`success-overlay ${successAnim ? 'active' : ''}`}>
                    <div className="success-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div className="success-text">Authentication Successful</div>
                    <div className="success-subtext">Redirecting to secure workspace...</div>
                </div>
            </div>
        </div>
    );
};

export default Auth;