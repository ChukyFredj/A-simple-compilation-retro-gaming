import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { useSoundManager } from '../components/SoundManager';
import Background from '../components/SpaceInvaders/Background';
import Boundaries from '../components/SpaceInvaders/Boundaries';
import Enemies from '../components/SpaceInvaders/Enemies';
import Player from '../components/SpaceInvaders/Player';

function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        const loadingInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(loadingInterval);
                    return 100;
                }
                return Math.min(prev + 0.5, 100);
            });
        }, 10);

        return () => {
            clearInterval(interval);
            clearInterval(loadingInterval);
        };
    }, []);

    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center">
            <div className="text-center w-full max-w-md px-4">
                <h1 className="text-4xl mb-12 text-green-500 font-press-start">Space Invaders</h1>
                <div className="mb-8">
                    <h2 className="text-xl mb-6 text-white font-press-start">Chargement{dots}</h2>
                    <div className="mx-auto w-full max-w-sm h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-green-500">
                        <div
                            className="h-full bg-green-500 transition-all duration-100 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-4 text-green-500 font-press-start">{Math.round(progress)}%</p>
                </div>
                <div className="text-sm text-gray-400 animate-pulse font-press-start">
                    Préparez-vous à défendre la galaxie...
                </div>
            </div>
        </div>
    );
}

