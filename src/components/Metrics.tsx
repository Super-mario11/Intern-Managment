type MetricsProps = {
  totalInterns: number
  activeProjects: number
  departments: number
}

// Dashboard KPI strip for quick admin insight.
export default function Metrics({
  totalInterns,
  activeProjects,
  departments,
}: MetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard label="Total Interns" value={totalInterns} tone="amber" />
      <MetricCard label="Active Projects" value={activeProjects} tone="gold" />
      <MetricCard label="Departments" value={departments} tone="sand" />
    </div>
  )
}

// Single metric card with a tone-based background.
function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'amber' | 'gold' | 'sand'
}) {
  const tones = {
    amber: 'from-amber-50 to-white text-amber-800',
    gold: 'from-yellow-50 to-white text-yellow-800',
    sand: 'from-amber-100/40 to-white text-amber-900',
  }
  return (
    <div className={`bg-gradient-to-br ${tones[tone]} rounded-2xl shadow-sm p-5 border border-amber-100`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-2xl sm:text-3xl font-semibold text-zinc-900 mt-2">
        {value}
      </div>
    </div>
  )
}
