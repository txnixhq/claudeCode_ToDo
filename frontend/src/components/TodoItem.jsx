export default function TodoItem({ todo, onToggle, onDelete }) {
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
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
      >
        ✕
      </button>
    </li>
  )
}
