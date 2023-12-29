import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './Header'
import LoginButton from './LoginButton';
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Header />
        <LoginButton />
    </React.StrictMode>
)