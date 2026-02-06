// Resolve a public image URL based on the intern id.
// Public files live in /public/interns and are served from /interns/* at runtime.
export const getInternImageUrl = (id: string) => {
  if (!id) return ''
  return `/interns/${id}.webp`
}
