'use client';

import React, { useEffect, useState, useMemo, useRef, memo } from 'react';
import { 
  getSpritePosition, 
  getSpriteUrl, 
  getIconSize,
  hasIcon,
  type SpriteType,
  type IconName 
} from '@/constants/spriteConfig';
import { preloadSpriteSheets, isSpriteLoaded } from '@/utils/spriteUtils';

export interface SpriteIconProps {
  type: SpriteType;
  name: IconName;
  size?: number;
  className?: string;
  alt?: string;
  onClick?: () => void;
  testId?: string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  retina?: boolean;
  lazyLoad?: boolean;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

/**
 * Optimized sprite icon component
 */
export const SpriteIcon = memo(function SpriteIcon({
  type,
  name,
  size,
  className = '',
  alt,
  onClick,
  testId,
  fallback,
  showLoading = false,
  retina = true,
  lazyLoad = false,
  responsive,
}: SpriteIconProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const iconRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Validate icon existence
  const isValidIcon = useMemo(() => {
    try {
      return hasIcon(type, name);
    } catch {
      return false;
    }
  }, [type, name]);

  // Calculate sprite styles
  const spriteStyles = useMemo(() => {
    if (!isValidIcon) return {};

    try {
      const position = getSpritePosition(type, name);
      const url = getSpriteUrl(type);
      const defaultSize = getIconSize(type);
      const iconSize = size || defaultSize.width;

      const styles: React.CSSProperties = {
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        backgroundImage: `url(${url})`,
        backgroundPosition: `${position.x}px ${position.y}px`,
        backgroundRepeat: 'no-repeat',
      };

      // Add retina support
      if (retina) {
        const scale = iconSize / defaultSize.width;
        const totalColumns = 10; // From config
        const totalRows = Math.ceil(20 / totalColumns); // Approximate
        const sheetWidth = totalColumns * defaultSize.width;
        const sheetHeight = totalRows * defaultSize.height;
        
        styles.backgroundSize = `${sheetWidth * scale}px ${sheetHeight * scale}px`;
      }

      return styles;
    } catch (err) {
      console.error(`Error calculating sprite position for ${type}/${name}:`, err);
      setError(true);
      return {};
    }
  }, [type, name, size, isValidIcon, retina]);

  // Preload sprite sheet
  useEffect(() => {
    if (!isValidIcon || !isVisible) return;

    const loadSprite = async () => {
      try {
        if (!isSpriteLoaded(type)) {
          const results = await preloadSpriteSheets([type]);
          if (results[0]) {
            setIsLoaded(true);
          } else {
            setError(true);
          }
        } else {
          setIsLoaded(true);
        }
      } catch (err) {
        console.error(`Failed to load sprite sheet ${type}:`, err);
        setError(true);
      }
    };

    loadSprite();
  }, [type, isValidIcon, isVisible]);

  // Setup lazy loading
  useEffect(() => {
    if (!lazyLoad || !iconRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observerRef.current.observe(iconRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazyLoad]);

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Render error or fallback
  if (error || !isValidIcon) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  // Build class names
  const classNames = [
    'sprite-icon',
    `sprite-icon--${type}`,
    className,
  ];

  if (showLoading && !isLoaded) {
    classNames.push('sprite-icon--loading');
  }

  if (retina) {
    classNames.push('sprite-icon--retina');
  }

  if (responsive) {
    classNames.push('sprite-icon--responsive');
  }

  if (onClick) {
    classNames.push('sprite-icon--clickable');
  }

  // Build responsive data attributes
  const dataAttributes: Record<string, string> = {};
  if (responsive) {
    if (responsive.sm) dataAttributes['data-size-sm'] = String(responsive.sm);
    if (responsive.md) dataAttributes['data-size-md'] = String(responsive.md);
    if (responsive.lg) dataAttributes['data-size-lg'] = String(responsive.lg);
  }

  return (
    <div
      ref={iconRef}
      className={classNames.join(' ')}
      style={spriteStyles}
      role="img"
      aria-label={alt}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      data-testid={testId}
      {...dataAttributes}
    />
  );
});

/**
 * Sprite icon with automatic type detection based on context
 */
export const AutoSpriteIcon = memo(function AutoSpriteIcon({
  name,
  context,
  ...props
}: Omit<SpriteIconProps, 'type'> & { 
  context?: 'card' | 'category' | 'ui';
}) {
  // Auto-detect sprite type based on icon name or context
  const type = useMemo((): SpriteType => {
    if (context === 'card') return 'cards';
    if (context === 'category') return 'categories';
    if (context === 'ui') return 'ui';

    // Try to detect based on name patterns
    if (name.includes('CARD') || name.includes('MEAL') || name.includes('NURI')) {
      return 'cards';
    }
    if (['restaurant', 'cafe', 'mart', 'pharmacy'].includes(name)) {
      return 'categories';
    }
    
    return 'ui';
  }, [name, context]);

  return <SpriteIcon type={type} name={name} {...props} />;
});

/**
 * Preload all sprite sheets on app initialization
 */
export function preloadAllSprites(): Promise<boolean[]> {
  return preloadSpriteSheets(['cards', 'categories', 'ui']);
}