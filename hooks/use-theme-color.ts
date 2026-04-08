import { Colors } from '@/constants/theme';

// Simplified hook — the app uses a fixed design system, not dynamic light/dark theming
export function useThemeColor(
  props: { light?: string; dark?: string },
  _colorName: string
) {
  return props.light ?? Colors.white;
}
