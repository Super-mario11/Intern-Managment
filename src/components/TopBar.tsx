type TopBarProps = {
  onAdd: () => void
  onImport: () => void
  onExport: () => void
}

export default function TopBar({
  onAdd,
  onImport,
  onExport,
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">
            Intern Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Manage interns, projects & performance
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="border border-amber-200 hover:border-amber-300 transition bg-white text-amber-800 px-3 py-2 rounded-full text-xs sm:text-sm shadow-sm"
            onClick={onImport}
          >
            Import CSV
          </button>
          <button
            className="border border-amber-200 hover:border-amber-300 transition bg-white text-amber-800 px-3 py-2 rounded-full text-xs sm:text-sm shadow-sm"
            onClick={onExport}
          >
            Export CSV
          </button>
          <button
            className="bg-amber-500 hover:bg-amber-600 transition text-white px-4 py-2 rounded-full text-xs sm:text-sm shadow"
            onClick={onAdd}
          >
            + Add Intern
          </button>
        </div>
      </div>
    </div>
  )
}
