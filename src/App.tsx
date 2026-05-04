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

// --- Screen Components ---

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center p-8 md:p-24 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl w-full z-10"
      >
        <div className="mb-16">
          <h1 className="text-7xl md:text-[9rem] leading-[0.85] font-black text-black mb-8 tracking-tighter uppercase">
            CON<br/>FRICTO
          </h1>
          <div className="flex gap-6 items-center">
             <div className="w-1.5 h-16 bg-[var(--color-brutal-pink)] flex-shrink-0"></div>
             <p className="text-zinc-600 text-xl font-medium max-w-xl leading-relaxed">
               Plan group outings without the social pressure. Honest voices only.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
          <div onClick={() => navigate('/create')} className="brutal-card p-10 flex flex-col cursor-pointer hover:-translate-y-1 transition-transform bg-white relative">
            <div className="w-16 h-16 bg-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_#FF00FF]">
              <MessageSquare className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-black mb-4 uppercase italic tracking-wide">New Session</h3>
            <p className="text-zinc-700 text-sm font-medium leading-relaxed mb-12">Start an anonymous chat to decide where the group should go next.</p>
            <div className="mt-auto font-black text-sm uppercase tracking-widest flex items-center gap-2">
              Execute <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div onClick={() => navigate('/join')} className="brutal-card p-10 flex flex-col cursor-pointer hover:-translate-y-1 transition-transform bg-white relative">
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-8">
              <Users className="text-black w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-black mb-4 uppercase italic tracking-wide">Join Friends</h3>
            <p className="text-zinc-700 text-sm font-medium leading-relaxed mb-12">Have an invite code? Join your friends and add your voice privately.</p>
            <div className="mt-auto font-black text-sm uppercase tracking-widest flex items-center gap-2">
              Link up <ChevronRight className="w-4 h-4" />
            </div>
          </div>
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
        setError("Connection timeout.");
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
    <div className="min-h-screen flex flex-col justify-center p-8 md:p-24 relative overflow-hidden">
      <button 
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 w-12 h-12 brutal-card flex items-center justify-center hover:bg-[var(--color-brutal-yellow)] z-50"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="max-w-xl w-full z-10"
      >
        <div className="mb-12">
          <div className="w-16 h-16 bg-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_#FF00FF]">
            <Users className="text-white w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tighter uppercase">
            LINK UP
          </h1>
          <div className="flex gap-4 items-center">
             <div className="w-1.5 h-12 bg-black flex-shrink-0"></div>
             <p className="text-zinc-600 font-medium max-w-sm">No judgment. No pressure. Just pure consensus.</p>
          </div>
        </div>

        <div className="brutal-card p-10 max-w-md">
          <label className="block font-black text-black uppercase tracking-widest mb-4">
            Access Code
          </label>
          <input 
            type="text" 
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="ENTER ROOM ID" 
            className="w-full brutal-input mb-4 placeholder:text-zinc-400 uppercase tracking-widest font-bold"
            maxLength={6}
          />
          {error && <p className="text-[var(--color-brutal-pink)] font-bold text-sm mb-4 uppercase tracking-wider">{error}</p>}

          <button 
            onClick={handleJoin}
            disabled={isLoading || !roomCode}
            className="w-full brutal-button-primary mt-4 py-4 flex items-center justify-between px-6 disabled:opacity-50"
          >
            <span>{isLoading ? 'JOINING...' : 'ENTER'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
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
      setError("Connection timeout.");
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
      setError("Failed to create room.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-8 md:p-24 relative overflow-hidden">
      <button 
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 w-12 h-12 brutal-card flex items-center justify-center hover:bg-[var(--color-brutal-yellow)] z-50"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="max-w-2xl w-full z-10"
      >
        <div className="mb-12">
          <div className="w-16 h-16 bg-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_#FFD600]">
            <MessageSquare className="text-white w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tighter uppercase">
            DEFINE<br/>MISSION
          </h1>
          <div className="flex gap-4 items-center">
             <div className="w-1.5 h-12 bg-black flex-shrink-0"></div>
             <p className="text-zinc-600 font-medium max-w-sm">What's the plan? Describe the vibe or occasion.</p>
          </div>
        </div>

        <div className="brutal-card p-10">
          <label className="block font-black text-black uppercase tracking-widest mb-4">
            Host Name
          </label>
          <input 
            type="text" 
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="ENTER YOUR NAME" 
            className="w-full brutal-input mb-8 placeholder:text-zinc-400 font-bold"
          />

          <label className="block font-black text-black uppercase tracking-widest mb-4">
            The Brief
          </label>
          <textarea 
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="SATURDAY NIGHT DRINKS, WEEKEND GETAWAY..." 
            className="w-full brutal-input mb-8 placeholder:text-zinc-400 min-h-[120px] resize-none font-bold uppercase"
          />

          <label className="block font-black text-black uppercase tracking-widest mb-4">
            Location/City
          </label>
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="E.G., KORAMANGALA, BANGALORE" 
            className="w-full brutal-input mb-8 placeholder:text-zinc-400 font-bold uppercase"
          />

          <label className="block font-black text-black uppercase tracking-widest mb-4">
            Squad Size
          </label>
          <input 
            type="number" 
            min="2"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="TOTAL PEOPLE" 
            className="w-full brutal-input mb-8 placeholder:text-zinc-400 font-bold"
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === '.' || e.key === 'e') e.preventDefault();
            }}
          />

          {error && <p className="text-[var(--color-brutal-pink)] font-bold text-sm mb-4 uppercase tracking-wider">{error}</p>}

          <button 
            onClick={handleCreate}
            disabled={isLoading || !brief || !location || !size || !hostName}
            className="w-full brutal-button-primary mt-4 py-4 flex items-center justify-between px-6 disabled:opacity-50"
          >
            <span>{isLoading ? 'CREATING...' : 'INITIALIZE'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
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
        <h1 className="text-5xl font-black text-black mb-6 uppercase">ERROR</h1>
        <p className="text-[var(--color-brutal-pink)] font-bold tracking-widest mb-8">{error}</p>
        <button onClick={() => navigate('/')} className="brutal-button py-3 px-8 text-black">ABORT</button>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 brutal-card flex items-center justify-center animate-pulse">
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full z-10 flex flex-col items-center"
      >
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tighter uppercase">
            WAIT AREA
          </h1>
          <p className="text-zinc-600 font-medium">Gathering signals from the network.</p>
        </div>
        
        <div className="brutal-card p-10 w-full mb-8 text-center relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-4 bg-[var(--color-brutal-pink)]"></div>
           <p className="font-black text-black mb-4 uppercase tracking-widest mt-4">Broadcast ID</p>
           <div className="brutal-inset py-8 px-10 w-full bg-white flex items-center justify-center">
              <h1 className="text-6xl md:text-8xl font-black tracking-widest text-black">
                {roomCode}
              </h1>
           </div>
        </div>
        
        <div className="brutal-card w-full p-8 mb-8">
          <h2 className="font-black text-black mb-6 uppercase tracking-widest text-center border-b-4 border-black pb-4">Live Status</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {[...Array(roomData.totalMembers)].map((_, i) => (
               <div key={i} className={`w-14 h-14 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_black] ${i < roomData.joinedMembers.length ? 'bg-[var(--color-brutal-yellow)]' : 'bg-white opacity-40'}`}>
                 <Users className="w-6 h-6 text-black" />
               </div>
            ))}
          </div>
          <p className="mt-8 text-black font-black uppercase tracking-widest text-center">{roomData.joinedMembers.length} OF {roomData.totalMembers} SECURED</p>
        </div>

        {isHost && (
          <button 
            onClick={handleStartSession}
            disabled={roomData.joinedMembers.length < 2}
            className="w-full brutal-button-primary py-5 text-xl flex items-center justify-between px-8 disabled:opacity-50 disabled:grayscale transition-all"
          >
            <span>START PROTOCOL</span>
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
