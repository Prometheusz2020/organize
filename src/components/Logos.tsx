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
        // Concept 3: Diamond Check (Selected)
        return (
          <>
            {/* Main Diamond Shape */}
            <rect 
              x="50" 
              y="10" 
              width="56.57" 
              height="56.57" 
              rx="12" 
              transform="rotate(45 50 10)" 
              fill="currentColor"
            />
            {/* Inner Checkmark */}
            <path 
              d="M38 52L46 60L62 44" 
              stroke="white" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
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
