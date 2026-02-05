type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function InputField({
  label,
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <label className="text-xs text-amber-800 flex flex-col gap-1">
      <span>{label}</span>
      <input
        className="border border-amber-200 rounded-xl px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  )
}
