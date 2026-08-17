import type { HarmonyRule } from '../../types'

const rules: { value: HarmonyRule; label: string }[] = [
  { value: 'complementary', label: 'Complementary' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'split-complementary', label: 'Split Comp' },
  { value: 'square', label: 'Square' },
  { value: 'monochromatic', label: 'Mono' },
  { value: 'random', label: 'Random' },
]

interface Props {
  value: HarmonyRule
  onChange: (rule: HarmonyRule) => void
}

export function HarmonySelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 flex-wrap">
      {rules.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            backgroundColor: r.value === value ? 'var(--color-text)' : 'var(--color-bg-tertiary)',
            color: r.value === value ? 'var(--color-bg)' : 'var(--color-text)',
            boxShadow: r.value === value ? 'inset 0 -2px 0 var(--color-accent)' : 'none',
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
