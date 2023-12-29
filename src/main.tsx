import React from 'react';
import ReactDOM from 'react-dom/client'
import './styles.css'
import Header from './components/Header'
import LoginButton from './components/LoginButton'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Header />
        <LoginButton />
    </React.StrictMode>
)