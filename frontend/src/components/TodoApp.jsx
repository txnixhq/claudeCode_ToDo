import { useState, useEffect } from 'react'
import TodoItem from './TodoItem'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const FILTERS = ['all', 'active', 'done', 'high']
const FILTER_LABEL = { all: 'All', active: 'Active', done: 'Done', high: 'High Priority' }

export default function TodoApp({ token, onLogout }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
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
        body: JSON.stringify({ title: title.trim(), priority }),
      })
      const json = await res.json()
      if (json.data) {
        setTodos((prev) => [...prev, json.data])
        setTitle('')
        setPriority('medium')
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

  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.done).length,
    done: todos.filter((t) => t.done).length,
    high: todos.filter((t) => t.priority === 'high').length,
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    if (filter === 'high') return t.priority === 'high'
    return true
  })

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
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          disabled={adding}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {FILTER_LABEL[f]} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 mt-16">No todos here</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}
        </ul>
      )}
    </div>
  )
}
