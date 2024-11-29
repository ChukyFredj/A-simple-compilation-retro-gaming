import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense, useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import Ball from '../components/Pong/Ball';
import Borders from '../components/Pong/Borders';
import Paddle from '../components/Pong/Paddle';
import Score from '../components/Pong/Score';
import { useSoundManager } from '../components/SoundManager';

function LoadingScreen() {
    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center">
            <div className="text-center w-full max-w-md px-4">
                <h1 className="text-4xl mb-12 text-green-500 font-press-start">Pong</h1>
                <div className="text-sm text-gray-400 animate-pulse font-press-start">
                    Chargement...
                </div>
            </div>
        </div>
    );
}

export default function Pong() {
    const { playMusic } = useSoundManager();
    const [isLoading, setIsLoading] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [bestTime, setBestTime] = useState(null);
    const [showSecretInput, setShowSecretInput] = useState(false);
    const [customTime, setCustomTime] = useState('');
    const [perfectAiScore, setPerfectAiScore] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [highScores, setHighScores] = useState([]);
    const [newHighScorePlace, setNewHighScorePlace] = useState(null);
    const [victoryMusicPlaying, setVictoryMusicPlaying] = useState(false);
    const [victoryMusicProgress, setVictoryMusicProgress] = useState(0);
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);
    const victorySoundRef = useRef(null);
    const victoryMusicRef = useRef(null);
    const pongSoundRef = useRef(null);
    const navigate = useNavigate();

    // Initialisation des sons
    useEffect(() => {
        victorySoundRef.current = new Audio('/song_si/victory.mp3');
        victorySoundRef.current.volume = 0.5;
        victoryMusicRef.current = new Audio('/song_p/match_point.mp3');
        victoryMusicRef.current.volume = 0.5;
        pongSoundRef.current = new Audio('/song_p/pong.mp3');
        pongSoundRef.current.volume = 0.3;

        victoryMusicRef.current.addEventListener('timeupdate', () => {
            const progress = (victoryMusicRef.current.currentTime / victoryMusicRef.current.duration) * 100;
            setVictoryMusicProgress(progress);
        });
        victoryMusicRef.current.addEventListener('ended', () => {
            setVictoryMusicPlaying(false);
            setVictoryMusicProgress(0);
        });

        return () => {
            [victorySoundRef, victoryMusicRef, pongSoundRef].forEach(ref => {
                if (ref.current) {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                }
            });
        };
    }, []);

    const playPongSound = () => {
        if (pongSoundRef.current) {
            pongSoundRef.current.currentTime = 0;
            pongSoundRef.current.play().catch(() => { });
        }
    };

    // Gestion des touches pour la musique
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space' && gameOver && !showSecretInput && playerScore >= 7) {
                e.preventDefault();
                handleVictoryMusicControl();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameOver, showSecretInput, playerScore]);

    const handleVictoryMusicControl = () => {
        if (!victoryMusicRef.current) return;

        if (victoryMusicPlaying) {
            victoryMusicRef.current.pause();
        } else {
            victoryMusicRef.current.play().catch(() => { });
        }
        setVictoryMusicPlaying(!victoryMusicPlaying);
    };

    // Vérification du username et firstVisit
    useEffect(() => {
        const username = localStorage.getItem('username');
        const firstVisit = localStorage.getItem('firstVisit');

        if (!username) {
            navigate('/');
            return;
        }

        if (firstVisit) {
            const currentTime = Date.now();
            const oneHour = 60 * 60 * 1000;

            if (currentTime - parseInt(firstVisit) > oneHour) {
                // Arrêter toutes les musiques en cours
                [victorySoundRef, victoryMusicRef, pongSoundRef].forEach(ref => {
                    if (ref.current) {
                        ref.current.pause();
                        ref.current.currentTime = 0;
                    }
                });

                playMusic('/song_m/final.mp3');
                navigate('/end');
                return;
            }
        }

        // Charger les high scores
        const initGame = async () => {
            try {
                const savedScores = localStorage.getItem('pong_high_scores');

                if (!savedScores) {
                    const response = await fetch('/src/components/Pong/highscore.json');
                    const data = await response.json();
                    const sortedData = data.sort((a, b) => a.time - b.time);
                    localStorage.setItem('pong_high_scores', JSON.stringify(sortedData));
                    setHighScores(sortedData);
                } else {
                    const scores = JSON.parse(savedScores);
                    const sortedScores = scores.sort((a, b) => a.time - b.time);
                    localStorage.setItem('pong_high_scores', JSON.stringify(sortedScores));
                    setHighScores(sortedScores);
                }

                // Charger le meilleur temps
                const savedBestTime = localStorage.getItem('pong_best_time');
                if (savedBestTime) {
                    setBestTime(parseInt(savedBestTime));
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des scores:', error);
                setIsLoading(false);
            }
        };

        initGame();
    }, [navigate]);

    // Gestion du chronomètre
    useEffect(() => {
        if (gameStarted && !gameOver) {
            startTimeRef.current = Date.now();
            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [gameStarted, gameOver]);

    const handleScore = (isPlayer) => {
        if (isPlayer) {
            setPlayerScore(prev => {
                const newScore = prev + 1;
                if (newScore >= 7) {
                    handleGameWin();
                }
                return newScore;
            });
        } else {
            setAiScore(prev => {
                const newScore = prev + 1;
                // Vérifier si l'IA atteint 6-0
                if (newScore === 6 && playerScore === 0) {
                    setPerfectAiScore(true);
                }
                if (newScore >= 7) {
                    handleGameOver();
                }
                return newScore;
            });
        }
    };

    const handleGameWin = () => {
        const isSecretWin = perfectAiScore

        setGameOver(true);
        clearInterval(timerRef.current);

        // Jouer le son de victoire dans tous les cas
        if (victorySoundRef.current) {
            victorySoundRef.current.currentTime = 0;
            victorySoundRef.current.play().catch(() => { });
        }

        // Pour une victoire secrète, afficher d'abord l'input
        if (isSecretWin) {
            setShowSecretInput(true);
            return; // Sortir de la fonction pour attendre la saisie du temps
        }

        // Pour une victoire normale, gérer les scores immédiatement
        const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        handleScoreUpdate(finalTime);
    };

    const handleScoreUpdate = (finalTime) => {
        const username = localStorage.getItem('username') || 'Anonymous';
        let newHighScores = [...highScores];
        const existingScoreIndex = newHighScores.findIndex(hs => hs.pseudo === username);

        if (existingScoreIndex === -1 || finalTime < newHighScores[existingScoreIndex].time) {
            if (existingScoreIndex !== -1) {
                newHighScores.splice(existingScoreIndex, 1);
            }

            const newScoreIndex = newHighScores.findIndex(hs => finalTime < hs.time);
            const place = newScoreIndex === -1 ? newHighScores.length + 1 : newScoreIndex + 1;

            if (newScoreIndex === -1) {
                newHighScores.push({
                    pseudo: username,
                    time: finalTime
                });
            } else {
                newHighScores.splice(newScoreIndex, 0, {
                    pseudo: username,
                    time: finalTime
                });
            }

            newHighScores = newHighScores.slice(0, 50);
            setHighScores(newHighScores);
            setNewHighScorePlace(place);
            setShowConfetti(true);

            localStorage.setItem('pong_high_scores', JSON.stringify(newHighScores));

            if (!bestTime || finalTime < bestTime) {
                localStorage.setItem('pong_best_time', finalTime.toString());
                setBestTime(finalTime);
            }
        } else {
            setShowConfetti(false);
            setNewHighScorePlace(null);
        }
    };

    const handleGameOver = () => {
        setGameOver(true);
        clearInterval(timerRef.current);
    };

    const restartGame = () => {
        setPlayerScore(0);
        setAiScore(0);
        setGameOver(false);
        setGameStarted(false);
        setElapsedTime(0);
        setShowSecretInput(false);
        setCustomTime('');
        setPerfectAiScore(false);
        setShowConfetti(false);
        setNewHighScorePlace(null);
        setVictoryMusicPlaying(false);
        setVictoryMusicProgress(0);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (victorySoundRef.current) {
            victorySoundRef.current.pause();
            victorySoundRef.current.currentTime = 0;
        }
        if (victoryMusicRef.current) {
            victoryMusicRef.current.pause();
            victoryMusicRef.current.currentTime = 0;
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSecretTimeSubmit = () => {
        const time = parseInt(customTime);
        if (!isNaN(time) && time > 0) {
            setElapsedTime(time); // Mettre à jour le temps affiché
            handleScoreUpdate(time);
            setShowSecretInput(false);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="h-screen w-screen">
            <div className="absolute top-4 left-4 z-10 font-press-start text-white">
                Temps: {formatTime(elapsedTime)}
            </div>
            {bestTime && (
                <div className="absolute top-4 right-4 z-10 font-press-start text-yellow-400">
                    Meilleur temps: {formatTime(bestTime)}
                </div>
            )}

            {/* Commandes */}
            <div className="absolute left-4 top-20 z-10 font-press-start text-white text-sm bg-black bg-opacity-50 p-4 rounded">
                <h3 className="text-yellow-400 mb-2">Commandes:</h3>
                <ul className="space-y-2">
                    <li>↑ ou Z : Monter</li>
                    <li>↓ ou S : Descendre</li>
                </ul>
                <div className="mt-4 text-yellow-400">Premier à 7 !</div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 font-press-start text-white text-4xl">
                {playerScore} - {aiScore}
            </div>

            {/* Affichage des high scores */}
            <div className="absolute right-4 top-20 bottom-4 w-64 bg-black bg-opacity-50 rounded p-4 overflow-y-auto z-10 
                scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-green-500 
                hover:scrollbar-thumb-green-400 font-press-start">
                <h2 className="text-white text-sm mb-4 sticky top-0 bg-black bg-opacity-90 py-2">Meilleurs Temps</h2>
                <div className="space-y-2">
                    {highScores.map((hs, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between text-xs truncate
                                ${elapsedTime === hs.time ? 'text-yellow-400' : 'text-white'}`}
                        >
                            <div className="flex items-center space-x-2 min-w-0">
                                <span className="flex-shrink-0">{index + 1}.</span>
                                <span className="truncate">{hs.pseudo}</span>
                            </div>
                            <span className="flex-shrink-0 ml-2">{formatTime(hs.time)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {!gameStarted && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-70">
                    <div className="text-center font-press-start text-white">
                        <h2 className="text-4xl mb-4">Prêt ?</h2>
                        <button
                            onClick={() => setGameStarted(true)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
                        >
                            Commencer
                        </button>
                    </div>
                </div>
            )}

            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-70">
                    {showConfetti && (
                        <Confetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                            recycle={false}
                            numberOfPieces={300}
                            colors={['#50ff50', '#ff50ff', '#50ffff', '#ffff50']}
                            gravity={0.3}
                            tweenDuration={4000}
                        />
                    )}
                    <div className="text-center font-press-start text-white">
                        {showSecretInput ? (
                            <>
                                <div className="mb-4">
                                    <p className="text-yellow-400 mb-2">Fin Secrète Débloquée !</p>
                                    <p className="text-sm mb-4">Choisissez votre temps :</p>
                                    <input
                                        type="number"
                                        value={customTime}
                                        onChange={(e) => setCustomTime(e.target.value)}
                                        className="bg-gray-800 text-white px-4 py-2 rounded mb-2 w-32 text-center"
                                        min="1"
                                    />
                                    <button
                                        onClick={handleSecretTimeSubmit}
                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded ml-2"
                                    >
                                        Valider
                                    </button>
                                </div>
                                <h2 className="text-4xl mb-4">Fin Secrète !</h2>
                            </>
                        ) : (
                            <>
                                <h2 className="text-4xl mb-4">
                                    {playerScore >= 7 && perfectAiScore ? 'Victoire Légendaire !' : playerScore >= 7 ? 'Victoire !' : 'Game Over'}
                                </h2>
                                <p className="mb-4">Temps: {formatTime(elapsedTime)}</p>
                                {playerScore >= 7 && perfectAiScore && (
                                    <div className="text-yellow-400 mb-4">
                                        <p>Incroyable ! Vous avez vaincu l'IA parfaite !</p>
                                        <p className="text-sm mt-2">Une victoire vraiment impressionnante !</p>
                                    </div>
                                )}
                                {playerScore >= 7 && newHighScorePlace > 0 && (
                                    <div className="text-yellow-400 mb-4">
                                        <p>Nouveau meilleur score !</p>
                                        <p className="text-2xl mt-2">Position #{newHighScorePlace}</p>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={restartGame}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded transform hover:scale-105 transition-all duration-200"
                            >
                                Rejouer
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded transform hover:scale-105 transition-all duration-200"
                            >
                                {playerScore >= 7 ? 'Menu' : 'Abandonner'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {gameOver && !showSecretInput && playerScore >= 7 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="bg-black bg-opacity-70 p-4 rounded-lg text-white font-press-start text-sm flex flex-col items-center">
                        <div className="flex items-center justify-center space-x-4 mb-2">
                            <button
                                onClick={handleVictoryMusicControl}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded"
                            >
                                {victoryMusicPlaying ? 'Pause' : 'Play'}
                            </button>
                        </div>
                        {victoryMusicPlaying && (
                            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-200"
                                    style={{ width: `${victoryMusicProgress}%` }}
                                />
                            </div>
                        )}
                        <p className="text-center mt-2">Une petite musique ?</p>
                    </div>
                </div>
            )}

            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <color attach="background" args={['#000000']} />
                <ambientLight intensity={0.5} />
                <Suspense fallback={null}>
                    <Physics>
                        <Borders />
                        {gameStarted && !gameOver && (
                            <>
                                <Paddle isPlayer={true} onCollision={playPongSound} />
                                <Paddle
                                    isPlayer={false}
                                    playerScore={playerScore}
                                    aiScore={aiScore}
                                    perfectAiScore={perfectAiScore}
                                    onCollision={playPongSound}
                                />
                                <Ball onScore={handleScore} onCollision={playPongSound} />
                                <Score playerScore={playerScore} aiScore={aiScore} />
                            </>
                        )}
                    </Physics>
                </Suspense>
            </Canvas>
        </div>
    );
} 