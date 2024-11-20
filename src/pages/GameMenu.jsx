import { motion } from 'framer-motion';
import { Clock, Github } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';

function GameMenu() {
    const [showWelcome, setShowWelcome] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        const firstVisit = localStorage.getItem('firstVisit');
        if (!firstVisit) {
            setShowWelcome(true);
        } else {
            const timeSinceFirstVisit = new Date().getTime() - parseInt(firstVisit, 10);
            const oneHour = 60 * 60 * 1000;
            if (timeSinceFirstVisit < oneHour) {
                setTimeRemaining(Math.ceil((oneHour - timeSinceFirstVisit) / 1000));
            }
        }
    }, []);

    useEffect(() => {
        let timer;
        if (timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining(prevTime => prevTime - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeRemaining]);

    const handleStartJourney = () => {
        const currentTime = new Date().getTime();
        localStorage.setItem('firstVisit', currentTime);
        setShowWelcome(false);
        setTimeRemaining(60 * 60); // 1 heure en secondes
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-press-start relative">
            <div className="bg-space absolute inset-0"></div>
            {showWelcome ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 p-8 text-white z-20 w-full h-full flex flex-col items-center justify-center"
                >
                    <h2 className="text-4xl font-bold mb-4 text-center text-yellow-400">Bienvenue à la Retro Gaming Cup, champion !</h2>
                    <p className="mb-4 text-lg text-center">
                        Vous voilà enfin, prêt à en découdre avec l'élite des joueurs de jeux rétro. Votre réputation vous précède,
                        mais ici, seuls vos <span className="text-green-400">talents</span> comptent. Le <span className="text-purple-400">grand prix de 100 000 euros</span> ne sera pas facile à remporter.
                        Il vous faudra terminer chaque jeu à <span className="text-red-400">100%</span> et plus vite que vos adversaires. Mais méfiez-vous,
                        certains jeux pourraient vous réserver des <span className="text-yellow-400">surprises</span>...
                    </p>
                    <p className="mb-4 text-lg text-center">
                        Si jamais vous vous retrouvez bloqué, rappelez-vous les sages paroles du créateur de ce concours : <br />  <br />
                        <span className="text-blue-400">"Un vrai joueur n'abandonne jamais. Il cherche, il trouve, il avance."</span>
                    </p>
                    <button
                        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-2xl transition-colors duration-300"
                        onClick={handleStartJourney}
                    >
                        Commencer l'aventure
                    </button>
                </motion.div>
            ) : (
                <>
                    <motion.h1
                        className="text-4xl font-bold text-white mb-8 z-10"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Choisissez votre jeu
                    </motion.h1>
                    <div className="space-y-8 z-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <GameCard title="Space Invaders" path="/space-invaders" image="space-invaders.webp" />
                        </motion.div>
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <GameCard title="Snake" link="/snake" />
                        </motion.div>
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                        >
                            <GameCard title="Pong" link="/pong" />
                        </motion.div>
                    </div>
                    <div className="mt-8 flex items-center space-x-4 z-10">
                        {timeRemaining !== null && (
                            <div className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg">
                                <Clock size={20} className="mr-2" />
                                <span>Temps restant : {formatTime(timeRemaining)}</span>
                            </div>
                        )}
                        <a
                            href="https://github.com/ChukyFredj"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                        >
                            <Github size={20} className="mr-2" />
                            <span>Chuky Fredj</span>
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}

export default GameMenu; 