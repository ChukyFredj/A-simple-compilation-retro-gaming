import { motion } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ title, image = '/api/placeholder/600/200', path }) => {
    const maxScores = {
        'Snake': 24000,
        'Space Invaders': 24000,
        'Pong': 15000,
    };

    const username = localStorage.getItem('username');

    const getGameStats = () => {
        const rankings = JSON.parse(localStorage.getItem(`classement_${title.toLowerCase().replace(' ', '_')}`) || '[]');
        const userRank = rankings.findIndex(score => score.username === username) + 1;
        const userScore = userRank ? rankings[userRank - 1].score : 0;
        const maxScore = maxScores[title];
        const progress = maxScore ? (userScore / maxScore) * 100 : 0;

        return {
            userRank,
            userScore,
            progress,
            totalPlayers: rankings.length
        };
    };

    const stats = useMemo(getGameStats, [title, username]);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-[600px] h-32 bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
        >
            <Link to={path} className="block h-full">
                <div className="flex h-full">
                    {/* Image section */}
                    <div className="w-48 relative overflow-hidden">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-800/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content section */}
                    <div className="flex-1 flex flex-col justify-center px-6 space-y-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                {title}
                            </h2>
                            <span className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-colors duration-300">
                                Jouer
                            </span>
                        </div>

                        {/* Stats section */}
                        <div className="flex items-center space-x-6 text-sm">
                            {stats.userRank > 0 && (
                                <div className="flex items-center text-yellow-500">
                                    <Trophy size={16} className="mr-1" />
                                    <span>
                                        {stats.userRank}/{stats.totalPlayers}
                                        {stats.userRank === 1 && ' 👑'}
                                    </span>
                                </div>
                            )}

                            {maxScores[title] && (
                                <div className="flex-1">
                                    <div className="flex justify-between text-gray-300 text-xs mb-1">
                                        <span>{stats.userScore.toLocaleString()} pts</span>
                                        <span>{maxScores[title].toLocaleString()} pts</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(stats.progress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {stats.userScore > 0 && (
                                <div className="flex items-center text-yellow-500">
                                    <Star size={16} className="mr-1" />
                                    <span>{Math.round(stats.progress)}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default GameCard;