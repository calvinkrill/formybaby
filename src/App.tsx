/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Heart, 
  Mail, 
  MessageCircle, 
  Image as ImageIcon, 
  Music, 
  Activity, 
  Lock, 
  Star,
  ChevronLeft,
  X,
  Play,
  Users
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { LETTERS, MOODS, MEMORIES, SONGS, DAILY_MESSAGES } from './constants';
import { Letter, MoodResponse } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString()
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Views
type View = 'splash' | 'landing' | 'home' | 'letters' | 'moods' | 'gallery' | 'music' | 'heartbeat' | 'secret';

// Game Component
const CatchHeartsGame = ({ onBack }: { onBack: () => void }) => {
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts(prev => [
        ...prev,
        { 
          id: Date.now(), 
          x: Math.random() * 80 + 10, 
          y: -10 
        }
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const catchHeart = (id: number) => {
    setScore(s => s + 1);
    setHearts(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-[#0A0B1A]/95 z-50 overflow-hidden backdrop-blur-md">
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <button onClick={onBack} className="text-indigo-400"><ChevronLeft /></button>
        <div className="bg-white/10 border border-white/10 px-4 py-1 rounded-full shadow-sm">
          <span className="text-indigo-300 font-bold">Hearts: {score}</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-full pointer-events-none">
        <p className="text-indigo-300 italic font-serif">catch my love!</p>
      </div>
      {hearts.map(h => (
        <motion.button
          key={h.id}
          initial={{ y: -50, x: `${h.x}%`, opacity: 1 }}
          animate={{ y: '110vh' }}
          transition={{ duration: 4, ease: 'linear' }}
          onClick={() => catchHeart(h.id)}
          className="absolute text-indigo-400 p-2 pointer-events-auto drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
        >
          <Heart size={32} fill="currentColor" />
        </motion.button>
      ))}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>('splash');
  const [showGame, setShowGame] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [activeMood, setActiveMood] = useState<MoodResponse | null>(null);
  const [dailyMessage, setDailyMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [totalVisits, setTotalVisits] = useState<number | null>(null);

  useEffect(() => {
    // Log the visit
    const logVisit = async () => {
      try {
        await addDoc(collection(db, 'visits'), {
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent
        });
      } catch (error) {
        // Silently handle visit logging errors to not break UX
        console.error('Error logging visit:', error);
      }
    };
    logVisit();

    // Listen for total visits (count)
    // Note: In Firestore, for real-time counts of a large collection, 
    // a counter doc is better, but for this small-scale app, 
    // we can listen to the collection snapshot size (though expensive at scale)
    // or just listen to the latest snapshot.
    const q = query(collection(db, 'visits'));
    const unsubscribeVisits = onSnapshot(q, (snapshot) => {
      setTotalVisits(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'visits');
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Pick a random daily message on load
    const msg = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];
    setDailyMessage(msg);

    // Auto-transition from splash to landing
    if (view === 'splash') {
      const timer = setTimeout(() => setView('landing'), 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      unsubscribeVisits();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [view]);

  const handleSecretAccess = () => {
    if (password.toLowerCase() === 'baby') {
      setIsUnlocked(true);
    } else {
      alert('Wrong password, my love!');
    }
  };

  const SplashScreen = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen text-center p-6 space-y-8 z-50"
    >
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-indigo-500 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Heart size={100} className="text-indigo-400 fill-indigo-400/10 drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]" strokeWidth={1} />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="space-y-2"
      >
        <p className="text-indigo-200 font-serif italic text-2xl tracking-widest">welcome to your safe place...</p>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em]">crafted with love by camz</p>
      </motion.div>
    </motion.div>
  );

  const LandingPage = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen text-center p-6 space-y-12 relative z-10"
    >
      <motion.div
        animate={{ y: [0, -15, 0], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative group cursor-pointer"
        onClick={() => setView('home')}
      >
        <div className="absolute inset-0 bg-indigo-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <Heart size={100} className="text-white fill-white/10 relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" strokeWidth={0.5} />
      </motion.div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-serif font-light text-white tracking-tight">hi baby :&gt;</h1>
          <p className="text-slate-400 text-xl font-serif italic">i made this specifically for you.</p>
        </div>
        <div className="max-w-xs mx-auto">
          <p className="text-indigo-300/60 font-sans text-xs uppercase tracking-[0.4em] leading-relaxed">
            if your day was hard, stay here for a while okay?
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05, letterSpacing: '0.4em' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setView('home')}
        className="group relative px-20 py-4 bg-indigo-500 text-white rounded-full overflow-hidden transition-all duration-300"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <span className="relative z-10 font-bold tracking-[0.2em] text-xs uppercase">Start Now</span>
      </motion.button>
    </motion.div>
  );

  const HomeView = () => (
    <div className="p-8 pb-32 space-y-12 max-w-lg mx-auto relative z-10">
      <header className="flex justify-between items-end py-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-light tracking-tight text-indigo-100 font-serif">Baby's Safe Place</h1>
          <p className="text-slate-500 font-sans text-xs italic">crafted with love by camz</p>
        </div>
        <button onClick={() => setView('secret')} className="text-slate-600 hover:text-indigo-400 transition-colors bg-white/5 p-2 rounded-full border border-white/5">
          <Lock size={18} />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'letters', label: 'Open Letters', icon: Mail, color: 'bg-white/5 text-indigo-300 border-white/5' },
          { id: 'moods', label: 'Mood Buttons', icon: MessageCircle, color: 'bg-white/5 text-purple-300 border-white/5' },
          { id: 'gallery', label: 'Memory Gallery', icon: ImageIcon, color: 'bg-white/5 text-amber-300 border-white/5', locked: true },
          { id: 'music', label: 'Music Room', icon: Music, color: 'bg-white/5 text-indigo-300 border-white/5' },
          { id: 'heartbeat', label: 'Heartbeat', icon: Activity, color: 'bg-white/5 text-red-300 border-white/5' },
          { id: 'game', label: 'Play Game', icon: Star, color: 'bg-indigo-900/20 text-indigo-300 border-indigo-500/20' },
        ].map((item) => (
          <motion.button
            key={item.id}
            whileHover={item.locked ? {} : { y: -4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            whileTap={item.locked ? {} : { scale: 0.98 }}
            onClick={() => {
              if (item.locked) {
                alert("This space is still being prepared with love... stay tuned baby! ❤️");
                return;
              }
              item.id === 'game' ? setShowGame(true) : setView(item.id as View);
            }}
            className={`${item.color} ${item.locked ? 'opacity-40 grayscale cursor-not-allowed' : ''} p-6 rounded-3xl flex flex-col items-center gap-3 border transition-all relative overflow-hidden`}
          >
            {item.locked && (
              <div className="absolute top-2 right-2 text-indigo-400">
                <Lock size={12} />
              </div>
            )}
            <item.icon size={28} strokeWidth={1.5} />
            <span className="font-sans text-[10px] uppercase tracking-widest font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>

      <motion.div 
        className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2.5rem] border border-indigo-500/20 p-8 text-center space-y-6 relative overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
        <Star size={24} className="mx-auto text-yellow-400/80 fill-yellow-400/20" />
        <p className="text-slate-400 font-sans italic text-sm">"baby, press me"</p>
        <button 
          onClick={() => setDailyMessage(DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)])}
          className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-100 rounded-3xl font-serif text-xl active:scale-95 transition-all shadow-xl"
        >
          {dailyMessage}
        </button>
      </motion.div>
    </div>
  );

  const LettersView = () => (
    <div className="p-8 pb-32 space-y-8 max-w-lg mx-auto relative z-10">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('home')} className="text-indigo-400 bg-white/5 p-2 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xs uppercase tracking-[0.3em] text-indigo-300 font-sans">💌 Open Letters</h2>
      </div>
      <div className="flex flex-col gap-3">
        {LETTERS.map((letter) => (
          <motion.button
            key={letter.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedLetter(letter)}
            className={`bg-white/5 border border-white/10 p-5 rounded-2xl text-left flex justify-between items-center group hover:bg-white/10 transition-all`}
          >
            <span className="text-sm font-sans tracking-wide text-slate-300">{letter.title}</span>
            <Mail size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0B1A]/80 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div 
              layoutId={`letter-${selectedLetter.id}`}
              className="bg-[#15172b] border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <button 
                onClick={() => setSelectedLetter(null)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>
              <h3 className="text-xs uppercase tracking-widest text-indigo-400 font-sans mb-8">{selectedLetter.title}</h3>
              <p className="text-slate-300 leading-relaxed font-serif text-lg italic">
                "{selectedLetter.content}"
              </p>
              <div className="mt-10 pt-8 border-t border-white/5 flex justify-center">
                <Heart size={24} className="text-indigo-500 fill-indigo-500/20 animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const MoodsView = () => (
    <div className="p-8 pb-32 space-y-8 max-w-lg mx-auto relative z-10">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('home')} className="text-indigo-400 bg-white/5 p-2 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xs uppercase tracking-[0.3em] text-indigo-300 font-sans">🌙 Mood Buttons</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {MOODS.map((m) => (
          <button
            key={m.mood}
            onClick={() => setActiveMood(m)}
            className={`p-4 rounded-xl font-sans text-[11px] uppercase tracking-wider transition-all border ${activeMood?.mood === m.mood ? 'bg-indigo-900/40 border-indigo-500/40 text-indigo-200' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {m.mood}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeMood ? (
          <motion.div
            key={activeMood.mood}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-500/5 p-10 rounded-[2.5rem] border border-indigo-500/10 text-center space-y-6"
          >
            <p className="text-indigo-100 font-serif text-lg italic leading-relaxed">
              "{activeMood.message}"
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </div>
          </motion.div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-slate-600 italic text-sm space-y-4">
            <Heart size={32} strokeWidth={1} className="opacity-20" />
            <p>how are you feeling today, baby?</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const GalleryView = () => (
    <div className="p-8 pb-32 space-y-8 max-w-lg mx-auto relative z-10">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('home')} className="text-indigo-400 bg-white/5 p-2 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xs uppercase tracking-[0.3em] text-indigo-300 font-sans">📸 Memory Gallery</h2>
      </div>
      <div className="grid grid-cols-1 gap-12">
        {MEMORIES.map((memory, i) => (
          <motion.div 
            key={memory.id}
            initial={{ opacity: 0, rotate: i % 2 === 0 ? -3 : 3, y: 20 }}
            animate={{ opacity: 1, rotate: i % 2 === 0 ? -3 : 3, y: 0 }}
            className="bg-[#F5F5F0] p-4 pt-4 pb-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-200 flex flex-col gap-6 relative"
          >
            <div className="aspect-[4/5] bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden rounded-[2px] shadow-inner">
               <ImageIcon size={64} strokeWidth={0.5} className="opacity-30" />
            </div>
            <div className="font-serif italic text-slate-800 px-4 space-y-3">
              <p className="text-base leading-relaxed tracking-tight">"{memory.content}"</p>
              <div className="flex justify-between items-center bg-black/5 px-3 py-1 rounded-full">
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">{memory.date}</p>
                <Heart size={14} className="text-red-400 fill-red-400 opacity-30" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const MusicView = () => (
    <div className="p-8 pb-32 space-y-8 max-w-lg mx-auto relative z-10">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('home')} className="text-indigo-400 bg-white/5 p-2 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xs uppercase tracking-[0.3em] text-indigo-300 font-sans">🎵 Music Room</h2>
      </div>
      <div className="space-y-3">
        {SONGS.map((song) => (
          <div key={song.title} className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
            <div className="space-y-1 flex-1 overflow-hidden">
              <h4 className="font-serif italic text-indigo-100 text-lg truncate">{song.title}</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{song.artist}</p>
              {song.note && <p className="text-[11px] italic text-indigo-300/50 mt-2">"{song.note}"</p>}
            </div>
            <a 
              href={song.url} 
              target="_blank" 
              rel="noreferrer"
              className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl"
            >
              <Play size={20} fill="currentColor" />
            </a>
          </div>
        ))}
      </div>
      <div className="bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-500/10 text-center space-y-3">
        <p className="text-xs text-indigo-400 uppercase tracking-[0.2em] font-sans">this song reminds me of you</p>
        <p className="font-serif italic text-indigo-100 text-xl">All of Me - John Legend</p>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full bg-indigo-500" 
          />
        </div>
      </div>
    </div>
  );

  const HeartbeatView = () => (
    <div className="p-8 pb-32 min-h-screen flex flex-col items-center justify-center space-y-12 max-w-lg mx-auto relative z-10">
      <div className="absolute top-8 left-8">
        <button onClick={() => setView('home')} className="text-indigo-400 bg-white/5 p-2 rounded-full"><ChevronLeft size={20} /></button>
      </div>
      
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-red-500 rounded-full blur-[60px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          <Heart size={140} className="text-red-500 fill-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]" />
        </motion.div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-3xl font-serif italic text-indigo-50">you are loved</h3>
        <p className="text-slate-500 font-sans text-xs uppercase tracking-[0.4em] animate-pulse">established 2026</p>
      </div>

      <p className="text-indigo-300/40 text-xs italic max-w-[220px] text-center leading-relaxed">
        "Every heartbeat is a reminder of how much you mean to me, baby."
      </p>
    </div>
  );

  const SecretView = () => (
    <div className="p-8 pb-32 min-h-screen flex flex-col items-center justify-center space-y-12 max-w-lg mx-auto relative z-10">
      <div className="absolute top-8 left-8">
        <button onClick={() => setView('home')} className="text-indigo-400 bg-white/5 p-2 rounded-full"><ChevronLeft size={20} /></button>
      </div>

      {!isUnlocked ? (
        <div className="w-full space-y-8 text-center bg-white/5 p-12 rounded-[3rem] border border-white/5 backdrop-blur-md">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif italic text-indigo-100">Enter Secret Code</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-sans">for your eyes only</p>
          </div>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password..."
            className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 outline-none focus:border-indigo-500/40 text-center font-serif text-xl text-indigo-100 transition-all"
          />
          <button 
            onClick={handleSecretAccess}
            className="w-full py-4 bg-indigo-500 text-white rounded-full font-sans uppercase tracking-[0.2em] text-xs font-semibold shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all"
          >
            unlock portal
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full space-y-8 text-center"
        >
          <h2 className="text-4xl font-serif italic text-indigo-100">welcome home, baby.</h2>
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-3xl space-y-8">
            <p className="text-slate-300 font-serif text-lg italic leading-relaxed">
              "I'm writing this secret message just for you on this beautiful day in May 2026. You are the most important person in my life.
              I can't wait for all our future plans together. You are my home, my peace, and my forever."
            </p>
            <div className="flex justify-center gap-6">
              {[Star, Heart, Music].map((Icon, i) => (
                <div key={i} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-300 border border-white/5 hover:border-indigo-500/30 transition-all">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-sans italic">our future plans await...</p>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0B1A] font-sans text-slate-200 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="fixed -top-48 -left-48 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-48 -right-48 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <AnimatePresence mode="wait">
        {showGame && <CatchHeartsGame onBack={() => setShowGame(false)} />}
        {view === 'splash' && <SplashScreen key="splash" />}
        {view === 'landing' && <LandingPage key="landing" />}
        {view === 'home' && <HomeView key="home" />}
        {view === 'letters' && <LettersView key="letters" />}
        {view === 'moods' && <MoodsView key="moods" />}
        {view === 'gallery' && <GalleryView key="gallery" />}
        {view === 'music' && <MusicView key="music" />}
        {view === 'heartbeat' && <HeartbeatView key="heartbeat" />}
        {view === 'secret' && <SecretView key="secret" />}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 w-full p-6 flex flex-col items-center pointer-events-none space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full border border-white/5 backdrop-blur-md transition-all">
              <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] ${isOnline ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50 animate-pulse'}`}></div>
              <span className="text-[9px] font-sans tracking-[0.2em] text-slate-500 uppercase italic">
                {isOnline ? 'Connected' : 'Offline Mode'} • created by camz
              </span>
            </div>
          </div>
          {totalVisits !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/10 backdrop-blur-sm"
            >
              <Users size={10} className="text-indigo-400" />
              <span className="text-[8px] font-sans tracking-[0.1em] text-indigo-300 uppercase">
                {totalVisits} visits of love
              </span>
            </motion.div>
          )}
        </div>
        <p className="text-[8px] text-slate-600 uppercase tracking-[0.4em]">
          thank you for existing, baby.
        </p>
      </footer>
    </div>
  );
}
