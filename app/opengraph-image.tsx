import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Arsenii Pomazkov — Senior software engineer';

export default async function Image() {
  const avatar = await readFile(join(process.cwd(), 'public', 'avatar.jpg'));
  const avatarSrc = `data:image/jpeg;base64,${avatar.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 96px',
          backgroundImage: 'linear-gradient(115deg, #14100f 0%, #201c1d 55%, #2f281c 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 660 }}>
          <div style={{ fontSize: 32, color: '#8a8286' }}>Hi, I&rsquo;m</div>
          <div
            style={{
              marginTop: 10,
              fontSize: 68,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-2px',
            }}
          >
            Arsenii Pomazkov
          </div>
          <div style={{ marginTop: 22, fontSize: 32, color: '#a29a9e' }}>
            Senior software engineer · London
          </div>
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundImage: 'linear-gradient(150deg, #ffd94d 0%, #f97316 100%)',
              }}
            />
            <div style={{ fontSize: 30, color: '#cfc8cc' }}>products &amp; AI</div>
          </div>
        </div>
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: 170,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage:
              'radial-gradient(circle at 50% 70%, #fff3c4 0%, #ffd94d 40%, #f5b81f 100%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc}
            alt=""
            width={304}
            height={304}
            style={{ borderRadius: 152, objectFit: 'cover' }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
