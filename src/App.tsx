import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { db } from './lib/firebase';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { 
  Lock, 
  Users, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  ChevronRight,
  Flame
} from 'lucide-react';
import ActiveSession from './ActiveSession';

// --- Skeuomorphic Components ---

const SkeuoCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`skeuo-card p-8 ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all' : ''} ${className}`}
  >
    {children}
  </div>
);

const SkeuoBadge = ({ text = "Private Response" }: { text?: string }) => (
  <div className="skeuo-inset flex items-center gap-2 w-fit mb-4 px-4 py-2 font-bold text-xs uppercase tracking-widest text-zinc-500 rounded-full">
    <Lock className="w-3 h-3 text-pink-500" />
    <span>{text}</span>
  </div>
);

// --- Screen Components ---

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-xl w-full z-10"
      >
        <div className="mb-16 text-center">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-24 h-24 mx-auto mb-6 skeuo-card flex items-center justify-center rounded-full"
          >
            <Flame className="w-10 h-10 text-rose-500" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold text-zinc-800 mb-4 tracking-tight drop-shadow-md">
            ConFricto
          </h1>
          <p className="text-zinc-500 text-xl font-medium max-w-sm mx-auto">Navigate group friction effortlessly. Plan your outings with style.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SkeuoCard onClick={() => navigate('/create')} className="flex flex-col items-center text-center gap-4 h-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 skeuo-inset rounded-full flex items-center justify-center mb-2 z-10">
              <MessageSquare className="text-rose-500 w-6 h-6" />
            </div>
            <div className="z-10">
              <h3 className="text-2xl font-bold text-zinc-800 mb-2">New Session</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">Start an anonymous chat to decide where the group should go next.</p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-rose-600 font-bold text-sm uppercase tracking-widest z-10">
              Execute <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </SkeuoCard>

          <SkeuoCard onClick={() => navigate('/join')} className="flex flex-col items-center text-center gap-4 h-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 skeuo-inset rounded-full flex items-center justify-center mb-2 z-10">
              <Users className="text-zinc-500 w-6 h-6" />
            </div>
            <div className="z-10">
              <h3 className="text-2xl font-bold text-zinc-800 mb-2">Join Friends</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">Have an invite code? Join your friends and add your voice privately.</p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-zinc-600 font-bold text-sm uppercase tracking-widest z-10">
              Link up <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </SkeuoCard>
        </div>
      </motion.div>
    </div>
  );
};

const InviteEntry = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!roomCode) return;
    setIsLoading(true);
    setError('');
    
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError("Connection timeout. Check your Firebase config.");
        setIsLoading(false);
      }
    }, 10000);

    try {
      const code = roomCode.toUpperCase().trim();
      const roomRef = doc(db, 'rooms', code);
      const roomSnap = await getDoc(roomRef);
      
      clearTimeout(timeoutId);

      if (!roomSnap.exists()) {
        setError("Invalid code. Try again.");
        setIsLoading(false);
        return;
      }
      
      const roomData = roomSnap.data();
      if (roomData.status !== "waiting") {
        setError("This session has already started.");
        setIsLoading(false);
        return;
      }
      
      if (roomData.joinedMembers.length >= roomData.totalMembers) {
        setError("This room is already full.");
        setIsLoading(false);
        return;
      }
      
      await updateDoc(roomRef, {
        joinedMembers: arrayUnion("Anonymous")
      });
      
      navigate('/room/' + code);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(err);
      setError(err.message || "Error joining room.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 skeuo-button p-4 text-zinc-600 hover:text-zinc-900 rounded-full"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="max-w-md w-full"
      >
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 skeuo-card rounded-full flex items-center justify-center">
            <ShieldCheck className="text-rose-500 w-10 h-10" />
          </div>
        </div>
        
        <div className="flex flex-col items-center mb-10">
          <SkeuoBadge text="Stealth mode active" />
          <h1 className="text-4xl font-display font-bold mb-4 text-zinc-800 tracking-tight">Gather Quietly</h1>
          <p className="text-zinc-500 font-medium text-lg leading-tight">No judgment. No pressure.<br/>Just pure consensus.</p>
        </div>

        <SkeuoCard className="mb-6">
          <label className="block text-left text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
            Access Code
          </label>
          <input 
            type="text" 
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter Room ID..." 
            className="w-full skeuo-input mb-4 placeholder:text-zinc-400 uppercase text-center tracking-widest text-lg text-zinc-800"
            maxLength={6}
          />
          {error && <p className="text-rose-600 font-bold text-sm mb-4">{error}</p>}
          {!error && <div className="mb-4"></div>}

          <button 
            onClick={handleJoin}
            disabled={isLoading || !roomCode}
            className="w-full skeuo-button-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span>{isLoading ? 'JOINING...' : 'JOIN SESSION'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </SkeuoCard>
      </motion.div>
    </div>
  );
};

