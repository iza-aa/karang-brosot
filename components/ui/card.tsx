// components/ui/card.tsx
'use client';

import { ReactNode, CSSProperties, useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import ButtonAction from './button-action';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'chrome';
  tint?: 'light' | 'dark' | 'auto';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: CSSProperties;
  enableTilt?: boolean;
  rounded?: boolean;
  border?: boolean;
  enableScroll?: boolean; // Add this
  // Admin control props
  enableAdminControls?: boolean;
  isVisible?: boolean;
  onEdit?: () => void;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
}

export default function Card({
  children,
  className = '',
  variant = 'regular',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tint = 'light',
  hover = false,
  padding = 'md',
  onClick,
  style,
  enableTilt = true,
  rounded = true,
  border = true,
  enableScroll = false, // Default false
  enableAdminControls = false,
  isVisible = true,
  onEdit,
  onToggleVisibility,
  onDelete,
}: CardProps) {

  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [lightPosition, setLightPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false); // Track hover state
  const { isAdmin } = useAdmin();

  useEffect(() => {
    if (!enableTilt) return;

    const card = cardRef.current;
    if (!card) return;

    // Mouse move handler (desktop)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -1;
      const rotateY = ((x - centerX) / centerX) * 1;
      
      // Position as percentage (0-100)
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
        transition: 'transform 0.1s ease-out',
      });
      
      setLightPosition({ x: percentX, y: percentY });
    };

    const handleMouseEnter = () => {
      setIsHovered(true); // Show gradient
    };

    const handleMouseLeave = () => {
      setIsHovered(false); // Hide gradient
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.3s ease-out',
      });
      setLightPosition({ x: 50, y: 50 });
    };

    // Device orientation handler (mobile)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      
      const rotateX = (e.beta - 90) * 0.1;
      const rotateY = e.gamma * 0.1;
      
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
        transition: 'transform 0.1s ease-out',
      });
      
      const percentX = 50 + (e.gamma * 0.5);
      const percentY = 50 + ((e.beta - 90) * 0.5);
      setLightPosition({ x: percentX, y: percentY });
    };

    // Check device orientation support
    type DeviceOrientationEventiOS = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    
    if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as DeviceOrientationEventiOS).requestPermission === 'function') {
      (DeviceOrientationEvent as DeviceOrientationEventiOS).requestPermission?.()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enableTilt]);

  const baseStyles = `${rounded ? 'rounded-2xl' : 'rounded-none'} transition-all duration-300 relative overflow-hidden`;
  
  const variants = {
    ultraThin: `
      bg-white/50 dark:bg-black/30
      backdrop-blur-[20px] backdrop-saturate-[180%]
      shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
    `,
    thin: `
      bg-white/60 dark:bg-black/40
      backdrop-blur-[30px] backdrop-saturate-[180%]
      shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]
    `,
    regular: `
      bg-white/70 dark:bg-black/50
      backdrop-blur-[40px] backdrop-saturate-[180%]
      shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]
    `,
    thick: `
      bg-white/80 dark:bg-black/60
      backdrop-blur-[60px] backdrop-saturate-[200%]
      shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]
    `,
    chrome: `
      bg-white/90 dark:bg-black/70
      backdrop-blur-[80px] backdrop-saturate-[200%]
      shadow-[0_12px_40px_0_rgba(0,0,0,0.18)]
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const hoverStyles = hover
    ? `
      hover:scale-[1.02] 
      hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)]
      active:scale-[0.38]
      cursor-pointer
    `
    : '';

  return (
    <div
      ref={cardRef}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `}
      onClick={onClick}
      style={{
        WebkitBackdropFilter: `blur(${getBlurValue(variant)}) saturate(${getSaturateValue(variant)})`,
        ...tiltStyle,
        ...style,
      }}
    >
      {/* Dynamic border highlight - HANYA muncul saat hover */}
      {isHovered && (
        <>
          <div 
            className={`absolute inset-0 ${rounded ? 'rounded-2xl' : 'rounded-none'} pointer-events-none`}
            style={{
              background: `radial-gradient(
                0px circle at ${lightPosition.x}% ${lightPosition.y}%, 
                rgba(255, 255, 255, 0.95),
                rgba(255, 255, 255, 0.55) 40%,
                transparent 70%
              )`,
              mixBlendMode: 'overlay',
              transition: 'background 0.15s ease-out',
              animation: 'fadeIn 0.2s ease-out',
            }}
          />

          <div 
            className={`absolute inset-0 ${rounded ? 'rounded-2xl' : 'rounded-none'} pointer-events-none`}
            style={{
              background: `radial-gradient(
                200px circle at ${lightPosition.x}% ${lightPosition.y}%, 
                rgba(255, 255, 255, 0.35),
                transparent 80%
              )`,
              transition: 'background 0.15s ease-out',
              animation: 'fadeIn 0.2s ease-out',
            }}
          />
        </>
      )}
      
      {/* Subtle border - selalu ada */}
      {border && (
        <div 
          className={`absolute inset-0 ${rounded ? 'rounded-2xl' : 'rounded-none'} pointer-events-none border border-gray-300 dark:border-white/20`}
        />
      )}
      
      {/* Admin Controls - Only visible when logged in as admin */}
      {enableAdminControls && isAdmin && (onEdit || onDelete) && (
        <div className="absolute top-3 right-3 z-20 nodrag nopan">
          <ButtonAction
            isVisible={isVisible}
            onEdit={onEdit}
            onToggleVisibility={onToggleVisibility}
            onDelete={onDelete}
          />
        </div>
      )}
      
      {/* Content wrapper */}
      <div className={`relative z-10 ${enableScroll ? 'flex flex-col flex-1 min-h-0' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function getBlurValue(variant: string): string {
  const blurMap = {
    ultraThin: '20px',
    thin: '30px',
    regular: '40px',
    thick: '60px',
    chrome: '80px',
  };
  return blurMap[variant as keyof typeof blurMap] || '40px';
}

function getSaturateValue(variant: string): string {
  const saturateMap = {
    ultraThin: '180%',
    thin: '180%',
    regular: '180%',
    thick: '200%',
    chrome: '200%',
  };
  return saturateMap[variant as keyof typeof saturateMap] || '180%';
}

export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 md:mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`
      text-lg md:text-xl 
      font-semibold 
      tracking-tight
      text-zinc-900 dark:text-white
      ${className}
    `}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`
      text-sm md:text-base 
      text-zinc-600 dark:text-zinc-400 
      mt-1
      leading-relaxed
      ${className}
    `}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`
      mt-4 pt-4 
      border-t border-zinc-200/30 dark:border-zinc-700/30
      ${className}
    `}>
      {children}
    </div>
  );
}