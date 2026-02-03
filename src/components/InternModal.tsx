import React from 'react'
import type { FormState } from '../types'
import InputField from './InputField'

type InternModalProps = {
  show: boolean
  editingId: string | null
  form: FormState
  formError: string
  onClose: () => void
  onSubmit: () => void
  onFieldChange: (field: keyof FormState, value: string) => void
}

export default function InternModal({
  show,
  editingId,
  form,
  formError,
  onClose,
  onSubmit,
  onFieldChange,
}: InternModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl mx-auto">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">
            {editingId ? 'Edit Intern' : 'Add Intern'}
          </div>
          <button className="text-zinc-400" onClick={onClose}>
            x
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Name"
              value={form.name}
              onChange={value => onFieldChange('name', value)}
            />
            <InputField
              label="Role"
              value={form.role}
              onChange={value => onFieldChange('role', value)}
            />
            <InputField
              label="Email"
              value={form.email}
              onChange={value => onFieldChange('email', value)}
            />
            <InputField
              label="Phone"
              value={form.phone}
              onChange={value => onFieldChange('phone', value)}
            />
            <InputField
              label="Manager"
              value={form.manager}
              onChange={value => onFieldChange('manager', value)}
            />
            <InputField
              label="Start date"
              value={form.startDate}
              placeholder="YYYY-MM-DD"
              onChange={value => onFieldChange('startDate', value)}
            />
            <InputField
              label="Department"
              value={form.department}
              onChange={value => onFieldChange('department', value)}
            />
          </div>
          <InputField
            label="Projects (comma separated)"
            value={form.projectsText}
            onChange={value => onFieldChange('projectsText', value)}
          />
          <InputField
            label="Skills (comma separated)"
            value={form.skillsText}
            onChange={value => onFieldChange('skillsText', value)}
          />
          <InputField
            label="Performance notes"
            value={form.performance}
            onChange={value => onFieldChange('performance', value)}
          />

          {formError ? (
            <div className="text-sm text-red-600">{formError}</div>
          ) : null}
        </div>
        <div className="border-t px-6 py-4 flex flex-col sm:flex-row justify-end gap-2">
          <button className="border rounded-lg px-4 py-2 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded-lg text-sm"
            onClick={onSubmit}
          >
            {editingId ? 'Save Changes' : 'Add Intern'}
          </button>
        </div>
      </div>
    </div>
  )
}
