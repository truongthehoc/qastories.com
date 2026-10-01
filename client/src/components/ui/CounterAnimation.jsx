import { useCounter } from '../../hooks/useCounter'

export function CounterAnimation({ end, suffix = '', label, icon: Icon }) {
  const [ref, count] = useCounter(end, 2000)

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      {Icon && <Icon size={32} className="text-primary mb-3" />}
      <div className="font-heading text-4xl md:text-5xl font-bold text-gray-900">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="font-body text-gray-500 text-sm mt-2">{label}</div>
    </div>
  )
}
