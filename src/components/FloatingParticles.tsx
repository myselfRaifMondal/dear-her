import { useMemo } from "react";

type FloatingParticlesProps = {
  reducedMotion: boolean;
};

type Particle = {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

export function FloatingParticles({ reducedMotion }: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 3 + Math.random() * 8,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 18,
        opacity: 0.16 + Math.random() * 0.32,
      })),
    [],
  );

  if (reducedMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-cream-100 blur-[1px] motion-safe:animate-particle-rise"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
