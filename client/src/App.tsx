import { useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/common/Sidebar';
import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { SmartNotesInput } from '@/components/dashboard/SmartNotesInput';
import { GenerationOverlay } from '@/components/dashboard/GenerationOverlay';
import { ToastContainer } from '@/components/common/ToastContainer';
import { CommandPalette } from '@/components/common/CommandPalette';
import { useStudyStore } from '@/store/useStudyStore';
import { useGenerate } from '@/hooks/useGenerate';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import { BotAssistant } from '@/components/common/BotAssistant';
import { AICompanionLayer } from '@/components/common/AICompanionLayer';
import { LandingHero } from '@/components/landing/LandingHero';

// Lazy-loaded views for code splitting
const FlashcardViewer = lazy(() =>
  import('@/components/flashcards/FlashcardViewer').then((m) => ({ default: m.FlashcardViewer }))
);
const QuizEngine = lazy(() =>
  import('@/components/quiz/QuizEngine').then((m) => ({ default: m.QuizEngine }))
);
const StudySummary = lazy(() =>
  import('@/components/dashboard/StudySummary').then((m) => ({ default: m.StudySummary }))
);
const AnalyticsDashboard = lazy(() =>
  import('@/components/analytics/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard }))
);
const SessionHistory = lazy(() =>
  import('@/components/history/SessionHistory').then((m) => ({ default: m.SessionHistory }))
);

// Configure TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ViewSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-8">
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-72" />
        <div className="skeleton h-64 w-full mt-6" />
      </div>
    </div>
  );
}

function AppContent() {
  const { viewMode, isGenerating } = useStudyStore();
  const { cancel } = useGenerate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);

  useKeyboardShortcuts();

  const renderView = () => {
    switch (viewMode) {
      case 'home':
        return <HomeDashboard />;
      case 'input':
        return <SmartNotesInput />;
      case 'flashcards':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <FlashcardViewer />
          </Suspense>
        );
      case 'quiz':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <QuizEngine />
          </Suspense>
        );
      case 'summary':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <StudySummary />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <AnalyticsDashboard />
          </Suspense>
        );
      case 'history':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <SessionHistory />
          </Suspense>
        );
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!hasLaunched ? (
        <motion.div
          key="landing-hero"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full min-h-screen"
        >
          <LandingHero onLaunch={() => setHasLaunched(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="workspace-app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex h-screen w-screen overflow-hidden bg-surface-0 relative"
        >
          {/* 100% Static Fixed Left Sidebar */}
          <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />

          {/* Main Content View Container - Isolated Scroll Area */}
          <main className="flex-1 h-full overflow-y-auto pb-24 md:pb-8">
            <div className="py-8 md:py-12 min-h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeOut',
                  }}
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Overlays & Notifications */}
          <AICompanionLayer />
          <GenerationOverlay isGenerating={isGenerating} onCancel={cancel} />
          <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <ToastContainer />
          <BotAssistant />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
