import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        {/* We recreate the Diamond Check here in JSX/CSS for the generator */}
        <div 
          style={{
            display: 'flex',
            width: '100px',
            height: '100px',
            backgroundColor: '#6366f1',
            borderRadius: '16px',
            transform: 'rotate(45deg)',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div 
            style={{
              width: '40px',
              height: '20px',
              borderLeft: '8px solid white',
              borderBottom: '8px solid white',
              transform: 'rotate(-45deg) translate(5px, -5px)',
              marginTop: '-5px',
            }}
          />
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
