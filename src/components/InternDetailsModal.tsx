import { useEffect, useState } from 'react'
import type { Intern } from '../types'
import { getInternImageUrl } from '../lib/internImages'
import { initials } from '../lib/internUtils'

type InternDetailsModalProps = {
  intern: Intern | null
  onClose: () => void
  onEdit?: (intern: Intern) => void
  onDelete?: (intern: Intern) => void
  projectDraft?: string
  onProjectDraftChange?: (value: string) => void
  onAddProject?: (intern: Intern) => void
  onRemoveProject?: (intern: Intern, project: string) => void
  skillDraft?: string
  onSkillDraftChange?: (value: string) => void
  onAddSkill?: (intern: Intern) => void
  onRemoveSkill?: (intern: Intern, skill: string) => void
}

// Read-only (or admin-enabled) modal for intern profile details and quick edits.
export default function InternDetailsModal({
  intern,
  onClose,
  onEdit,
  onDelete,
  projectDraft,
  onProjectDraftChange,
  onAddProject,
  onRemoveProject,
  skillDraft,
  onSkillDraftChange,
  onAddSkill,
  onRemoveSkill,
}: InternDetailsModalProps) {
  if (!intern) return null

  const imageSrc = intern.imageUrl || getInternImageUrl(intern.id)
  const showAdminActions = Boolean(onEdit || onDelete)
  const showProjectTools = Boolean(onAddProject || onRemoveProject)
  const showSkillTools = Boolean(onAddSkill || onRemoveSkill)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    setConfirmingDelete(false)
  }, [intern.id])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-30 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-xl mx-auto overflow-hidden border border-amber-100"
        onClick={event => event.stopPropagation()}
      >
        {/* Profile header */}
        <div className="border-b border-amber-100 px-6 py-6 bg-gradient-to-r from-amber-50/70 via-white to-white relative">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-40 h-40 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-3xl font-semibold overflow-hidden shadow-sm">
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
            <div className="text-xs text-amber-700">{intern.id}</div>
            <div className="text-xl font-semibold text-zinc-900">
              {intern.name}
            </div>
          </div>
          <button
            className="text-amber-500 hover:text-amber-700 absolute top-4 right-4"
            onClick={onClose}
          >
            x
          </button>
        </div>
        {/* Details, skills, projects, and admin actions */}
        <div className="px-6 py-5 space-y-5 text-sm text-zinc-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-amber-700">Role</div>
              <div>{intern.role || '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-700">Email</div>
              <div>{intern.email || '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-700">Phone</div>
              <div>{intern.phone || '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-700">Department</div>
              <div>{intern.department || '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-700">Manager</div>
              <div>{intern.manager || '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-700">Start date</div>
              <div>{intern.startDate || '-'}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-amber-700">Projects</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {intern.projects.length ? (
                intern.projects.map(project => (
                  <span
                    key={project}
                    className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs border border-amber-100 flex items-center gap-2"
                  >
                    {project}
                    {showProjectTools ? (
                      <button
                        className="text-amber-500 hover:text-amber-700"
                        onClick={() => onRemoveProject?.(intern, project)}
                      >
                        x
                      </button>
                    ) : null}
                  </span>
                ))
              ) : (
                <span className="text-zinc-500">-</span>
              )}
            </div>
            {showProjectTools ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  className="border border-amber-200 rounded-xl px-3 py-2 text-xs w-56 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="Add project"
                  value={projectDraft ?? ''}
                  onChange={event => onProjectDraftChange?.(event.target.value)}
                />
                <button
                  className="border border-amber-200 text-amber-900 px-3 py-2 rounded-full text-xs"
                  onClick={() => onAddProject?.(intern)}
                >
                  Add
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <div className="text-xs font-semibold text-amber-700">Skills</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {intern.skills.length ? (
                intern.skills.map(skill => (
                  <span
                    key={skill}
                    className="bg-white text-amber-800 px-2.5 py-1 rounded-full text-xs border border-amber-200 flex items-center gap-2"
                  >
                    {skill}
                    {showSkillTools ? (
                      <button
                        className="text-amber-500 hover:text-amber-700"
                        onClick={() => onRemoveSkill?.(intern, skill)}
                      >
                        x
                      </button>
                    ) : null}
                  </span>
                ))
              ) : (
                <span className="text-zinc-500">-</span>
              )}
            </div>
            {showSkillTools ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  className="border border-amber-200 rounded-xl px-3 py-2 text-xs w-56 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="Add skill"
                  value={skillDraft ?? ''}
                  onChange={event => onSkillDraftChange?.(event.target.value)}
                />
                <button
                  className="border border-amber-200 text-amber-900 px-3 py-2 rounded-full text-xs"
                  onClick={() => onAddSkill?.(intern)}
                >
                  Add
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <div className="text-xs font-semibold text-amber-700">Performance</div>
            <div>{intern.performance || 'No notes yet.'}</div>
          </div>
          {showAdminActions ? (
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap gap-2">
                {onEdit ? (
                  <button
                    className="border border-amber-200 text-amber-900 px-4 py-2 rounded-full text-xs"
                    onClick={() => onEdit(intern)}
                  >
                    Edit
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    className="border border-red-200 text-red-600 px-4 py-2 rounded-full text-xs"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
              {confirmingDelete ? (
                <div className="border border-red-200 bg-red-50/60 rounded-xl p-3 text-xs text-red-700 flex flex-col gap-2">
                  <div>Are you sure you want to delete this intern?</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="border border-amber-200 text-amber-900 px-3 py-1.5 rounded-full"
                      onClick={() => setConfirmingDelete(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="border border-red-200 text-red-600 px-3 py-1.5 rounded-full"
                      onClick={() => {
                        onDelete?.(intern)
                        onClose()
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