const CreateSession = () => {
  const navigate = useNavigate();
  const [brief, setBrief] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [hostName, setHostName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!brief || !location || !size || !hostName) return;
    setIsLoading(true);
    setError('');

    const timeoutId = setTimeout(() => {
      setError("Connection timeout. Check your Firebase config.");
      setIsLoading(false);
    }, 10000);

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await setDoc(doc(db, 'rooms', code), {
        roomCode: code,
        brief: brief,
        location: location,
        totalMembers: parseInt(size),
        joinedMembers: [hostName],
        status: "waiting",
        createdAt: serverTimestamp()
      });
      
      clearTimeout(timeoutId);
      localStorage.setItem(`isHost_${code}`, 'true');
      navigate('/room/' + code);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Error creating room", err);
      setError(err.message || "Failed to create room.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 skeuo-button p-4 text-zinc-600 hover:text-zinc-900 rounded-full"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        className="max-w-xl w-full"
      >
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 skeuo-card rounded-full flex items-center justify-center">
            <MessageSquare className="text-zinc-600 w-10 h-10" />
          </div>
        </div>
        
        <div className="flex flex-col items-center mb-10">
          <SkeuoBadge text="Session Initialization" />
          <h1 className="text-4xl font-display font-bold mb-4 text-zinc-800 tracking-tight text-left w-full">Define the Mission</h1>
          <p className="text-zinc-500 font-medium text-lg text-left w-full">What's the plan? Describe the vibe, the occasion, or the goal.</p>
        </div>

        <SkeuoCard className="mb-6">
          <label className="block text-left text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
            Host Name
          </label>
          <input 
            type="text" 
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Your name..." 
            className="w-full skeuo-input mb-6 placeholder:text-zinc-400 text-zinc-800"
          />

          <label className="block text-left text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
            The Brief
          </label>
          <textarea 
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="e.g., Saturday night drinks, casual dinner, or weekend getaway ideas..." 
            className="w-full skeuo-input mb-6 placeholder:text-zinc-400 min-h-[120px] resize-none text-zinc-800"
          />

          <label className="block text-left text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
            Location/City
          </label>
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Koramangala, Bangalore" 
            className="w-full skeuo-input mb-6 placeholder:text-zinc-400 text-zinc-800"
          />

          <label className="block text-left text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
            Squad Size
          </label>
          <input 
            type="number" 
            min="2"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Total number of people (including you)..." 
            className="w-full skeuo-input mb-6 placeholder:text-zinc-400 text-zinc-800"
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === '.' || e.key === 'e') e.preventDefault();
            }}
          />

          {error && <p className="text-rose-600 font-bold text-sm mb-4 text-left">{error}</p>}

          <button 
            onClick={handleCreate}
            disabled={isLoading || !brief || !location || !size || !hostName}
            className="w-full skeuo-button-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'CREATING...' : 'CREATE SESSION'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </SkeuoCard>
      </motion.div>
    </div>
  );
};

const WaitingRoom = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState('');
  
  const isHost = localStorage.getItem(`isHost_${roomCode}`) === 'true';

  useEffect(() => {
    if (!roomCode) return;
    
    const roomRef = doc(db, 'rooms', roomCode);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        if (data.status === 'answering') {
          navigate('/active/' + roomCode);
        }
      } else {
        setError("Room not found.");
      }
    }, (err) => {
      console.error(err);
      setError("Failed to connect to room.");
    });
    
    return () => unsubscribe();
  }, [roomCode, navigate]);

  const handleStartSession = async () => {
    if (isHost && roomCode) {
      await updateDoc(doc(db, 'rooms', roomCode), {
        status: 'answering'
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-display font-bold text-rose-600 mb-6">{error}</h1>
        <button onClick={() => navigate('/')} className="skeuo-button py-3 px-8 text-zinc-600">RETURN HOME</button>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 skeuo-inset rounded-full flex items-center justify-center animate-pulse">
           <div className="w-8 h-8 bg-zinc-300 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
         <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
         />
         <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
         />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <SkeuoBadge text="ConFricto Wait Area" />
          <h1 className="text-4xl font-display font-bold text-zinc-800 tracking-tight mt-2">Ready to align?</h1>
          <p className="text-zinc-500 mt-2">Gather your group and let the magic happen.</p>
        </div>
        
        <SkeuoCard className="mb-8 text-center p-10 flex flex-col items-center relative">
           <p className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">Share this code with your friends</p>
           <div className="skeuo-inset py-6 px-10 w-full flex items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-zinc-200/50 transition-colors">
              <h1 className="text-5xl font-display font-black tracking-[0.3em] text-rose-500 font-mono z-10 drop-shadow-sm">
                {roomCode}
              </h1>
           </div>
        </SkeuoCard>
        
        <div className="skeuo-inset p-6 mb-8 flex flex-col items-center">
          <h2 className="text-sm font-bold text-zinc-500 mb-3 uppercase tracking-widest">Live Status</h2>
          <div className="flex gap-2">
            {[...Array(roomData.totalMembers)].map((_, i) => (
               <div key={i} className={`w-12 h-12 rounded-full flex items-center justify-center ${i < roomData.joinedMembers.length ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-inner' : 'skeuo-card opacity-50'}`}>
                 <Users className={`w-5 h-5 ${i < roomData.joinedMembers.length ? 'text-white' : 'text-zinc-400'}`} />
               </div>
            ))}
          </div>
          <p className="mt-4 text-zinc-600 font-medium">{roomData.joinedMembers.length} of {roomData.totalMembers} people have joined</p>
        </div>

        {isHost && (
          <button 
            onClick={handleStartSession}
            disabled={roomData.joinedMembers.length < 2}
            className="w-full skeuo-button-primary py-5 text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
          >
            <span>START SESSION</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        )}
      </motion.div>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<InviteEntry />} />
        <Route path="/create" element={<CreateSession />} />
        <Route path="/room/:roomCode" element={<WaitingRoom />} />
        <Route path="/active/:roomCode" element={<ActiveSession />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
