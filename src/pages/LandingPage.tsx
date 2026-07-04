import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-sans text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-surface/15 border-b border-white/30 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-[1280px] mx-auto">
          <div className="text-[24px] leading-[32px] font-bold text-primary">WorkTrack</div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[16px] leading-[24px] text-primary font-bold border-b-2 border-primary hover:text-primary transition-colors duration-400" href="#">Features</a>
            <a className="text-[16px] leading-[24px] text-on-surface-variant hover:text-primary transition-colors duration-400" href="#">Solutions</a>
            <a className="text-[16px] leading-[24px] text-on-surface-variant hover:text-primary transition-colors duration-400" href="#">Pricing</a>
            <a className="text-[16px] leading-[24px] text-on-surface-variant hover:text-primary transition-colors duration-400" href="#">About</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-on-surface-variant font-medium hover:text-primary transition-colors">Login</button>
            <button onClick={() => navigate('/login')} className="bg-primary text-on-primary px-6 py-2 rounded-full font-medium neumorphic-raised cta-magnetic">Get Started</button>
          </div>
        </div>
      </nav>

      <section className="animated-bg relative min-h-screen pt-32 pb-24 flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="animate-blob absolute top-1/4 -left-20 w-96 h-96 bg-[#e0e7ff] rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
          <div className="animate-blob absolute top-1/2 -right-20 w-[500px] h-[500px] bg-[#e1e0ff] rounded-full mix-blend-multiply filter blur-3xl opacity-30" style={{ animationDelay: '-5s' }} />
          <div className="animate-blob absolute bottom-0 left-1/3 w-80 h-80 bg-[#dbe2fa] rounded-full mix-blend-multiply filter blur-3xl opacity-40" style={{ animationDelay: '-10s' }} />
        </div>

        <div className="container max-w-[1280px] mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="fade-in-up neumorphic-inset-badge px-4 py-1.5 rounded-full mb-8 inline-block" style={{ animationDelay: '0.1s' }}>
              <span className="text-[12px] leading-[16px] tracking-[0.1em] font-bold text-primary">FOR PEOPLE JUGGLING MULTIPLE JOBS</span>
            </div>

            <h1 className="fade-in-up text-[40px] leading-[48px] lg:text-[56px] lg:leading-[64px] tracking-[-0.02em] font-extrabold text-on-background mb-4 max-w-[700px]" style={{ animationDelay: '0.2s' }}>
              Every job. One dashboard. <span className="text-shimmer">Paid exactly right.</span>
            </h1>

            <p className="fade-in-up text-[18px] leading-[28px] text-secondary mb-8 max-w-[600px]" style={{ animationDelay: '0.3s' }}>
              Schedule your work, check in with a QR scan, and let WorkTrack calculate your earnings — down to the day.
            </p>

            <div className="fade-in-up flex flex-col sm:flex-row items-center gap-4 mb-8" style={{ animationDelay: '0.4s' }}>
              <button onClick={() => navigate('/login')} className="neumorphic-raised cta-magnetic px-8 py-4 rounded-full text-[24px] leading-[32px] font-semibold text-white min-w-[200px]">
                Get Started
              </button>
              <button className="glass-card px-8 py-4 rounded-full text-[24px] leading-[32px] font-semibold text-on-surface-variant border border-white/40 hover:bg-white/30 transition-all min-w-[200px]">
                See how it works
              </button>
            </div>

            <p className="fade-in-up text-[14px] leading-[20px] tracking-[0.01em] font-light text-outline flex items-center gap-2" style={{ animationDelay: '0.5s' }}>
              <span className="material-symbols-outlined text-[16px]">verified</span>
              No credit card needed · Set up in minutes
            </p>
          </div>

          <div className="lg:col-span-5 relative h-[500px] flex items-center justify-center">
            <div className="absolute bottom-20 w-3/4 h-8 bg-black/5 blur-2xl rounded-full" />

            <div className="animate-float-delayed absolute -top-4 -right-4 z-0">
              <div className="glass-card p-6 rounded-[32px] w-48 h-48 flex flex-col items-center justify-center gap-4 rotate-12">
                <div className="w-16 h-16 bg-primary-fixed rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl">qr_code_2</span>
                </div>
                <span className="text-[12px] leading-[16px] tracking-[0.05em] font-bold text-on-surface-variant">SCAN IN</span>
              </div>
            </div>

            <div className="animate-float relative z-10 glass-card p-8 rounded-[40px] w-full max-w-[420px] border-l-2 border-l-primary shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                  <span className="text-[14px] leading-[20px] tracking-[0.01em] font-light text-outline">Active Job</span>
                  <span className="text-[24px] leading-[32px] font-semibold text-on-background">Lead Designer</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100/50 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[12px] leading-[16px] tracking-[0.05em] font-bold text-green-700">PRESENT</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-surface-container-low/50 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-fixed rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-secondary-container">timer</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] tracking-[0.01em] font-light text-outline">Today's Hours</span>
                      <span className="text-[16px] leading-[24px] font-bold text-on-surface">6h 42m</span>
                    </div>
                  </div>
                  <span className="text-primary font-bold">+$167.50</span>
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[14px] leading-[20px] tracking-[0.01em] font-light text-outline block">Est. Monthly Total</span>
                    <span className="text-[32px] leading-[40px] tracking-[-0.01em] font-bold text-on-background">$4,820.00</span>
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white neumorphic-raised">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-float-delayed absolute -bottom-8 -left-8 z-20">
              <div className="glass-card px-4 py-3 rounded-full flex items-center gap-3 border-white/50">
                <div className="w-8 h-8 bg-tertiary-fixed rounded-full flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <span className="text-[16px] leading-[24px] font-semibold text-on-surface">Payroll verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 bg-surface border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-[1280px] mx-auto gap-4">
          <div className="text-[24px] leading-[32px] font-bold text-primary">WorkTrack</div>
          <div className="flex gap-8">
            <a className="text-[14px] leading-[20px] tracking-[0.01em] font-light text-on-surface-variant/70 hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-[14px] leading-[20px] tracking-[0.01em] font-light text-on-surface-variant/70 hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="text-[14px] leading-[20px] tracking-[0.01em] font-light text-on-surface-variant/70 hover:text-primary transition-colors" href="#">Cookie Policy</a>
            <a className="text-[14px] leading-[20px] tracking-[0.01em] font-light text-on-surface-variant/70 hover:text-primary transition-colors" href="#">Security</a>
          </div>
          <div className="text-[14px] leading-[20px] tracking-[0.01em] font-light text-on-surface-variant/70">
            &copy; 2024 WorkTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
