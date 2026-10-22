import React, { useEffect, useRef, useCallback } from 'react';
import { Wish, LANTERN_PALETTES } from '../types.ts';
import { playTapSound } from '../utils/audio.ts';

interface SkyCanvasProps {
  wishes: Wish[];
  onSelectWish: (wish: Wish) => void;
  onSkyInteraction?: () => void;
  newlyLaunchedWish?: Wish | null;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  direction: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
  gravity?: number;
  friction?: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  width: number;
  tailRgb: string;
}

const FESTIVAL_FIREWORK_COLORS = [
  '#fbbf24', // Gold
  '#f59e0b', // Amber
  '#f43f5e', // Ruby Red
  '#10b981', // Emerald Green
  '#a855f7', // Violet
  '#ec4899', // Lotus Pink
  '#38bdf8', // Star Sapphire Cyan
  '#fef08a', // Moon White-Gold
];

class SkyLantern {
  wish: Wish;
  x: number;
  y: number;
  depth: number;
  w: number;
  h: number;
  vy: number;
  vx: number;
  angle: number;
  swaySpeed: number;
  swayOffset: number;
  isNew: boolean;
  launchSparkleCooldown: number;

  constructor(wishData: Wish, screenWidth: number, screenHeight: number, x: number | null = null, y: number | null = null, isNew = false) {
    this.wish = wishData;
    this.x = x !== null ? x : Math.random() * (screenWidth - 80) + 40;
    this.y = y !== null ? y : (isNew ? screenHeight + 20 : Math.random() * (screenHeight * 0.75) + 50);

    this.depth = isNew ? 1.0 : (Math.random() * 0.65 + 0.45);
    this.w = 36 * this.depth;
    this.h = 46 * this.depth;

    this.vy = -(Math.random() * 0.4 + 0.35) * (this.depth * 1.1);
    this.vx = (Math.random() - 0.5) * 0.25;
    this.angle = 0;
    this.swaySpeed = Math.random() * 0.025 + 0.015;
    this.swayOffset = Math.random() * Math.PI * 2;

    this.isNew = isNew;
    this.launchSparkleCooldown = 0;
  }

