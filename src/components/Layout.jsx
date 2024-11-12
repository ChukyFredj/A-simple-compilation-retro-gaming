import React from 'react';
import Header from './Header';

function Layout({ children }) {
    return (
        <div className="min-h-screen bg-stars bg-cover bg-center text-white font-pixel">
            <Header />
            <main>{children}</main>
        </div>
    );
}

export default Layout; 