import { Dimensions } from 'react-native';
import Svg, { Circle, Ellipse, Rect, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Scales relative to base frame width of 375 (iPhone 13 mini)
const scale = width / 375;
const W = Math.round(210 * scale);
const H = Math.round(255 * scale);

// Airplane window with three passengers — built programmatically
// since the Figma asset cannot be directly exported here.
// Design: dark-navy frame, sky-blue interior, 3 silhouettes (L/R white, center yellow).
export default function AirplaneWindowIllustration() {
  return (
    <Svg width={W} height={H} viewBox="0 0 210 255">
      {/* ── Window outer frame ── */}
      <Rect
        x="0" y="0" width="210" height="255"
        rx="68" ry="68"
        fill="#1d5abc"
      />

      {/* ── Window glass / sky interior ── */}
      <Rect
        x="13" y="13" width="184" height="229"
        rx="57" ry="57"
        fill="#c8e6ff"
      />

      {/* ── Horizon / ground hint at bottom ── */}
      <Rect
        x="13" y="195" width="184" height="47"
        rx="0" ry="0"
        fill="#a8d4f5"
        clipPath="url(#windowClip)"
      />

      {/* ── Clouds ── */}
      {/* Cloud 1 */}
      <Ellipse cx="72"  cy="60"  rx="32" ry="16" fill="white" opacity="0.75" />
      <Ellipse cx="50"  cy="67"  rx="20" ry="12" fill="white" opacity="0.75" />
      <Ellipse cx="93"  cy="67"  rx="18" ry="11" fill="white" opacity="0.75" />

      {/* Cloud 2 */}
      <Ellipse cx="155" cy="48"  rx="26" ry="13" fill="white" opacity="0.65" />
      <Ellipse cx="174" cy="55"  rx="17" ry="10" fill="white" opacity="0.65" />
      <Ellipse cx="138" cy="55"  rx="16" ry="9"  fill="white" opacity="0.65" />

      {/* ── Seat-back row (subtle) ── */}
      <Rect
        x="22" y="196" width="166" height="42"
        rx="12"
        fill="#1d5abc"
        opacity="0.12"
      />

      {/* ══ PERSON LEFT (white) ══ */}
      {/* body */}
      <Rect x="32" y="192" width="46" height="56" rx="14" fill="white" opacity="0.88" />
      {/* head */}
      <Circle cx="55" cy="175" r="23" fill="white" opacity="0.88" />
      {/* hair hint */}
      <Path
        d="M32,175 Q55,152 78,175"
        fill="#b0c8e8"
        opacity="0.5"
      />

      {/* ══ PERSON CENTER (yellow — slightly taller/closer) ══ */}
      {/* body */}
      <Rect x="82" y="184" width="46" height="64" rx="14" fill="#febd19" />
      {/* head */}
      <Circle cx="105" cy="164" r="26" fill="#febd19" />
      {/* hair hint */}
      <Path
        d="M79,164 Q105,138 131,164"
        fill="#e09900"
        opacity="0.45"
      />

      {/* ══ PERSON RIGHT (white) ══ */}
      {/* body */}
      <Rect x="132" y="192" width="46" height="56" rx="14" fill="white" opacity="0.88" />
      {/* head */}
      <Circle cx="155" cy="175" r="23" fill="white" opacity="0.88" />
      {/* hair hint */}
      <Path
        d="M132,175 Q155,152 178,175"
        fill="#b0c8e8"
        opacity="0.5"
      />
    </Svg>
  );
}
