import { motion } from 'framer-motion';
import React from 'react';
import GameCard from '../components/GameCard';

function GameMenu() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-press-start relative">
            <div className="bg-space absolute inset-0"></div>
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
                    <GameCard title="Space Invaders" link="/space-invaders" />
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
        </div>
    );
}

export default GameMenu; 