import { useState } from 'react'

const API = 'http://localhost:8000'

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup'
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (json.error) {
        setIsError(true)
        setMessage(json.error)
      } else if (mode === 'login') {
        onLogin(json.data.access_token)
      } else {
        setIsError(false)
        setMessage('Account created! Check your email to confirm, then log in.')
        setMode('login')
      }
    } catch {
      setIsError(true)
      setMessage('Network error — is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setMessage(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo App</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {message && (
            <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={switchMode} className="text-blue-600 hover:underline">
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
