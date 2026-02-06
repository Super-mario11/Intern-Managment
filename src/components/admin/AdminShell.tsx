import type { ReactNode, RefObject } from 'react'
import AdminLogoutButton from './AdminLogoutButton'
import AdminToast from './AdminToast'
import TopBar from '../TopBar'

type AdminShellProps = {
  toast: string
  onAdd: () => void
  onImport: () => void
  onExport: () => void
  onLogout: () => void
  fileInputRef: RefObject<HTMLInputElement | null>
  onFileChange: (file: File | null) => void
  children: ReactNode
}

// Admin page wrapper: toast, top bar actions, hidden CSV input, and layout.
export default function AdminShell({
  toast,
  onAdd,
  onImport,
  onExport,
  onLogout,
  fileInputRef,
  onFileChange,
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-white">
      {/* Global toast and top actions */}
      <AdminToast message={toast} />
      <TopBar
        onAdd={onAdd}
        onImport={onImport}
        onExport={onExport}
      />

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={e => onFileChange(e.target.files?.[0] ?? null)}
      />

      {/* Content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {children}
      </div>

      {/* Logout button anchored to the page */}
      <AdminLogoutButton onLogout={onLogout} />
    </div>
  )
}
