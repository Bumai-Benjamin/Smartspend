import React from "react";

export default function LogoMark({ size = 32, radius = 9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: radius, flexShrink: 0 }}>
      <rect width="100" height="100" rx="22" fill="#c67139" />
      <path
        d="M52 26c-9 0-15 5-15 12 0 6 4 9 11 11l4 1c5 1 6 3 6 5 0 3-3 5-8 5-6 0-10-3-11-7l-9 3c2 8 9 13 19 13 10 0 17-5 17-13 0-6-4-10-12-12l-4-1c-4-1-6-2-6-5 0-3 3-4 7-4 5 0 8 2 9 6l9-3c-2-7-8-11-17-11z"
        fill="#f9f4ed"
      />
      <rect x="62" y="68" width="8" height="14" rx="2.5" fill="#ecd3c0" />
      <rect x="74" y="60" width="8" height="22" rx="2.5" fill="#f4e2d5" />
      <rect x="86" y="52" width="8" height="30" rx="2.5" fill="#f9f4ed" />
    </svg>
  );
}
