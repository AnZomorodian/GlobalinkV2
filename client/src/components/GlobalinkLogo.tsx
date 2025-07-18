import globaLinkLogo from "@assets/globalink-logo.png";

interface GlobalinkLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function GlobalinkLogo({ 
  className = "", 
  size = "md", 
  showText = true 
}: GlobalinkLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16",
    xl: "h-20 w-20"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl", 
    xl: "text-3xl"
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src={globaLinkLogo} 
        alt="Globalink Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-bold text-white ${textSizes[size]} tracking-wide`}>
          GLOBALINK
        </span>
      )}
    </div>
  );
}