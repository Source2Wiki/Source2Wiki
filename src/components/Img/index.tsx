import React from 'react';

// hack to get scaleable markdown images without going through the trouble of making a plugin

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

export default function Img({ src, alt, ...props }: ImgProps) {
  let displayAlt = alt || '';
  let maxWidth = '100%';
  
  if (alt?.includes('|')) {
    const parts = alt.split('|');
    displayAlt = parts[0].trim();
    const width = parseInt(parts[1].trim());
    if (!isNaN(width)) {
      maxWidth = `${width}px`;
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'left',
      margin: '1rem 0'
    }}>
      <img 
        {...props}
        src={src} 
        alt={displayAlt}
        style={{ 
          maxWidth,
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
        }} 
      />
    </div>
  );
}