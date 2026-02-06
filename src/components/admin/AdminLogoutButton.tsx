type AdminLogoutButtonProps = {
  onLogout: () => void
}

// Floating logout button anchored to the admin view.
export default function AdminLogoutButton({
  onLogout,
}: AdminLogoutButtonProps) {
  return (
    <button
      className="fixed bottom-24 right-6 border border-amber-200 bg-white text-amber-800 text-xs px-4 py-2 rounded-full shadow-sm hover:border-amber-300"
      onClick={onLogout}
    >
      Log out
    </button>
  )
}
