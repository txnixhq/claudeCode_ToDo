const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

export default function TodoItem({ todo, onToggle, onDelete }) {
  const badge = PRIORITY_BADGE[todo.priority] || PRIORITY_BADGE.medium

  return (
    <li className="flex items-center gap-3 bg-white border border-gray-200 rounded px-4 py-3">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 accent-blue-600 cursor-pointer"
      />
      <span className={`flex-1 text-gray-800 ${todo.done ? 'line-through text-gray-400' : ''}`}>
        {todo.title}
      </span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>
        {todo.priority || 'medium'}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
      >
        ✕
      </button>
    </li>
  )
}
