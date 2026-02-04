const images = import.meta.glob('../assets/interns/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const imageMap: Record<string, string> = {}

Object.entries(images).forEach(([path, url]) => {
  const filename = path.split('/').pop()
  if (!filename) return
  const id = filename.split('.')[0]?.toUpperCase()
  if (!id) return
  imageMap[id] = url as string
})

export const getInternImageUrl = (id: string) => imageMap[id] || ''
