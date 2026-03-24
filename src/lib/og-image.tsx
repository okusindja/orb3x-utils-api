import { ImageResponse } from 'next/og';

export const ogImageSize = {
  width: 1200,
  height: 630,
};

export const ogImageContentType = 'image/png';

type OgImageInput = {
  eyebrow: string;
  title: string;
  description: string;
};

export function createOgImageResponse({ eyebrow, title, description }: OgImageInput) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          background: '#08173f',
          color: '#edf2ff',
          padding: '48px',
          fontFamily: 'Inter, Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            borderRadius: '32px',
            border: '1px solid rgba(158, 183, 255, 0.25)',
            background: 'linear-gradient(145deg, rgba(12, 35, 93, 0.98), rgba(4, 11, 33, 1))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-80px',
            width: '420px',
            height: '420px',
            borderRadius: '999px',
            background: 'radial-gradient(circle, rgba(102, 136, 239, 0.36), rgba(102, 136, 239, 0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-140px',
            left: '-120px',
            width: '520px',
            height: '520px',
            borderRadius: '999px',
            background: 'radial-gradient(circle, rgba(23, 69, 177, 0.36), rgba(23, 69, 177, 0) 74%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '22px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              borderRadius: '999px',
              border: '1px solid rgba(196, 211, 255, 0.3)',
              background: 'rgba(4, 11, 33, 0.42)',
              color: '#c4d3ff',
              padding: '10px 16px',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '880px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  background: '#1745b1',
                  boxShadow: '0 0 0 10px rgba(23, 69, 177, 0.16)',
                }}
              />
              <div style={{ fontSize: 30, fontWeight: 700, color: '#9eb7ff' }}>ORB3X Utils API</div>
            </div>

            <div
              style={{
                fontSize: 68,
                lineHeight: 1.06,
                fontWeight: 800,
                letterSpacing: '-0.04em',
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 28,
                lineHeight: 1.45,
                color: '#dde7ff',
                maxWidth: '880px',
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#c4d3ff',
              fontSize: 22,
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <span>Validation</span>
              <span>Geo</span>
              <span>Finance</span>
              <span>Documents</span>
            </div>
            <div style={{ fontWeight: 700 }}>orb3x-utils-api.vercel.app</div>
          </div>
        </div>
      </div>
    ),
    ogImageSize,
  );
}
