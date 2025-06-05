import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import JournalList from './components/JournalList'
import JournalEditor from './components/JournalEditor'
import JournalViewer from './components/JournalViewer'
import Layout from './components/Layout'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<JournalList />} />
            <Route path="new" element={<JournalEditor />} />
            <Route path="edit/:id" element={<JournalEditor />} />
            <Route path="view/:id" element={<JournalViewer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
