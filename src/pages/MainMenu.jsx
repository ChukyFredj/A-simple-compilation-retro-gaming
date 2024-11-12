import React, { useEffect, useState } from 'react';
import LoginModal from '../components/LoginModal';
import GameMenu from './GameMenu';
import HomePage from './HomePage';

function MainMenu() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const storedIsConnected = localStorage.getItem('isConnected') === 'true';

        if (storedIsConnected) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleStartClick = () => {
        setShowLoginModal(true);
    };

    const handleCloseModal = () => {
        setShowLoginModal(false);
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    if (!isLoggedIn) {
        return (
            <>
                <HomePage onStartClick={handleStartClick} />
                {showLoginModal && (
                    <LoginModal onClose={handleCloseModal} onLogin={handleLogin} />
                )}
            </>
        );
    }

    return <GameMenu />;
}

export default MainMenu; 