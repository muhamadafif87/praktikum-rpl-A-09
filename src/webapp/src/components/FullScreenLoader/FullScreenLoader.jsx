import React, { useState, useEffect } from 'react';
import './FullScreenLoader.css';

const FullScreenLoader = ({ messages = ["Memuat data..."] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        if (messages.length <= 1) return;

        const intervalId = setInterval(() => {
            setOpacity(0); // Fade out
            
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
                setOpacity(1); // Fade in
            }, 500); // Wait for fade out to complete before changing text

        }, 3500); // Change message every 3.5 seconds

        return () => clearInterval(intervalId);
    }, [messages]);

    return (
        <div className="fsl-container">
            <main className="fsl-main">
                {/* Brand Identity */}
                <div className="fsl-brand">
                    <div className="fsl-brand-text">
                        KostHub<span className="fsl-brand-dot">.</span>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="fsl-spinner-wrapper">
                    <svg className="fsl-spinner" viewBox="25 25 50 50">
                        <circle className="fsl-spinner-circle" cx="50" cy="50" fill="none" r="20" strokeLinecap="round" strokeWidth="3"></circle>
                    </svg>
                    <div className="fsl-spinner-bg"></div>
                </div>

                {/* Status Messaging */}
                <div className="fsl-message-wrapper">
                    <p 
                        className="fsl-message" 
                        style={{ opacity }}
                    >
                        {messages[currentIndex]}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default FullScreenLoader;
