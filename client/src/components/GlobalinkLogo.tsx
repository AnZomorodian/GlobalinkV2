export default function GlobalinkLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" fill="url(#gradient)" stroke="#1e40af" strokeWidth="2"/>
      
      {/* Globe lines */}
      <ellipse cx="50" cy="50" rx="30" ry="45" fill="none" stroke="white" strokeWidth="2"/>
      <ellipse cx="50" cy="50" rx="45" ry="30" fill="none" stroke="white" strokeWidth="2"/>
      <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="2"/>
      <line x1="50" y1="5" x2="50" y2="95" stroke="white" strokeWidth="2"/>
      
      {/* Connection dots */}
      <circle cx="35" cy="25" r="3" fill="white"/>
      <circle cx="65" cy="25" r="3" fill="white"/>
      <circle cx="35" cy="75" r="3" fill="white"/>
      <circle cx="65" cy="75" r="3" fill="white"/>
      <circle cx="25" cy="50" r="3" fill="white"/>
      <circle cx="75" cy="50" r="3" fill="white"/>
      
      {/* Connection lines */}
      <line x1="35" y1="25" x2="65" y2="75" stroke="white" strokeWidth="1" opacity="0.7"/>
      <line x1="65" y1="25" x2="35" y2="75" stroke="white" strokeWidth="1" opacity="0.7"/>
      <line x1="25" y1="50" x2="75" y2="50" stroke="white" strokeWidth="1" opacity="0.7"/>
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
      </defs>
    </svg>
  );
}