import React, { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Upload = () => {
    const [activeTab, setActiveTab] = useState('file');
    const navigate = useNavigate();
    const [fileData, setFileData] = useState(null);
    const [linkData, setLinkData] = useState('');
    const [projectName, setProjectName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedData, setUploadedData] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [processingStage, setProcessingStage] = useState('idle');
    const [conversionMethod, setConversionMethod] = useState('animegan');
    const [processingDetails, setProcessingDetails] = useState({
        framesExtracted: 0,
        framesProcessed: 0,
        estimatedTimeRemaining: 0,
        currentStep: 'Initializing',
        elapsedTime: 0,
        speed: 0,
    });
    const fileInputRef = useRef(null);

    // Supported video formats
    const VIDEO_FORMATS = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'flv': 'video/x-flv',
        'wmv': 'video/x-ms-wmv',
        'm4v': 'video/x-m4v',
        '3gp': 'video/3gpp',
        'ogv': 'video/ogg',
        'ts': 'video/mp2t',
        'mts': 'video/mp2t',
        'mxf': 'application/mxf'
    };

    // Conversion methods
    const CONVERSION_METHODS = {
        animegan: {
            name: 'AnimeGAN',
            description: 'Advanced anime-style conversion',
            icon: '🎨',
            speed: 'Fast',
            quality: 'Excellent'
        },
        opencv: {
            name: 'OpenCV Cartoon',
            description: 'Classic cartoon filter',
            icon: '🎭',
            speed: 'Very Fast',
            quality: 'Good'
        }
    };

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Video platform patterns
    const VIDEO_PLATFORMS = {
        youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)([a-zA-Z0-9_-]{11})/,
        vimeo: /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/,
        instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/,
        tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)|(?:https?:\/\/)?(?:vm|vt)\.tiktok\.com\/(\w+)/,
        dailymotion: /(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-z0-9]+)/,
        twitch: /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/videos\/(\d+)|(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)\/clip\/([a-zA-Z0-9_-]+)/,
        twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/\w+\/status\/(\d+)/,
        facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[a-zA-Z0-9_.-]+\/videos\/(\d+)/,
        linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/posts\/.*video-(\d+)/,
        direct: /^https?:\/\/.+\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v|3gp|ogv|ts|mts)$/i
    };

    const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

    // Generate unique video ID
    const generateVideoId = () => {
        return `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // Validate video file
    const isValidVideoFile = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        const mimeType = file.type;

        if (!Object.keys(VIDEO_FORMATS).includes(extension)) {
            return {
                valid: false,
                error: `Invalid file format: .${extension}. Supported formats: ${Object.keys(VIDEO_FORMATS).join(', ').toUpperCase()}`
            };
        }

        if (mimeType && !mimeType.startsWith('video/') && !['application/mxf'].includes(mimeType)) {
            return {
                valid: false,
                error: 'File must be a valid video file'
            };
        }

        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File size exceeds 5GB limit. Your file is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`
            };
        }

        return { valid: true };
    };

    // Validate video link
    const isValidVideoLink = (url) => {
        try {
            new URL(url);
        } catch {
            return {
                valid: false,
                error: 'Invalid URL format'
            };
        }

        for (const [platform, regex] of Object.entries(VIDEO_PLATFORMS)) {
            if (regex.test(url)) {
                return { valid: true, platform };
            }
        }

        return {
            valid: false,
            error: 'Video link is not from a supported platform. Supported: YouTube, Vimeo, Instagram, TikTok, Dailymotion, Twitch, Twitter/X, Facebook, LinkedIn, or direct video URL'
        };
    };

    // Drag handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Drop handler
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const validation = isValidVideoFile(file);
            if (!validation.valid) {
                setError(validation.error);
                return;
            }
            setFileData(file);
            setError(null);
            setSuccess(null);
        }
    };

    // File change handler
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validation = isValidVideoFile(file);
            if (!validation.valid) {
                setError(validation.error);
                setFileData(null);
                return;
            }
            setFileData(file);
            setError(null);
            setSuccess(null);
        }
    };

    // Link change handler
    const handleLinkChange = (e) => {
        setLinkData(e.target.value);
    };

    // Project name change handler
    const handleProjectNameChange = (e) => {
        setProjectName(e.target.value);
    };

    const getEmbedUrl = (url) => {
        if (!url) return url;

        // YouTube
        const ytMatch = url.match(VIDEO_PLATFORMS.youtube);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
        }
        
        // Vimeo
        const vimeoMatch = url.match(VIDEO_PLATFORMS.vimeo);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        // Dailymotion
        const dmMatch = url.match(VIDEO_PLATFORMS.dailymotion);
        if (dmMatch && dmMatch[1]) {
            return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
        }

        // TikTok (Uses TikTok's v2 embed)
        const tiktokMatch = url.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/);
        if (tiktokMatch && tiktokMatch[1]) {
            return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
        }

        return url;
    };

    // UPLOAD HANDLER
    const handleUpload = async () => {
        setError(null);
        setSuccess(null);

        if (activeTab === 'file') {
            if (!fileData) {
                setError('Please select a video file');
                return;
            }
        } else {
            if (!linkData.trim()) {
                setError('Please enter a video link');
                return;
            }
            const validation = isValidVideoLink(linkData);
            if (!validation.valid) {
                setError(validation.error);
                return;
            }
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const videoId = generateVideoId();
            const formData = new FormData();

            if (activeTab === 'file') {
                formData.append('video', fileData);
            } else {
                formData.append('videoLink', linkData);
            }

            if (projectName.trim()) {
                formData.append('projectName', projectName.trim());
            }

            formData.append('videoId', videoId);

           const response = await axios.post(
    `${API_BASE_URL}/api/upload`,
    formData,
    {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
        }
    }
);

            const uploadedVideoData = {
                videoId: videoId,
                type: activeTab === 'file' ? 'file' : 'link',
                file: activeTab === 'file' ? fileData : null,
                url: activeTab === 'link' ? linkData : null,
                projectName: projectName.trim() || 'Untitled Project',
                uploadedAt: new Date().toLocaleString(),
                responseData: response.data,
                uploadStatus: 'completed',
                processingStatus: 'pending'
            };
            setUploadedData(uploadedVideoData);

            setSuccess('✅ Video uploaded successfully! Ready to process.');
            setFileData(null);
            setLinkData('');
            setProjectName('');
            setUploadProgress(0);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.message ||
                'Upload failed. Please try again.'
            );
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    // ENHANCED PROCESS HANDLER WITH REAL CONVERSION METHOD
   // ===============================
    // UPDATED: Real-Time SSE Progress
    // ===============================
    const handleProcessVideo = async () => {
        if (!uploadedData || !uploadedData.videoId) {
            setError('No video to process. Please upload first.');
            return;
        }

        setProcessing(true);
        setProcessingProgress(0);
        setProcessingStage('processing');
        setError(null);
        setSuccess(null);

        const startTime = Date.now();
        let elapsedSeconds = 0;

        try {
            // Open Server-Sent Events connection for real-time progress
            const response = await fetch(`${API_BASE_URL}/api/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    videoId: uploadedData.videoId,
                    projectName: uploadedData.projectName,
                    videoPath: `src/uploads/${uploadedData.responseData.data.filename}`,
                    conversionMethod: conversionMethod
                })
            });

            if (!response.ok) {
                throw new Error('Failed to start processing');
            }

            // Read Server-Sent Events stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines[lines.length - 1]; // Keep incomplete line in buffer

                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i];
                    
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            // Update progress based on received data
                            if (data.status === 'conversion_progress') {
                                // Real conversion progress from backend
                                const { framesProcessed, totalFrames, percentage } = data;
                                
                                // Calculate overall progress: 35% (extract) + 65% (conversion)
                                const conversionProgress = (percentage / 100) * 65;
                                const overallProgress = 35 + conversionProgress;
                                
                                elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                                const speed = framesProcessed / Math.max(elapsedSeconds, 1);
                                const remainingFrames = totalFrames - framesProcessed;
                                const estimatedSecondsRemaining = Math.ceil(remainingFrames / speed);
                                
                                setProcessingProgress(overallProgress);
                                setProcessingDetails({
                                    framesExtracted: totalFrames,
                                    framesProcessed: framesProcessed,
                                    estimatedTimeRemaining: estimatedSecondsRemaining,
                                    currentStep: `Converting frames (${CONVERSION_METHODS[conversionMethod].name})`,
                                    elapsedTime: elapsedSeconds,
                                    speed: speed.toFixed(2),
                                });
                            } 
                            else if (data.status === 'extraction_progress') {
                                // Frame extraction progress
                                const { framesExtracted, totalFrames } = data;
                                const extractProgress = (framesExtracted / totalFrames) * 35;
                                
                                elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                                
                                setProcessingProgress(Math.min(extractProgress, 35));
                                setProcessingDetails({
                                    framesExtracted: framesExtracted,
                                    framesProcessed: 0,
                                    estimatedTimeRemaining: 0,
                                    currentStep: 'Extracting frames',
                                    elapsedTime: elapsedSeconds,
                                    speed: (framesExtracted / Math.max(elapsedSeconds, 1)).toFixed(2),
                                });
                            }
                            else if (data.status === 'reconstruction_progress') {
                                // Video reconstruction progress
                                const { percentage } = data;
                                const reconProgress = 35 + 65 + (percentage / 100) * 10;
                                
                                elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                                
                                setProcessingProgress(Math.min(reconProgress, 95));
                                setProcessingDetails({
                                    framesExtracted: processingDetails.framesExtracted,
                                    framesProcessed: processingDetails.framesProcessed,
                                    estimatedTimeRemaining: 0,
                                    currentStep: 'Reconstructing video',
                                    elapsedTime: elapsedSeconds,
                                    speed: processingDetails.speed,
                                });
                            }
                            else if (data.status === 'completed') {
                                // Processing completed
                                elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                                
                                setProcessingProgress(100);
                                setProcessingDetails({
                                    framesExtracted: processingDetails.framesExtracted,
                                    framesProcessed: processingDetails.framesProcessed,
                                    estimatedTimeRemaining: 0,
                                    currentStep: 'Complete!',
                                    elapsedTime: elapsedSeconds,
                                    speed: (processingDetails.framesProcessed / elapsedSeconds).toFixed(2),
                                });

                                const updatedData = {
                                    ...uploadedData,
                                    processingStatus: 'completed',
                                    processedData: data.data,
                                    downloadUrl: data.data?.downloadUrl || `/api/download/${uploadedData.videoId}`
                                };

                                setUploadedData(updatedData);
                                setSuccess('✅ Video processed successfully! Ready to download.');
                                setProcessingStage('completed');
                            }
                            else if (data.status === 'error') {
                                throw new Error(data.message || 'Processing failed');
                            }
                        } catch (e) {
                            console.error('Error parsing progress data:', e);
                        }
                    }
                }
            }
        } catch (err) {
            setError(
                err.message ||
                'Processing failed. Please try again.'
            );
            setProcessingProgress(0);
            setProcessingStage('error');
        } finally {
            setProcessing(false);
        }
    };

    // DOWNLOAD HANDLER
   const handleDownloadVideo = () => {
    if (!uploadedData?.videoId) {
        setError("No processed video found");
        return;
    }

    navigate("/downloads");
};
    const handleResetPreview = () => {
        setUploadedData(null);
        setSuccess(null);
        setError(null);
        setFileData(null);
        setLinkData('');
        setProjectName('');
        setProcessing(false);
        setProcessingProgress(0);
        setProcessingStage('idle');
        setProcessingDetails({
            framesExtracted: 0,
            framesProcessed: 0,
            estimatedTimeRemaining: 0,
            currentStep: 'Initializing',
            elapsedTime: 0,
            speed: 0,
        });
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
    };

    const styles = `
        /* ============================================
           UPLOAD PAGE STYLES
           ============================================ */

        .upload-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            position: relative;
            overflow: hidden;
            padding: 40px 20px 80px;
        }

        .upload-page::before {
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

        .upload-page::after {
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
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-40px); }
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

        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .upload-content {
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }

        .upload-header {
            text-align: center;
            margin-bottom: 48px;
            animation: slideInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .upload-header-badge {
            display: inline-block;
            background: linear-gradient(135deg, rgba(0, 102, 255, 0.1), rgba(0, 212, 255, 0.05));
            border: 1px solid rgba(0, 102, 255, 0.2);
            color: #0066ff;
            padding: 10px 16px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .upload-header h1 {
            font-size: 48px;
            font-weight: 800;
            color: #111827;
            margin: 0 0 12px 0;
            letter-spacing: -1px;
        }

        .upload-header h1 .accent {
            background: linear-gradient(135deg, #0066ff, #00d4ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .upload-header p {
            font-size: 18px;
            color: #6b7280;
            margin: 0;
        }

        .upload-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 32px;
            justify-content: center;
        }

        .tab-button {
            padding: 12px 24px;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: #6b7280;
        }

        .tab-button.active {
            background: linear-gradient(135deg, #0066ff, #00d4ff);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 15px rgba(0, 102, 255, 0.3);
        }

        .tab-button:hover {
            border-color: #0066ff;
        }

        .alert {
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 15px;
            font-weight: 500;
            animation: slideInDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .alert.alert-error {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #991b1b;
        }

        .alert.alert-success {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05));
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #15803d;
        }

        .upload-card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 34px rgba(0, 0, 0, 0.08);
            animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            margin-bottom: 32px;
        }

        .upload-zone {
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 60px 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: #f9fafb;
        }

        .upload-zone:hover {
            border-color: #0066ff;
            background: #f0f4ff;
        }

        .upload-zone.drag-active {
            border-color: #0066ff;
            background: #f0f4ff;
            box-shadow: 0 0 20px rgba(0, 102, 255, 0.2);
        }

        .upload-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .upload-zone h3 {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
        }

        .upload-zone p {
            color: #6b7280;
            margin: 0 0 16px 0;
            font-size: 15px;
        }

        .highlight {
            color: #0066ff;
            font-weight: 600;
        }

        .upload-input {
            display: none;
        }

        .file-info {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 16px;
        }

        .divider {
            display: flex;
            align-items: center;
            margin: 32px 0;
            color: #d1d5db;
        }

        .divider::before,
        .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e5e7eb;
        }

        .divider span {
            padding: 0 16px;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box;
            font-family: inherit;
        }

        .form-input:focus {
            outline: none;
            border-color: #0066ff;
            box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }

        .form-input:disabled {
            background: #f3f4f6;
            color: #9ca3af;
            cursor: not-allowed;
        }

        .form-description {
            font-size: 13px;
            color: #6b7280;
            margin-top: 8px;
            margin-bottom: 0;
        }

        .conversion-methods {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .method-option {
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: white;
            text-align: center;
        }

        .method-option:hover {
            border-color: #0066ff;
            background: #f0f4ff;
        }

        .method-option.selected {
            border-color: #0066ff;
            background: linear-gradient(135deg, rgba(0, 102, 255, 0.05), rgba(0, 212, 255, 0.02));
            box-shadow: 0 0 15px rgba(0, 102, 255, 0.1);
        }

        .method-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }

        .method-name {
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
        }

        .method-description {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 8px;
        }

        .method-specs {
            display: flex;
            justify-content: space-around;
            font-size: 11px;
            color: #0066ff;
            font-weight: 500;
        }

        .upload-button {
            width: 100%;
            padding: 14px 24px;
            background: linear-gradient(135deg, #0066ff, #00d4ff);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 15px rgba(0, 102, 255, 0.4);
        }

        .upload-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 102, 255, 0.5);
        }

        .upload-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .progress-text {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
        }

        .upload-progress {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 24px;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #0066ff, #00d4ff);
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 10px rgba(0, 102, 255, 0.5);
        }

        .preview-container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 34px rgba(0, 0, 0, 0.08);
            animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .preview-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 32px;
        }

        .preview-title {
            font-size: 28px;
            font-weight: 800;
            color: #111827;
        }

        .preview-close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #9ca3af;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .preview-close-btn:hover:not(:disabled) {
            background: #f3f4f6;
            color: #374151;
        }

        .preview-close-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .preview-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 32px;
        }

        @media (max-width: 768px) {
            .preview-content {
                grid-template-columns: 1fr;
            }
        }

        .preview-video {
            border-radius: 12px;
            overflow: hidden;
            background: #f3f4f6;
            aspect-ratio: 16/9;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .preview-video video,
        .preview-video iframe {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .preview-info {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .info-section {
            margin-bottom: 24px;
        }

        .info-section:last-child {
            margin-bottom: 0;
        }

        .info-label {
            font-size: 12px;
            font-weight: 700;
            color: #0066ff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .info-value {
            font-size: 15px;
            font-weight: 500;
            color: #111827;
            word-break: break-all;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 600;
            width: fit-content;
            margin-top: 12px;
        }

        .status-badge.completed {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05));
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #15803d;
        }

        .status-badge.pending {
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(217, 119, 6, 0.05));
            border: 1px solid rgba(251, 191, 36, 0.3);
            color: #b45309;
        }

        .conversion-method-selector {
            margin-bottom: 24px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(0, 102, 255, 0.05), rgba(0, 212, 255, 0.02));
            border: 1px solid rgba(0, 102, 255, 0.1);
            border-radius: 8px;
        }

        .conversion-method-label {
            font-size: 13px;
            font-weight: 700;
            color: #0066ff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            display: block;
        }

        .action-buttons {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #e5e7eb;
        }

        .action-button {
            flex: 1;
            min-width: 150px;
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .action-button.primary {
            background: linear-gradient(135deg, #0066ff, #00d4ff);
            color: white;
            box-shadow: 0 4px 15px rgba(0, 102, 255, 0.4);
        }

        .action-button.primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 102, 255, 0.5);
        }

        .action-button.secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
        }

        .action-button.secondary:hover:not(:disabled) {
            background: #e5e7eb;
            border-color: #9ca3af;
        }

        .action-button.success {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .action-button.success:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
        }

        .action-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .processing-container {
            background: linear-gradient(135deg, rgba(0, 102, 255, 0.05), rgba(0, 212, 255, 0.02));
            border: 1px solid rgba(0, 102, 255, 0.1);
            border-radius: 12px;
            padding: 28px;
            margin-bottom: 32px;
        }

        .processing-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .processing-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 18px;
            font-weight: 700;
            color: #111827;
        }

        .processing-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(0, 102, 255, 0.3);
            border-top-color: #0066ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .processing-percentage {
            font-size: 24px;
            font-weight: 800;
            color: #0066ff;
        }

        .main-progress {
            margin-bottom: 24px;
        }

        .main-progress-bar {
            width: 100%;
            height: 12px;
            background: rgba(0, 102, 255, 0.1);
            border-radius: 6px;
            overflow: hidden;
        }

        .main-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #0066ff, #00d4ff);
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 15px rgba(0, 102, 255, 0.5);
        }

        .current-step-section {
            background: white;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
        }

        .current-step-label {
            font-size: 12px;
            font-weight: 700;
            color: #0066ff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .current-step-name {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
        }

        .processing-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

        @media (max-width: 768px) {
            .processing-details {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .detail-item {
            background: white;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
        }

        .detail-label {
            font-size: 12px;
            font-weight: 700;
            color: #0066ff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .detail-value {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
        }

        .detail-value.metric {
            color: #0066ff;
        }

        .detail-subtext {
            font-size: 12px;
            color: #6b7280;
        }

        .processing-timeline {
            background: white;
            padding: 16px;
            border-radius: 8px;
        }

        .timeline-label {
            font-size: 12px;
            font-weight: 700;
            color: #0066ff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }

        .timeline-stages {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .timeline-stage {
            flex: 1;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .timeline-stage.active {
            background: linear-gradient(90deg, #0066ff, #00d4ff);
            box-shadow: 0 0 10px rgba(0, 102, 255, 0.3);
        }

        .timeline-stage.completed {
            background: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }

        .info-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }

        .info-card {
            background: linear-gradient(135deg, rgba(0, 102, 255, 0.05), rgba(0, 212, 255, 0.02));
            border: 1px solid rgba(0, 102, 255, 0.1);
            border-radius: 12px;
            padding: 28px;
            text-align: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .info-card:hover {
            transform: translateY(-4px);
            border-color: rgba(0, 102, 255, 0.3);
            box-shadow: 0 8px 20px rgba(0, 102, 255, 0.1);
        }

        .info-icon {
            font-size: 40px;
            margin-bottom: 12px;
        }

        .info-card h4 {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
        }

        .info-card p {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
        }

        @media (max-width: 768px) {
            .upload-header h1 {
                font-size: 36px;
            }

            .processing-details {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 480px) {
            .upload-card {
                padding: 24px 16px;
            }

            .processing-details {
                grid-template-columns: 1fr;
            }
        }
    `;

    // Show preview if video is uploaded
    const isUploaded = uploadedData !== null;
    const isProcessing = processing;
    const isProcessed = uploadedData?.processingStatus === 'completed';

    if (isUploaded) {
        return (
            <div className="upload-page">
                <style>{styles}</style>
                <div className="upload-content">
                    <div className="preview-container">
                        <div className="preview-header">
                            <h2 className="preview-title">
                                {uploadedData.projectName}
                            </h2>
                            <button
                                className="preview-close-btn"
                                onClick={handleResetPreview}
                                disabled={processing}
                                title="Upload another video"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="preview-content">
                            <div className="preview-video" style={{ backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                                {uploadedData.type === 'file' || (uploadedData.url && uploadedData.url.match(/\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v|3gp|ogv|ts|mts)$/i)) ? (
                                    <video
                                        controls
                                        src={uploadedData.type === 'file' ? URL.createObjectURL(uploadedData.file) : uploadedData.url}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={getEmbedUrl(uploadedData.url)}
                                        title="Video preview"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ border: 'none' }}
                                    />
                                )}
                            </div>

                            <div className="preview-info">
                                <div>
                                    <div className="info-section">
                                        <div className="info-label">Project Name</div>
                                        <div className="info-value">
                                            {uploadedData.projectName}
                                        </div>
                                    </div>

                                    {uploadedData.file && (
                                        <div className="info-section">
                                            <div className="info-label">File Name</div>
                                            <div className="info-value">
                                                {uploadedData.file.name}
                                            </div>
                                        </div>
                                    )}

                                    {uploadedData.file && (
                                        <div className="info-section">
                                            <div className="info-label">File Size</div>
                                            <div className="info-value">
                                                {(uploadedData.file.size / (1024 * 1024)).toFixed(2)} MB
                                            </div>
                                        </div>
                                    )}

                                    <div className="info-section">
                                        <div className="info-label">Uploaded At</div>
                                        <div className="info-value">{uploadedData.uploadedAt}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="status-badge completed">
                                        ✓ Upload Completed
                                    </div>
                                    <div className={`status-badge ${uploadedData.processingStatus}`}>
                                        {uploadedData.processingStatus === 'pending' && '⏳ Pending Processing'}
                                        {uploadedData.processingStatus === 'processing' && '⚙️ Processing...'}
                                        {uploadedData.processingStatus === 'completed' && '✓ Processed'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONVERSION METHOD SELECTOR - ONLY SHOWN IF NOT PROCESSING/PROCESSED */}
                        {!isProcessing && !isProcessed && (
                            <div className="conversion-method-selector">
                                <label className="conversion-method-label">Select Conversion Method</label>
                                <div className="conversion-methods">
                                    {Object.entries(CONVERSION_METHODS).map(([key, method]) => (
                                        <div
                                            key={key}
                                            className={`method-option ${conversionMethod === key ? 'selected' : ''}`}
                                            onClick={() => setConversionMethod(key)}
                                        >
                                            <div className="method-icon">{method.icon}</div>
                                            <div className="method-name">{method.name}</div>
                                            <div className="method-description">{method.description}</div>
                                            <div className="method-specs">
                                                <span>⚡ {method.speed}</span>
                                                <span>✨ {method.quality}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PREMIUM DETAILED PROGRESS SECTION */}
                        {isProcessing && (
                            <div className="processing-container">
                                <div className="processing-header">
                                    <div className="processing-title">
                                        <div className="processing-spinner"></div>
                                        Processing Video with {CONVERSION_METHODS[conversionMethod].name}
                                    </div>
                                    <div className="processing-percentage">
                                        {Math.round(processingProgress)}%
                                    </div>
                                </div>

                                {/* Main Progress Bar */}
                                <div className="main-progress">
                                    <div className="main-progress-bar">
                                        <div
                                            className="main-progress-fill"
                                            style={{ width: `${processingProgress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Current Step Info */}
                                <div className="current-step-section">
                                    <div className="current-step-label">Current Step</div>
                                    <div className="current-step-name">
                                        {processingDetails.currentStep}
                                    </div>
                                </div>

                                {/* Processing Details Grid */}
                                <div className="processing-details">
                                    <div className="detail-item">
                                        <div className="detail-label">Frames Extracted</div>
                                        <div className="detail-value metric">
                                            {processingDetails.framesExtracted.toLocaleString()}
                                        </div>
                                        <div className="detail-subtext">of ~1,800 total</div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-label">Frames Processed</div>
                                        <div className="detail-value metric">
                                            {processingDetails.framesProcessed.toLocaleString()}
                                        </div>
                                        <div className="detail-subtext">conversion applied</div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-label">Elapsed Time</div>
                                        <div className="detail-value">
                                            {formatTime(processingDetails.elapsedTime)}
                                        </div>
                                        <div className="detail-subtext">processing time</div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-label">Est. Time Remaining</div>
                                        <div className="detail-value metric">
                                            {processingDetails.estimatedTimeRemaining > 0
                                                ? formatTime(processingDetails.estimatedTimeRemaining)
                                                : 'Almost done!'}
                                        </div>
                                        <div className="detail-subtext">estimated</div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-label">Processing Speed</div>
                                        <div className="detail-value metric">
                                            {processingDetails.speed}
                                        </div>
                                        <div className="detail-subtext">frames/second</div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-label">Output Quality</div>
                                        <div className="detail-value">4K Ready</div>
                                        <div className="detail-subtext">premium encode</div>
                                    </div>
                                </div>

                                {/* Processing Stages Timeline */}
                                <div className="processing-timeline">
                                    <div className="timeline-label">Processing Stages</div>
                                    <div className="timeline-stages">
                                        <div className={`timeline-stage ${processingProgress > 0 ? 'active' : ''} ${processingProgress > 5 ? 'completed' : ''}`}></div>
                                        <div className={`timeline-stage ${processingProgress > 10 ? 'active' : ''} ${processingProgress > 35 ? 'completed' : ''}`}></div>
                                        <div className={`timeline-stage ${processingProgress > 36 ? 'active' : ''} ${processingProgress > 75 ? 'completed' : ''}`}></div>
                                        <div className={`timeline-stage ${processingProgress > 76 ? 'active' : ''} ${processingProgress > 90 ? 'completed' : ''}`}></div>
                                        <div className={`timeline-stage ${processingProgress > 91 ? 'active' : ''} ${processingProgress > 100 ? 'completed' : ''}`}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="action-buttons">
                            {!isProcessed ? (
                                <button
                                    className="action-button primary"
                                    onClick={handleProcessVideo}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>⚙️ Process Video</>
                                    )}
                                </button>
                            ) : (
                                <button
                                    className="action-button success"
                                    onClick={handleDownloadVideo}
                                >
                                    📥 Download Processed Video
                                </button>
                            )}
                            <button
                                className="action-button secondary"
                                onClick={handleResetPreview}
                                disabled={processing}
                            >
                                ↻ Upload Another
                            </button>
                        </div>
                    </div>

                    <div className="info-cards">
                        <div className="info-card">
                            <div className="info-icon">⚡</div>
                            <h4>Lightning Fast</h4>
                            <p>Average processing time under 5 minutes per video</p>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">🔒</div>
                            <h4>Enterprise Secure</h4>
                            <p>Bank-level encryption for all your video data</p>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">🎨</div>
                            <h4>Multiple Styles</h4>
                            <p>Choose between anime and cartoon conversion methods</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="upload-page">
            <style>{styles}</style>
            <div className="upload-content">
                <div className="upload-header">
                    <div className="upload-header-badge">🎬 AI VIDEO CONVERTER</div>
                    <h1>Transform Your Videos to <span className="accent">Anime Style</span></h1>
                    <p>
                        Upload video files or paste links from YouTube, TikTok, Instagram, and more
                    </p>
                </div>

                <div className="upload-tabs">
                    <button
                        className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('file');
                            setError(null);
                            setSuccess(null);
                        }}
                    >
                        📁 Upload File
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('link');
                            setError(null);
                            setSuccess(null);
                        }}
                    >
                        🔗 Paste Link
                    </button>
                </div>

                {error && <div className="alert alert-error">❌ {error}</div>}
                {success && <div className="alert alert-success">✅ {success}</div>}

                <div className="upload-card">
                    {activeTab === 'file' ? (
                        <>
                            <div
                                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                                onClick={handleBrowseClick}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="upload-icon">📹</div>
                                <h3>Drag & drop your video here</h3>
                                <p>
                                    or <span className="highlight">click to browse</span> your files
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="upload-input"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                                <div className="file-info">
                                    Supports all video formats: MP4, WebM, MOV, AVI, MKV, FLV, WMV, M4V, 3GP, OGV, TS, MTS, MXF • Max size: 5GB
                                </div>
                            </div>

                            <div className="divider">
                                <span>OR</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Paste a video link instead</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://youtube.com/watch?v=... or any video URL"
                                    value={linkData}
                                    onChange={handleLinkChange}
                                    disabled={uploading}
                                />
                                <p className="form-description">
                                    Supports YouTube, Vimeo, Instagram, TikTok, Dailymotion, Twitch, Twitter/X, Facebook, LinkedIn, and direct video links
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label">Video Link</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://youtube.com/watch?v=... or any video URL"
                                    value={linkData}
                                    onChange={handleLinkChange}
                                    disabled={uploading}
                                />
                                <p className="form-description">
                                    Supports YouTube, Vimeo, Instagram, TikTok, Dailymotion, Twitch, Twitter/X, Facebook, LinkedIn, and direct video links
                                </p>
                            </div>

                            <div className="divider">
                                <span>OR</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Upload a video file instead</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="upload-input"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                                <button
                                    type="button"
                                    onClick={handleBrowseClick}
                                    className="action-button primary"
                                    style={{ marginTop: '12px' }}
                                    disabled={uploading}
                                >
                                    📁 Select File
                                </button>
                                <p className="form-description">
                                    Supports all video formats: MP4, WebM, MOV, AVI, MKV, FLV, WMV, M4V, 3GP, OGV, TS, MTS, MXF • Max size: 5GB
                                </p>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Project Name (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Give your project a name (e.g., 'Summer Vlog #2')"
                            value={projectName}
                            onChange={handleProjectNameChange}
                            disabled={uploading}
                        />
                    </div>

                    {uploading && (
                        <div>
                            <div className="progress-text">
                                Uploading: {Math.round(uploadProgress)}%
                            </div>
                            <div className="upload-progress">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <button
                        className="upload-button"
                        onClick={handleUpload}
                        disabled={uploading || (!fileData && !linkData)}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner"></span>
                                Uploading...
                            </>
                        ) : (
                            '📤 Upload Video'
                        )}
                    </button>
                </div>

                <div className="info-cards">
                    <div className="info-card">
                        <div className="info-icon">⚡</div>
                        <h4>Lightning Fast</h4>
                        <p>Average processing time under 5 minutes per video</p>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">🔒</div>
                        <h4>Enterprise Secure</h4>
                        <p>Bank-level encryption for all your video data</p>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">🎨</div>
                        <h4>Multiple Conversion Styles</h4>
                        <p>Choose between anime, cartoon, and more conversion methods</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload;