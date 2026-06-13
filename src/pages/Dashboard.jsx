import "./Dashboard.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [stats, setStats] = useState({
        totalVideos: 0,
        totalDownloads: 0,
        storageUsed: "0",
        latestVideo: "None",
        favoriteMethod: "N/A"
    });

    const userString = localStorage.getItem("user") || "{}";
    const user = JSON.parse(userString);
    const userName = user?.name || "Innovator";

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLogoutModal(false);
        navigate("/login");
    };

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    useEffect(() => {
    const loadStats = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/videos/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            setStats(res.data.data);

        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    loadStats();

}, [API_BASE_URL]);

    return (
        <div className="dashboard-container">
            {/* Animated Background Elements */}
            <div className="background-grid"></div>
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>

            <div className="dashboard-content">
                <header className="dashboard-header">
                    <div className="header-greeting">
                        <h1>Welcome back, <span className="text-gradient">{userName}</span></h1>
                        <p>Here is an overview of your AI processing environment.</p>
                    </div>
                    <button className="logout-btn" onClick={handleLogoutClick}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>End Session</span>
                    </button>
                </header>

                {/* Top Statistics Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Total Videos</p>
                            <h2 className="stat-value">{stats.totalVideos}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Downloads</p>
                            <h2 className="stat-value">{stats.totalDownloads}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Storage Used</p>
                            <h2 className="stat-value">{stats.storageUsed} <span className="unit">GB</span></h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Favorite Method</p>
                            <h2 className="stat-value text-small">{stats.favoriteMethod}</h2>
                        </div>
                    </div>

                    <div className="stat-card wide">
                        <div className="stat-icon pink">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Latest Processing</p>
                            <h2 className="stat-value text-small">{stats.latestVideo}</h2>
                        </div>
                    </div>
                </div>

                {/* Main Action Modules */}
                <div className="action-modules-grid">
                    <Link to="/upload" className="action-module">
                        <div className="module-glow"></div>
                        <div className="module-icon-wrapper">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </div>
                        <div className="module-content">
                            <h3>Initialize Upload</h3>
                            <p>Deploy a new video into the neural processing pipeline for stylization and clipping.</p>
                        </div>
                        <div className="module-arrow">→</div>
                    </Link>

                    <Link to="/downloads" className="action-module">
                        <div className="module-glow"></div>
                        <div className="module-icon-wrapper">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                        </div>
                        <div className="module-content">
                            <h3>Asset Library</h3>
                            <p>Access your secure vault to view, manage, and download your processed video files.</p>
                        </div>
                        <div className="module-arrow">→</div>
                    </Link>
                </div>
            </div>

            {/* Premium Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </div>
                        <h2>End Session?</h2>
                        <p>Are you sure you want to securely log out of your environment? You will need to re-authenticate to access your assets.</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button className="btn-confirm" onClick={confirmLogout}>Confirm Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;