import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormState, Intern, SortKey } from '../types'
import {
  normalizeList,
  parseCSV,
  parseListCell,
  toCSV,
} from '../lib/internUtils'
import ControlsPanel from '../components/ControlsPanel'
import InternModal from '../components/InternModal'
import InternTable from '../components/InternTable'
import Metrics from '../components/Metrics'
import Pagination from '../components/Pagination'
import TopBar from '../components/TopBar'

type AuthStatus = 'checking' | 'authed' | 'unauth'

const emptyForm: FormState = {
  id: '',
  name: '',
  role: '',
  email: '',
  phone: '',
  imageUrl: '',
  projectsText: '',
  manager: '',
  startDate: '',
  performance: '',
  skillsText: '',
  department: '',
}

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [interns, setInterns] = useState<Intern[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [secondarySortKey, setSecondarySortKey] =
    useState<SortKey>('role')
  const [roleFilter, setRoleFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [formError, setFormError] = useState('')
  const [importError, setImportError] = useState('')
  const [projectDrafts, setProjectDrafts] = useState<Record<string, string>>(
    {}
  )
  const [skillDrafts, setSkillDrafts] = useState<Record<string, string>>(
    {}
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fetchInterns = async () => {
    setLoading(true)
    const response = await fetch('/api/interns?limit=1000')
    const data = await response.json()
    if (data?.interns) {
      setInterns(data.interns)
    }
    setLoading(false)
  }

  const handleLogin = () => {
    setAuthError('')
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then(async response => {
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || 'Login failed')
        }
        setAuthStatus('authed')
        setPassword('')
        await fetchInterns()
      })
      .catch(error => {
        setAuthError(error.message || 'Login failed')
      })
  }

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST' }).finally(() => {
      setAuthStatus('unauth')
      setPassword('')
      setAuthError('')
      setInterns([])
    })
  }

  useEffect(() => {
    fetch('/api/session')
      .then(response => response.json())
      .then(data => {
        if (data?.authed) {
          setAuthStatus('authed')
          fetchInterns()
        } else {
          setAuthStatus('unauth')
        }
      })
      .catch(() => setAuthStatus('unauth'))
  }, [])

  const roleOptions = useMemo(() => {
    const set = new Set(interns.map(i => i.role))
    return Array.from(set).sort()
  }, [interns])

  const projectOptions = useMemo(() => {
    const set = new Set(interns.flatMap(i => i.projects))
    return Array.from(set).sort()
  }, [interns])

  const departmentCount = useMemo(() => {
    const set = new Set(interns.map(i => i.department).filter(Boolean))
    return set.size
  }, [interns])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const matchQuery = (value: string) => value.toLowerCase().includes(q)

    return interns
      .filter(intern => {
        if (roleFilter !== 'all' && intern.role !== roleFilter) return false
        if (
          projectFilter !== 'all' &&
          !intern.projects.includes(projectFilter)
        )
          return false
        return [
          intern.name,
          intern.role,
          intern.id,
          intern.email,
          intern.department,
        ].some(matchQuery)
      })
      .sort((a, b) => {
        const compare = (key: SortKey) => {
          if (key === 'projects') {
            return a.projects.length - b.projects.length
          }
          return a[key].localeCompare(b[key])
        }

        const primary = compare(sortKey)
        if (primary !== 0) {
          return sortDir === 'asc' ? primary : -primary
        }
        const secondary = compare(secondarySortKey)
        return secondary
      })
  }, [
    interns,
    query,
    sortKey,
    sortDir,
    secondarySortKey,
    roleFilter,
    projectFilter,
  ])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageSafe = Math.min(page, pageCount)
  const paged = filtered.slice(
    (pageSafe - 1) * pageSize,
    pageSafe * pageSize
  )

  const resetForm = () => {
    setForm({ ...emptyForm })
    setFormError('')
  }

  const openAddModal = () => {
    setEditingId(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (intern: Intern) => {
    setEditingId(intern.id)
    setForm({
      id: intern.id,
      name: intern.name,
      role: intern.role,
      email: intern.email,
      phone: intern.phone,
      imageUrl: intern.imageUrl,
      projectsText: intern.projects.join(', '),
      manager: intern.manager,
      startDate: intern.startDate,
      performance: intern.performance,
      skillsText: intern.skills.join(', '),
      department: intern.department,
    })
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required.'
    if (!form.role.trim()) return 'Role is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return 'Please enter a valid email.'
    return ''
  }

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const persistIntern = async (payload: Intern) => {
    const response = await fetch(`/api/interns/${payload.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || 'Failed to update intern')
    }
    const data = await response.json()
    const updated = data?.intern as Intern
    setInterns(prev =>
      prev.map(item => (item.id === updated.id ? updated : item))
    )
  }

  const submitForm = async () => {
    const error = validateForm()
    if (error) {
      setFormError(error)
      return
    }
    const projects = normalizeList(form.projectsText)
    const skills = normalizeList(form.skillsText)
    if (editingId) {
      const updated = {
        id: editingId,
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        imageUrl: form.imageUrl.trim(),
        projects,
        manager: form.manager.trim(),
        startDate: form.startDate.trim(),
        performance: form.performance.trim(),
        skills,
        department: form.department.trim(),
      }
      try {
        await persistIntern(updated)
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Update failed')
        return
      }
    } else {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        imageUrl: form.imageUrl.trim(),
        projects,
        manager: form.manager.trim(),
        startDate: form.startDate.trim(),
        performance: form.performance.trim(),
        skills,
        department: form.department.trim(),
      }
      try {
        const response = await fetch('/api/interns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || 'Create failed')
        }
        const data = await response.json()
        setInterns(prev => [data.intern as Intern, ...prev])
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Create failed')
        return
      }
    }
    closeModal()
  }

  const deleteIntern = async (intern: Intern) => {
    if (!confirm(`Delete ${intern.name}?`)) return
    const response = await fetch(`/api/interns/${intern.id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      return
    }
    setInterns(prev => prev.filter(item => item.id !== intern.id))
    if (expandedId === intern.id) setExpandedId(null)
  }

  const addProject = (intern: Intern) => {
    const draft = projectDrafts[intern.id]?.trim()
    if (!draft) return
    const updated = intern.projects.includes(draft)
      ? intern
      : { ...intern, projects: [...intern.projects, draft] }
    setInterns(prev =>
      prev.map(item => (item.id === intern.id ? updated : item))
    )
    persistIntern(updated).catch(() => null)
    setProjectDrafts(prev => ({ ...prev, [intern.id]: '' }))
  }

  const removeProject = (intern: Intern, project: string) => {
    const updated = {
      ...intern,
      projects: intern.projects.filter(p => p !== project),
    }
    setInterns(prev =>
      prev.map(item => (item.id === intern.id ? updated : item))
    )
    persistIntern(updated).catch(() => null)
  }

  const addSkill = (intern: Intern) => {
    const draft = skillDrafts[intern.id]?.trim()
    if (!draft) return
    const updated = intern.skills.includes(draft)
      ? intern
      : { ...intern, skills: [...intern.skills, draft] }
    setInterns(prev =>
      prev.map(item => (item.id === intern.id ? updated : item))
    )
    persistIntern(updated).catch(() => null)
    setSkillDrafts(prev => ({ ...prev, [intern.id]: '' }))
  }

  const removeSkill = (intern: Intern, skill: string) => {
    const updated = {
      ...intern,
      skills: intern.skills.filter(s => s !== skill),
    }
    setInterns(prev =>
      prev.map(item => (item.id === intern.id ? updated : item))
    )
    persistIntern(updated).catch(() => null)
  }

  const triggerImport = () => {
    setImportError('')
    fileInputRef.current?.click()
  }

  const handleImport = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '')
        const rows = parseCSV(text).filter(r => r.length > 0)
        if (rows.length < 2) {
          setImportError('CSV file has no data rows.')
          return
        }
        const header = rows[0].map(cell => cell.trim().toLowerCase())
        const indexOf = (key: string) => header.indexOf(key)
        const getCell = (row: string[], key: string) => {
          const idx = indexOf(key)
          return idx >= 0 ? row[idx] ?? '' : ''
        }
        const imported = rows.slice(1).map(row => {
          const projects = parseListCell(getCell(row, 'projects'))
          const skills = parseListCell(getCell(row, 'skills'))
          const id = getCell(row, 'id').trim()
          const resolvedId = id || undefined
          return {
            id: resolvedId,
            name: getCell(row, 'name').trim(),
            role: getCell(row, 'role').trim(),
            email: getCell(row, 'email').trim(),
            phone: getCell(row, 'phone').trim(),
            imageUrl: getCell(row, 'imageurl').trim(),
            projects,
            manager: getCell(row, 'manager').trim(),
            startDate: getCell(row, 'startdate').trim(),
            performance: getCell(row, 'performance').trim(),
            skills,
            department: getCell(row, 'department').trim(),
          } as Intern
        })
        fetch('/api/interns/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interns: imported }),
        })
          .then(async response => {
            if (!response.ok) {
              const data = await response.json().catch(() => null)
              throw new Error(data?.error || 'Bulk import failed')
            }
            return response.json()
          })
          .then(data => {
            if (data?.interns) setInterns(data.interns)
          })
          .catch(() => {
            setImportError('Failed to import CSV.')
          })
      } catch {
        setImportError('Failed to import CSV.')
      }
    }
    reader.readAsText(file)
  }

  const handleExport = () => {
    const csv = toCSV(interns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'interns.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetSampleData = () => {
    fetch('/api/seed', { method: 'POST' })
      .then(() => fetchInterns())
      .catch(() => null)
    setExpandedId(null)
    setPage(1)
    setRoleFilter('all')
    setProjectFilter('all')
    setQuery('')
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setPage(1)
  }

  const handleProjectFilterChange = (value: string) => {
    setProjectFilter(value)
    setPage(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPage(1)
  }

  if (authStatus !== 'authed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl border border-white/60 p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1">
                Admin Portal
              </div>
              <h1 className="text-2xl font-semibold text-zinc-900">
                {authStatus === 'checking' ? 'Checking sessionâ€¦' : 'Secure access'}
              </h1>
              <p className="text-sm text-zinc-500">
                {authStatus === 'checking'
                  ? 'Verifying your session credentials.'
                  : 'Enter the admin password to continue managing interns.'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Password</label>
              <input
                type="password"
                className="border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={password}
                onChange={event => setPassword(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') handleLogin()
                }}
                disabled={authStatus === 'checking'}
              />
              {authError ? (
                <div className="text-xs text-red-600">{authError}</div>
              ) : null}
            </div>
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-70"
              onClick={handleLogin}
              disabled={authStatus === 'checking'}
            >
              {authStatus === 'checking' ? 'Checkingâ€¦' : 'Unlock Admin'}
            </button>
            <div className="text-[11px] text-zinc-400">
              Contact your admin for credentials.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <TopBar
        onAdd={openAddModal}
        onImport={triggerImport}
        onExport={handleExport}
        onReset={resetSampleData}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={e => handleImport(e.target.files?.[0] ?? null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Metrics
          totalInterns={interns.length}
          activeProjects={interns.reduce((s, i) => s + i.projects.length, 0)}
          departments={departmentCount}
        />

        {importError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {importError}
          </div>
        ) : null}

        <ControlsPanel
          query={query}
          onQueryChange={handleQueryChange}
          roleOptions={roleOptions}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
          projectOptions={projectOptions}
          projectFilter={projectFilter}
          onProjectFilterChange={handleProjectFilterChange}
          sortKey={sortKey}
          sortDir={sortDir}
          secondarySortKey={secondarySortKey}
          onSortKeyChange={setSortKey}
          onSortDirToggle={() =>
            setSortDir(dir => (dir === 'asc' ? 'desc' : 'asc'))
          }
          onSecondarySortKeyChange={setSecondarySortKey}
        />

        <InternTable
          interns={paged}
          loading={loading}
          expandedId={expandedId}
          onToggleExpand={id =>
            setExpandedId(prev => (prev === id ? null : id))
          }
          onEdit={openEditModal}
          onDelete={deleteIntern}
          projectDrafts={projectDrafts}
          onProjectDraftChange={(id, value) =>
            setProjectDrafts(prev => ({ ...prev, [id]: value }))
          }
          onAddProject={addProject}
          onRemoveProject={removeProject}
          skillDrafts={skillDrafts}
          onSkillDraftChange={(id, value) =>
            setSkillDrafts(prev => ({ ...prev, [id]: value }))
          }
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
        />

        <Pagination
          page={pageSafe}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(pageCount, p + 1))}
        />
      </div>

      <InternModal
        show={showModal}
        editingId={editingId}
        form={form}
        formError={formError}
        onClose={closeModal}
        onSubmit={submitForm}
        onFieldChange={handleFieldChange}
      />

      <button
        className="fixed bottom-24 right-6 border border-zinc-200 bg-white text-zinc-700 text-xs px-4 py-2 rounded-full shadow-sm hover:border-zinc-300"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  )
}
