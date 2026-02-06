type AdminToastProps = {
  message: string
}

// Lightweight toast for admin actions (save/import/updates).
export default function AdminToast({ message }: AdminToastProps) {
  if (!message) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm">
        {message}
      </div>
    </div>
  )
}
