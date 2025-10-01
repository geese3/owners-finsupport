'use client';

import React, { useEffect, useState } from 'react';

interface ConfettiAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  size: number;
  delay: number;
  finalX: number;
  finalY: number;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  trigger,
  onComplete
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);

      // 폭죽 파티클 생성
      const colors = ['#FFD700', '#FF4757', '#5352ED', '#00D2D3', '#FF6B35', '#FFA502', '#FF3838', '#7D5BA6', '#26C6DA'];
      const newParticles: Particle[] = [];

      // 여러 폭발 생성
      for (let burst = 0; burst < 3; burst++) {
        const burstDelay = burst * 200;
        const particleCount = burst === 0 ? 25 : 15;

        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
          const velocity = 80 + Math.random() * 60 + (burst === 0 ? 30 : 0); // 더 큰 범위

          newParticles.push({
            id: burst * 100 + i,
            x: 50,
            y: 50,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle,
            velocity,
            size: Math.random() * 8 + 4, // 더 큰 파티클
            delay: burstDelay + Math.random() * 100,
            finalX: 50 + Math.cos(angle) * velocity * 0.8, // 더 넓은 범위
            finalY: 50 + Math.sin(angle) * velocity * 0.8
          });
        }
      }

      setParticles(newParticles);

      // 각 파티클 애니메이션 - 중심에서 사방으로 퍼져나가기
      newParticles.forEach((particle) => {
        setTimeout(() => {
          const element = document.getElementById(`particle-${particle.id}`);
          if (element) {
            // 초기 상태를 중심으로 설정
            element.style.transform = 'translate(-50%, -50%) scale(1)';
            element.style.opacity = '1';

            // 조금 후에 퍼져나가는 애니메이션 시작
            setTimeout(() => {
              element.style.transition = 'all 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              element.style.transform = `translate(-50%, -50%) translate(${(particle.finalX - particle.x) * 2}px, ${(particle.finalY - particle.y) * 2 + 50}px) scale(0.2)`;
              element.style.opacity = '0';
            }, 100);
          }
        }, particle.delay);
      });

      // 애니메이션 완료 후 정리
      setTimeout(() => {
        setParticles([]);
        setIsAnimating(false);
        onComplete?.();
      }, 3000);
    }
  }, [trigger, isAnimating, onComplete]);

  if (!isAnimating) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          id={`particle-${particle.id}`}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}AA, 0 0 ${particle.size * 6}px ${particle.color}60`,
            transform: 'translate(-50%, -50%) scale(0)',
            opacity: 0,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes scale-in {
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};