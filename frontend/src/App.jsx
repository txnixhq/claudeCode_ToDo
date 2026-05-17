import { useState } from 'react'
import AuthForm from './components/AuthForm'
import TodoApp from './components/TodoApp'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const handleLogin = (accessToken) => {
    localStorage.setItem('token', accessToken)
    setToken(accessToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {token
        ? <TodoApp token={token} onLogout={handleLogout} />
        : <AuthForm onLogin={handleLogin} />
      }
    </div>
  )
}
