import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Users, CheckCircle, Clock, Flame, Power } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// --- Skeuomorphic Helper Components ---
const SkeuoCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`skeuo-card p-8 ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Layout Wrapper ---
const SkeuoLayout = ({ children, roomCode }: { children: React.ReactNode, roomCode?: string }) => {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800 font-sans relative overflow-hidden selection:bg-rose-200">
      {/* Background Texture/Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-zinc-50 to-zinc-200 opacity-50" />
      
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="font-bold text-2xl flex items-center gap-2 drop-shadow-sm">
          <Flame className="w-6 h-6 text-rose-500" />
          ConFricto
        </div>
        {roomCode && (
          <div className="skeuo-inset px-4 py-2 flex items-center gap-3 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-widest">Live: {roomCode}</span>
          </div>
        )}
      </nav>

      <main className="relative z-10 w-full min-h-screen flex flex-col justify-center px-4 md:px-12 py-24 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
};

// --- Screen 1: Room Entrance ---
const EntranceScreen = ({ onNext, roomCode, joinedCount }: { onNext: () => void, roomCode: string, joinedCount: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex flex-col items-center text-center">
    <div className="w-20 h-20 skeuo-card rounded-full flex items-center justify-center mb-8">
      <Users className="w-8 h-8 text-rose-500" />
    </div>
    <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8 text-zinc-800">Ready to resolve the friction?</h1>
    
    <SkeuoCard className="w-full max-w-md flex flex-col items-center p-10">
      <div className="flex -space-x-4 mb-8 p-4 skeuo-inset rounded-full">
        {[...Array(Math.min(joinedCount, 4))].map((_, i) => (
          <div key={i} className="w-14 h-14 rounded-full border-2 border-white bg-gradient-to-br from-zinc-200 to-zinc-300 shadow-md flex items-center justify-center overflow-hidden">
            <Users className="w-5 h-5 text-zinc-500" />
          </div>
        ))}
        {joinedCount > 4 && (
          <div className="w-14 h-14 rounded-full border-2 border-white bg-rose-100 shadow-md flex items-center justify-center font-bold text-sm text-rose-600">
            +{joinedCount - 4}
          </div>
        )}
      </div>
      <p className="text-zinc-500 font-medium mb-10">{joinedCount} members synced up.</p>
      
      <button onClick={onNext} className="w-full skeuo-button-primary py-4 flex items-center justify-center group">
        <span>ENTER QUESTIONNAIRE</span>
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </SkeuoCard>
  </motion.div>
);

// --- Price Range Slider Component ---
const DualSlider = ({ onChange }: { onChange: (min: number, max: number) => void }) => {
  const [minVal, setMinVal] = useState(100);
  const [maxVal, setMaxVal] = useState(10100);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 500);
    setMinVal(val);
    onChange(val, maxVal);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 500);
    setMaxVal(val);
    onChange(minVal, val);
  };

  const getPercent = (value: number) => Math.round(((value - 100) / (20000 - 100)) * 100);

  return (
    <div className="w-full py-8">
      <div className="flex flex-col mb-6">
        <span className="text-sm text-zinc-500 font-medium mb-1">Selected Price range</span>
        <span className="text-2xl font-bold text-zinc-800">
          ₹{minVal} - ₹{maxVal >= 20000 ? '20,000+' : maxVal}
        </span>
      </div>
      <div className="relative w-full h-4 skeuo-inset rounded-full flex items-center">
        <div 
          className="absolute h-2 bg-rose-500 rounded-full z-10" 
          style={{ left: `${getPercent(minVal)}%`, width: `${getPercent(maxVal) - getPercent(minVal)}%` }}
        />
        <input 
          type="range" min="100" max="20000" step="100" value={minVal} onChange={handleMinChange}
          className="absolute w-full h-0 z-20 appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
        />
        <input 
          type="range" min="100" max="20000" step="100" value={maxVal} onChange={handleMaxChange}
          className="absolute w-full h-0 z-20 appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>
    </div>
  );
};

// --- Screen 2: Private Preferences ---
const questions = [
  { id: 1, type: "choice", title: "What's the energy today?", options: ["Chill & Relaxed", "Adventurous", "Party Mode"] },
  { id: 2, type: "choice", title: "How long do we have?", options: ["A quick bite (1-2 hrs)", "Half Day Hangout", "All Day Epic"] },
  { id: 3, type: "slider", title: "What's the budget constraint?", options: [] },
  { id: 4, type: "choice", title: "Preferred environment?", options: ["Indoor Comfort", "Nature & Parks", "City Streets"] },
  { id: 5, type: "choice", title: "Food situation?", options: ["Just Drinks", "Snacks", "Full Feast"] },
];

const QuestionnaireScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      onComplete();
    }
  };

  const progress = ((currentIndex) / questions.length) * 100;
  const currentQ = questions[currentIndex];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center mb-12">
        <div className="w-full h-4 skeuo-inset rounded-full overflow-hidden mb-4 p-1">
          <motion.div 
            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full shadow-inner"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="font-bold text-zinc-400 uppercase tracking-widest text-xs">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full"
        >
          <SkeuoCard className="p-10">
            <h2 className="text-3xl font-display font-bold tracking-tight mb-8 text-zinc-800">
              {currentQ.title}
            </h2>

            {currentQ.type === 'slider' ? (
              <div className="w-full flex flex-col gap-6">
                <DualSlider onChange={(min, max) => console.log(min, max)} />
                <button 
                  onClick={handleNext}
                  className="mt-4 w-full skeuo-button py-4 font-bold text-zinc-700 tracking-widest uppercase transition-all"
                >
                  Confirm & Next
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {currentQ.options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={handleNext}
                    className="w-full text-left skeuo-button px-6 py-5 flex items-center justify-between group"
                  >
                    <span className="text-lg font-bold text-zinc-700">{opt}</span>
                    <div className="w-8 h-8 rounded-full skeuo-inset flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-rose-500" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </SkeuoCard>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// --- Screen 3: Waiting Lobby (Interactive UI) ---
const SyncScreen = ({ onSimulateDone }: { onSimulateDone: () => void }) => {
  const [clicks, setClicks] = useState(0);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(onSimulateDone, 5000);
    return () => clearTimeout(timer);
  }, [onSimulateDone]);

  const handleInteract = () => {
    setClicks(c => c + 1);
    setLit(true);
    setTimeout(() => setLit(false), 200);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-3xl font-display font-bold text-zinc-800 mb-2">Waiting for the others...</h2>
      <p className="text-zinc-500 font-medium mb-16">Play with the switch while we calculate overlaps.</p>
      
      <div className="relative mb-12 flex flex-col items-center">
        {/* Interactive Skeuomorphic Button */}
        <div 
          onClick={handleInteract}
          className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-100 ${lit ? 'bg-[#e0e0e0] shadow-[inset_10px_10px_20px_#bebebe,inset_-10px_-10px_20px_#ffffff]' : 'bg-gradient-to-br from-[#f0f0f0] to-[#cacaca] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff]'}`}
        >
          <Power className={`w-12 h-12 transition-colors duration-100 ${lit ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'text-zinc-400'}`} />
        </div>
        
        {/* Status Indicator */}
        <div className="mt-12 skeuo-inset px-6 py-3 rounded-xl flex items-center gap-4">
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <motion.div 
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                className="w-3 h-3 rounded-full bg-rose-500 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4)]"
              />
            ))}
          </div>
          <div className="w-px h-6 bg-zinc-300"></div>
          <span className="font-bold text-zinc-600 font-mono tracking-widest">{clicks} CLICKS</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Screen 4: Plan Proposals ---
