import React from 'react';
import { Link } from 'react-router-dom';

function GameCard({ title, image, path }) {
    return (
        <Link to={path} className="game-card">
            <img src={image} alt={title} />
            <h2>{title}</h2>
        </Link>
    );
}

export default GameCard; 