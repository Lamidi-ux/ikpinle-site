import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import Accueil from './pages/Accueil.jsx'
import Methode from './pages/Methode.jsx'
import Canaux from './pages/Canaux.jsx'
import Cultures from './pages/Cultures.jsx'
import Contact from './pages/Contact.jsx'
import Connexion from './pages/Connexion.jsx'
import Inscription from './pages/Inscription.jsx'
import TableauDeBord from './pages/TableauDeBord.jsx'
import Assistant from './pages/Assistant.jsx'
import Videos from './pages/Videos.jsx'
import NouvelleVideo from './pages/NouvelleVideo.jsx'
import Messages from './pages/Messages.jsx'
import Page404 from './pages/Page404.jsx'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Accueil />} />
              <Route path="methode" element={<Methode />} />
              <Route path="canaux" element={<Canaux />} />
              <Route path="cultures" element={<Cultures />} />
              <Route path="contact" element={<Contact />} />
              <Route path="connexion" element={<Connexion />} />
              <Route path="inscription" element={<Inscription />} />
              <Route
                path="tableau-de-bord"
                element={
                  <ProtectedRoute>
                    <TableauDeBord />
                  </ProtectedRoute>
                }
              />
              <Route
                path="assistant"
                element={
                  <ProtectedRoute>
                    <Assistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="videos"
                element={
                  <ProtectedRoute>
                    <Videos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="videos/nouvelle"
                element={
                  <ProtectedRoute>
                    <NouvelleVideo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Page404 />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