const mockPlans = [
  { id: "A", score: 94, title: "Urban Sunset", steps: [
    { time: "18:00", act: "Meetup", loc: "Central Plaza" },
    { time: "18:30", act: "Dinner", loc: "The Noodle Bar" }
  ]},
  { id: "B", score: 88, title: "Active Afternoon", steps: [
    { time: "14:00", act: "Bouldering", loc: "Peak Gym" },
    { time: "16:30", act: "Smoothies", loc: "Green Blend" }
  ]}
];

const ProposalsScreen = ({ onNext }: { onNext: () => void }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-display font-bold tracking-tight text-zinc-800">Overlap Results</h2>
        <div className="skeuo-inset rounded-full px-6 py-2 font-bold text-zinc-500 tracking-widest uppercase text-sm">
          Phase 1 of 3
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockPlans.map((plan, idx) => (
          <SkeuoCard key={idx} className="relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 border-b border-zinc-200 pb-6">
              <div className="w-12 h-12 skeuo-inset rounded-full flex items-center justify-center font-bold text-xl text-zinc-700">{plan.id}</div>
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-500 drop-shadow-sm">{plan.score}%</div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Match</div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-zinc-800 mb-6">{plan.title}</h3>
            
            <div className="space-y-6 mb-8">
              {plan.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex gap-4">
                  <div className="skeuo-inset px-2 py-1 rounded h-fit font-mono text-xs font-bold text-zinc-500">{step.time}</div>
                  <div>
                    <div className="font-bold text-zinc-800">{step.act}</div>
                    <div className="text-zinc-500 text-sm">{step.loc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full skeuo-button py-3 text-zinc-600 font-bold uppercase tracking-widest hover:text-rose-500">
              Vote Plan {plan.id}
            </button>
          </SkeuoCard>
        ))}
      </div>
      
      <div className="mt-12 flex justify-center">
        <button onClick={onNext} className="skeuo-button-primary py-4 px-12 font-bold tracking-widest uppercase text-lg">
          Lock In Results
        </button>
      </div>
    </motion.div>
  );
};

