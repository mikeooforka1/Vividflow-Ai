import React, { useState } from 'react';

const CaptionEditor = ({ captions, onUpdateCaptions }) => {
    const [editedCaptions, setEditedCaptions] = useState(captions);

    const handleCaptionChange = (index, newText) => {
        const updatedCaptions = editedCaptions.map((caption, i) =>
            i === index ? { ...caption, text: newText } : caption
        );
        setEditedCaptions(updatedCaptions);
    };

    const handleSave = () => {
        onUpdateCaptions(editedCaptions);
    };

    return (
        <div>
            <h2>Edit Captions</h2>
            {editedCaptions.map((caption, index) => (
                <div key={index}>
                    <input
                        type="text"
                        value={caption.text}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                    />
                    <span> (Start: {caption.start}, End: {caption.end})</span>
                </div>
            ))}
            <button onClick={handleSave}>Save Captions</button>
        </div>
    );
};

export default CaptionEditor;