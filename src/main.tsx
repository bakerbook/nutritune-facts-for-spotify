import React from 'react';
import ReactDOM from 'react-dom/client'
import Header from './components/Header'
import LoginComponent from './components/LoginComponent'
import ExtraInfo from './components/ExtraInfo'
import Footer from './components/Footer'
import { Analytics } from '@vercel/analytics/react'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Header />
        <LoginComponent />
        <ExtraInfo />
        <Footer />
        <Analytics />
    </React.StrictMode>
)