import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Crown, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundShader from '../components/BackgroundShader';

export default function End() {
    const navigate = useNavigate();
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [showModal, setShowModal] = useState(true);
    const [pongPosition, setPongPosition] = useState(null);
    const [spacePosition, setSpacePosition] = useState(null);
    const audioRef = useRef(null);

    const isChampion = pongPosition === 1 && spacePosition === 1;

    useEffect(() => {
        // Récupérer les scores
        const username = localStorage.getItem('username');
        const pongScores = JSON.parse(localStorage.getItem('pong_high_scores') || '[]');
        const spaceScores = JSON.parse(localStorage.getItem('spaceInvaders_highScores') || '[]');

        // Trier les scores de Pong (temps le plus petit = meilleur)
        const sortedPongScores = [...pongScores].sort((a, b) => a.time - b.time);
        const pongIndex = sortedPongScores.findIndex(score => score.pseudo === username);
        if (pongIndex !== -1) {
            setPongPosition(pongIndex + 1);
        }

        // Trier les scores de Space Invaders (score le plus grand = meilleur)
        const sortedSpaceScores = [...spaceScores].sort((a, b) => b.score - a.score);
        const spaceIndex = sortedSpaceScores.findIndex(score => score.pseudo === username);
        if (spaceIndex !== -1) {
            setSpacePosition(spaceIndex + 1);
        }

        // Initialisation de la musique
        audioRef.current = new Audio('/song_m/final.mp3');
        audioRef.current.volume = 0.5;
        audioRef.current.loop = true;

        audioRef.current.addEventListener('timeupdate', () => {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setAudioProgress(progress);
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    // Gestion des touches pour la musique
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleAudioControl();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [audioPlaying]);

    const handleAudioControl = () => {
        if (!audioRef.current) return;

        if (audioPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => { });
        }
        setAudioPlaying(!audioPlaying);
    };

    const handleStartClick = () => {
        audioRef.current.play().catch(() => { });
        setAudioPlaying(true);
        setShowModal(false);
    };

    const handleRestart = () => {
        // Nettoyer le localStorage
        localStorage.clear();
        // Rediriger vers la page d'accueil
        navigate('/');
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden' }}>
            <Canvas
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                camera={{ position: [0, 0, 0.5], fov: 45 }}
            >
                <BackgroundShader />
            </Canvas>

            {showModal ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center p-8 rounded-lg"
                    >
                        <h2 className="text-4xl mb-8 text-white font-press-start">Fin de la Session</h2>
                        <button
                            onClick={handleStartClick}
                            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-press-start transform hover:scale-105 transition-all duration-200"
                        >
                            Commencer
                        </button>
                    </motion.div>
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-press-start z-10">
                    <h1 className="text-6xl mb-8 text-center">Fin du Jeu</h1>
                    <div className="text-2xl mb-16 text-center">
                        {isChampion ? (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 1, type: "spring" }}
                                className="mb-8"
                            >
                                <Trophy className="text-yellow-400 w-24 h-24 mx-auto mb-4" />
                                <p className="text-yellow-400 text-4xl mb-4">
                                    GG Champion !
                                </p>
                                <p className="text-yellow-400 text-2xl">
                                    Tu as remporté la Retro Gaming Cup !
                                </p>
                            </motion.div>
                        ) : (
                            <p className="text-yellow-400 mb-4">
                                Merci d'avoir joué !
                            </p>
                        )}
                        {pongPosition && (
                            <p className="text-green-400 mb-2 flex items-center justify-center gap-2">
                                Position Pong: #{pongPosition}
                                {pongPosition === 1 && (
                                    <Crown className="text-yellow-400 w-6 h-6 inline animate-bounce" />
                                )}
                            </p>
                        )}
                        {spacePosition && (
                            <p className="text-blue-400 mb-2 flex items-center justify-center gap-2">
                                Position Space Invaders: #{spacePosition}
                                {spacePosition === 1 && (
                                    <Crown className="text-yellow-400 w-6 h-6 inline animate-bounce" />
                                )}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4 text-center">
                        <button
                            onClick={handleRestart}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg transform hover:scale-105 transition-all duration-200"
                        >
                            Recommencer une partie
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 