// --- Screen 5: Final Consensus ---
const ConsensusScreen = ({ onNext }: { onNext: () => void }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto skeuo-card rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-5xl font-display font-bold tracking-tight text-zinc-800">Consensus Reached</h2>
      </div>

      <div className="space-y-6">
        <SkeuoCard onClick={onNext} className="border-2 border-emerald-400/50 flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden group">
          <div className="flex gap-6 items-center">
            <div className="w-16 h-16 rounded-full skeuo-inset flex items-center justify-center font-bold text-2xl text-emerald-600 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]">1</div>
            <div>
              <div className="flex gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Winner</span>
              </div>
              <h3 className="text-3xl font-bold text-zinc-800">The Urban Sunset</h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="skeuo-button py-2 px-6 flex items-center gap-2 font-bold text-emerald-600 uppercase tracking-widest text-xs pointer-events-none">
               Continue <ArrowRight className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-zinc-400">100% of votes</div>
          </div>
        </SkeuoCard>
      </div>
    </motion.div>
  );
};

// --- Screen 6: The Locked Plan ---
const LockedPlanScreen = () => {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl mx-auto">
      <SkeuoCard className="p-12 mb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-rose-400 to-rose-600" />
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4 text-zinc-800">The Urban Sunset</h2>
        <p className="text-xl text-zinc-500 font-medium">Your group's ideal outing.</p>
      </SkeuoCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="skeuo-inset p-6 rounded-2xl flex flex-col gap-2 items-center text-center">
          <div className="w-10 h-10 skeuo-card rounded-full flex items-center justify-center mb-2"><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
          <div className="font-bold text-xs uppercase tracking-widest text-zinc-400">Status</div>
          <div className="font-bold text-zinc-800">Locked</div>
        </div>
        <div className="skeuo-inset p-6 rounded-2xl flex flex-col gap-2 items-center text-center">
          <div className="w-10 h-10 skeuo-card rounded-full flex items-center justify-center mb-2"><Clock className="w-5 h-5 text-rose-500" /></div>
          <div className="font-bold text-xs uppercase tracking-widest text-zinc-400">Duration</div>
          <div className="font-bold text-zinc-800">5h 30m</div>
        </div>
        <div className="skeuo-inset p-6 rounded-2xl flex flex-col gap-2 items-center text-center">
          <div className="w-10 h-10 skeuo-card rounded-full flex items-center justify-center mb-2"><Users className="w-5 h-5 text-blue-500" /></div>
          <div className="font-bold text-xs uppercase tracking-widest text-zinc-400">Consensus</div>
          <div className="font-bold text-zinc-800">100% Sync</div>
        </div>
        <div className="skeuo-inset p-6 rounded-2xl flex flex-col gap-2 items-center text-center">
          <div className="w-10 h-10 skeuo-card rounded-full flex items-center justify-center mb-2"><span className="font-bold text-zinc-500">$$</span></div>
          <div className="font-bold text-xs uppercase tracking-widest text-zinc-400">Cost</div>
          <div className="font-bold text-zinc-800">Moderate</div>
        </div>
      </div>

      <SkeuoCard className="p-10 mb-12">
        <h3 className="font-bold text-zinc-500 tracking-widest uppercase mb-8 border-b border-zinc-200 pb-4">Final Master Plan</h3>
        
        <div className="space-y-8">
          {[
            { num: 1, title: "Central Plaza Meetup", note: "Centralized location for everyone arriving from different routes.", time: "18:00" },
            { num: 2, title: "The Noodle Bar", note: "Matches the selected budget and covers dinner preferences.", time: "18:30" },
            { num: 3, title: "Sky Lounge Drinks", note: "Perfect 'Chill' energy to end the night.", time: "20:00" },
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <div className="w-12 h-12 rounded-full skeuo-inset flex-shrink-0 flex items-center justify-center font-bold text-zinc-600 shadow-inner">{item.num}</div>
              <div className="flex-1 bg-zinc-50 rounded-xl p-5 border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg text-zinc-800">{item.title}</h4>
                  <span className="font-bold text-xs text-zinc-400 bg-zinc-200 px-3 py-1 rounded-full">{item.time}</span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </SkeuoCard>

      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <button className="skeuo-button-primary py-5 px-10">Share Itinerary</button>
        <button onClick={() => navigate('/')} className="skeuo-button py-5 px-10 text-zinc-600">Finish</button>
      </div>
    </motion.div>
  );
};

// --- Main Active Session Flow Manager ---
export default function ActiveSession() {
  const { roomCode } = useParams();
  const [step, setStep] = useState(0);
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    if (!roomCode) return;
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomCode), (snap) => {
      if (snap.exists()) setRoomData(snap.data());
    });
    return () => unsubscribe();
  }, [roomCode]);

  return (
    <SkeuoLayout roomCode={roomCode}>
      <AnimatePresence mode="wait">
        {step === 0 && <EntranceScreen key="s0" roomCode={roomCode || ''} joinedCount={roomData?.joinedMembers?.length || 1} onNext={() => setStep(1)} />}
        {step === 1 && <QuestionnaireScreen key="s1" onComplete={() => setStep(2)} />}
        {step === 2 && <SyncScreen key="s2" onSimulateDone={() => setStep(3)} />}
        {step === 3 && <ProposalsScreen key="s3" onNext={() => setStep(4)} />}
        {step === 4 && <ConsensusScreen key="s4" onNext={() => setStep(5)} />}
        {step === 5 && <LockedPlanScreen key="s5" />}
      </AnimatePresence>
    </SkeuoLayout>
  );
}
