export interface PaletteColor {
  hex: string
  locked: boolean
}

export interface Palette {
  id: string
  name: string
  colors: PaletteColor[]
  tags: string[]
  collection?: string
  createdAt: number
  updatedAt: number
}

export type ColorSpace = 'hex' | 'rgb' | 'hsl'

export type HarmonyRule =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'square'
  | 'monochromatic'
  | 'random'

export interface BuiltInPalette {
  name: string
  colors: string[]
  tags: string[]
  mood?: string
}

export interface FontOption {
  name: string
  cssFamily: string
  category: 'serif' | 'sans-serif'
}

export type BlindnessType =
  | 'none'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
