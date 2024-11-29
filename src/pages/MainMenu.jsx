import { Canvas } from '@react-three/fiber';
import { Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background3D from '../components/Background3D';
import LoginModal from '../components/LoginModal';
import { useSoundManager } from '../components/SoundManager';
import HomePage from './HomePage';

function MainMenu() {
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { playMusic, stopMusic, toggleMute, isMuted } = useSoundManager();

    useEffect(() => {
        const storedIsConnected = localStorage.getItem('isConnected') === 'true';
        if (storedIsConnected) {
            setIsLoggedIn(true);
            navigate('/menu');
            return;
        }

        playMusic('/song_m/menu.mp3');

        // Arrêter la musique quand on quitte la page
        return () => {
            stopMusic();
        };
    }, [navigate, playMusic, stopMusic]);

    const handleStartClick = () => {
        setShowLoginModal(true);
    };

    const handleCloseModal = () => {
        setShowLoginModal(false);
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
        localStorage.setItem('isConnected', 'true');
        stopMusic(); // Arrêter la musique avant de naviguer
        navigate('/menu');
    };

    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center font-press-start cursor-pointer relative">
                <div className="absolute inset-0">
                    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                        <color attach="background" args={['#000000']} />
                        <Background3D />
                    </Canvas>
                </div>
                <HomePage onStartClick={handleStartClick} />
                <button
                    onClick={toggleMute}
                    className="absolute top-4 right-4 bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors z-50"
                >
                    {isMuted ? <VolumeX className="text-white" /> : <Volume2 className="text-white" />}
                </button>
            </div>
            {showLoginModal && (
                <LoginModal onClose={handleCloseModal} onLogin={handleLogin} />
            )}
        </>
    );
}

export default MainMenu; 