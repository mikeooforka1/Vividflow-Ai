import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoLink, setVideoLink] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (event) => {
        setVideoFile(event.target.files[0]);
        setError('');
        setSuccess('');
    };

    const handleLinkChange = (event) => {
        setVideoLink(event.target.value);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData();
        if (videoFile) {
            formData.append('videoFile', videoFile);
        } else if (videoLink) {
            formData.append('videoLink', videoLink);
        } else {
            setError('Please upload a video file or enter a video link.');
            return;
        }

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Video uploaded successfully!');
            setVideoFile(null);
            setVideoLink('');
        } catch (err) {
            setError('Error uploading video. Please try again.');
        }
    };

    return (
        <div>
            <h2>Upload Video</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input type="file" accept="video/*" onChange={handleFileChange} />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Or enter video link"
                        value={videoLink}
                        onChange={handleLinkChange}
                    />
                </div>
                <button type="submit">Upload</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
};

export default UploadForm;