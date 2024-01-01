import React from 'react';
import ReactDOM from 'react-dom/client'
import './styles.css'
import Header from './components/Header'
import LoginComponent from './components/LoginComponent'
import SelectPlaylist from './components/SelectPlaylist'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Header />
        <LoginComponent />
    </React.StrictMode>
)