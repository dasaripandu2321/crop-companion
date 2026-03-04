import { useEffect, useState } from "react";

const PARTICLE_COUNT = 20;

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

const emojis = ["🌿", "🍃", "🌱", "☘️", "🌾", "💧"];

export default function ParticlesBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 14,
        duration: 12 + Math.random() * 18,
        delay: Math.random() * 15,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute opacity-0"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
