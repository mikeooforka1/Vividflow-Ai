import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import "./styles/style.css";

// Pages
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Download from "./pages/Download";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

// Protected Route
import ProtectedRoute from "./pages/ProtectedRoute";

const App = () => {
    return (
        <Router>
            <Routes>

                {/* Public Routes */}
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/auth"
                    element={<Auth />}
                />

                {/* Protected Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Upload */}
                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <Upload />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Downloads */}
                <Route
                    path="/downloads"
                    element={
                        <ProtectedRoute>
                            <Download />
                        </ProtectedRoute>
                    }
                />

                {/* Catch Unknown Routes */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </Router>
    );
};

export default App;