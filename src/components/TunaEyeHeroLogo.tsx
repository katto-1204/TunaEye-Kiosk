import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

interface TunaEyeHeroLogoProps {
  className?: string;
}

export const TunaEyeHeroLogo: React.FC<TunaEyeHeroLogoProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position state for 3D Parallax Tilt
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });

  // Scroll animations linked to window scroll
  const { scrollY } = useScroll();
  
  // Smooth scroll transformations
  const rawScrollRotate = useTransform(scrollY, [0, 800], [0, 45]);
  const rawScrollScale = useTransform(scrollY, [0, 600], [1, 0.88]);
  const rawScrollY = useTransform(scrollY, [0, 600], [0, 50]);
  
  const scrollRotate = useSpring(rawScrollRotate, { stiffness: 100, damping: 20 });
  const scrollScale = useSpring(rawScrollScale, { stiffness: 100, damping: 20 });
  const scrollYOffset = useSpring(rawScrollY, { stiffness: 100, damping: 20 });

  // Mouse tilt spring animation values
  const tiltX = useSpring(mousePos.x * 22, { stiffness: 150, damping: 15 });
  const tiltY = useSpring(-mousePos.y * 22, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize coordinates -1 to +1
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePos({ x, y, targetX: x, targetY: y, isHovered: true });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });
  };

  return (
    <motion.div
      ref={containerRef}
      className={`tunaeye-hero-logo-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1200,
        scale: scrollScale,
        y: scrollYOffset,
      }}
    >
      <motion.div
        className="tunaeye-hero-logo-stage"
        style={{
          rotateX: tiltY,
          rotateY: tiltX,
          rotateZ: scrollRotate,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: mousePos.isHovered ? 1.04 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        {/* Background Ambient Glow Layer */}
        <motion.div 
          className="tunaeye-logo-ambient-glow"
          animate={{
            opacity: mousePos.isHovered ? 0.85 : 0.5,
            scale: mousePos.isHovered ? 1.15 : 1,
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Deep Parallax Back Grid & Orbit Rings */}
        <motion.div 
          className="tunaeye-logo-parallax-back"
          style={{
            transform: `translateZ(-60px) translateX(${mousePos.x * -18}px) translateY(${mousePos.y * -18}px)`,
          }}
        >
          <svg viewBox="0 0 500 500" className="tunaeye-back-svg">
            <circle cx="250" cy="250" r="230" className="orbit-outer-ring" />
            <circle cx="250" cy="250" r="190" className="orbit-dashed-ring" />
            <circle cx="250" cy="250" r="140" className="orbit-inner-ring" />
            {/* Compass Ticks */}
            <line x1="250" y1="10" x2="250" y2="25" className="orbit-tick" />
            <line x1="250" y1="475" x2="250" y2="490" className="orbit-tick" />
            <line x1="10" y1="250" x2="25" y2="250" className="orbit-tick" />
            <line x1="475" y1="250" x2="490" y2="250" className="orbit-tick" />
          </svg>
        </motion.div>

        {/* Main Hero Image Layer (/assets/tunaEyeLoadingScreen.png) */}
        <motion.div 
          className="tunaeye-logo-main-layer"
          style={{
            transform: `translateZ(40px) translateX(${mousePos.x * 14}px) translateY(${mousePos.y * 14}px)`,
          }}
        >
          <img 
            src="/assets/tunaEyeLoadingScreen.png" 
            alt="TunaEye grading station interface" 
            className="tunaeye-hero-image"
          />

          {/* SVG Animated Orbit & AI Target Overlay */}
          <svg
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="tunaeye-hero-svg-overlay"
          >
            <defs>
              <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Pulsing AI Target Crosshair */}
            <g className="tunaeye-ai-sight">
              <circle cx="250" cy="250" r="215" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 12" opacity="0.35" className="orbit-dashed-ring" />
              <circle cx="250" cy="250" r="160" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
              <circle cx="250" cy="250" r="6" fill="#38bdf8" opacity="0.8" className="pulse-center-dot" />
            </g>
          </svg>
        </motion.div>

        {/* Foreground Floating Particle Dots Layer for 3D Depth */}
        <motion.div 
          className="tunaeye-logo-parallax-front"
          style={{
            transform: `translateZ(90px) translateX(${mousePos.x * 24}px) translateY(${mousePos.y * 24}px)`,
          }}
        >
          <div className="particle-dot particle-dot--1" />
          <div className="particle-dot particle-dot--2" />
          <div className="particle-dot particle-dot--3" />
          <div className="particle-dot particle-dot--4" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
