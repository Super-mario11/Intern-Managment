import type { Intern } from '../types'
import { getInternImageUrl } from '../lib/internImages'
import { initials } from '../lib/internUtils'

type InternTableProps = {
  interns: Intern[]
  loading: boolean
  onView: (intern: Intern) => void
  onEdit: (intern: Intern) => void
  onDelete: (intern: Intern) => void
}

export default function InternTable({
  interns,
  loading,
  onView,
  onEdit,
  onDelete,
}: InternTableProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-amber-100 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-amber-50 text-xs text-amber-800">
              <tr>
                <th className="text-left px-6 py-3">Intern</th>
                <th className="text-left px-6 py-3">Role</th>
                <th className="text-center px-6 py-3">Projects</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-zinc-500" colSpan={4}>
                    Loading interns...
                  </td>
                </tr>
              ) : interns.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-zinc-500" colSpan={4}>
                    No interns match the current filters.
                  </td>
                </tr>
              ) : (
                interns.map(intern => {
                  const imageSrc = intern.imageUrl || getInternImageUrl(intern.id)
                  return (
                    <tr
                      key={intern.id}
                      onClick={() => onView(intern)}
                      className="cursor-pointer hover:bg-amber-50/40 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-semibold overflow-hidden">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={intern.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              initials(intern.name)
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {intern.name}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {intern.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {intern.role}
                      </td>

                      <td className="px-6 py-4 text-center text-sm font-medium text-zinc-700">
                        {intern.projects.length}
                      </td>

                      <td className="px-6 py-4 text-right text-xs text-amber-700">
                        <div className="flex justify-end gap-2">
                          <button
                            className="text-amber-700 hover:text-amber-900"
                            onClick={event => {
                              event.stopPropagation()
                              onView(intern)
                            }}
                          >
                            View
                          </button>
                          <button
                            className="text-amber-700 hover:text-amber-900"
                            onClick={event => {
                              event.stopPropagation()
                              onEdit(intern)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={event => {
                              event.stopPropagation()
                              onDelete(intern)
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {loading ? (
          <div className="bg-white rounded-2xl p-5 text-sm text-zinc-500 shadow-sm border border-amber-100">
            Loading interns...
          </div>
        ) : interns.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-sm text-zinc-500 shadow-sm border border-amber-100">
            No interns match the current filters.
          </div>
        ) : (
          interns.map(intern => {
            const imageSrc = intern.imageUrl || getInternImageUrl(intern.id)
            return (
              <div
                key={intern.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100"
              >
                <button
                  className="w-full text-left"
                  onClick={() => onView(intern)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-semibold overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={intern.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        initials(intern.name)
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-amber-700">{intern.id}</div>
                      <div className="text-lg font-semibold text-zinc-900">
                        {intern.name}
                      </div>
                      <div className="text-sm text-zinc-600">
                        {intern.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-100">
                      {intern.role}
                    </span>
                    <span className="bg-white text-zinc-600 px-2.5 py-1 rounded-full border border-amber-100">
                      {intern.projects.length} projects
                    </span>
                  </div>
                </button>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <button
                    className="border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full"
                    onClick={() => onView(intern)}
                  >
                    View
                  </button>
                  <button
                    className="border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full"
                    onClick={() => onEdit(intern)}
                  >
                    Edit
                  </button>
                  <button
                    className="border border-red-200 text-red-600 px-3 py-1.5 rounded-full"
                    onClick={() => onDelete(intern)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
