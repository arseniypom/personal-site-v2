import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'A. Pomazkov — Senior software engineer';

export default async function Image() {
  const portrait = await readFile(join(process.cwd(), 'public', 'portrait.png'));
  const portraitSrc = `data:image/png;base64,${portrait.toString('base64')}`;

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
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-3px',
            }}
          >
            A. Pomazkov
          </div>
          <div style={{ marginTop: 22, fontSize: 34, color: '#8a8286' }}>
            Software engineer
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
            backgroundImage:
              'radial-gradient(circle at 50% 78%, #fff3c4 0%, #ffd94d 34%, #ffc933 58%, #f5b81f 100%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitSrc}
            width={513}
            height={513}
            style={{
              position: 'absolute',
              bottom: -1,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
