import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function TopProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(30);
    
    const timer1 = setTimeout(() => setProgress(70), 150);
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setProgress(0), 200);
      }, 200);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname, location.search]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div 
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{ width: `\${progress}%` }}
      />
    </div>
  );
}
