import { useState } from "react";
import { getCropImageUrl, CROP_PLACEHOLDER_IMAGE } from "@/lib/cropImages";

interface CropImageDisplayProps {
  /** The predicted crop name (e.g., "Rice", "Wheat") */
  cropName: string;
  /** Optional: size variant for the image */
  size?: "sm" | "md" | "lg";
  /** Optional: show the crop name below the image */
  showLabel?: boolean;
  /** Optional: inline layout (no extra wrapper), for use in flex rows */
  inline?: boolean;
  /** Optional: additional CSS classes for the container */
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-32 h-32 sm:w-40 sm:h-40",
  lg: "w-full max-w-xl h-48 sm:h-56 md:h-64",
};

export function CropImageDisplay({
  cropName,
  size = "lg",
  showLabel = true,
  inline = false,
  className = "",
}: CropImageDisplayProps) {
  const [imgSrc, setImgSrc] = useState(() => getCropImageUrl(cropName));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(CROP_PLACEHOLDER_IMAGE);
    }
  };

  const imageBlock = (
    <div
      className={`
        ${sizeClasses[size]}
        overflow-hidden rounded-xl shadow-lg
        border border-border/60 bg-muted/30
        transition-shadow duration-300 hover:shadow-xl
      `}
    >
      <img
        src={imgSrc}
        alt={cropName}
        referrerPolicy="no-referrer"
        onError={handleError}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );

  if (inline) {
    return <div className={className}>{imageBlock}</div>;
  }

  return (
    <div
      className={`flex flex-col items-center gap-3 transition-transform duration-300 hover:scale-[1.02] ${className}`}
    >
      {imageBlock}
      {showLabel && (
        <p className="text-sm font-semibold text-foreground">{cropName}</p>
      )}
    </div>
  );
}

export default CropImageDisplay;
