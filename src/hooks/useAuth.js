import { useEffect, useState } from 'react';

export function useAuth() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    function login(userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }

    function logout() {
        setUser(null);
        localStorage.removeItem('user');
    }

    return { user, login, logout };
} 