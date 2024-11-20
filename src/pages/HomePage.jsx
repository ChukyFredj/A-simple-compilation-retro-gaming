import { motion } from 'framer-motion';
import React from 'react';

function HomePage({ onStartClick }) {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center font-press-start cursor-pointer"
            onClick={onStartClick}
        >
            <motion.div
                className="bg-space absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            />
            <motion.h1
                className="text-6xl font-bold text-white mb-8 z-10"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                Rétro World Cup
            </motion.h1>
            <motion.div
                className="text-8xl mb-16 z-10"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                🏆
            </motion.div>
            <motion.p
                className="text-white z-10 pt-10"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    y: [0, -10, 0]  // Animation de flottement vertical
                }}
                transition={{
                    delay: 1.5,
                    duration: 2,
                    repeat: Infinity,  // Répétition infinie
                    repeatType: "reverse"  // Aller-retour fluide
                }}
            >
                Cliquez n'importe où pour commencer
            </motion.p>
        </div>
    );
}

export default HomePage; 