export default function SpaceInvaders() {
    const { playMusic } = useSoundManager();
    const [isLoading, setIsLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [wave, setWave] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [showStartModal, setShowStartModal] = useState(true);
    const audioRef = useRef(null);
    const backgroundMusicRef = useRef(null);
    const backgroundMusicX2Ref = useRef(null);
    const shootSoundRef = useRef(null);
    const gameOverSoundRef = useRef(null);
    const victorySoundRef = useRef(null);
    const [chargeLevel, setChargeLevel] = useState(100);
    const [powerUps, setPowerUps] = useState({
        rapidFire: false,
        shield: false,
        infiniteEnergy: false
    });
    const enemiesRef = useRef(null);
    const [highScores, setHighScores] = useState([]);
    const [newHighScorePlace, setNewHighScorePlace] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [scoreMultiplier, setScoreMultiplier] = useState(1);
    const zeroScoreWaves = useRef(0);
    const [showVictoryMessage, setShowVictoryMessage] = useState(false);
    const fadeInterval = useRef(null);
    const navigate = useNavigate();

    const maxWaves = useMemo(() => 10, []);
    const initialPowerUps = useMemo(() => ({
        rapidFire: false,
        shield: false,
        infiniteEnergy: false
    }), []);

    const [quality, setQuality] = useState('high');
    const frameRate = useRef(0);
    const lastFrameTime = useRef(Date.now());
    const framesThisSecond = useRef(0);
    const lastFpsUpdate = useRef(Date.now());

    useEffect(() => {
        const checkPerformance = () => {
            const now = Date.now();
            framesThisSecond.current++;

            if (now > lastFpsUpdate.current + 1000) {
                frameRate.current = framesThisSecond.current;
                framesThisSecond.current = 0;
                lastFpsUpdate.current = now;

                if (frameRate.current < 30 && quality === 'high') {
                    setQuality('low');
                } else if (frameRate.current > 45 && quality === 'low') {
                    setQuality('high');
                }
            }
        };

        const animationFrame = requestAnimationFrame(function animate() {
            checkPerformance();
            requestAnimationFrame(animate);
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [quality]);

    useEffect(() => {
        backgroundMusicRef.current = new Audio('/song_si/background.mp3');
        backgroundMusicRef.current.loop = true;
        backgroundMusicRef.current.volume = 1;

        backgroundMusicX2Ref.current = new Audio('/song_si/background-x2.mp3');
        backgroundMusicX2Ref.current.loop = true;
        backgroundMusicX2Ref.current.volume = 0;

        shootSoundRef.current = new Audio('/song_si/shoot.mp3');
        shootSoundRef.current.volume = 0.3;

        gameOverSoundRef.current = new Audio('/song_si/gameover.mp3');
        gameOverSoundRef.current.volume = 0.5;

        victorySoundRef.current = new Audio('/song_si/victory.mp3');
        victorySoundRef.current.volume = 0.5;

        const handleFirstInteraction = () => {
            setHasInteracted(true);
            if (!gameOver) {
                backgroundMusicRef.current?.play().catch(() => { });
            }
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            [backgroundMusicRef, backgroundMusicX2Ref, shootSoundRef, gameOverSoundRef, victorySoundRef].forEach(ref => {
                if (ref.current) {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                }
            });
        };
    }, []);

    const crossFadeMusic = useCallback((fadeOutMusic, fadeInMusic) => {
        if (fadeInterval.current) {
            clearInterval(fadeInterval.current);
        }

        const fadeDuration = 1000; // 1 seconde de transition
        const steps = 20; // Nombre d'étapes pour le fondu
        const stepTime = fadeDuration / steps;
        let step = 0;

        fadeOutMusic.volume = 1;
        fadeInMusic.volume = 0;
        fadeInMusic.play().catch(() => { });

        fadeInterval.current = setInterval(() => {
            step++;
            fadeOutMusic.volume = Math.max(0, 1 - (step / steps));
            fadeInMusic.volume = Math.min(1, step / steps);

            if (step >= steps) {
                clearInterval(fadeInterval.current);
                fadeOutMusic.pause();
                fadeOutMusic.currentTime = 0;
                fadeInMusic.volume = 1;
            }
        }, stepTime);
    }, []);

    useEffect(() => {
        if (!hasInteracted) return;

        if (gameOver) {
            if (fadeInterval.current) {
                clearInterval(fadeInterval.current);
            }
            backgroundMusicRef.current?.pause();
            backgroundMusicX2Ref.current?.pause();
            return;
        }

        try {
            if (scoreMultiplier === 2) {
                if (!backgroundMusicX2Ref.current?.paused) {
                    // Déjà en train de jouer la musique x2
                    return;
                }
                if (!backgroundMusicRef.current?.paused) {
                    // Transition de normal vers x2
                    crossFadeMusic(backgroundMusicRef.current, backgroundMusicX2Ref.current);
                } else {
                    // Démarrer directement la musique x2
                    backgroundMusicX2Ref.current?.play().catch(() => { });
                }
            } else {
                if (!backgroundMusicRef.current?.paused) {
                    // Déjà en train de jouer la musique normale
                    return;
                }
                if (!backgroundMusicX2Ref.current?.paused) {
                    // Transition de x2 vers normal
                    crossFadeMusic(backgroundMusicX2Ref.current, backgroundMusicRef.current);
                } else {
                    // Démarrer directement la musique normale
                    backgroundMusicRef.current?.play().catch(() => { });
                }
            }
        } catch (error) {
            console.log("Erreur de lecture audio:", error);
        }
    }, [scoreMultiplier, gameOver, hasInteracted, crossFadeMusic]);

    useEffect(() => {
        return () => {
            if (fadeInterval.current) {
                clearInterval(fadeInterval.current);
            }
        };
    }, []);

    const playShootSound = () => {
        if (shootSoundRef.current) {
            shootSoundRef.current.currentTime = 0;
            shootSoundRef.current.volume = 0.3;
            shootSoundRef.current.play().catch(() => { });
        }
    };

    const handleGameOver = (finalScore = false) => {
        // Arrêter la musique de fond avec un petit délai pour laisser le son de game over/victoire se jouer
        setTimeout(() => {
            backgroundMusicRef.current?.pause();
            backgroundMusicX2Ref.current?.pause();
        }, 100);

        if (finalScore) {
            if (victorySoundRef.current) {
                victorySoundRef.current.currentTime = 0;
                victorySoundRef.current.play().catch(() => { });
            }
            setShowVictoryMessage(true);
        } else {
            if (gameOverSoundRef.current) {
                gameOverSoundRef.current.currentTime = 0;
                gameOverSoundRef.current.play().catch(() => { });
            }
        }

        setGameOver(true);

        const username = localStorage.getItem('username') || 'Anonymous';
        let newHighScores = [...highScores];

        const finalPointsScore = finalScore ? 24000 : score;

        const existingScoreIndex = newHighScores.findIndex(hs => hs.pseudo === username);
        const existingScore = existingScoreIndex !== -1 ? newHighScores[existingScoreIndex].score : 0;

        if (finalPointsScore > existingScore || (finalPointsScore > newHighScores[newHighScores.length - 1].score && existingScoreIndex === -1)) {
            if (existingScoreIndex !== -1) {
                newHighScores.splice(existingScoreIndex, 1);
            }

            const newScoreIndex = newHighScores.findIndex(hs => finalPointsScore > hs.score);
            const place = newScoreIndex === -1 ? newHighScores.length + 1 : newScoreIndex + 1;

            if (newScoreIndex === -1) {
                newHighScores.push({
                    pseudo: username,
                    score: finalPointsScore
                });
            } else {
                newHighScores.splice(newScoreIndex, 0, {
                    pseudo: username,
                    score: finalPointsScore
                });
            }

            newHighScores = newHighScores.slice(0, 50).sort((a, b) => b.score - a.score);
            setHighScores(newHighScores);
            setNewHighScorePlace(place);
            setShowConfetti(true);

            localStorage.setItem('spaceInvaders_highScores', JSON.stringify(newHighScores));
        } else {
            setShowConfetti(false);
            setNewHighScorePlace(null);
        }
    };

    const restartGame = () => {
        if (fadeInterval.current) {
            clearInterval(fadeInterval.current);
        }

        if (backgroundMusicRef.current) {
            backgroundMusicRef.current.volume = 1;
        }
        if (backgroundMusicX2Ref.current) {
            backgroundMusicX2Ref.current.volume = 0;
        }

        [audioRef, backgroundMusicRef, backgroundMusicX2Ref, gameOverSoundRef, victorySoundRef].forEach(ref => {
            if (ref.current) {
                ref.current.pause();
                ref.current.currentTime = 0;
            }
        });

        if (audioRef.current) {
            setAudioPlaying(false);
            setAudioProgress(0);
        }

        backgroundMusicRef.current?.play();

        setScore(0);
        setWave(1);
        setGameOver(false);
        setChargeLevel(100);
        setPowerUps(initialPowerUps);
        setScoreMultiplier(1);
        zeroScoreWaves.current = 0;
    };

    const handleEnemyDestroyed = useCallback((points) => {
        const newScore = score + (points * scoreMultiplier);
        setScore(newScore);

        if (wave) {
            setTimeout(() => {
                if (newScore >= 24000) {
                    setScore(24000);
                    setShowVictoryMessage(true);
                    let finalScore = true;
                    setTimeout(() => {
                        handleGameOver(finalScore);
                    }, 100);
                }
            }, 100);
        }
    }, [score, scoreMultiplier, wave]);

    const handleNewWave = useCallback((waveNumber) => {
        setWave(waveNumber);

        if (waveNumber === 6 && score === 0) {
            setScoreMultiplier(2);
        }

        if (waveNumber === 10 && scoreMultiplier === 1) {
            handleGameOver();
        }
    }, [score, scoreMultiplier]);

    useEffect(() => {
        const initGame = async () => {
            try {
                const savedScores = localStorage.getItem('spaceInvaders_highScores');

                if (!savedScores) {
                    const response = await fetch('/highscore_si.json');
                    const data = await response.json();
                    const sortedData = data.sort((a, b) => b.score - a.score);
                    localStorage.setItem('spaceInvaders_highScores', JSON.stringify(sortedData));
                    setHighScores(sortedData);
                } else {
                    const scores = JSON.parse(savedScores);
                    const sortedScores = scores.sort((a, b) => b.score - a.score);
                    localStorage.setItem('spaceInvaders_highScores', JSON.stringify(sortedScores));
                    setHighScores(sortedScores);
                }

                setTimeout(() => {
                    setIsLoading(false);
                }, 2500);
            } catch (error) {
                console.error('Erreur lors du chargement des scores:', error);
                setIsLoading(false);
            }
        };

        initGame();
    }, []);

    const handleAudioControl = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/song_si/Julia.mp3');
            audioRef.current.addEventListener('timeupdate', () => {
                const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                setAudioProgress(progress);
            });
            audioRef.current.addEventListener('ended', () => {
                setAudioPlaying(false);
                setAudioProgress(0);
            });
        }

        if (audioPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setAudioPlaying(!audioPlaying);
    };

    const handleStartGame = () => {
        setHasInteracted(true);
        setShowStartModal(false);
        if (!gameOver) {
            backgroundMusicRef.current?.play().catch(() => { });
        }
    };

    const handleQuit = () => {
        // Arrêter tous les sons
        [audioRef, backgroundMusicRef, backgroundMusicX2Ref, gameOverSoundRef, victorySoundRef].forEach(ref => {
            if (ref.current) {
                ref.current.pause();
                ref.current.currentTime = 0;
            }
        });
        navigate('/');  // Retour au menu principal
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
                [backgroundMusicRef, backgroundMusicX2Ref, shootSoundRef, gameOverSoundRef, victorySoundRef].forEach(ref => {
                    if (ref.current) {
                        ref.current.pause();
                        ref.current.currentTime = 0;
                    }
                });

                playMusic('/song_m/final.mp3');
                navigate('/menu');
                return;
            }
        }
    }, [navigate, playMusic]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="h-screen w-screen">
            {showStartModal && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
                    <div className="text-center font-press-start p-8 bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg shadow-2xl border-2 border-purple-500 transform hover:scale-105 transition-all duration-300">
                        <h2 className="text-3xl mb-6 text-white">Space Invaders</h2>
                        <p className="text-purple-300 mb-8">Prêt à défendre la galaxie ?</p>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-300 mb-6">
                                Commandes :<br />
                                ← → : Déplacer<br />
                                ESPACE : Tirer
                            </p>
                            <button
                                onClick={handleStartGame}
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse"
                            >
                                COMMENCER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute top-4 left-4 z-10 font-press-start text-white">
                Score: {score}
                {scoreMultiplier > 1 && (
                    <span className="ml-2 text-yellow-400">x{scoreMultiplier}</span>
                )}
            </div>
            <div className="absolute top-4 right-4 z-10 font-press-start text-white">
                Vague: {wave}/10
            </div>
            <div className="absolute right-4 top-20 bottom-4 w-64 bg-black bg-opacity-50 rounded p-4 overflow-y-auto z-10 
                scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-green-500 
                hover:scrollbar-thumb-green-400 font-press-start">
                <h2 className="text-white text-sm mb-4 sticky top-0 bg-black bg-opacity-90 py-2">Meilleurs Scores</h2>
                <div className="space-y-2">
                    {highScores.map((hs, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between text-xs truncate
                                ${score === hs.score ? 'text-yellow-400' : 'text-white'}`}
                        >
                            <div className="flex items-center space-x-2 min-w-0">
                                <span className="flex-shrink-0">{index + 1}.</span>
                                <span className="truncate">{hs.pseudo}</span>
                            </div>
                            <span className="flex-shrink-0 ml-2">{hs.score}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute left-4 top-20 z-10 font-press-start text-white">
                <div className="mb-4">
                    <div className="text-sm mb-1 flex justify-between items-center">
                        <span>Énergie</span>
                        <span className="text-xs">{Math.round(chargeLevel)}%</span>
                    </div>
                    <div className="w-32 h-4 bg-gray-800 rounded overflow-hidden border border-gray-600">
                        <div
                            className="h-full bg-blue-500 rounded"
                            style={{ width: `${chargeLevel}%` }}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className={`p-2 rounded ${powerUps.rapidFire ? 'bg-green-500' : 'bg-gray-700'}`}>
                        Tir Rapide
                    </div>
                    <div className={`p-2 rounded ${powerUps.infiniteEnergy ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                        Énergie Infinie
                    </div>
                    <div className={`p-2 rounded ${powerUps.shield ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                        Bouclier
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 z-10 font-press-start text-white">
                <div className="bg-black bg-opacity-50 p-4 rounded">
                    <h3 className="text-sm mb-2">Commandes :</h3>
                    <ul className="text-xs space-y-1">
                        <li>Q et D : Déplacer</li>
                        <li>ESPACE : Tirer</li>
                    </ul>
                </div>
            </div>

            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-70">
                    {showConfetti && (
                        <Confetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                            recycle={false}
                            numberOfPieces={showVictoryMessage ? 300 : 200}
                            colors={['#50ff50', '#ff50ff', '#50ffff', '#ffff50']}
                            gravity={0.3}
                            tweenDuration={4000}
                        />
                    )}
                    <div className="text-center font-press-start text-white">
                        {showVictoryMessage ? (
                            <>
                                <h2 className="text-4xl mb-4 text-yellow-400">Félicitations !</h2>
                                <p className="mb-4 text-xl">Bravo, tu as su relever le défi du Space Invaders !</p>
                            </>
                        ) : wave >= 10 && scoreMultiplier === 1 ? (
                            <>
                                <h2 className="text-4xl mb-4 text-red-500 animate-pulse">Game Over</h2>
                                <p className="mb-4 text-xl">
                                    <span className="text-red-400">Une erreur est survenue</span>, <br />
                                    <span className="text-yellow-400"> Veuillez arrêter d'essayer d'avoir le High score</span>, <br />
                                    <span className="text-green-400"> Vous n'allez pas réussir</span>, <br />
                                    <span className="text-pink-400">:3</span>
                                </p>
                                <p className="mb-6 text-xl">
                                    <span className="text-blue-400">En attendant, je vous laisse une musique qui vous permet de vous apitoyé sur l'argent que vous ne gagnerez jamais</span>
                                    <span className="text-purple-400"> :)</span>
                                </p>
                                <div className="flex flex-col items-center space-y-4 p-4">
                                    <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                                            style={{ width: `${audioProgress}%` }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAudioControl}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-200 mb-4"
                                    >
                                        {audioPlaying ? '⏸️ ' : '▶️ '} 🎵 Écouter la musique de la défaite 🎵
                                    </button>
                                </div>
                            </>
                        ) : (
                            <h2 className="text-4xl mb-4">Game Over</h2>
                        )}
                        <p className="mb-4">
                            Score Final: {score}
                            {scoreMultiplier > 1 && (
                                <span className="text-yellow-400"> (x{scoreMultiplier})</span>
                            )}
                        </p>
                        {newHighScorePlace > 0 && (
                            <div className="text-yellow-400 mb-4">
                                <p>Nouveau High Score !</p>
                                <p className="text-2xl mt-2">Position #{newHighScorePlace}</p>
                            </div>
                        )}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={restartGame}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded transform hover:scale-105 transition-all duration-200"
                            >
                                Rejouer
                            </button>
                            {showVictoryMessage ? (
                                <button
                                    onClick={handleQuit}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transform hover:scale-105 transition-all duration-200"
                                >
                                    Menu
                                </button>
                            ) : (
                                <button
                                    onClick={handleQuit}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded transform hover:scale-105 transition-all duration-200"
                                >
                                    Abandonner
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Canvas
                camera={{ position: [0, 0, 15], fov: 50 }}
                dpr={quality === 'high' ? window.devicePixelRatio : 1}
                performance={{ min: 0.5 }}
            >
                <color attach="background" args={['#000000']} />
                <fog attach="fog" args={['#000000', 30, 100]} />
                <ambientLight intensity={0.5} />
                <Background />
                <Suspense fallback={null}>
                    <Physics>
                        <Boundaries />
                        {!gameOver && !showStartModal && (
                            <>
                                <Player
                                    onGameOver={handleGameOver}
                                    chargeLevel={chargeLevel}
                                    setChargeLevel={setChargeLevel}
                                    powerUps={powerUps}
                                    onShoot={playShootSound}
                                />
                                <Enemies
                                    ref={enemiesRef}
                                    onEnemyDestroyed={handleEnemyDestroyed}
                                    onNewWave={handleNewWave}
                                    maxWaves={maxWaves}
                                    onGameOver={handleGameOver}
                                    currentWave={wave}
                                    setPowerUps={setPowerUps}
                                    powerUps={powerUps}
                                    quality={quality}
                                    score={score}
                                />
                            </>
                        )}
                    </Physics>
                </Suspense>
            </Canvas>
        </div>
    );
}