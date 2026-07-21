import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'pomazkov.js — поиск и карта тем';

// small cluster of "topic map" dots, positioned within the right card
const DOTS: Array<{ x: number; y: number; r: number; color: string }> = [
  { x: 80, y: 90, r: 9, color: '#ffd94d' },
  { x: 130, y: 60, r: 6, color: '#ffd94d' },
  { x: 150, y: 120, r: 7, color: '#ffd94d' },
  { x: 250, y: 160, r: 8, color: '#5eead4' },
  { x: 300, y: 120, r: 6, color: '#5eead4' },
  { x: 60, y: 260, r: 7, color: '#ff9a3d' },
  { x: 110, y: 300, r: 9, color: '#ff9a3d' },
  { x: 40, y: 350, r: 6, color: '#ff9a3d' },
  { x: 260, y: 340, r: 8, color: '#ffffff' },
  { x: 310, y: 380, r: 6, color: '#ffffff' },
  { x: 220, y: 400, r: 6, color: '#ffffff' },
  { x: 150, y: 440, r: 8, color: '#ffd94d' },
  { x: 90, y: 460, r: 6, color: '#5eead4' },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: '#0f0b0d',
          padding: 48,
          gap: 24,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            flexGrow: 1,
            flexBasis: 0,
            height: '100%',
            minWidth: 0,
            borderRadius: 40,
            backgroundImage: 'linear-gradient(115deg, #1b171a 0%, #201c1d 55%, #2f281c 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 68px',
          }}
        >
          <div style={{ fontSize: 28, color: '#8a8286' }}>Telegram</div>
          <div
            style={{
              marginTop: 12,
              fontSize: 88,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-3px',
            }}
          >
            pomazkov.js
          </div>
        </div>

        <div
          style={{
            width: 380,
            height: '100%',
            flexShrink: 0,
            borderRadius: 40,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            backgroundImage: 'linear-gradient(150deg, #6dc7ff 0%, #2aabee 45%, #0e75b8 100%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -60,
              bottom: -80,
              width: 300,
              height: 300,
              borderRadius: 64,
              background: 'rgba(255, 255, 255, 0.16)',
              transform: 'rotate(14deg)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 40,
              bottom: -120,
              width: 260,
              height: 260,
              borderRadius: 64,
              background: 'rgba(255, 255, 255, 0.22)',
              transform: 'rotate(-8deg)',
            }}
          />
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
                opacity: 0.95,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
