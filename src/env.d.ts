declare module '@fontsource-variable/inter' {}
declare module '@fontsource-variable/playfair-display' {}
declare module '@fontsource-variable/dm-sans' {}
declare module '@fontsource-variable/outfit' {}
declare module '@fontsource-variable/fraunces' {}
declare module '@fontsource-variable/plus-jakarta-sans' {}
declare module '@fontsource-variable/space-grotesk' {}
declare module '@fontsource-variable/manrope' {}
declare module '@fontsource/dm-serif-display' {}
declare module '@fontsource/young-serif' {}

declare module 'culori' {
  export function parseHex(color: string): { mode: 'rgb'; r: number; g: number; b: number; alpha?: number } | undefined
  export function formatHex(color: Record<string, unknown>): string
  export function wcagContrast(fg: string, bg: string): number
  export function converter(mode: string): (color: Record<string, unknown>) => Record<string, unknown> | undefined
  export function clampChroma(color: Record<string, unknown>): Record<string, unknown>
  export function filterDeficiencyProt(severity?: number): (color: Record<string, unknown>) => Record<string, unknown> | undefined
  export function filterDeficiencyDeuter(severity?: number): (color: Record<string, unknown>) => Record<string, unknown> | undefined
  export function filterDeficiencyTrit(severity?: number): (color: Record<string, unknown>) => Record<string, unknown> | undefined
}
