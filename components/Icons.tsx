type P = { size?: number; color?: string; strokeWidth?: number };

const base = (size = 20, color = "currentColor", sw = 2) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Back = ({ size = 22, color, strokeWidth }: P) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
export const Close = ({ size = 22, color, strokeWidth }: P) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const Send = ({ size = 20, color = "#fff", strokeWidth }: P) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Check = ({ size = 18, color = "#11643f", strokeWidth = 2.6 }: P) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
export const Lock = ({ size = 16, color = "currentColor", strokeWidth = 2.2 }: P) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
export const Bulb = ({ size = 20, color = "#b26b00" }: P) => (
  <svg {...base(size, color)}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" />
  </svg>
);
export const Cap = ({ size = 24, color = "#f5a524" }: P) => (
  <svg {...base(size, color)}>
    <path d="M3 10l9-5 9 5-9 5-9-5z" />
    <path d="M7 12.5V17c3 2 7 2 10 0v-4.5" />
  </svg>
);
export const Rupee = ({ size = 24, color = "#f5a524" }: P) => (
  <svg {...base(size, color)}>
    <path d="M7 4h10M7 8h10M7 4c5 0 5 8 0 8l8 8" />
  </svg>
);
export const Medal = ({ size = 24, color = "#f5a524" }: P) => (
  <svg {...base(size, color)}>
    <circle cx="12" cy="9" r="5" />
    <path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5L15 13.5" />
  </svg>
);
export const Share = ({ size = 20, color = "#fff" }: P) => (
  <svg {...base(size, color)}>
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12M7 8l5-5 5 5" />
  </svg>
);
export const Chat = ({ size = 18, color = "#fff" }: P) => (
  <svg {...base(size, color)}>
    <path d="M4 20l1.5-4A8 8 0 1 1 9 19.5L4 20z" />
  </svg>
);
export const Phone = ({ size = 20, color = "#b26b00" }: P) => (
  <svg {...base(size, color)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);
export const Spinner = ({ size = 18, color = "#f5a524" }: P) => (
  <svg {...base(size, color, 2.4)} className="spin">
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);
export const Info = ({ size = 18, color = "#3730c8" }: P) => (
  <svg {...base(size, color)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16v.5" />
  </svg>
);
