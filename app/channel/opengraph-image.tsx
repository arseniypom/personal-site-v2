import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'pomazkov.js — поиск и карта тем по постам канала';

// decorative "topic map": clusters of dots in the site palette
const DOTS: Array<{ x: number; y: number; r: number; color: string }> = [
  // yellow cluster
  { x: 820, y: 150, r: 13, color: '#ffd94d' },
  { x: 878, y: 118, r: 9, color: '#ffd94d' },
  { x: 905, y: 185, r: 11, color: '#ffd94d' },
  { x: 845, y: 215, r: 8, color: '#ffd94d' },
  // purple cluster
  { x: 1035, y: 250, r: 12, color: '#a78bfa' },
  { x: 1090, y: 215, r: 9, color: '#a78bfa' },
  { x: 1075, y: 300, r: 14, color: '#a78bfa' },
  { x: 1020, y: 330, r: 8, color: '#a78bfa' },
  // orange cluster
  { x: 870, y: 400, r: 12, color: '#ff9a3d' },
  { x: 930, y: 372, r: 9, color: '#ff9a3d' },
  { x: 940, y: 448, r: 13, color: '#ff9a3d' },
  { x: 985, y: 405, r: 8, color: '#ff9a3d' },
  // teal cluster
  { x: 1060, y: 490, r: 11, color: '#5eead4' },
  { x: 1115, y: 455, r: 8, color: '#5eead4' },
  { x: 1120, y: 525, r: 12, color: '#5eead4' },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(115deg, #14100f 0%, #201c1d 55%, #2f281c 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {DOTS.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.x - d.r,
              top: d.y - d.r,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: d.r,
              backgroundColor: d.color,
              opacity: 0.9,
            }}
          />
        ))}
        {DOTS.map((d, i) => (
          <div
            key={`glow-${i}`}
            style={{
              position: 'absolute',
              left: d.x - d.r * 3,
              top: d.y - d.r * 3,
              width: d.r * 6,
              height: d.r * 6,
              borderRadius: d.r * 3,
              backgroundColor: d.color,
              opacity: 0.08,
            }}
          />
        ))}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 640,
            paddingLeft: 96,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundImage: 'linear-gradient(150deg, #ffd94d 0%, #f97316 100%)',
              }}
            />
            <div style={{ fontSize: 32, color: '#8a8286' }}>Telegram-канал</div>
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 82,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-2px',
            }}
          >
            pomazkov.js
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 34,
              lineHeight: 1.4,
              color: '#a29a9e',
            }}
          >
            Поиск по смыслу и карта тем по постам канала
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
