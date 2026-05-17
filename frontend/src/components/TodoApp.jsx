import { useState, useEffect } from 'react'
import TodoItem from './TodoItem'

const API = 'http://localhost:8000'

export default function TodoApp({ token, onLogout }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    fetch(`${API}/todos`, { headers })
      .then((r) => r.json())
      .then((json) => { if (json.data) setTodos(json.data) })
  }, [])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`${API}/todos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: title.trim() }),
      })
      const json = await res.json()
      if (json.data) {
        setTodos((prev) => [...prev, json.data])
        setTitle('')
      }
    } finally {
      setAdding(false)
    }
  }

  const toggleTodo = async (id) => {
    const res = await fetch(`${API}/todos/${id}`, { method: 'PATCH', headers })
    const json = await res.json()
    if (json.data) {
      setTodos((prev) => prev.map((t) => (t.id === id ? json.data : t)))
    }
  }

  const deleteTodo = async (id) => {
    await fetch(`${API}/todos/${id}`, { method: 'DELETE', headers })
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="max-w-lg mx-auto pt-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Todos</h1>
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
          Logout
        </button>
      </div>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Add a todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="text-center text-gray-400 mt-16">No todos yet</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}
        </ul>
      )}
    </div>
  )
}
