import React, { useEffect, useRef } from 'react';

export const StarfieldCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      createStars();
    };

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleResize = () => {
      setupCanvas();
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const starCount = Math.floor((width * height) / 5000);
    let stars = [];
    let shootingStars = [];

    function createStars() {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          originX: Math.random() * width,
          originY: Math.random() * height,
          radius: Math.random() * 1.4 + 0.4,
          alpha: Math.random() * 0.5 + 0.45,
          speed: Math.random() * 0.015 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          depth: Math.random() * 15 + 5
        });
      }
    }

    function createShootingStar() {
      if (Math.random() < 0.005 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.85,
          y: Math.random() * height * 0.4,
          len: Math.random() * 110 + 70,
          speed: Math.random() * 14 + 12,
          angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
          alpha: 1,
          decay: 0.018
        });
      }
    }

    setupCanvas();

    let animationId;
    let time = 0;

    function render() {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const targetOffsetX = (mouseX - width / 2) * 0.02;
      const targetOffsetY = (mouseY - height / 2) * 0.02;

      // 1. Rich Ethereal Cosmic Aurora & Sunset Nebula Fields (Direct Glass Illumination)
      const nebulas = [
        {
          x: width * 0.30 + Math.sin(time * 0.35) * (width * 0.08) - targetOffsetX * 0.6,
          y: height * 0.22 + Math.cos(time * 0.25) * (height * 0.08) - targetOffsetY * 0.6,
          r: Math.max(width, height) * 0.52 * (1 + Math.sin(time * 0.2) * 0.06),
          c0: 'rgba(13, 148, 136, 0.24)', // Emerald Cyan Aurora Forest
          c1: 'rgba(20, 184, 166, 0.12)'
        },
        {
          x: width * 0.72 + Math.cos(time * 0.3) * (width * 0.07) - targetOffsetX * 0.5,
          y: height * 0.35 + Math.sin(time * 0.35) * (height * 0.07) - targetOffsetY * 0.5,
          r: Math.max(width, height) * 0.48 * (1 + Math.cos(time * 0.25) * 0.06),
          c0: 'rgba(99, 102, 241, 0.22)', // Indigo Violet Cosmic Cloud
          c1: 'rgba(139, 92, 246, 0.08)'
        },
        {
          x: width * 0.50 + Math.sin(time * 0.25 + 2) * (width * 0.06) - targetOffsetX * 0.4,
          y: height * 0.60 + Math.cos(time * 0.3 + 1) * (height * 0.06) - targetOffsetY * 0.4,
          r: Math.max(width, height) * 0.58 * (1 + Math.sin(time * 0.18) * 0.07),
          c0: 'rgba(245, 158, 11, 0.30)', // Golden Sunset Amber Glow (Direct Glass Glow)
          c1: 'rgba(251, 191, 36, 0.14)'
        },
        {
          x: width * 0.25 + Math.cos(time * 0.2) * (width * 0.05) - targetOffsetX * 0.3,
          y: height * 0.85 + Math.sin(time * 0.25) * (height * 0.05) - targetOffsetY * 0.3,
          r: Math.max(width, height) * 0.46 * (1 + Math.cos(time * 0.15) * 0.05),
          c0: 'rgba(217, 119, 6, 0.22)', // Warm Amber Earth Twilight
          c1: 'rgba(245, 158, 11, 0.06)'
        }
      ];

      nebulas.forEach(n => {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, n.c0);
        grad.addColorStop(0.5, n.c1);
        grad.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // 2. Stars
      stars.forEach(star => {
        const twinkle = Math.sin(time * star.speed * 50 + star.twinkleOffset) * 0.35 + 0.65;
        const currentAlpha = Math.max(0.25, Math.min(1, star.alpha * twinkle));
        
        const renderX = star.originX - targetOffsetX * (star.depth / 10);
        const renderY = star.originY - targetOffsetY * (star.depth / 10);

        ctx.fillStyle = `rgba(250, 245, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Shooting Stars
      createShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        ctx.strokeStyle = `rgba(245, 197, 66, ${s.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - Math.cos(s.angle) * s.len,
          s.y - Math.sin(s.angle) * s.len
        );
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= s.decay;

        if (s.alpha <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#030712]" />
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />
    </>
  );
};
