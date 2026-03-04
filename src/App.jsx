import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Manage from './pages/Manage'
import AddCard from './pages/AddCard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route path="/learn/:topic" element={<LearnPage />} />
        <Route
          path="/manage"
          element={
            <Layout>
              <Manage />
            </Layout>
          }
        />
        <Route
          path="/add"
          element={
            <Layout>
              <AddCard />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

function LearnPage() {
  return (
    <Layout>
      <Learn />
    </Layout>
  )
}
