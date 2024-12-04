import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src?: string; // The primary image source
  fallbackSrc: string; // The fallback image source
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  ...rest
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);

  const handleError = () => {
    setImageSrc(fallbackSrc); // Switch to the fallback image on error
  };

  return (
    <img
      src={imageSrc}
      onError={handleError} // Handle loading errors
      {...rest}
    />
  );
};
