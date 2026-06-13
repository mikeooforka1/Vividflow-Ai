import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Download = () => {
    const [clips, setClips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState({});

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchProcessedClips();
    }, []);

    const fetchProcessedClips = async () => {
        try {
            setLoading(true);
            setError(null);

            const response =await axios.get( 
   `${API_BASE_URL}/api/videos`,
   {
     headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
}
   }
);
            
            if (response.data && response.data.data) {
                setClips(response.data.data);
            } else {
                setClips([]);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError('No processed videos available yet. Upload and process a video first!');
            } else {
                setError(err.response?.data?.error || 'Failed to fetch clips. Please try again.');
            }
            setClips([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (videoId) => {
    try {
await axios.delete(
    `${API_BASE_URL}/api/download/${videoId}`,
    {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }
);
    

        setClips(prev =>
            prev.filter(v => v.videoId !== videoId)
        );

    } catch (error) {
        setError("Failed to delete video");
    }
};
    const handleDownload = async (videoId, fileName) => {
        try {
            setDownloading(videoId);
            setDownloadProgress({ ...downloadProgress, [videoId]: 0 });

            const response = await axios.get(`${API_BASE_URL}/api/download/${videoId}`, {
                responseType: 'blob',
                  headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
                onDownloadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setDownloadProgress({ ...downloadProgress, [videoId]: percentCompleted });
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || `processed_${videoId}.mp4`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            setDownloading(null);
            setDownloadProgress({ ...downloadProgress, [videoId]: 0 });
        } catch (err) {
            setError(err.response?.data?.error || 'Download failed. Please try again.');
            setDownloading(null);
            setDownloadProgress({ ...downloadProgress, [videoId]: 0 });
        }
    };

    const styles = `
        .download-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            position: relative;
            overflow: hidden;
            padding: 40px 20px 80px;
        }

        .download-page::before {
            content: '';
            position: fixed;
            top: -50%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(0, 102, 255, 0.08), transparent);
            border-radius: 50%;
            animation: float 25s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
        }

        .download-page::after {
            content: '';
            position: fixed;
            bottom: -20%;
            left: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(0, 212, 255, 0.08), transparent);
            border-radius: 50%;
            animation: float 30s ease-in-out infinite reverse;
            pointer-events: none;
            z-index: 0;
        }

        @keyframes float {
            0%, 100% {
                transform: translate(0, 0);
            }
            25% {
                transform: translate(-30px, -30px);
            }
            50% {
                transform: translate(-60px, 0);
            }
            75% {
                transform: translate(-30px, 30px);
            }
        }

        .download-content {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
        }

        .download-header {
            text-align: center;
            margin-bottom: 60px;
            animation: fadeInDown 0.8s ease-out;
        }

        .download-header-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, rgba(0, 102, 255, 0.1), rgba(0, 212, 255, 0.1));
            border: 1px solid rgba(0, 102, 255, 0.3);
            border-radius: 50px;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 600;
            color: #0066ff;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }

        .download-header h1 {
            font-size: clamp(36px, 8vw, 56px);
            font-weight: 700;
            color: #111827;
            margin: 0 0 12px 0;
            line-height: 1.2;
        }

        .download-header h1 .accent {
            background: linear-gradient(135deg, #0066ff, #00d4ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .download-header p {
            font-size: 18px;
            color: #6b7280;
            margin: 0;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.6;
        }

        .alert {
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            font-weight: 500;
            animation: slideInUp 0.3s ease-out;
            backdrop-filter: blur(10px);
        }

        .alert-error {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #991b1b;
        }

        .alert-info {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #1e40af;
        }

        .loading-container {
            text-align: center;
            padding: 60px 20px;
        }

        .loading-spinner {
            display: inline-block;
            width: 48px;
            height: 48px;
            border: 4px solid rgba(0, 102, 255, 0.2);
            border-top-color: #0066ff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 20px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .loading-text {
            font-size: 16px;
            color: #6b7280;
            font-weight: 500;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0, 0, 0, 0.05);
            animation: slideInUp 0.6s ease-out;
        }

        .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
        }

        .empty-state h2 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
        }

        .empty-state p {
            font-size: 16px;
            color: #6b7280;
            margin: 0 0 24px 0;
            line-height: 1.6;
        }

        .clips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
            animation: slideInUp 0.8s ease-out;
        }

        .clip-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
        }

        .clip-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
        }

        .clip-thumbnail {
            width: 100%;
            height: 180px;
            background: linear-gradient(135deg, rgba(0, 102, 255, 0.1), rgba(0, 212, 255, 0.1));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: #0066ff;
            position: relative;
            overflow: hidden;
        }

        .clip-content {
            padding: 20px;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .clip-title {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
            word-break: break-word;
        }

        .clip-caption {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 12px 0;
            flex: 1;
            line-height: 1.5;
        }

        .clip-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
        }

        .clip-info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
        }

        .clip-info-label {
            color: #6b7280;
            font-weight: 500;
        }

        .clip-info-value {
            color: #111827;
            font-weight: 600;
        }

        .clip-actions {
            display: flex;
            gap: 8px;
        }

        .download-button {
            flex: 1;
            padding: 12px;
            background: linear-gradient(135deg, #0066ff, #00d4ff);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(0, 102, 255, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .download-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 102, 255, 0.5);
        }

        .download-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .view-button {
            flex: 1;
            padding: 12px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            color: #374151;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .view-button:hover {
            background: #e5e7eb;
            border-color: #9ca3af;
        }

        .download-progress-container {
            margin-top: 12px;
        }

        .download-progress-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
        }

        .download-progress {
            width: 100%;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
        }

        .download-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #0066ff, #00d4ff);
            border-radius: 2px;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .spinner-small {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
            .clips-grid {
                grid-template-columns: 1fr;
            }

            .download-header h1 {
                font-size: 32px;
            }
        }
    `;

    if (loading) {
        return (
            <div className="download-page">
                <style>{styles}</style>
                <div className="download-content">
                    <div className="download-header">
                        <div className="download-header-badge">
                            📥 Processing Videos
                        </div>
                        <h1>
                            Loading your <span className="accent">clips</span>
                        </h1>
                    </div>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Fetching your processed videos...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && clips.length === 0) {
        return (
            <div className="download-page">
                <style>{styles}</style>
                <div className="download-content">
                    <div className="download-header">
                        <div className="download-header-badge">
                            📥 Download Your Videos
                        </div>
                        <h1>
                            No clips <span className="accent">yet</span>
                        </h1>
                        <p>Your processed videos will appear here</p>
                    </div>
                    {error && <div className="alert alert-error">❌ {error}</div>}
                    <div className="empty-state">
                        <div className="empty-icon">🎬</div>
                        <h2>No Processed Videos</h2>
                        <p>
                            Upload and process a video first to see your clips here.
                            Start by uploading a video file or pasting a link!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="download-page">
            <style>{styles}</style>
            <div className="download-content">
                <div className="download-header">
                    <div className="download-header-badge">
                        📥 Download Your Videos
                    </div>
                    <h1>
                        Your <span className="accent">clips</span>
                    </h1>
                    <p>Download your processed videos anytime</p>
                </div>

                {error && <div className="alert alert-error">❌ {error}</div>}

                {clips.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎬</div>
                        <h2>No Processed Videos Yet</h2>
                        <p>
                            Your processed clips will appear here once you upload and process videos.
                            Start creating amazing anime videos now!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="alert alert-info">
                            ℹ️ Found {clips.length} processed {clips.length === 1 ? 'video' : 'videos'}. Click download to get your anime-style videos!
                        </div>
                        <div className="clips-grid">
                            {clips.map((clip) => (
                                <div key={clip.id || clip.videoId} className="clip-card">
                                  <div className="clip-thumbnail">
    🎬
</div>
                                    <div className="clip-content">
                                        <h3 className="clip-title">{clip.projectName || 'Untitled Video'}</h3>
                                        <p className="clip-caption">{`${clip.conversionMethod.toUpperCase()} processed video` || 'Processed video ready for download'}</p>

                                        <div className="clip-info">
                                            <div className="clip-info-item">
                                                <span className="clip-info-label">Project:</span>
                                                <span className="clip-info-value">{clip.projectName || 'N/A'}</span>
                                            </div>
                                            {clip.fileSize && (
                                                <div className="clip-info-item">
                                                    <span className="clip-info-label">Size:</span>
                                                    <span className="clip-info-value">{clip.fileSize}</span>
                                                </div>
                                            )}
                                            {clip.processingTime && (
                                                <div className="clip-info-item">
                                                    <span className="clip-info-label">Processed:</span>
                                                 <span className="clip-info-value">
    {clip.processingTime}s
</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="clip-actions">
                                            <button
                                                className="download-button"
                                               onClick={() =>
    handleDownload(
        clip.videoId,
        clip.processedVideo?.filename
    )
}
                                                disabled={downloading === (clip.id || clip.videoId)}
                                            >
                                                {downloading === (clip.id || clip.videoId) ? (
                                                    <>
                                                        <span className="spinner-small"></span>
                                                        {Math.round(downloadProgress[clip.id || clip.videoId] || 0)}%
                                                    </>
                                                ) : (
                                                    <>📥 Download</>
                                                )}
                                            </button>
                                            
                                            <button
    className="view-button"
    onClick={() => handleDelete(clip.videoId)}
>
    🗑 Delete
</button>
                                            {clip.previewUrl && (
                                                <button className="view-button" onClick={() => window.open(clip.previewUrl, '_blank')}>
                                                    👁️ Preview
                                                </button>
                                            )}
                                        </div>

                                        {downloading === (clip.id || clip.videoId) && downloadProgress[clip.id || clip.videoId] > 0 && (
                                            <div className="download-progress-container">
                                                <div className="download-progress-label">
                                                    <span>Downloading</span>
                                                    <span>{Math.round(downloadProgress[clip.id || clip.videoId])}%</span>
                                                </div>
                                                <div className="download-progress">
                                                    <div
                                                        className="download-progress-bar"
                                                        style={{ width: `${downloadProgress[clip.id || clip.videoId]}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Download;