import React, { useEffect, useRef, useState } from 'react';

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [useGlow, setUseGlow] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class representing floating stars and debris
    interface Particle {
      x: number;
      y: number;
      z: number; // For 3D depth
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      speedZ: number;
      angle: number;
      rotationSpeed: number;
      type: 'dot' | 'square' | 'triangle';
    }

    const particles: Particle[] = [];
    const particleCount = 70;

    const colors = [
      'rgba(6, 182, 212, 0.45)',  // Cyan
      'rgba(168, 85, 247, 0.45)', // Purple
      'rgba(236, 72, 153, 0.45)', // Pink
      'rgba(59, 130, 246, 0.45)',  // Neon Blue
    ];

    // Initialize particles in 3D-like coordinates
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * 1000 + 100, // Depth
        size: Math.random() * 8 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        speedZ: -(Math.random() * 1.5 + 0.5), // Coming toward screen
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        type: Math.random() < 0.6 ? 'dot' : Math.random() < 0.85 ? 'square' : 'triangle'
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to center-based coordinates
      mouseRef.current.targetX = e.clientX - width / 2;
      mouseRef.current.targetY = e.clientY - height / 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Grid details for standard synthwave layout
    let gridOffset = 0;

    const render = () => {
      // Clear with very dark indigo space theme
      ctx.fillStyle = '#050409';
      ctx.fillRect(0, 0, width, height);

      // Dampen mouse movements for ultra-smooth inertia
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Draw Grid on lower half of screen (3D perspective grid)
      const centerY = height * 0.65;
      const gridHeight = height * 0.35;
      
      ctx.save();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.09)'; // Very soft neon violet
      ctx.lineWidth = 1;

      // Draw horizontal perspective lines
      gridOffset = (gridOffset + 1) % 40; // Forward animation speed
      const horizon = centerY;
      
      for (let i = 0; i < 15; i++) {
        const ratio = i / 14;
        // Exponential distribution for depth crowding
        const py = horizon + Math.pow(ratio, 2.5) * gridHeight;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }

      // Draw perspective lanes from horizon node point
      const vanishingX = width / 2 - mouse.x * 0.3; // Responsive shift
      const vanishingY = horizon - 20;

      const laneCount = 20;
      for (let i = -laneCount; i <= laneCount; i++) {
        const startX = width / 2 + (i / laneCount) * width * 2;
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(startX - mouse.x * 0.5, height);
        ctx.stroke();
      }
      ctx.restore();

      // Render 3D Space Particles / Cyber Starfield
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle forward in depth
        p.z += p.speedZ;
        p.x += p.speedX;
        p.y += p.speedY;

        // Reset particle if it is past the camera or off bounds
        if (p.z <= 0) {
          p.z = 1000;
          p.x = Math.random() * width - width / 2;
          p.y = Math.random() * height - height / 2;
        }

        // Map 3D coordinates to 2D Screen space
        // Perspective divide
        const fov = 400; // focal length
        const scale = fov / p.z;
        
        // Add subtle responsive tilt based on mouse parallax offset
        const screenX = width / 2 + p.x * scale - mouse.x * (0.01 + scale * 0.001);
        const screenY = height / 2 + p.y * scale - mouse.y * (0.01 + scale * 0.001);
        const finalSize = p.size * scale;

        // Only draw if within bounds
        if (screenX > 0 && screenX < width && screenY > 0 && screenY < height && p.z < 950) {
          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(p.angle);
          p.angle += p.rotationSpeed;

          // Compute fade based on depth
          let opacity = (1.0 - p.z / 1000);
          // Clamp opacity between 0 and 0.8
          opacity = Math.max(0, Math.min(0.8, opacity));
          
          ctx.fillStyle = p.color.replace('0.45', opacity.toFixed(2));
          ctx.shadowBlur = p.z < 400 ? 12 : 3;
          ctx.shadowColor = p.color;

          if (p.type === 'dot') {
            ctx.beginPath();
            ctx.arc(0, 0, finalSize / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'square') {
            ctx.fillRect(-finalSize / 2, -finalSize / 2, finalSize, finalSize);
          } else if (p.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -finalSize / 2);
            ctx.lineTo(finalSize / 2, finalSize / 2);
            ctx.lineTo(-finalSize / 2, finalSize / 2);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // Constellation webs - lines between close dots in space center
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        const scaleI = 400 / pi.z;
        const sxi = width / 2 + pi.x * scaleI - mouse.x * (0.01 + scaleI * 0.001);
        const syi = height / 2 + pi.y * scaleI - mouse.y * (0.01 + scaleI * 0.001);

        // Limit lines to deeper nodes to prevent crazy spaghetti
        if (pi.z > 250 && pi.z < 700) {
          for (let j = i + 1; j < particles.length; j++) {
            const pj = particles[j];
            if (pj.z > 250 && pj.z < 700 && Math.abs(pi.z - pj.z) < 120) {
              const scaleJ = 400 / pj.z;
              const sxj = width / 2 + pj.x * scaleJ - mouse.x * (0.01 + scaleJ * 0.001);
              const syj = height / 2 + pj.y * scaleJ - mouse.y * (0.01 + scaleJ * 0.001);

              const dist = Math.hypot(sxi - sxj, syi - syj);
              if (dist < 110) {
                const ratio = 1 - (dist / 110);
                const avgZ = (pi.z + pj.z) / 2;
                const zFade = 1 - (avgZ / 1000);
                ctx.strokeStyle = `rgba(147, 51, 234, ${Math.min(0.2, ratio * zFade).toFixed(2)})`;
                ctx.beginPath();
                ctx.moveTo(sxi, syi);
                ctx.lineTo(sxj, syj);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Cursor Cyber Glow Target (following mouse pointer)
      const absMouseX = mouse.x + width / 2;
      const absMouseY = mouse.y + height / 2;

      // Draw subtle neon grid highlights around mouse
      ctx.save();
      const radialGlow = ctx.createRadialGradient(
        absMouseX, absMouseY, 20, 
        absMouseX, absMouseY, 220
      );
      radialGlow.addColorStop(0, 'rgba(6, 182, 212, 0.12)');  // Soft Cyan
      radialGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)'); // Soft Purple
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(absMouseX, absMouseY, 220, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      id="neon-stars-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block bg-[#040307]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
