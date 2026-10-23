import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flame } from 'lucide-react';
import { Wish, LanternColor } from './types.ts';
import { initAudio, setAudioMuted } from './utils/audio.ts';
import { SkyCanvas } from './components/SkyCanvas.tsx';
import { SkylineBackdrop } from './components/SkylineBackdrop.tsx';
import { Header } from './components/Header.tsx';
import { CreateWishModal } from './components/CreateWishModal.tsx';
import { WishDetailModal } from './components/WishDetailModal.tsx';
import { WishesWallModal } from './components/WishesWallModal.tsx';
import { OilLampIcon } from './components/OilLampIcon.tsx';
import { Toast } from './components/Toast.tsx';

export default function App() {
  const [wishes, setWishes] = useState<Wish[]>(() => {
    try {
      const cached = localStorage.getItem('thadingyut_wishes_v1');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isWallOpen, setIsWallOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showGuideHint, setShowGuideHint] = useState(true);
  const [newlyLaunchedWish, setNewlyLaunchedWish] = useState<Wish | null>(null);

  const locallyLaunchedIdsRef = useRef<Set<string>>(new Set());

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Fetch and bidirectional sync wishes
  const fetchWishes = useCallback(async () => {
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const data = await res.json();
        const serverWishes: Wish[] = Array.isArray(data.wishes) ? data.wishes : [];

        setWishes((prev) => {
          const map = new Map<string, Wish>();
          prev.forEach((w) => map.set(w.id, w));

          serverWishes.forEach((w) => {
            if (map.has(w.id)) {
              const existing = map.get(w.id)!;
              map.set(w.id, { ...existing, likes: Math.max(existing.likes || 0, w.likes || 0) });
            } else {
              map.set(w.id, w);
            }
          });

          const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);

          try {
            localStorage.setItem('thadingyut_wishes_v1', JSON.stringify(merged));
          } catch {
            // Ignored
          }

          // If local client has wishes that the serverless instance lost after a cold-start, sync them to server
          if (merged.length > serverWishes.length) {
            fetch('/api/wishes/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wishes: merged }),
            }).catch(() => {});
          }

          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch initial wishes:', err);
    }
  }, []);

  useEffect(() => {
    fetchWishes();

    // Check stored mute preference
    const storedMuted = localStorage.getItem('thadingyut_audio_muted') === 'true';
    setIsMuted(storedMuted);
    setAudioMuted(storedMuted);

    // Audio init on first gesture
    const handleFirstGesture = () => {
      initAudio();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [fetchWishes]);

  // Periodic polling fallback for serverless environments (Vercel)
  useEffect(() => {
    const pollTimer = setInterval(() => {
      fetchWishes();
    }, 12000);
    return () => clearInterval(pollTimer);
  }, [fetchWishes]);

  // Connect to SSE stream for live real-time sync across all users
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/wishes/stream');

        eventSource.onopen = () => {
          setIsLiveConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') {
              setIsLiveConnected(true);
            } else if (data.type === 'new_wish' && data.wish) {
              const incomingWish: Wish = data.wish;

              // If already launched locally by this user, do not spawn a duplicate lantern
              if (locallyLaunchedIdsRef.current.has(incomingWish.id)) {
                return;
              }

              setWishes((prev) => {
                if (prev.some((w) => w.id === incomingWish.id)) return prev;
                const next = [incomingWish, ...prev];
                try {
                  localStorage.setItem('thadingyut_wishes_v1', JSON.stringify(next));
                } catch {
                  // Ignored
                }
                return next;
              });
              setNewlyLaunchedWish(incomingWish);
            } else if (data.type === 'wish_liked' && data.id) {
              setWishes((prev) => {
                const next = prev.map((w) =>
                  w.id === data.id ? { ...w, likes: data.likes } : w
                );
                try {
                  localStorage.setItem('thadingyut_wishes_v1', JSON.stringify(next));
                } catch {
                  // Ignored
                }
                return next;
              });
              setSelectedWish((cur) =>
                cur && cur.id === data.id ? { ...cur, likes: data.likes } : cur
              );
            }
          } catch {
            // Heartbeat or raw message
          }
        };

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          eventSource?.close();
          // Try reconnect after 4s
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.warn('SSE connection error:', err);
        reconnectTimeout = setTimeout(connectSSE, 4000);
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleToggleAudio = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    setAudioMuted(nextState);
    showToast(nextState ? 'ခေါင်းလောင်းသံ ပိတ်လိုက်ပါပြီ' : 'ခေါင်းလောင်းသံ ဖွင့်လိုက်ပါပြီ');
  };

  // Launch a new wish
  const handleCreateWish = async (wishData: {
    name: string;
    text: string;
    color: LanternColor;
  }): Promise<Wish | null> => {
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wishData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'မီးပုံးပျံ လွှတ်တင်ခြင်း မအောင်မြင်ပါ');
      }

      const data = await res.json();
      const newWish: Wish = data.wish;

      locallyLaunchedIdsRef.current.add(newWish.id);
      setWishes((prev) => {
        const next = [newWish, ...prev.filter((w) => w.id !== newWish.id)];
        try {
          localStorage.setItem('thadingyut_wishes_v1', JSON.stringify(next));
        } catch {
          // Ignored
        }
        return next;
      });
      setNewlyLaunchedWish(newWish);
      showToast('ဆုတောင်းမီးပုံးကို ကောင်းကင်သို့ အောင်မြင်စွာ လွှတ်တင်ပြီးပါပြီ! 🏮✨');
      return newWish;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Like / Sadhu reaction
  const handleLikeWish = async (id: string) => {
    try {
      // Optimistic update
      setWishes((prev) => {
        const next = prev.map((w) => (w.id === id ? { ...w, likes: (w.likes || 0) + 1 } : w));
        try {
          localStorage.setItem('thadingyut_wishes_v1', JSON.stringify(next));
        } catch {
          // Ignored
        }
        return next;
      });
      setSelectedWish((cur) =>
        cur && cur.id === id ? { ...cur, likes: (cur.likes || 0) + 1 } : cur
      );

      await fetch(`/api/wishes/${id}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to like wish:', err);
    }
  };

  const handleSelectWish = (wish: Wish) => {
    setShowGuideHint(false);
    setSelectedWish(wish);
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] sky-bg text-amber-50 overflow-hidden select-none">
      {/* 2D Particle Canvas: Stars, Floating Lanterns, Fireworks, Shooting Stars */}
      <SkyCanvas
        wishes={wishes}
        onSelectWish={handleSelectWish}
        onSkyInteraction={() => setShowGuideHint(false)}
        newlyLaunchedWish={newlyLaunchedWish}
      />

      {/* Decorative Traditional Pagoda Horizon & Full Moon */}
      <SkylineBackdrop />

      {/* Header bar with Live Status, Mute toggle & Wishes button */}
      <Header
        wishCount={wishes.length}
        isMuted={isMuted}
        onToggleAudio={handleToggleAudio}
        onOpenWishesWall={() => {
          initAudio();
          setIsWallOpen(true);
        }}
        isLiveConnected={isLiveConnected}
      />

      {/* Floating Guide Hint */}
      {showGuideHint && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-700 opacity-90 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 backdrop-blur-md text-center text-xs text-amber-200 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>
            {wishes.length > 0
              ? 'ကောင်းကင်ရှိ မီးပုံးပျံလေးများကို နှိပ်၍ ဆုတောင်းစာများ ဖတ်ရှုပါ'
              : 'သီတင်းကျွတ် ဆုတောင်းမီးပုံးကို ပထမဆုံး စတင်လွှတ်တင်လိုက်ပါ ✨'}
          </span>
        </div>
      )}

      {/* Bottom Center Call-To-Action: Release Lantern Button */}
      <div className="absolute bottom-8 sm:bottom-7 md:bottom-8 mb-[env(safe-area-inset-bottom)] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 w-auto max-w-sm px-4 pointer-events-auto">
        <button
          onClick={() => {
            initAudio();
            setIsCreateOpen(true);
          }}
          className="group py-2.5 px-5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_24px_rgba(245,158,11,0.5)] hover:shadow-[0_0_32px_rgba(245,158,11,0.75)] active:scale-95 transition-all transform flex items-center justify-center gap-2.5 border border-amber-200/50 cursor-pointer whitespace-nowrap"
        >
          <OilLampIcon className="w-5 h-5 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)] shrink-0" />
          <span className="tracking-wide">ဆုတောင်းမီးပုံး လွှတ်တင်မည်</span>
          <Flame className="w-4 h-4 text-amber-950 group-hover:rotate-12 transition-transform shrink-0" />
        </button>
        <span className="text-[10px] sm:text-[11px] text-amber-200/60 font-medium whitespace-nowrap">
          မြန်မာ့ရိုးရာ သီတင်းကျွတ် မီးထွန်းပွဲတော်
        </span>
      </div>

      {/* Modal 1: Create & Release Lantern */}
      <CreateWishModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateWish}
      />

      {/* Modal 2: View Single Lantern Wish */}
      <WishDetailModal
        wish={selectedWish}
        onClose={() => setSelectedWish(null)}
        onLike={handleLikeWish}
        onShowToast={showToast}
      />

      {/* Modal 3: All Public Wishes Board */}
      <WishesWallModal
        isOpen={isWallOpen}
        onClose={() => setIsWallOpen(false)}
        wishes={wishes}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onLike={handleLikeWish}
        onSelectWish={handleSelectWish}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
