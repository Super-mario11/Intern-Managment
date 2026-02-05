import type { SortKey } from '../types'

type ControlsPanelProps = {
  query: string
  onQueryChange: (value: string) => void
  roleOptions: string[]
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  projectOptions: string[]
  projectFilter: string
  onProjectFilterChange: (value: string) => void
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  secondarySortKey: SortKey
  onSortKeyChange: (value: SortKey) => void
  onSortDirToggle: () => void
  onSecondarySortKeyChange: (value: SortKey) => void
}

export default function ControlsPanel({
  query,
  onQueryChange,
  roleOptions,
  roleFilter,
  onRoleFilterChange,
  projectOptions,
  projectFilter,
  onProjectFilterChange,
  sortKey,
  sortDir,
  secondarySortKey,
  onSortKeyChange,
  onSortDirToggle,
  onSecondarySortKeyChange,
}: ControlsPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-4 border border-amber-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="bg-amber-50/40 border border-amber-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 w-full sm:w-1/2"
          placeholder="Search interns, email, or department..."
          value={query}
          onChange={e => onQueryChange(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <select
            className="border border-amber-200 rounded-xl px-3 py-2 text-sm"
            value={roleFilter}
            onChange={e => onRoleFilterChange(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roleOptions.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            className="border border-amber-200 rounded-xl px-3 py-2 text-sm"
            value={projectFilter}
            onChange={e => onProjectFilterChange(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projectOptions.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border border-amber-200 rounded-xl px-3 py-2 text-sm"
          value={sortKey}
          onChange={e => onSortKeyChange(e.target.value as SortKey)}
        >
          <option value="name">Sort by Name</option>
          <option value="role">Sort by Role</option>
          <option value="projects">Sort by Projects</option>
        </select>
        <button
          className="border border-amber-200 rounded-xl px-3 py-2 text-sm text-amber-900"
          onClick={onSortDirToggle}
        >
          {sortDir === 'asc' ? 'Ascending' : 'Descending'}
        </button>
        <select
          className="border border-amber-200 rounded-xl px-3 py-2 text-sm"
          value={secondarySortKey}
          onChange={e => onSecondarySortKeyChange(e.target.value as SortKey)}
        >
          <option value="name">Then by Name</option>
          <option value="role">Then by Role</option>
          <option value="projects">Then by Projects</option>
        </select>
      </div>
    </div>
  )
}
