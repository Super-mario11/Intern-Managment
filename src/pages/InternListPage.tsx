import { useEffect, useMemo, useState } from 'react'
import type { Intern } from '../types'
import Pagination from '../components/Pagination'
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
  if (!startDate) return '—'
  const endDate = addDays(startDate, 84)
  const startLabel = formatDate(startDate)
  const endLabel = formatDate(endDate)
  if (!startLabel || !endLabel) return '—'
  return `${startLabel} - ${endLabel}`
}

export default function InternListPage() {
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalInterns, setTotalInterns] = useState(0)
  const [selected, setSelected] = useState<Intern | null>(null)
  const limit = 10 // Items per page

  useEffect(() => {
    fetch(`/api/interns?page=${currentPage}&limit=${limit}`)
      .then(async response => {
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || 'Failed to load interns')
        }
        return response.json()
      })
      .then(data => {
        setInterns(data?.interns || [])
        setTotalPages(data?.totalPages || 1)
        setTotalInterns(data?.total || 0)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load interns')
      })
      .finally(() => setLoading(false))
  }, [currentPage, limit])

  const rows = useMemo(() => {
    return interns.map(intern => ({
      id: intern.id,
      name: intern.name,
      email: intern.email,
      role: intern.role,
      imageUrl: intern.imageUrl || getInternImageUrl(intern.id),
      intern,
      period: getTimePeriod(intern.startDate),
    }))
  }, [interns])

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 mb-3">
            Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900">
            Intern Directory
          </h1>
          <p className="text-sm text-zinc-500">
            Name, email, role, and internship time period.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-zinc-50 text-xs text-zinc-500">
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
                      No interns available yet. Add them in the Admin page.
                    </td>
                  </tr>
                ) : (
                  rows.map(row => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:bg-zinc-50 transition"
                      onClick={() => setSelected(row.intern)}
                    >
                      <td className="px-6 py-4 text-zinc-600">{row.id}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold overflow-hidden">
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

        <div className="grid gap-4 md:hidden">
          {loading ? (
            <div className="bg-white rounded-2xl p-5 text-sm text-zinc-500 shadow-sm">
              Loading interns...
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-5 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-sm text-zinc-500 shadow-sm">
              No interns available yet. Add them in the Admin page.
            </div>
          ) : (
            rows.map(row => (
              <div
                key={row.id}
                className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition"
                onClick={() => setSelected(row.intern)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold overflow-hidden">
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
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                    {row.role}
                  </span>
                  <span className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full">
                    {row.period}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              page={currentPage}
              pageCount={totalPages}
              total={totalInterns}
              pageSize={limit}
              onPageSizeChange={() => {}} // We are not changing page size for now, keeping it fixed at 10
              onPrev={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              onNext={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            />
          </div>
        )}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-30 px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-xl mx-auto overflow-hidden"
            onClick={event => event.stopPropagation()}
          >
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold overflow-hidden">
                  {selected.imageUrl || getInternImageUrl(selected.id) ? (
                    <img
                      src={selected.imageUrl || getInternImageUrl(selected.id)}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    selected.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-sm text-zinc-500">{selected.id}</div>
                  <div className="text-lg font-semibold text-zinc-900">
                    {selected.name}
                  </div>
                </div>
              </div>
              <button
                className="text-zinc-400 hover:text-zinc-600"
                onClick={() => setSelected(null)}
              >
                x
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm text-zinc-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500">Role</div>
                  <div>{selected.role || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Email</div>
                  <div>{selected.email || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Phone</div>
                  <div>{selected.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Department</div>
                  <div>{selected.department || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Manager</div>
                  <div>{selected.manager || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Start date</div>
                  <div>{selected.startDate || '-'}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-500">Projects</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selected.projects.length ? (
                    selected.projects.map(project => (
                      <span
                        key={project}
                        className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-full text-xs"
                      >
                        {project}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500">-</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-500">Skills</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selected.skills.length ? (
                    selected.skills.map(skill => (
                      <span
                        key={skill}
                        className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500">-</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-500">Performance</div>
                <div>{selected.performance || 'No notes yet.'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
