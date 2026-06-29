import { useState, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTerminal } from '@fortawesome/free-solid-svg-icons';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { name }
          }
        });
        if (error) throw error;
        setMessage("REGISTRATION SUCCESSFUL. PLEASE VERIFY EMAIL IF REQUIRED.");
      }
    } catch (error) {
      setMessage(`ERROR: ${error.message || error.error_description}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate randomized warp stars for background
  const warpStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${Math.random() * 2 + 2}s`
      });
    }
    return stars;
  }, []);

  return (
    <div className="relative h-screen w-screen flex flex-col justify-center items-center bg-[#000005] text-cyan-400 font-sans overflow-hidden">
      
      {/* Warp Speed Starfield Background */}
      <div className="absolute inset-0 z-0 overflow-hidden preserve-3d">
         {warpStars.map(star => (
           <div 
             key={star.id} 
             className="warp-star"
             style={{
               top: star.top,
               left: star.left,
               animationDelay: star.delay,
               animationDuration: star.duration
             }}
           ></div>
         ))}
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#000005_95%)] z-0 pointer-events-none"></div>

      {/* Main Layout Wrapper */}
      <div className="relative z-10 w-full max-w-md p-6 md:p-10 mx-4 bg-[#050510]/40 backdrop-blur-3xl border border-cyan-500/20 rounded-[2rem] shadow-[0_30px_80px_rgba(0,255,255,0.1)] preserve-3d">
        
        {/* Header with Miniature Hologram */}
        <div className="text-center mb-10 relative flex flex-col items-center">
          
          {/* Miniature 3D Holographic Globe */}
          <div className="relative flex justify-center items-center mb-6 w-20 h-20 preserve-3d">
            <div className="absolute w-20 h-20 rounded-full border border-cyan-400/50 shadow-[0_0_10px_rgba(0,255,255,0.4)] globe-ring-1"></div>
            <div className="absolute w-20 h-20 rounded-full border border-fuchsia-400/40 shadow-[0_0_10px_rgba(217,70,239,0.3)] globe-ring-2"></div>
            <div className="absolute w-20 h-20 rounded-full border border-cyan-300/30 shadow-[0_0_8px_rgba(0,255,255,0.2)] globe-ring-3"></div>
            <div className="absolute w-4 h-4 bg-white rounded-full blur-[1px] shadow-[0_0_20px_#fff,0_0_40px_#0ff] animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            COBRA
          </h1>
          <p className="text-[9px] tracking-[0.3em] text-cyan-400/80 mt-2 uppercase font-mono">
            {isLogin ? 'SECURE AUTHENTICATION' : 'OPERATOR REGISTRATION'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2 relative group">
              <label className="text-[10px] font-mono tracking-widest text-cyan-400/70 uppercase block pl-1">Operator_Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#000005]/80 border border-cyan-900/50 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:shadow-[inset_0_0_15px_rgba(0,255,255,0.1)] transition-all font-mono text-sm rounded-lg placeholder-cyan-900/40"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2 relative group">
            <label className="text-[10px] font-mono tracking-widest text-cyan-400/70 uppercase block pl-1">User_Identifier</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#000005]/80 border border-cyan-900/50 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:shadow-[inset_0_0_15px_rgba(0,255,255,0.1)] transition-all font-mono text-sm rounded-lg placeholder-cyan-900/40"
              placeholder="operator@nexus.net"
              required
            />
          </div>

          <div className="space-y-2 relative group">
            <label className="text-[10px] font-mono tracking-widest text-cyan-400/70 uppercase block pl-1">Security_Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#000005]/80 border border-cyan-900/50 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:shadow-[inset_0_0_15px_rgba(0,255,255,0.1)] transition-all font-mono text-sm rounded-lg placeholder-cyan-900/40"
              placeholder="••••••••"
              required
            />
          </div>

          {message && (
            <div className={`p-4 text-xs font-mono tracking-wider border rounded-lg backdrop-blur-sm animate-slide-up ${message.startsWith('ERROR') ? 'bg-red-950/40 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(255,0,0,0.2)]' : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.2)]'}`}>
              {message}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full mt-8 py-4 rounded-full bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 font-mono font-bold tracking-[0.2em] hover:bg-cyan-500/20 hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">{loading ? 'PROCESSING...' : (isLogin ? 'EXECUTE LOGIN' : 'REGISTER USER')}</span>
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center pt-6 border-t border-cyan-900/30">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
            className="text-[10px] font-mono text-cyan-600 hover:text-cyan-300 tracking-widest transition-colors hover:shadow-[0_0_10px_rgba(0,255,255,0.5)]"
          >
            {isLogin ? '> INITIATE REGISTRATION' : '> RETURN TO LOGIN'}
          </button>
        </div>
      </div>
    </div>
  );
}
