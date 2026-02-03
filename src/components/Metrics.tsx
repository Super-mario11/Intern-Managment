type MetricsProps = {
  totalInterns: number
  activeProjects: number
  departments: number
}

export default function Metrics({
  totalInterns,
  activeProjects,
  departments,
}: MetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard label="Total Interns" value={totalInterns} tone="indigo" />
      <MetricCard label="Active Projects" value={activeProjects} tone="emerald" />
      <MetricCard label="Departments" value={departments} tone="amber" />
    </div>
  )
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'indigo' | 'emerald' | 'amber'
}) {
  const tones = {
    indigo: 'from-indigo-50 to-white text-indigo-700',
    emerald: 'from-emerald-50 to-white text-emerald-700',
    amber: 'from-amber-50 to-white text-amber-700',
  }
  return (
    <div className={`bg-gradient-to-br ${tones[tone]} rounded-2xl shadow-sm p-5 border border-zinc-100`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-2xl sm:text-3xl font-semibold text-zinc-900 mt-2">
        {value}
      </div>
    </div>
  )
}
