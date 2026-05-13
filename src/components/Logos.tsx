import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "diamond" | "layers" | "grid" | "progress";
}

export const Logo: React.FC<LogoProps> = ({ size = 32, variant = "diamond", className, ...props }) => {
  const getIcon = () => {
    switch (variant) {
      case "layers":
        // Concept 1: Stylized 'O' with layers
        return (
          <>
            <path d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <path d="M35 50C35 41.72 41.72 35 50 35C58.28 35 65 41.72 65 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
            <circle cx="50" cy="50" r="6" fill="currentColor" />
          </>
        );
      case "grid":
        // Concept 2: Geometric Grid
        return (
          <>
            <rect x="15" y="15" width="30" height="30" rx="4" fill="currentColor" opacity="0.4" />
            <rect x="55" y="15" width="30" height="30" rx="4" fill="currentColor" />
            <rect x="15" y="55" width="30" height="30" rx="4" fill="currentColor" />
            <rect x="55" y="55" width="30" height="30" rx="4" fill="currentColor" opacity="0.4" />
          </>
        );
      case "progress":
        // Concept 4: Progress bars in circle
        return (
          <>
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" opacity="0.2" />
            <rect x="35" y="45" width="8" height="20" rx="4" fill="currentColor" />
            <rect x="46" y="30" width="8" height="35" rx="4" fill="currentColor" />
            <rect x="57" y="40" width="8" height="25" rx="4" fill="currentColor" />
          </>
        );
      case "diamond":
      default:
        // Concept 3: Diamond Check (Premium Version)
        return (
          <>
            <defs>
              <linearGradient id="diamond-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="#4f46e5" /> {/* Indigo-600 */}
              </linearGradient>
            </defs>
            <rect 
              x="50" 
              y="12" 
              width="54" 
              height="54" 
              rx="14" 
              transform="rotate(45 50 12)" 
              fill="url(#diamond-grad)"
            />
            {/* Styled bold checkmark */}
            <path 
              d="M36 52L45 61L64 42" 
              stroke="white" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }}
            />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {getIcon()}
    </svg>
  );
};