  update(screenWidth: number, screenHeight: number, wishesPool: Wish[], addEmber: (x: number, y: number, color: string) => void) {
    this.y += this.vy;
    this.angle += this.swaySpeed;
    this.x += Math.sin(this.angle + this.swayOffset) * 0.45 + this.vx;

    const palette = LANTERN_PALETTES[this.wish.color] || LANTERN_PALETTES.gold;

    // Embers for newly launched lanterns
    if (this.isNew && this.y > screenHeight * 0.3) {
      this.launchSparkleCooldown++;
      if (this.launchSparkleCooldown % 5 === 0) {
        addEmber(this.x, this.y + this.h, palette.mid);
      }
    }

    // Wrap around from top
    if (this.y < -this.h - 15) {
      this.y = screenHeight + 10;
      this.x = Math.random() * (screenWidth - 80) + 40;
      this.isNew = false;
      this.vy = -(Math.random() * 0.4 + 0.35) * (this.depth * 1.1);

      if (wishesPool.length > 0) {
        this.wish = wishesPool[Math.floor(Math.random() * wishesPool.length)];
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const palette = LANTERN_PALETTES[this.wish.color] || LANTERN_PALETTES.gold;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Subtle sway tilt
    const tilt = Math.sin(this.angle + this.swayOffset) * 0.08;
    ctx.rotate(tilt);

    // 1. Soft Warm Radial Glow aura
    const glowRadius = this.w * 2.3;
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glowGrad.addColorStop(0, palette.glow);
    glowGrad.addColorStop(0.5, palette.glow.replace(/[\d.]+\)$/, '0.15)'));
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Myanmar Traditional Hexagonal/Round Paper Lantern Body
    const halfW = this.w / 2;
    const halfH = this.h / 2;

    const bodyGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    bodyGrad.addColorStop(0, palette.edge);
    bodyGrad.addColorStop(0.35, palette.mid);
    bodyGrad.addColorStop(0.85, palette.core);
    bodyGrad.addColorStop(1, '#ffffff');

    ctx.beginPath();
    // Dome top
    ctx.moveTo(-halfW * 0.65, -halfH);
    ctx.quadraticCurveTo(0, -halfH * 1.25, halfW * 0.65, -halfH);
    // Right bulged body
    ctx.bezierCurveTo(halfW * 1.18, -halfH * 0.3, halfW * 1.12, halfH * 0.7, halfW * 0.6, halfH);
    // Base bottom rim
    ctx.lineTo(-halfW * 0.6, halfH);
    // Left bulged body
    ctx.bezierCurveTo(-halfW * 1.12, halfH * 0.7, -halfW * 1.18, -halfH * 0.3, -halfW * 0.65, -halfH);
    ctx.closePath();

    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = palette.mid;
    ctx.shadowBlur = 14 * this.depth;
    ctx.fill();

    // Bamboo rib wire rings
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1 * this.depth;

    [-halfH * 0.45, 0, halfH * 0.45].forEach((yPos) => {
      ctx.beginPath();
      ctx.ellipse(0, yPos, halfW * 0.8, 2.5 * this.depth, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Central Vertical crease
    ctx.beginPath();
    ctx.moveTo(0, -halfH * 1.1);
    ctx.lineTo(0, halfH);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.stroke();

    // 3. Wooden base frame & candle flame
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-halfW * 0.65, halfH, this.w * 0.65, 3.5 * this.depth);

    // Candle flame inside
    const flameY = halfH - 2;
    const flameSize = 4.5 * this.depth;
    const flameGlow = Math.sin(Date.now() * 0.01 + this.x) * 1.2;

    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.ellipse(0, flameY, flameSize + flameGlow * 0.5, flameSize * 1.5 + flameGlow, 0, 0, Math.PI * 2);
    ctx.fill();

    // Author badge if closer
    if (this.depth > 0.72) {
      ctx.fillStyle = 'rgba(254, 243, 199, 0.9)';
      ctx.font = `${Math.max(10, Math.floor(11 * this.depth))}px Padauk, sans-serif`;
      ctx.textAlign = 'center';
      const label = this.wish.name || 'မေတ္တာမီးပုံး';
      ctx.fillText(label.slice(0, 10), 0, halfH + 15 * this.depth);
    }

    ctx.restore();
  }

  contains(px: number, py: number): boolean {
    const hitRadius = Math.max(this.w, 34);
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= hitRadius * hitRadius;
  }
}

export const SkyCanvas: React.FC<SkyCanvasProps> = ({
  wishes,
  onSelectWish,
  onSkyInteraction,
  newlyLaunchedWish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lanternsRef = useRef<SkyLantern[]>([]);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nextShootingStarTimeRef = useRef<number>(Date.now() + 2500);
  const animationFrameIdRef = useRef<number | null>(null);
  const tapCountRef = useRef(0);
  const launchedWishIdsRef = useRef<Set<string>>(new Set());

  const wishesRef = useRef(wishes);
  wishesRef.current = wishes;

  /**
   * Spawns a shooting star that streaks across the upper night sky at a graceful angle.
   */
  const spawnShootingStar = useCallback((screenWidth: number, screenHeight: number) => {
    const angle = Math.PI / 6 + (Math.random() - 0.5) * 0.3; // ~25 to 40 degrees downward slope
    const isFromLeft = Math.random() > 0.25;
    const startX = isFromLeft
      ? Math.random() * (screenWidth * 0.65)
      : screenWidth * 0.35 + Math.random() * (screenWidth * 0.65);
    const startY = Math.random() * (screenHeight * 0.32);

    const speed = Math.random() * 10 + 13; // Fast celestial streak
    const length = Math.random() * 90 + 130; // 130 - 220px radiant tail

    const tailOptions = [
      '254, 240, 138', // Warm golden glow
      '251, 191, 36',  // Amber
      '186, 230, 253', // Celestial soft blue
      '244, 244, 245', // Pure starlight white
    ];
    const tailRgb = tailOptions[Math.floor(Math.random() * tailOptions.length)];

    const ss: ShootingStar = {
      x: startX,
      y: startY,
      length,
      speed,
      angle: isFromLeft ? angle : Math.PI - angle,
      vx: (isFromLeft ? 1 : -1) * Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 0.1,
      maxAlpha: Math.random() * 0.35 + 0.65,
      decay: Math.random() * 0.012 + 0.014,
      width: Math.random() * 0.9 + 1.6,
      tailRgb,
    };

    shootingStarsRef.current.push(ss);
  }, []);

  const addEmber = useCallback((x: number, y: number, color: string) => {
    particlesRef.current.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y + Math.random() * 5,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.6 + 1.2,
      radius: Math.random() * 2 + 1,
      alpha: 1,
      decay: Math.random() * 0.02 + 0.02,
      color: color || '#fbbf24',
      gravity: 0.02,
      friction: 0.98,
    });
  }, []);

  /**
   * Triggers a vibrant fireworks burst animation using the existing Canvas particle structure.
   * If `force` is false, it occasionally triggers based on user tap intervals and random probability.
   */
  const triggerFireworksBurst = useCallback(
    (originX: number, originY: number, customColor?: string, force = false) => {
      // If not forced, occasionally trigger (approx 60% probability on taps, or every 2-3 taps)
      if (!force) {
        tapCountRef.current += 1;
        const isEveryNthTap = tapCountRef.current % 2 === 0;
        const isRandomChance = Math.random() < 0.55;
        if (!isEveryNthTap && !isRandomChance) {
          return;
        }
      }

      // Select firework burst color palette
      const primaryColor =
        customColor ||
        FESTIVAL_FIREWORK_COLORS[Math.floor(Math.random() * FESTIVAL_FIREWORK_COLORS.length)];
      const secondaryColor =
        FESTIVAL_FIREWORK_COLORS[Math.floor(Math.random() * FESTIVAL_FIREWORK_COLORS.length)];

      const particleCount = force ? 48 : 36;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.35;
        const speed = Math.random() * 4.2 + 1.6;
        const particleColor = i % 3 === 0 ? secondaryColor : primaryColor;

        particlesRef.current.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.8 + 1.2,
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012, // Long trailing glowing decay
          color: particleColor,
          gravity: 0.05, // Gentle downward curve
          friction: 0.97, // Air resistance drag for realistic explosion
        });
      }

      // Add central luminous sparkle core
      for (let j = 0; j < 8; j++) {
        particlesRef.current.push({
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 3 + 2,
          alpha: 1,
          decay: 0.04,
          color: '#ffffff',
          gravity: 0.01,
          friction: 0.95,
        });
      }
    },
    []
  );

  // When a newly launched wish is received, trigger fireworks burst and animate lantern
  useEffect(() => {
    if (!newlyLaunchedWish || !canvasRef.current) return;

    // Prevent duplicate spawning of the exact same wish
    if (launchedWishIdsRef.current.has(newlyLaunchedWish.id)) {
      return;
    }
    launchedWishIdsRef.current.add(newlyLaunchedWish.id);

    // Also check if lanternsRef already has an active newly launched lantern with this wish id
    if (lanternsRef.current.some((l) => l.wish.id === newlyLaunchedWish.id && l.isNew)) {
      return;
    }

    const canvas = canvasRef.current;
    const spawnX = canvas.width * 0.5 + (Math.random() - 0.5) * (canvas.width * 0.3);
    const spawnY = canvas.height - 10;
    const palette = LANTERN_PALETTES[newlyLaunchedWish.color] || LANTERN_PALETTES.gold;

    const lantern = new SkyLantern(newlyLaunchedWish, canvas.width, canvas.height, spawnX, spawnY, true);
    lantern.vy = -1.35; // Ascent boost
    lanternsRef.current.push(lantern);

    // 1. Initial firework burst at launch position
    triggerFireworksBurst(spawnX, canvas.height - 60, palette.mid, true);

    // 2. Cascading secondary festive fireworks burst higher up in the sky
    const timer = setTimeout(() => {
      triggerFireworksBurst(
        spawnX + (Math.random() - 0.5) * 100,
        canvas.height * 0.45,
        palette.core,
        true
      );
    }, 450);

    return () => clearTimeout(timer);
  }, [newlyLaunchedWish, triggerFireworksBurst]);

  // Canvas resize and star creation
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate stars
    const starCount = Math.floor((canvas.width * canvas.height) / 3600);
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.8),
        radius: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    starsRef.current = newStars;

    // Seed lanterns if empty
    if (lanternsRef.current.length === 0 && wishesRef.current.length > 0) {
      const targetCount = Math.min(26, Math.max(14, Math.floor(canvas.width / 45)));
      const pool = wishesRef.current;
      const initialLanterns: SkyLantern[] = [];

      for (let i = 0; i < targetCount; i++) {
        const wish = pool[i % pool.length];
        initialLanterns.push(new SkyLantern(wish, canvas.width, canvas.height));
      }
      lanternsRef.current = initialLanterns;
    }
  }, []);

  // Update existing lanterns wish pool if new wishes arrive
  useEffect(() => {
    if (lanternsRef.current.length === 0 && wishes.length > 0 && canvasRef.current) {
      handleResize();
    }
  }, [wishes, handleResize]);

  // Main render loop
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Twinkling Stars
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.alpha += s.speed * s.direction;
        if (s.alpha > 0.95) {
          s.alpha = 0.95;
          s.direction = -1;
        } else if (s.alpha < 0.15) {
          s.alpha = 0.15;
          s.direction = 1;
        }

        ctx.fillStyle = `rgba(254, 240, 138, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Spawn & Draw Shooting Stars (streaking occasionally across the night sky)
      const nowTime = Date.now();
      if (nowTime >= nextShootingStarTimeRef.current) {
        spawnShootingStar(width, height);
        // Occasionally spawn a rapid pair of shooting stars
        if (Math.random() < 0.25) {
          setTimeout(() => {
            spawnShootingStar(width, height);
          }, 380);
        }
        // Next shooting star at random intervals (3.5s to 8s)
        nextShootingStarTimeRef.current = nowTime + Math.random() * 4500 + 3500;
      }

      const shootingStars = shootingStarsRef.current;
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;

        // Fade in rapidly, then decay
        if (ss.alpha < ss.maxAlpha) {
          ss.alpha = Math.min(ss.maxAlpha, ss.alpha + 0.18);
        } else {
          ss.alpha -= ss.decay;
        }

        // Remove if off-screen or faded
        if (ss.alpha <= 0 || ss.x < -150 || ss.x > width + 150 || ss.y > height * 0.8) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = ss.x - (ss.vx / ss.speed) * ss.length;
        const tailY = ss.y - (ss.vy / ss.speed) * ss.length;

        ctx.save();
        // Tail gradient
        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `rgba(${ss.tailRgb}, 0)`);
        grad.addColorStop(0.65, `rgba(${ss.tailRgb}, ${ss.alpha * 0.45})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = ss.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        // Luminous glowing meteor head
        ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
        ctx.shadowColor = `rgba(${ss.tailRgb}, 0.9)`;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.width * 1.25, 0, Math.PI * 2);
        ctx.fill();

        // Stardust sparkle trail behind the head
        if (Math.random() < 0.35) {
          particlesRef.current.push({
            x: ss.x - (ss.vx / ss.speed) * (Math.random() * 35),
            y: ss.y - (ss.vy / ss.speed) * (Math.random() * 35),
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4 + 0.25,
            radius: Math.random() * 1.5 + 0.5,
            alpha: ss.alpha * 0.8,
            decay: 0.035,
            color: `rgba(${ss.tailRgb}, 0.9)`,
            gravity: 0.015,
            friction: 0.96,
          });
        }

        ctx.restore();
      }

      // 3. Draw & Update Embers / Fireworks Particles with physics (drag & gravity)
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.gravity) {
          p.vy += p.gravity;
        }
        if (p.friction) {
          p.vx *= p.friction;
          p.vy *= p.friction;
        }

        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius > 2 ? 8 : 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Sort lanterns by depth (smaller background lanterns rendered first)
      const lanterns = lanternsRef.current;
      lanterns.sort((a, b) => a.depth - b.depth);

      // 4. Update and draw lanterns
      for (let i = 0; i < lanterns.length; i++) {
        const lantern = lanterns[i];
        lantern.update(width, height, wishesRef.current, addEmber);
        lantern.draw(ctx);
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, addEmber]);

  // Click & Touch hit-testing to inspect lantern and trigger fireworks burst
  const handleClick = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    onSkyInteraction?.();

    const lanterns = lanternsRef.current;
    let hitLantern = false;

    // Inspect highest depth (foreground) first
    for (let i = lanterns.length - 1; i >= 0; i--) {
      const lantern = lanterns[i];
      if (lantern.contains(clickX, clickY)) {
        hitLantern = true;
        playTapSound();
        onSelectWish(lantern.wish);

        // Occasionally trigger a spark/fireworks burst around the tapped lantern
        const palette = LANTERN_PALETTES[lantern.wish.color] || LANTERN_PALETTES.gold;
        triggerFireworksBurst(lantern.x, lantern.y, palette.mid, false);
        return;
      }
    }

    // When users tap anywhere on the open night sky, occasionally trigger a fireworks burst
    if (!hitLantern) {
      triggerFireworksBurst(clickX, clickY, undefined, false);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-10 cursor-pointer pointer-events-auto"
      onClick={(e) => handleClick(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          handleClick(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
    />
  );
};
