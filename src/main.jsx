import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout.jsx'
import Accueil from './pages/Accueil.jsx'
import Methode from './pages/Methode.jsx'
import Canaux from './pages/Canaux.jsx'
import Cultures from './pages/Cultures.jsx'
import Contact from './pages/Contact.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="methode" element={<Methode />} />
          <Route path="canaux" element={<Canaux />} />
          <Route path="cultures" element={<Cultures />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
