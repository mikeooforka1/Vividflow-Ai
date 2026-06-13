import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust the base URL as needed

export const uploadVideo = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading video:', error);
        throw error;
    }
};

export const processVideo = async (videoId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/process`, { videoId });
        return response.data;
    } catch (error) {
        console.error('Error processing video:', error);
        throw error;
    }
};

export const downloadClip = async (clipId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/download/${clipId}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading clip:', error);
        throw error;
    }
};

export const fetchClips = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/clips`);
        return response.data;
    } catch (error) {
        console.error('Error fetching clips:', error);
        throw error;
    }
};