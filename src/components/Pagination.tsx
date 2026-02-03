type PaginationProps = {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageSizeChange: (value: number) => void
  onPrev: () => void
  onNext: () => void
}

export default function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageSizeChange,
  onPrev,
  onNext,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="text-xs text-zinc-500">
        Page {page} of {pageCount} - {total} total
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
        <button
          className="border rounded-xl px-3 py-2 text-sm"
          onClick={onPrev}
          disabled={page <= 1}
        >
          Previous
        </button>
        <button
          className="border rounded-xl px-3 py-2 text-sm"
          onClick={onNext}
          disabled={page >= pageCount}
        >
          Next
        </button>
      </div>
    </div>
  )
}
