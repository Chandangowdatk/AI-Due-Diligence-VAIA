'use client';

interface BackgroundOrbsProps {
  isDark: boolean;
}

export function BackgroundOrbs({ isDark }: BackgroundOrbsProps) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-neutral-50'}`}>
      {/* Top Left - Orange/Red */}
      <div className={`absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-brand-orange/20 rounded-full blur-[120px] animate-blob transition-all duration-500 ${isDark ? 'mix-blend-screen opacity-60' : 'mix-blend-multiply opacity-30'}`} />
      
      {/* Top Right - Purple/Blue contrast */}
      <div className={`absolute top-[10%] -right-[20%] w-[60vw] h-[60vw] bg-indigo-900/30 rounded-full blur-[120px] animate-blob animation-delay-2000 transition-all duration-500 ${isDark ? 'mix-blend-screen opacity-50' : 'mix-blend-multiply opacity-20'}`} />
      
      {/* Bottom - Subtle Warmth */}
      <div className={`absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] bg-brand-peach/10 rounded-full blur-[100px] animate-blob animation-delay-4000 transition-all duration-500 ${isDark ? 'mix-blend-screen opacity-40' : 'mix-blend-multiply opacity-40'}`} />
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} 
      />
    </div>
  );
}
