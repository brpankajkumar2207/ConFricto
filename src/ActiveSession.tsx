import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Users, CheckCircle, Clock, Flame, Power, Vote, Star, MapPin, Zap, ThumbsUp, ArrowLeft } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { generateQuestions, generateOutingPlans, generateFinalPlans } from './lib/gemini';
import type { OutingPlan, FinalPlan } from './lib/gemini';

// --- Brutalmorphic Helper Components ---
const BrutalCard = ({ children, className = "", onClick, initial, animate, exit, transition, variants, whileHover }: any) => (
  <motion.div 
    onClick={onClick}
    initial={initial} animate={animate} exit={exit} transition={transition} variants={variants} whileHover={whileHover}
    className={`brutal-card p-8 ${onClick ? 'cursor-pointer hover:-translate-y-1 transition-transform' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

// --- Layout Wrapper ---
const BrutalLayout = ({ children, roomCode, onBack }: { children: React.ReactNode, roomCode?: string, onBack?: () => void }) => {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate('/'));
  return (
    <div className="min-h-screen text-black font-sans relative overflow-hidden selection:bg-black selection:text-white pb-24">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={handleBack}
            className="w-12 h-12 brutal-card flex items-center justify-center hover:bg-[var(--color-brutal-yellow)] bg-white"
          >
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <div className="font-black text-2xl hidden md:flex items-center gap-2 uppercase tracking-tighter bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_black]">
            CON<span className="text-[var(--color-brutal-pink)]">FRICTO</span>
          </div>
        </div>
        {roomCode && (
          <div className="bg-white border-2 border-black px-4 py-2 flex items-center gap-3 shadow-[4px_4px_0px_black] pointer-events-auto">
            <div className="w-3 h-3 bg-black"></div>
            <span className="font-black text-xs text-black uppercase tracking-widest">LIVE: {roomCode}</span>
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
const EntranceScreen = ({ onNext, roomCode, joinedCount, isGenerating }: { onNext: () => void, roomCode: string, joinedCount: number, isGenerating: boolean }) => (
  <motion.div initial={{ opacity: 0, x: -50, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5, type: "spring", bounce: 0.4 }} className="w-full flex flex-col justify-center md:px-12">
    <div className="mb-12">
      <motion.div 
        initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 bg-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_#FFD600]"
      >
        <Users className="w-8 h-8 text-white" />
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring" }}
        className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tighter uppercase"
      >
        READY TO<br/>EXECUTE?
      </motion.h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-4 items-center">
         <motion.div initial={{ height: 0 }} animate={{ height: 48 }} transition={{ delay: 0.4, duration: 0.3 }} className="w-1.5 bg-black flex-shrink-0" />
         <p className="text-zinc-600 font-medium max-w-sm">The squad is assembled. Time to feed your preferences into the protocol.</p>
      </motion.div>
    </div>
    
    <BrutalCard className="w-full max-w-md p-10">
      <motion.div 
        variants={{ show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show"
        className="flex gap-2 mb-8 p-4 brutal-inset flex-wrap justify-center bg-white"
      >
        {[...Array(Math.min(joinedCount, 4))].map((_, i) => (
          <motion.div 
            key={i} variants={{ hidden: { scale: 0, rotate: -15 }, show: { scale: 1, rotate: 0 } }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-14 h-14 border-4 border-black bg-white shadow-[2px_2px_0px_black] flex items-center justify-center"
          >
            <Users className="w-6 h-6 text-black" />
          </motion.div>
        ))}
        {joinedCount > 4 && (
          <motion.div variants={{ hidden: { scale: 0 }, show: { scale: 1 } }} className="w-14 h-14 border-4 border-black bg-[var(--color-brutal-pink)] shadow-[2px_2px_0px_black] flex items-center justify-center font-black text-sm text-white">
            +{joinedCount - 4}
          </motion.div>
        )}
      </motion.div>
      <p className="text-black font-black uppercase tracking-widest text-center mb-10">{joinedCount} UNITS SYNCED.</p>
      
      <motion.button 
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
        onClick={onNext} disabled={isGenerating} 
        className="w-full brutal-button-primary py-4 flex items-center justify-between px-6 group disabled:opacity-50"
      >
        <span>{isGenerating ? "GENERATING..." : "BEGIN PROTOCOL"}</span>
        {!isGenerating && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
      </motion.button>
    </BrutalCard>
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
      <div className="flex flex-col mb-8">
        <span className="font-black uppercase tracking-widest text-zinc-500 text-xs mb-2">Budget Constraint</span>
        <span className="text-3xl font-black text-black">
          ₹{minVal} - ₹{maxVal >= 20000 ? '20,000+' : maxVal}
        </span>
      </div>
      <div className="relative w-full h-8 brutal-inset bg-white flex items-center">
        <div 
          className="absolute h-full bg-[var(--color-brutal-pink)] z-10 border-r-4 border-l-4 border-black" 
          style={{ left: `${getPercent(minVal)}%`, width: `${getPercent(maxVal) - getPercent(minVal)}%` }}
        />
        <input 
          type="range" min="100" max="20000" step="100" value={minVal} onChange={handleMinChange}
          className="absolute w-full h-0 z-20 appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-12 [&::-webkit-slider-thumb]:bg-[var(--color-brutal-yellow)] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:appearance-none"
        />
        <input 
          type="range" min="100" max="20000" step="100" value={maxVal} onChange={handleMaxChange}
          className="absolute w-full h-0 z-20 appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-12 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>
    </div>
  );
};

// --- Screen 2: Private Preferences ---
const QuestionnaireScreen = ({ onComplete, questions, roomCode }: { onComplete: (responses: Record<number, string>, customInsight: string) => void, questions: any[], roomCode: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [insight, setInsight] = useState("");
  
  const handleAnswer = (answer: string) => {
    const newResponses = { ...responses, [currentIndex]: answer };
    setResponses(newResponses);
    setCurrentIndex(curr => curr + 1);
  };

  const handleFinish = () => {
    onComplete(responses, insight);
  };

  const isInsightStep = currentIndex === questions.length;
  const progress = ((currentIndex) / (questions.length + 1)) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col mb-12">
        <div className="font-black text-black uppercase tracking-widest text-sm mb-4">
          {isInsightStep ? `FINAL INSIGHT` : `Q.${currentIndex + 1} // ${questions.length}`}
        </div>
        <div className="w-full h-8 brutal-inset bg-white relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-black border-r-4 border-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
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
          <BrutalCard className="p-10">
            {isInsightStep ? (
              <>
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-black uppercase tracking-tight mb-8 text-black"
                >
                  ANYTHING ELSE WE SHOULD KNOW?
                </motion.h2>
                <motion.textarea 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                  className="w-full brutal-inset p-4 text-xl border-4 border-black mb-8 focus:outline-none focus:border-[var(--color-brutal-pink)]"
                  rows={4}
                  placeholder="Specific cravings, strict vetos, or wild ideas..."
                  value={insight}
                  onChange={e => setInsight(e.target.value)}
                />
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "#000" }} whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  className="w-full text-center brutal-button-primary px-8 py-6 flex items-center justify-center group disabled:opacity-50"
                >
                  <span className="text-xl font-black uppercase tracking-wide text-white group-hover:text-white">SUBMIT PREFERENCES</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.h2 
                  key={`q-${currentIndex}`}
                  initial={{ opacity: 0, y: -10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.3 }}
                  className="text-4xl font-black uppercase tracking-tight mb-12 text-black"
                >
                  {questions[currentIndex].question || questions[currentIndex].title}
                </motion.h2>
                <motion.div 
                  key={`opts-${currentIndex}`}
                  variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="show"
                  className="flex flex-col gap-4"
                >
                  {questions[currentIndex].options.map((opt: string, i: number) => (
                    <motion.button 
                      key={i}
                      variants={{ hidden: { opacity: 0, x: -30 }, show: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.4 } } }}
                      whileHover={{ scale: 1.02, x: 10, backgroundColor: "var(--color-brutal-yellow)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(opt)}
                      className="w-full text-left brutal-button px-8 py-6 flex items-center justify-between group bg-white border-4 border-black"
                    >
                      <span className="text-xl font-black text-black uppercase tracking-wide">{opt}</span>
                      <ChevronRight className="w-6 h-6 text-black group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </BrutalCard>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// --- Screen 3: Waiting Lobby (Interactive UI) ---
const SyncScreen = ({ roomData, isHost, isGenerating, onGenerate }: { roomData: any, isHost: boolean, isGenerating: boolean, onGenerate: () => void }) => {
  const [mashes, setMashes] = useState(0);

  const responsesCount = roomData?.memberResponses?.length || 0;
  const totalCount = roomData?.totalMembers || 1;
  const allResponded = responsesCount >= totalCount;

  const handleInteract = () => {
    setMashes(m => m + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1, x: mashes % 2 === 0 ? 0 : (mashes % 4 === 1 ? -10 : 10) }} 
      exit={{ opacity: 0 }} 
      className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center transition-transform duration-75"
    >
      <motion.div 
        animate={allResponded ? { rotate: -2, scale: [1, 1.05, 1] } : { rotate: [-2, 2, -2] }} 
        transition={{ repeat: allResponded ? 0 : Infinity, duration: 0.3, ease: "linear" }}
        className="brutal-card bg-black text-white p-6 mb-12 shadow-[8px_8px_0px_#FFD600]"
      >
        <h2 className="text-5xl font-black uppercase tracking-tighter">
          {allResponded ? "ALL DATA SYNCED" : "CALCULATING"}
        </h2>
      </motion.div>
      <div className="flex gap-4 items-center mb-16">
        <motion.div animate={{ height: [32, 16, 48, 32] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 bg-black flex-shrink-0"></motion.div>
        <p className="text-black font-black text-xl uppercase tracking-widest">
          {allResponded ? "READY TO GENERATE PLANS." : `AWAITING OTHERS (${responsesCount}/${totalCount}). MASH TO EXPEDITE.`}
        </p>
      </div>
      
      <div className="relative mb-12 flex flex-col items-center">
        {allResponded && isHost ? (
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onGenerate}
            disabled={isGenerating}
            className="brutal-button-primary py-6 px-12 text-2xl font-black uppercase disabled:opacity-50"
          >
            {isGenerating ? "GENERATING..." : "GENERATE PLANS"}
          </motion.button>
        ) : (
          <>
            <motion.button 
              whileTap={{ scale: 0.8, rotate: (Math.random() - 0.5) * 30 }}
              onClick={handleInteract}
              className="brutal-button bg-[var(--color-brutal-pink)] text-white w-56 h-56 flex items-center justify-center text-6xl active:bg-black transition-colors shadow-[12px_12px_0px_black] active:translate-y-2 active:translate-x-2 active:shadow-[0px_0px_0px_black]"
            >
              MASH
            </motion.button>
            
            <motion.div 
              key={mashes}
              initial={{ scale: 1.5, color: "#FF00FF" }} animate={{ scale: 1, color: "#000" }} transition={{ duration: 0.2 }}
              className="mt-16 brutal-inset px-10 py-6 flex items-center gap-6 bg-white border-4 border-black text-black font-black text-4xl shadow-[8px_8px_0px_black]"
            >
              <span>{mashes}</span>
              <span className="text-[var(--color-brutal-pink)]">HITS</span>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// --- Screen 4: Vote on Plan Proposals ---
const ProposalsScreen = ({ plans, onSubmitVotes, roomCode }: { plans: OutingPlan[], onSubmitVotes: (votes: number[]) => void, roomCode: string }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleVote = (id: number) => {
    if (submitted) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;
    setSubmitted(true);
    onSubmitVotes(selectedIds);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b-8 border-black pb-8">
        <div>
           <div className="w-16 h-16 bg-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_#FFD600]">
             <CheckCircle className="text-white w-8 h-8" />
           </div>
           <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase">RESULTS</h2>
        </div>
        <div className="brutal-inset bg-black text-white px-6 py-3 font-black tracking-widest uppercase text-lg">
          {selectedIds.length}/3 SELECTED
        </div>
      </div>

      <motion.div 
        variants={{ show: { transition: { staggerChildren: 0.15 } } }} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12"
      >
        {plans.map((plan) => {
          const isSelected = selectedIds.includes(plan.id);
          return (
            <BrutalCard 
              key={plan.id} 
              variants={{ hidden: { opacity: 0, y: 30, rotate: -2 }, show: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring", bounce: 0.4 } } }}
              whileHover={{ scale: 1.02, rotate: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleVote(plan.id)}
              className={`relative overflow-hidden group flex flex-col h-full bg-white border-4 ${isSelected ? 'border-[var(--color-brutal-pink)] shadow-[8px_8px_0px_var(--color-brutal-pink)]' : 'border-black'}`}
            >
              <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-8">
                <div className={`w-16 h-16 border-4 border-black ${isSelected ? 'bg-[var(--color-brutal-pink)] text-white' : 'bg-[var(--color-brutal-yellow)] text-black'} flex items-center justify-center font-black text-3xl shadow-[4px_4px_0px_black]`}>
                  {isSelected ? <CheckCircle className="w-8 h-8" /> : plan.id}
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-black ${plan.groupFitScore >= 90 ? 'text-emerald-500' : plan.groupFitScore >= 75 ? 'text-amber-500' : 'text-black'}`}>
                    {plan.groupFitScore}%
                  </div>
                  <div className="text-sm font-black uppercase tracking-widest">Match</div>
                </div>
              </div>
              
              <h3 className="text-3xl font-black text-black mb-4 uppercase tracking-wide">{plan.title}</h3>
              <p className="text-zinc-600 font-bold mb-6 uppercase tracking-tight">{plan.vibe}</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase">{plan.estimatedCost}</span>
                <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase">{plan.duration}</span>
                <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase">{plan.energyLevel}</span>
              </div>
              
              <p className="text-sm font-black text-zinc-500 italic uppercase mb-8">{plan.bestFor}</p>

              <button className={`w-full brutal-button py-5 font-black uppercase tracking-widest ${isSelected ? 'bg-black text-white' : 'bg-white text-black hover:bg-[var(--color-brutal-pink)] hover:text-white'}`}>
                {isSelected ? "SELECTED" : `VOTE PLAN ${plan.id}`}
              </button>
            </BrutalCard>
          );
        })}
      </motion.div>
      
      {!submitted && (
        <div className="mt-16 flex justify-center">
          <button 
            onClick={handleSubmit} 
            disabled={selectedIds.length === 0}
            className="brutal-button-primary py-6 px-16 font-black tracking-widest uppercase text-2xl flex items-center gap-4 disabled:opacity-50"
          >
            <span>LOCK IN ({selectedIds.length})</span>
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>
      )}
      {submitted && (
        <div className="text-center">
          <p className="text-black font-black uppercase tracking-widest text-xl">PROXIMITY SYNC IN PROGRESS... ANALYZING CONSENSUS.</p>
        </div>
      )}
    </motion.div>
  );
};

// --- Screen 5: Final Plans ---
const FinalPlansScreen = ({ finalPlans, revealed, onReveal }: { finalPlans: FinalPlan[], revealed: boolean, onReveal: (v: boolean) => void }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {!revealed ? (
        <>
          <div className="text-center mb-16">
            <div className="w-32 h-32 mx-auto bg-black border-4 border-white shadow-[10px_10px_0px_#FF00FF] flex items-center justify-center mb-8 transform rotate-3">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase">CONSENSUS<br/>REACHED</h2>
          </div>

          <motion.div 
            variants={{ show: { transition: { staggerChildren: 0.2 } } }} initial="hidden" animate="show"
            className="w-full space-y-8"
          >
            {finalPlans.map((plan, idx) => (
              <BrutalCard 
                key={plan.id}
                onClick={() => onReveal(true)} 
                variants={{ hidden: { opacity: 0, x: -50 }, show: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.3 } } }}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                className={`${idx === 0 ? 'bg-[var(--color-brutal-yellow)]' : 'bg-white'} border-4 border-black flex flex-col md:flex-row gap-8 justify-between items-center cursor-pointer`}
              >
                <div className="flex gap-8 items-center w-full">
                  <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center font-black text-4xl text-black shadow-[4px_4px_0px_black]">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <span className="bg-black text-white text-xs font-black px-4 py-2 uppercase tracking-widest border-2 border-transparent">
                        {plan.rating === "Perfect Match" ? "WINNER" : plan.rating.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-4xl font-black text-black uppercase tracking-tight">{plan.title}</h3>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2">
                    <div className="text-black font-black uppercase tracking-widest">{plan.ratingScore}% SECURED</div>
                    <ArrowRight className="w-8 h-8" />
                  </div>
                </div>
              </BrutalCard>
            ))}
          </motion.div>
        </>
      ) : (
        <LockedPlanScreen plan={finalPlans[0]} />
      )}
    </motion.div>
  );
};

// --- Screen 6: The Locked Plan ---
const LockedPlanScreen = ({ plan }: { plan: FinalPlan }) => {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-12 border-b-8 border-black pb-8">
         <div>
            <h1 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter mb-4">LOCKED IN</h1>
            <p className="text-zinc-600 font-bold tracking-widest uppercase">YOUR GROUP'S IDEAL OUTING</p>
         </div>
      </div>
      
      <BrutalCard className="p-12 mb-12 text-center bg-black text-white transform -rotate-1 relative shadow-[12px_12px_0px_#FFD600]">
        <div className="absolute top-4 left-4 w-4 h-4 bg-white rounded-full"></div>
        <div className="absolute top-4 right-4 w-4 h-4 bg-white rounded-full"></div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-4 uppercase mt-8">{plan.title}</h2>
        <p className="text-[var(--color-brutal-yellow)] font-black uppercase tracking-widest text-xl">{plan.tagline || plan.vibe}</p>
      </BrutalCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-white border-4 border-black p-6 flex flex-col gap-4 items-center text-center shadow-[4px_4px_0px_black]">
          <div className="w-12 h-12 bg-black flex items-center justify-center"><CheckCircle className="w-6 h-6 text-[#FF00FF]" /></div>
          <div className="font-black text-xs uppercase tracking-widest text-zinc-500">Match</div>
          <div className="font-black text-xl text-black uppercase">{plan.ratingScore}%</div>
        </div>
        <div className="bg-white border-4 border-black p-6 flex flex-col gap-4 items-center text-center shadow-[4px_4px_0px_black]">
          <div className="w-12 h-12 bg-black flex items-center justify-center"><Clock className="w-6 h-6 text-[#FFD600]" /></div>
          <div className="font-black text-xs uppercase tracking-widest text-zinc-500">Duration</div>
          <div className="font-black text-xl text-black uppercase">{plan.totalDuration || plan.duration}</div>
        </div>
        <div className="bg-white border-4 border-black p-6 flex flex-col gap-4 items-center text-center shadow-[4px_4px_0px_black]">
          <div className="w-12 h-12 bg-black flex items-center justify-center"><Users className="w-6 h-6 text-white" /></div>
          <div className="font-black text-xs uppercase tracking-widest text-zinc-500">Consensus</div>
          <div className="font-black text-xl text-black uppercase">{plan.groupVotePercentage}</div>
        </div>
        <div className="bg-white border-4 border-black p-6 flex flex-col gap-4 items-center text-center shadow-[4px_4px_0px_black]">
          <div className="w-12 h-12 bg-black flex items-center justify-center"><span className="font-black text-white text-xl">₹</span></div>
          <div className="font-black text-xs uppercase tracking-widest text-zinc-500">Cost</div>
          <div className="font-black text-md text-black uppercase">{plan.totalEstimatedCost || plan.estimatedCost}</div>
        </div>
      </div>

      <BrutalCard className="p-12 mb-16 bg-white">
        <h3 className="font-black text-black tracking-widest uppercase mb-10 border-b-4 border-black pb-4 text-3xl">MASTER PLAN</h3>
        
        <div className="space-y-12">
          {(plan.itinerary || []).map((item, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-black flex items-center justify-center font-black text-3xl text-white flex-shrink-0 shadow-[4px_4px_0px_#FF00FF]">{item.stopNumber}</div>
              <div className="flex-1 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_black]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <h4 className="font-black text-2xl text-black uppercase">{item.placeName}</h4>
                  <span className="font-black text-sm text-black bg-[var(--color-brutal-yellow)] px-4 py-2 border-2 border-black">{item.time}</span>
                </div>
                <div className="text-zinc-500 font-black text-xs uppercase tracking-widest mb-4">{item.placeType} // {item.area}</div>
                <p className="text-black font-bold uppercase text-sm tracking-wide mb-4">{item.whatToDo}</p>
                {item.whatToOrder && (
                  <div className="bg-black text-white px-4 py-2 inline-block font-black text-xs uppercase tracking-widest">TRY: {item.whatToOrder}</div>
                )}
              </div>
            </div>
          ))}
          {(!plan.itinerary || plan.itinerary.length === 0) && (
            <p className="text-zinc-400 font-black uppercase tracking-widest text-center py-12 border-4 border-dashed border-zinc-200">Expansion pending: Itinerary generation in progress.</p>
          )}
        </div>
      </BrutalCard>

      <div className="flex justify-center">
        <button onClick={() => navigate('/')} className="brutal-button py-6 px-12 text-xl bg-white hover:bg-zinc-200 border-4 border-black shadow-[8px_8px_0px_black]">TERMINATE SESSION</button>
      </div>
    </motion.div>
  );
};

// --- Main Active Session Flow Manager ---
export default function ActiveSession() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [roomData, setRoomData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outingPlans, setOutingPlans] = useState<OutingPlan[]>([]);
  const [finalPlans, setFinalPlans] = useState<FinalPlan[]>([]);
  const [planRevealed, setPlanRevealed] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomCode), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRoomData(data);
        
        // Auto-sync steps for all members
        if (data.status === 'revealed' && data.finalPlans) {
          setStep(4);
        } else if (data.outingPlans && data.outingPlans.length > 0 && step < 3) {
          setStep(3);
        } else if (data.questions && data.questions.length > 0 && step < 1) {
          setStep(1);
        }
      }
    });
    return () => unsubscribe();
  }, [roomCode, step]);

  const isHost = localStorage.getItem(`isHost_${roomCode}`) === 'true';

  // Smart back navigation
  const handleBack = () => {
    if (step === 4 && planRevealed) { setPlanRevealed(false); return; }
    if (step > 0) { setStep(s => s - 1); return; }
    navigate('/');
  };

  // Step 0 → 1: Generate questions then enter questionnaire
  const handleEnterQuestionnaire = async () => {
    if (!roomCode || !roomData) return;
    if (roomData.questions) { setStep(1); return; }
    setIsGenerating(true);
    try {
      const q = await generateQuestions(roomData.brief, roomData.location || "Not specified", roomData.totalMembers);
      await updateDoc(doc(db, 'rooms', roomCode), { questions: q });
      setStep(1);
    } catch (err) { console.error(err); alert("Failed to generate questions."); }
    finally { setIsGenerating(false); }
  };

  // Step 1 → 2: Save responses to Firestore, then wait for others
  const handleQuestionnaireComplete = async (responses: Record<number, string>, customInsight: string) => {
    if (!roomCode || !roomData) return;
    const questions = roomData.questions || [];
    const formatted = Object.entries(responses).map(([idx, answer]) => {
      const q = questions[Number(idx)];
      return `Q: ${q?.question || q?.title || ''} → A: ${answer}`;
    });
    if (customInsight.trim()) {
      formatted.push(`Additional Insight: ${customInsight.trim()}`);
    }
    try {
      await updateDoc(doc(db, 'rooms', roomCode), {
        memberResponses: arrayUnion({ responses: formatted, timestamp: Date.now() })
      });
    } catch (e) { console.error("Failed to save responses", e); }
    setStep(2);
  };

  // Step 2 → 3: Generate outing plans via API (Host only)
  const handleGeneratePlans = async () => {
    if (!roomCode || !roomData) return;
    if (!isHost) return;

    setIsGenerating(true);
    try {
      const allResponses = (roomData.memberResponses || [])
        .map((r: any, i: number) => `Member ${i + 1}:\n${(r.responses || []).join('\n')}`)
        .join('\n\n');
      const plans = await generateOutingPlans(
        roomData.brief, roomData.location || "Not specified",
        roomData.totalMembers, allResponses || "No responses yet"
      );
      setOutingPlans(plans);
      await updateDoc(doc(db, 'rooms', roomCode), { outingPlans: plans });
    } catch (err: any) { 
      console.error(err); 
      alert("Failed to generate plans: " + (err.message || "Unknown error")); 
    }
    finally { 
      setIsGenerating(false); 
      setStep(3); 
    }
  };

  // Step 3 → 4: After voting, generate final refined plans
  const handleVotesSubmitted = async (votedIds: number[]) => {
    if (!roomCode || !roomData) return;
    const plans = outingPlans.length > 0 ? outingPlans : (roomData.outingPlans || []);
    const votedPlansData = plans.map((p: OutingPlan) => ({
      title: p.title, vibe: p.vibe, estimatedCost: p.estimatedCost,
      votesReceived: votedIds.includes(p.id) ? 1 : 0
    }));
    try {
      await updateDoc(doc(db, 'rooms', roomCode), { 
        votes: arrayUnion(...votedIds),
        status: 'revealing' 
      });
      const finals = await generateFinalPlans(
        roomData.brief, roomData.location || "Not specified",
        roomData.totalMembers, JSON.stringify(votedPlansData)
      );
      setFinalPlans(finals);
      await updateDoc(doc(db, 'rooms', roomCode), { 
        finalPlans: finals,
        status: 'revealed'
      });
      setStep(4);
    } catch (err: any) { 
      console.error(err); 
      alert("Failed to generate final plans: " + (err.message || "Unknown error")); 
    }
  };

  const activePlans = outingPlans.length > 0 ? outingPlans : (roomData?.outingPlans || []);
  const activeFinals = finalPlans.length > 0 ? finalPlans : (roomData?.finalPlans || []);

  return (
    <BrutalLayout roomCode={roomCode} onBack={handleBack}>
      <AnimatePresence mode="wait">
        {step === 0 && <EntranceScreen key="s0" roomCode={roomCode || ''} joinedCount={roomData?.joinedMembers?.length || 1} isGenerating={isGenerating} onNext={handleEnterQuestionnaire} />}
        {step === 1 && <QuestionnaireScreen key="s1" questions={roomData?.questions || []} roomCode={roomCode || ''} onComplete={handleQuestionnaireComplete} />}
        {step === 2 && <SyncScreen key="s2" roomData={roomData} isHost={isHost} isGenerating={isGenerating} onGenerate={handleGeneratePlans} />}
        {step === 3 && <ProposalsScreen key="s3" plans={activePlans} roomCode={roomCode || ''} onSubmitVotes={handleVotesSubmitted} />}
        {step === 4 && <FinalPlansScreen key="s4" finalPlans={activeFinals} revealed={planRevealed} onReveal={setPlanRevealed} />}
      </AnimatePresence>
    </BrutalLayout>
  );
}
