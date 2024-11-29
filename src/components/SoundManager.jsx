import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const SoundContext = createContext();

export function useSoundManager() {
    return useContext(SoundContext);
}

export function SoundProvider({ children }) {
    const [isMuted, setIsMuted] = useState(() => {
        const stored = localStorage.getItem('isMuted');
        return stored ? JSON.parse(stored) : false;
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const currentMusicRef = useRef(null);
    const pendingMusicPathRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('isMuted', JSON.stringify(isMuted));
    }, [isMuted]);

    useEffect(() => {
        const handleUserInteraction = () => {
            if (!isInitialized) {
                setIsInitialized(true);
                if (pendingMusicPathRef.current) {
                    playMusic(pendingMusicPathRef.current);
                }
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('keydown', handleUserInteraction);
            }
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, [isInitialized]);

    const stopMusic = () => {
        if (currentMusicRef.current) {
            currentMusicRef.current.pause();
            currentMusicRef.current.currentTime = 0;
            currentMusicRef.current = null;
        }
        pendingMusicPathRef.current = null;
    };

    const playMusic = (musicPath) => {
        if (!musicPath) return;

        if (!isInitialized) {
            pendingMusicPathRef.current = musicPath;
            return;
        }

        if (currentMusicRef.current) {
            currentMusicRef.current.pause();
            currentMusicRef.current.currentTime = 0;
        }

        const audio = new Audio(musicPath);
        audio.volume = 0.5;
        audio.loop = true;

        if (!isMuted) {
            audio.play().catch(console.error);
        }

        currentMusicRef.current = audio;
    };

    const toggleMute = () => {
        setIsMuted(prev => {
            const newValue = !prev;
            if (newValue && currentMusicRef.current) {
                currentMusicRef.current.pause();
            } else if (!newValue && currentMusicRef.current && isInitialized) {
                currentMusicRef.current.play().catch(console.error);
            }
            return newValue;
        });
    };

    return (
        <SoundContext.Provider value={{ playMusic, stopMusic, toggleMute, isMuted, isInitialized }}>
            {children}
        </SoundContext.Provider>
    );
} 