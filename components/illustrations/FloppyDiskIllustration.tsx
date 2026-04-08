import Svg, { Rect, Path } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface Props {
  size?: number;
}

export default function FloppyDiskIllustration({ size = 52 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52">
      {/* Disk body */}
      <Rect x="4" y="4" width="44" height="44" rx="6" fill={Colors.darkNavy} />

      {/* Top label area (lighter) */}
      <Rect x="10" y="4" width="24" height="18" rx="2" fill={Colors.primaryBlue} />

      {/* Metal shutter slot on label */}
      <Rect x="18" y="8" width="6" height="10" rx="2" fill={Colors.darkNavy} />

      {/* Bottom read/write area */}
      <Rect x="10" y="30" width="32" height="14" rx="3" fill={Colors.primaryBlue} opacity="0.6" />

      {/* Shine lines on bottom area */}
      <Rect x="14" y="34" width="24" height="2" rx="1" fill="white" opacity="0.3" />
      <Rect x="14" y="38" width="16" height="2" rx="1" fill="white" opacity="0.3" />
    </Svg>
  );
}
