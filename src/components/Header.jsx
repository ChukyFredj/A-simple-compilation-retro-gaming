import React from 'react';
import { useAuth } from '../hooks/useAuth';

function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="flex justify-between items-center p-4">
            <h1 className="text-2xl">Rétro World Cup</h1>
            {user && (
                <div>
                    <span>{user.username}</span>
                    <button onClick={logout}>Déconnexion</button>
                </div>
            )}
        </header>
    );
}

export default Header; 