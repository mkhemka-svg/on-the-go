import Svg, { Circle, Rect, Ellipse } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface Props {
  size?: number;
  color?: string;
}

export default function PersonAvatarIllustration({ size = 56, color = Colors.darkNavy }: Props) {
  const s = size / 56; // scale factor relative to base size
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Background circle */}
      <Circle cx="28" cy="28" r="28" fill={Colors.lightYellow} />
      {/* Head */}
      <Circle cx="28" cy="20" r="10" fill={color} />
      {/* Body / shoulders */}
      <Ellipse cx="28" cy="42" rx="14" ry="10" fill={color} />
    </Svg>
  );
}
