import React, { useEffect, useState } from 'react';

function LoginModal({ onClose, onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedIsConnected = localStorage.getItem('isConnected') === 'true';

        if (storedUsername && storedIsConnected) {
            setIsConnected(true);
            onLogin();
        } else if (storedUsername) {
            setShowLoginForm(true);
        }
    }, []);

    const handleCreateAccount = () => {
        if (!username || !password) {
            alert('Veuillez entrer un pseudo et un mot de passe');
            return;
        }
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        localStorage.setItem('isConnected', 'true');
        setIsConnected(true);
        onLogin();
        onClose();
    };

    const handleLogin = () => {
        const storedPassword = localStorage.getItem('password');
        const storedUsername = localStorage.getItem('username');

        if (password === storedPassword && username === storedUsername) {
            localStorage.setItem('isConnected', 'true');
            setIsConnected(true);
            onLogin();
            onClose();
        } else {
            alert('Mot de passe/Pseudo incorrect');
        }
    };

    if (isConnected) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white p-8 shadow-lg z-10 border-4 border-black">
                {showLoginForm ? (
                    <>
                        <h2 className="text-2xl font-press-start mb-4 text-center text-black">Connexion</h2>
                        <input
                            type="text"
                            placeholder="Pseudo"
                            value={username}
                            required
                            onChange={(e) => setUsername(e.target.value)}
                            className="border border-gray-400 p-2 mb-4 w-full placeholder-black font-press-start text-black"
                        />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-400 p-2 mb-4 w-full placeholder-black font-press-start text-black"
                        />
                        <div className="flex justify-center">
                            <button
                                onClick={handleLogin}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-press-start py-2 px-4"
                            >
                                Se connecter
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-press-start mb-4 text-center text-black">Création de compte</h2>
                        <input
                            type="text"
                            placeholder="Pseudo"
                            value={username}
                            required
                            onChange={(e) => setUsername(e.target.value)}
                            className="border border-gray-400 p-2 mb-4 w-full placeholder-black font-press-start text-black"
                        />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-400 p-2 mb-4 w-full placeholder-black font-press-start text-black"
                        />
                        <div className="flex justify-center">
                            <button
                                onClick={handleCreateAccount}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-press-start py-2 px-4"
                            >
                                Créer un compte
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default LoginModal; 