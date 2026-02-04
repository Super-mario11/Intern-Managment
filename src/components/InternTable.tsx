import React from 'react'
import type { Intern } from '../types'
import { initials } from '../lib/internUtils'

type InternTableProps = {
  interns: Intern[]
  loading: boolean
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onEdit: (intern: Intern) => void
  onDelete: (intern: Intern) => void
  projectDrafts: Record<string, string>
  onProjectDraftChange: (id: string, value: string) => void
  onAddProject: (intern: Intern) => void
  onRemoveProject: (intern: Intern, project: string) => void
  skillDrafts: Record<string, string>
  onSkillDraftChange: (id: string, value: string) => void
  onAddSkill: (intern: Intern) => void
  onRemoveSkill: (intern: Intern, skill: string) => void
}

export default function InternTable({
  interns,
  loading,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
  projectDrafts,
  onProjectDraftChange,
  onAddProject,
  onRemoveProject,
  skillDrafts,
  onSkillDraftChange,
  onAddSkill,
  onRemoveSkill,
}: InternTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
        <thead className="bg-zinc-50 text-xs text-zinc-500">
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
              const open = expandedId === intern.id
              return (
                <React.Fragment key={intern.id}>
                  <tr
                    onClick={() => onToggleExpand(intern.id)}
                    className="cursor-pointer hover:bg-zinc-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold overflow-hidden">
                          {intern.imageUrl ? (
                            <img
                              src={intern.imageUrl}
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

                    <td className="px-6 py-4 text-right text-xs text-indigo-600">
                      <div className="flex justify-end gap-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-800"
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
                        <span className="text-indigo-600">
                          {open ? 'Hide' : 'View'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={4} className="p-0">
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          open
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="bg-zinc-50 px-6 py-4 text-sm text-zinc-700 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-zinc-500">
                                  Phone
                                </div>
                                <div>{intern.phone || '-'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-zinc-500">
                                  Manager
                                </div>
                                <div>{intern.manager || '-'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-zinc-500">
                                  Start date
                                </div>
                                <div>{intern.startDate || '-'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-zinc-500">
                                  Department
                                </div>
                                <div>{intern.department || '-'}</div>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-zinc-500">
                                Performance notes
                              </div>
                              <div>
                                {intern.performance || 'No notes yet.'}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="text-xs text-zinc-500">
                                Projects
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {intern.projects.map(project => (
                                  <span
                                    key={project}
                                    className="bg-white border px-3 py-1 rounded-md text-xs whitespace-nowrap flex items-center gap-2"
                                  >
                                    {project}
                                    <button
                                      className="text-zinc-400 hover:text-zinc-600"
                                      onClick={event => {
                                        event.stopPropagation()
                                        onRemoveProject(intern, project)
                                      }}
                                    >
                                      x
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  className="border rounded-md px-2 py-1 text-xs w-56"
                                  placeholder="Add project"
                                  value={projectDrafts[intern.id] ?? ''}
                                  onChange={event =>
                                    onProjectDraftChange(
                                      intern.id,
                                      event.target.value
                                    )
                                  }
                                />
                                <button
                                  className="text-xs border rounded-md px-2 py-1"
                                  onClick={event => {
                                    event.stopPropagation()
                                    onAddProject(intern)
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="text-xs text-zinc-500">
                                Skills
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {intern.skills.map(skill => (
                                  <span
                                    key={skill}
                                    className="bg-white border px-3 py-1 rounded-md text-xs whitespace-nowrap flex items-center gap-2"
                                  >
                                    {skill}
                                    <button
                                      className="text-zinc-400 hover:text-zinc-600"
                                      onClick={event => {
                                        event.stopPropagation()
                                        onRemoveSkill(intern, skill)
                                      }}
                                    >
                                      x
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  className="border rounded-md px-2 py-1 text-xs w-56"
                                  placeholder="Add skill"
                                  value={skillDrafts[intern.id] ?? ''}
                                  onChange={event =>
                                    onSkillDraftChange(
                                      intern.id,
                                      event.target.value
                                    )
                                  }
                                />
                                <button
                                  className="text-xs border rounded-md px-2 py-1"
                                  onClick={event => {
                                    event.stopPropagation()
                                    onAddSkill(intern)
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              )
            })
          )}
        </tbody>
        </table>
      </div>
    </div>
  )
}
