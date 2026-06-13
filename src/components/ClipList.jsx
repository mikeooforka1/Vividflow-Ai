import React, { useEffect, useState } from 'react';
import { fetchClips } from '../utils/api';

const ClipList = () => {
    const [clips, setClips] = useState([]);

    useEffect(() => {
        const getClips = async () => {
            const data = await fetchClips();
            setClips(data);
        };

        getClips();
    }, []);

    return (
        <div>
            <h2>Generated Clips</h2>
            <ul>
                {clips.map((clip) => (
                    <li key={clip.id}>
                        <a href={clip.downloadUrl} download>
                            {clip.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClipList;