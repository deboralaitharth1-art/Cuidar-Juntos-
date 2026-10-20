import React, { useState } from 'react';
import appLogoImage from '../assets/images/app_logo_1792159235320.jpg';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-10 h-10', size = 40 }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <img
          src={appLogoImage}
          alt="Cuidar Juntos Logo"
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      ) : (
        /* High-fidelity Vector SVG Fallback reproducing the user's uploaded emblem */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full absolute inset-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
        {/* Circular background */}
        <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        
        {/* Top green cross tab */}
        <rect x="44" y="16" width="12" height="18" rx="4" fill="#84CC16" />
        <rect x="41" y="19" width="18" height="12" rx="4" fill="#84CC16" />

        {/* Heart Left Half (Vibrant Blue) */}
        <path
          d="M50 78 C35 68 22 55 22 42 C22 30 31 22 42 26 C47 28 50 34 50 34 Z"
          fill="#0EA5E9"
        />

        {/* Heart Right Half (Vibrant Green) */}
        <path
          d="M50 78 C65 68 78 55 78 42 C78 30 69 22 58 26 C53 28 50 34 50 34 Z"
          fill="#10B981"
        />

        {/* Person Left - Head & Silhouette */}
        <circle cx="36" cy="44" r="5" fill="#FFFFFF" />
        <path
          d="M26 55 C26 50 31 49 37 51 L44 54 C42 56 36 57 28 57 Z"
          fill="#FFFFFF"
        />
        <circle cx="43" cy="52" r="3" fill="#FFFFFF" />

        {/* Person Right - Head & Silhouette (Caregiver) */}
        <circle cx="62" cy="42" r="6" fill="#FFFFFF" />
        <path
          d="M52 57 C58 48 68 47 73 53 C67 55 58 57 48 57 Z"
          fill="#FFFFFF"
        />
      </svg>
      )}
    </div>
  );
};
