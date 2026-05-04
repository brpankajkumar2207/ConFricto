import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Users, CheckCircle, Clock, Flame, Power, Vote, Star, MapPin, Zap, ThumbsUp } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { generateQuestions, generateOutingPlans, generateFinalPlans } from './lib/gemini';
import type { OutingPlan, FinalPlan } from './lib/gemini';

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
<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< HEAD
const EntranceScreen = ({ onNext, roomCode, joinedCount }: { onNext: () => void, roomCode: string, joinedCount: number }) => (
=======
const EntranceScreen = ({ onNext, roomCode, joinedCount, isGenerating }: { onNext: () => void, roomCode: string, joinedCount: number, isGenerating: boolean }) => (
>>>>>>> 51fc1d9 (Backend)
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full flex flex-col justify-center md:px-12">
    <div className="mb-12">
      <div className="w-16 h-16 bg-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_#FFD600]">
        <Users className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tighter uppercase">
        READY TO<br/>EXECUTE?
      </h1>
      <div className="flex gap-4 items-center">
         <div className="w-1.5 h-12 bg-black flex-shrink-0"></div>
         <p className="text-zinc-600 font-medium max-w-sm">The squad is assembled. Time to feed your preferences into the protocol.</p>
      </div>
<<<<<<< HEAD
=======
>>>>>>> 34c2844 (Update)
const EntranceScreen = ({ onNext, roomCode, joinedCount, isGenerating }: { onNext: () => void, roomCode: string, joinedCount: number, isGenerating: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex flex-col items-center text-center">
    <div className="w-20 h-20 skeuo-card rounded-full flex items-center justify-center mb-8">
      <Users className="w-8 h-8 text-rose-500" />
<<<<<<< HEAD
=======
>>>>>>> 030c452 (Update)
>>>>>>> 34c2844 (Update)
=======
>>>>>>> 51fc1d9 (Backend)
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
      
<<<<<<< HEAD
<<<<<<< HEAD
      <button onClick={onNext} disabled={isGenerating} className="w-full skeuo-button-primary py-4 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed">
        <span>{isGenerating ? "GENERATING QUESTIONS..." : "ENTER QUESTIONNAIRE"}</span>
        {!isGenerating && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
=======
<<<<<<< HEAD
      <button onClick={onNext} className="w-full brutal-button-primary py-4 flex items-center justify-between px-6 group">
        <span>BEGIN PROTOCOL</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
=======
      <button onClick={onNext} disabled={isGenerating} className="w-full skeuo-button-primary py-4 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed">
        <span>{isGenerating ? "GENERATING QUESTIONS..." : "ENTER QUESTIONNAIRE"}</span>
        {!isGenerating && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
>>>>>>> 030c452 (Update)
>>>>>>> 34c2844 (Update)
=======
      <button onClick={onNext} disabled={isGenerating} className="w-full brutal-button-primary py-4 flex items-center justify-between px-6 group disabled:opacity-50">
        <span>{isGenerating ? "GENERATING..." : "BEGIN PROTOCOL"}</span>
        {!isGenerating && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
>>>>>>> 51fc1d9 (Backend)
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
const QuestionnaireScreen = ({ onComplete, questions, roomCode }: { onComplete: (responses: Record<number, string>) => void, questions: any[], roomCode: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  
  const handleAnswer = (answer: string) => {
    const newResponses = { ...responses, [currentIndex]: answer };
    setResponses(newResponses);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      onComplete(newResponses);
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
<<<<<<< HEAD
<<<<<<< HEAD
          <SkeuoCard className="p-10">
            <h2 className="text-3xl font-display font-bold tracking-tight mb-8 text-zinc-800">
              {currentQ.question || currentQ.title}
=======
<<<<<<< HEAD
=======
>>>>>>> 51fc1d9 (Backend)
          <BrutalCard className="p-10">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-12 text-black">
              {currentQ.question || currentQ.title}
<<<<<<< HEAD
>>>>>>> 030c452 (Update)
>>>>>>> 34c2844 (Update)
=======
>>>>>>> 51fc1d9 (Backend)
            </h2>

            <div className="flex flex-col gap-4">
              {currentQ.options.map((opt: string, i: number) => (
                <button 
<<<<<<< HEAD
<<<<<<< HEAD
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="w-full text-left skeuo-button px-6 py-5 flex items-center justify-between group"
=======
<<<<<<< HEAD
                  onClick={handleNext}
                  className="mt-8 w-full brutal-button bg-[var(--color-brutal-pink)] text-white py-6 font-black tracking-widest uppercase transition-all flex items-center justify-between px-8"
>>>>>>> 34c2844 (Update)
                >
                  <span className="text-lg font-bold text-zinc-700">{opt}</span>
                  <div className="w-8 h-8 rounded-full skeuo-inset flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-rose-500" />
                  </div>
                </button>
<<<<<<< HEAD
              ))}
            </div>
          </SkeuoCard>
=======
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {currentQ.options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={handleNext}
                    className="w-full text-left brutal-button px-8 py-6 flex items-center justify-between group bg-white hover:bg-[var(--color-brutal-yellow)]"
                  >
                    <span className="text-xl font-black text-black uppercase tracking-wide">{opt}</span>
                    <ChevronRight className="w-6 h-6 text-black group-hover:translate-x-2 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </BrutalCard>
=======
=======
>>>>>>> 51fc1d9 (Backend)
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="w-full text-left brutal-button px-8 py-6 flex items-center justify-between group bg-white hover:bg-[var(--color-brutal-yellow)]"
                >
                  <span className="text-xl font-black text-black uppercase tracking-wide">{opt}</span>
                  <ChevronRight className="w-6 h-6 text-black group-hover:translate-x-2 transition-transform" />
                </button>
              ))}
            </div>
<<<<<<< HEAD
          </SkeuoCard>
>>>>>>> 030c452 (Update)
>>>>>>> 34c2844 (Update)
=======
          </BrutalCard>
>>>>>>> 51fc1d9 (Backend)
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
<<<<<<< HEAD
<<<<<<< HEAD
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
=======
<<<<<<< HEAD
=======
>>>>>>> 51fc1d9 (Backend)
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b-8 border-black pb-8">
>>>>>>> 34c2844 (Update)
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-zinc-800">Pick Your Favorites</h2>
          <p className="text-zinc-500 mt-2">Vote for up to 3 plans that excite you most.</p>
        </div>
<<<<<<< HEAD
        <div className="skeuo-inset rounded-full px-6 py-2 font-bold text-zinc-500 tracking-widest uppercase text-sm">
          {selectedIds.length}/3 Selected
        </div>
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {plans.map((plan) => {
          const isSelected = selectedIds.includes(plan.id);
          return (
            <div
              key={plan.id}
              onClick={() => toggleVote(plan.id)}
              className={`skeuo-card p-6 cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-rose-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-rose-500 text-white' : 'skeuo-inset text-zinc-600'}`}>
                    {isSelected ? <CheckCircle className="w-5 h-5" /> : plan.id}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-800">{plan.title}</h3>
                </div>
                <div className={`text-xl font-black ${plan.groupFitScore >= 90 ? 'text-emerald-500' : plan.groupFitScore >= 75 ? 'text-amber-500' : 'text-zinc-400'}`}>
                  {plan.groupFitScore}%
                </div>
              </div>
              <p className="text-zinc-600 text-sm mb-3">{plan.vibe}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-bold skeuo-inset px-3 py-1 rounded-full text-zinc-500">{plan.estimatedCost}</span>
                <span className="text-xs font-bold skeuo-inset px-3 py-1 rounded-full text-zinc-500">{plan.duration}</span>
                <span className="text-xs font-bold skeuo-inset px-3 py-1 rounded-full text-zinc-500">{plan.energyLevel}</span>
              </div>
              <p className="text-xs text-zinc-400 italic">{plan.bestFor}</p>
            </div>
          );
        })}
      </div>

=======
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {mockPlans.map((plan, idx) => (
          <BrutalCard key={idx} className="relative overflow-hidden group flex flex-col h-full bg-white">
            <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-8">
              <div className="w-16 h-16 border-4 border-black bg-[var(--color-brutal-yellow)] flex items-center justify-center font-black text-3xl text-black shadow-[4px_4px_0px_black]">{plan.id}</div>
              <div className="text-right">
                <div className="text-5xl font-black text-black">{plan.score}%</div>
                <div className="text-sm font-black text-[var(--color-brutal-pink)] uppercase tracking-widest">Match</div>
              </div>
            </div>
            
            <h3 className="text-3xl font-black text-black mb-8 uppercase tracking-wide">{plan.title}</h3>
            
            <div className="space-y-6 mb-12 flex-grow">
              {plan.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex gap-6 items-center">
                  <div className="border-2 border-black bg-white px-3 py-2 font-black text-sm text-black">{step.time}</div>
                  <div>
                    <div className="font-black text-black uppercase tracking-wide">{step.act}</div>
                    <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{step.loc}</div>
=======
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-zinc-800">Pick Your Favorites</h2>
          <p className="text-zinc-500 mt-2">Vote for up to 3 plans that excite you most.</p>
        </div>
        <div className="skeuo-inset rounded-full px-6 py-2 font-bold text-zinc-500 tracking-widest uppercase text-sm">
          {selectedIds.length}/3 Selected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
=======
        <div className="brutal-inset bg-black text-white px-6 py-3 font-black tracking-widest uppercase text-lg">
          {selectedIds.length}/3 SELECTED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
>>>>>>> 51fc1d9 (Backend)
        {plans.map((plan) => {
          const isSelected = selectedIds.includes(plan.id);
          return (
            <BrutalCard 
              key={plan.id} 
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
      </div>
      
<<<<<<< HEAD
      <div className="mt-16 flex justify-center">
        <button onClick={onNext} className="brutal-button-primary py-6 px-16 font-black tracking-widest uppercase text-2xl flex items-center gap-4">
          <span>LOCK IN</span>
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>
=======
>>>>>>> 34c2844 (Update)
=======
>>>>>>> 51fc1d9 (Backend)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 030c452 (Update)
>>>>>>> 34c2844 (Update)
=======
>>>>>>> 51fc1d9 (Backend)
    </motion.div>
  );
};

// --- Screen 5: Final Plans ---
const FinalPlansScreen = ({ finalPlans }: { finalPlans: FinalPlan[] }) => {
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const navigate = useNavigate();
  const ratingColor = (rating: string) => {
    if (rating === "Perfect Match") return "text-emerald-500";
    if (rating === "Great Choice") return "text-blue-500";
    return "text-amber-500";
  };
  const ratingBg = (rating: string) => {
    if (rating === "Perfect Match") return "bg-emerald-100 text-emerald-700";
    if (rating === "Great Choice") return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  };
=======
  const [revealed, setRevealed] = useState(false);
>>>>>>> 51fc1d9 (Backend)

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

          <div className="w-full space-y-8">
            {finalPlans.map((plan, idx) => (
              <BrutalCard 
                key={plan.id}
                onClick={() => setRevealed(true)} 
                className={`${idx === 0 ? 'bg-[var(--color-brutal-yellow)]' : 'bg-white'} border-4 border-black flex flex-col md:flex-row gap-8 justify-between items-center cursor-pointer hover:translate-y-[-4px] transition-transform`}
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
          </div>
        </>
      ) : (
        <LockedPlanScreen plan={finalPlans[0]} />
      )}
    </motion.div>
  );
};

// --- Screen 6: The Locked Plan ---
<<<<<<< HEAD
const LockedPlanScreen = () => {
>>>>>>> 34c2844 (Update)
=======
const LockedPlanScreen = ({ plan }: { plan: FinalPlan }) => {
>>>>>>> 51fc1d9 (Backend)
  const navigate = useNavigate();
  const ratingColor = (rating: string) => {
    if (rating === "Perfect Match") return "text-emerald-500";
    if (rating === "Great Choice") return "text-blue-500";
    return "text-amber-500";
  };
  const ratingBg = (rating: string) => {
    if (rating === "Perfect Match") return "bg-emerald-100 text-emerald-700";
    if (rating === "Great Choice") return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
<<<<<<< HEAD
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto skeuo-card rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
=======
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
>>>>>>> 51fc1d9 (Backend)
        </div>
        <h2 className="text-5xl font-display font-bold tracking-tight text-zinc-800">Consensus Reached</h2>
        <p className="text-zinc-500 mt-3 text-lg">Here are your group's best-fit plans.</p>
      </div>

<<<<<<< HEAD
      <div className="space-y-8 mb-12">
        {finalPlans.map((plan, idx) => (
          <SkeuoCard key={plan.id} className="p-8 relative overflow-hidden">
            {idx === 0 && <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full skeuo-inset flex items-center justify-center font-bold text-xl ${ratingColor(plan.rating)}`}>{plan.id}</div>
                <div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${ratingBg(plan.rating)}`}>{plan.rating}</span>
                  <h3 className="text-2xl font-bold text-zinc-800 mt-2">{plan.title}</h3>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-black ${ratingColor(plan.rating)}`}>{plan.ratingScore}%</div>
                <div className="text-xs font-bold text-zinc-400">{plan.groupVotePercentage} votes</div>
              </div>
            </div>

            <p className="text-zinc-600 mb-4">{plan.vibe}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="skeuo-inset p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cost</div>
                <div className="font-bold text-sm text-zinc-700">{plan.estimatedCost}</div>
              </div>
              <div className="skeuo-inset p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duration</div>
                <div className="font-bold text-sm text-zinc-700">{plan.duration}</div>
              </div>
              <div className="skeuo-inset p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Energy</div>
                <div className="font-bold text-sm text-zinc-700">{plan.energyLevel}</div>
              </div>
              <div className="skeuo-inset p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Area</div>
                <div className="font-bold text-sm text-zinc-700">{plan.recommendedArea}</div>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 mb-4">
              <h4 className="font-bold text-sm text-zinc-500 uppercase tracking-widest mb-2">Why your group will love this</h4>
              <p className="text-zinc-700 text-sm leading-relaxed">{plan.whyYourGroupWillLoveThis}</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
              <h4 className="font-bold text-sm text-zinc-500 uppercase tracking-widest mb-2">What to expect</h4>
              <p className="text-zinc-700 text-sm leading-relaxed">{plan.whatToExpect}</p>
            </div>
          </SkeuoCard>
        ))}
      </div>
=======
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
>>>>>>> 51fc1d9 (Backend)

      <div className="flex flex-col sm:flex-row gap-6 justify-center">
<<<<<<< HEAD
        <button onClick={() => navigate('/')} className="skeuo-button-primary py-5 px-10">Finish</button>
=======
        <button className="brutal-button-primary py-6 px-12 text-xl">DISTRIBUTE SECURELY</button>
<<<<<<< HEAD
        <button onClick={() => navigate('/')} className="brutal-button py-6 px-12 text-xl bg-white hover:bg-zinc-200">TERMINATE SESSION</button>
=======
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto skeuo-card rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-5xl font-display font-bold tracking-tight text-zinc-800">Consensus Reached</h2>
        <p className="text-zinc-500 mt-3 text-lg">Here are your group's best-fit plans.</p>
      </div>

      <div className="space-y-8 mb-12">
        {finalPlans.map((plan, idx) => (
          <SkeuoCard key={plan.id} className="p-8 relative overflow-hidden">
            {idx === 0 && <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full skeuo-inset flex items-center justify-center font-bold text-xl ${ratingColor(plan.rating)}`}>{plan.id}</div>
                <div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${ratingBg(plan.rating)}`}>{plan.rating}</span>
                  <h3 className="text-2xl font-bold text-zinc-800 mt-2">{plan.title}</h3>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-black ${ratingColor(plan.rating)}`}>{plan.ratingScore}%</div>
                <div className="text-xs font-bold text-zinc-400">{plan.groupVotePercentage} votes</div>
              </div>
            </div>

            <p className="text-zinc-600 mb-4">{plan.vibe}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="skeuo-inset p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cost</div>
                <div className="font-bold text-sm text-zinc-700">{plan.estimatedCost}</div>
              </div>
              <div className="skeuo-inset p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duration</div>
                <div className="font-bold text-sm text-zinc-700">{plan.duration}</div>
              </div>
              <div className="skeuo-inset p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Energy</div>
                <div className="font-bold text-sm text-zinc-700">{plan.energyLevel}</div>
              </div>
              <div className="skeuo-inset p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Area</div>
                <div className="font-bold text-sm text-zinc-700">{plan.recommendedArea}</div>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 mb-4">
              <h4 className="font-bold text-sm text-zinc-500 uppercase tracking-widest mb-2">Why your group will love this</h4>
              <p className="text-zinc-700 text-sm leading-relaxed">{plan.whyYourGroupWillLoveThis}</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
              <h4 className="font-bold text-sm text-zinc-500 uppercase tracking-widest mb-2">What to expect</h4>
              <p className="text-zinc-700 text-sm leading-relaxed">{plan.whatToExpect}</p>
            </div>
          </SkeuoCard>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <button onClick={() => navigate('/')} className="skeuo-button-primary py-5 px-10">Finish</button>
>>>>>>> 030c452 (Update)
>>>>>>> 34c2844 (Update)
=======
        <button onClick={() => navigate('/')} className="brutal-button py-6 px-12 text-xl bg-white hover:bg-zinc-200 border-4 border-black shadow-[8px_8px_0px_black]">TERMINATE SESSION</button>
>>>>>>> 51fc1d9 (Backend)
      </div>
    </motion.div>
  );
};

// --- Main Active Session Flow Manager ---
export default function ActiveSession() {
  const { roomCode } = useParams();
  const [step, setStep] = useState(0);
  const [roomData, setRoomData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outingPlans, setOutingPlans] = useState<OutingPlan[]>([]);
  const [finalPlans, setFinalPlans] = useState<FinalPlan[]>([]);

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

  // Step 1 → 2: Save responses to Firestore, then generate outing plans
  const handleQuestionnaireComplete = async (responses: Record<number, string>) => {
    if (!roomCode || !roomData) return;
    const questions = roomData.questions || [];
    const formatted = Object.entries(responses).map(([idx, answer]) => {
      const q = questions[Number(idx)];
      return `Q: ${q?.question || q?.title || ''} → A: ${answer}`;
    });
    try {
      await updateDoc(doc(db, 'rooms', roomCode), {
        memberResponses: arrayUnion({ responses: formatted, timestamp: Date.now() })
      });
    } catch (e) { console.error("Failed to save responses", e); }
    setStep(2);
  };

  // Step 2 → 3: After sync screen, generate outing plans via API
  const handleSyncDone = async () => {
    if (!roomCode || !roomData) { setStep(3); return; }
    
    // If plans already exist, just move forward
    if (roomData.outingPlans && roomData.outingPlans.length > 0) {
      setStep(3);
      return;
    }

    // Only host triggers the generation
    if (!isHost) {
      // Non-hosts stay on sync screen until roomData updates
      return;
    }

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
    } catch (err) { console.error(err); alert("Failed to generate plans."); }
    finally { setIsGenerating(false); setStep(3); }
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
    } catch (err) { console.error(err); alert("Failed to generate final plans."); }
  };

  const activePlans = outingPlans.length > 0 ? outingPlans : (roomData?.outingPlans || []);
  const activeFinals = finalPlans.length > 0 ? finalPlans : (roomData?.finalPlans || []);

  return (
    <SkeuoLayout roomCode={roomCode}>
      <AnimatePresence mode="wait">
        {step === 0 && <EntranceScreen key="s0" roomCode={roomCode || ''} joinedCount={roomData?.joinedMembers?.length || 1} isGenerating={isGenerating} onNext={handleEnterQuestionnaire} />}
        {step === 1 && <QuestionnaireScreen key="s1" questions={roomData?.questions || []} roomCode={roomCode || ''} onComplete={handleQuestionnaireComplete} />}
        {step === 2 && <SyncScreen key="s2" onSimulateDone={handleSyncDone} />}
        {step === 3 && <ProposalsScreen key="s3" plans={activePlans} roomCode={roomCode || ''} onSubmitVotes={handleVotesSubmitted} />}
        {step === 4 && <FinalPlansScreen key="s4" finalPlans={activeFinals} />}
      </AnimatePresence>
    </SkeuoLayout>
  );
}
