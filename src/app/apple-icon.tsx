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
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '20px',
            transform: 'rotate(45deg)',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}
        >
          <div 
            style={{
              width: '45px',
              height: '25px',
              borderLeft: '12px solid white',
              borderBottom: '12px solid white',
              transform: 'rotate(-45deg) translate(8px, -8px)',
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
