import { useEffect, useMemo, useState } from 'react'
import type { Intern } from '../types'
import Pagination from '../components/Pagination'
import InternDetailsModal from '../components/InternDetailsModal'
import { getInternImageUrl } from '../lib/internImages'

const formatDate = (value: string) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

const addDays = (value: string, days: number) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  parsed.setDate(parsed.getDate() + days)
  return parsed.toISOString().slice(0, 10)
}

const getTimePeriod = (startDate: string) => {
  if (!startDate) return '--'
  const endDate = addDays(startDate, 84)
  const startLabel = formatDate(startDate)
  const endLabel = formatDate(endDate)
  if (!startLabel || !endLabel) return '--'
  return `${startLabel} - ${endLabel}`
}

// Public intern directory with filters, pagination, and detail modal.
export default function InternListPage() {
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selected, setSelected] = useState<Intern | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/interns?limit=1000`)
      .then(async response => {
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || 'Failed to load interns')
        }
        return response.json()
      })
      .then(data => {
        setInterns(data?.interns || [])
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load interns')
      })
      .finally(() => setLoading(false))
  }, [])

  const roleOptions = useMemo(() => {
    const set = new Set(interns.map(intern => intern.role))
    return Array.from(set).sort()
  }, [interns])

  const departmentOptions = useMemo(() => {
    const set = new Set(interns.map(intern => intern.department).filter(Boolean))
    return Array.from(set).sort()
  }, [interns])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = (value: string) => value.toLowerCase().includes(q)

    return interns.filter(intern => {
      if (roleFilter !== 'all' && intern.role !== roleFilter) return false
      if (
        departmentFilter !== 'all' &&
        intern.department !== departmentFilter
      )
        return false
      if (!q) return true
      return [
        intern.name,
        intern.email,
        intern.role,
        intern.id,
        intern.department,
      ]
        .filter(Boolean)
        .some(matches)
    })
  }, [interns, query, roleFilter, departmentFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageSafe = Math.min(currentPage, pageCount)
  const paged = filtered.slice(
    (pageSafe - 1) * pageSize,
    pageSafe * pageSize
  )

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setCurrentPage(1)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setRoleFilter('all')
    setDepartmentFilter('all')
    setCurrentPage(1)
  }

  const rows = useMemo(() => {
    return paged.map(intern => ({
      id: intern.id,
      name: intern.name,
      email: intern.email,
      role: intern.role,
      imageUrl: intern.imageUrl || getInternImageUrl(intern.id),
      intern,
      period: getTimePeriod(intern.startDate),
    }))
  }, [paged])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Title and description */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1 mb-3 border border-amber-100">
            Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900">
            Intern Directory
          </h1>
          <p className="text-sm text-zinc-500">
            Name, email, role, and internship time period.
          </p>
        </div>

        {/* Filters and search */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-4 border border-amber-100 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              className="bg-amber-50/40 border border-amber-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 w-full sm:w-1/2"
              placeholder="Search by name, email, role, or department..."
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <select
                className="border border-amber-200 rounded-xl px-3 py-2 text-sm"
                value={roleFilter}
                onChange={e => handleRoleFilterChange(e.target.value)}
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
                value={departmentFilter}
                onChange={e => handleDepartmentFilterChange(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departmentOptions.map(department => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
              <button
                className="border border-amber-200 rounded-xl px-3 py-2 text-sm text-amber-900"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="text-xs text-zinc-500">
            Showing {filtered.length} intern
            {filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Desktop table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hidden md:block border border-amber-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-amber-50 text-xs text-amber-800">
                <tr>
                  <th className="text-left px-6 py-3">ID</th>
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">Role</th>
                  <th className="text-left px-6 py-3">Time Period</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {loading ? (
                  <tr>
                    <td className="px-6 py-6 text-zinc-500" colSpan={5}>
                      Loading interns...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-6 py-6 text-red-600" colSpan={5}>
                      {error}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-zinc-500" colSpan={5}>
                      {interns.length === 0
                        ? 'No interns available yet. Add them in the Admin page.'
                        : 'No interns match your filters.'}
                    </td>
                  </tr>
                ) : (
                  rows.map(row => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:bg-amber-50/40 transition"
                      onClick={() => setSelected(row.intern)}
                    >
                      <td className="px-6 py-4 text-zinc-600">{row.id}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-semibold overflow-hidden">
                            {row.imageUrl ? (
                              <img
                                src={row.imageUrl}
                                alt={row.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              row.name
                                .split(' ')
                                .map(n => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            )}
                          </div>
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{row.email}</td>
                      <td className="px-6 py-4 text-zinc-600">{row.role}</td>
                      <td className="px-6 py-4 text-zinc-600">{row.period}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-4 md:hidden">
          {loading ? (
            <div className="bg-white rounded-2xl p-5 text-sm text-zinc-500 shadow-sm border border-amber-100">
              Loading interns...
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-5 text-sm text-red-600 shadow-sm border border-amber-100">
              {error}
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-sm text-zinc-500 shadow-sm border border-amber-100">
              {interns.length === 0
                ? 'No interns available yet. Add them in the Admin page.'
                : 'No interns match your filters.'}
            </div>
          ) : (
            rows.map(row => (
              <div
                key={row.id}
                className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition border border-amber-100"
                onClick={() => setSelected(row.intern)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-semibold overflow-hidden">
                    {row.imageUrl ? (
                      <img
                        src={row.imageUrl}
                        alt={row.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      row.name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">{row.id}</div>
                    <div className="text-lg font-semibold text-zinc-900">
                      {row.name}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-zinc-600">{row.email}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-100">
                    {row.role}
                  </span>
                  <span className="bg-white text-zinc-600 px-2.5 py-1 rounded-full border border-amber-100">
                    {row.period}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="mt-8">
            <Pagination
              page={pageSafe}
              pageCount={pageCount}
              total={filtered.length}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              onPrev={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              onNext={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
            />
          </div>
        )}
      </div>

      {/* Detail modal */}
      <InternDetailsModal intern={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
