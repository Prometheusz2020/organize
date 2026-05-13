import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 512,
  height: 512,
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
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '60px',
            transform: 'rotate(45deg)',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }}
        >
          <div 
            style={{
              width: '130px',
              height: '70px',
              borderLeft: '35px solid white',
              borderBottom: '35px solid white',
              transform: 'rotate(-45deg) translate(25px, -25px)',
              marginTop: '-15px',
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
