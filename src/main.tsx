import React from 'react';
import ReactDOM from 'react-dom/client'
import './styles.css'
import Header from './components/Header'
import LoginComponent from './components/LoginComponent'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Header />
        <LoginComponent />
    </React.StrictMode>
)