/**
 * App Root Component
 *
 * Assembles the layout with sidebar navigation and content views.
 * Uses TanStack Query provider for data fetching.
 */

import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/common/Sidebar';
import { SmartNotesInput } from '@/components/dashboard/SmartNotesInput';
import { useStudyStore } from '@/store/useStudyStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { pageVariants, pageTransition } from '@/animations/variants';

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

// Loading fallback for lazy-loaded components
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
  const { viewMode } = useStudyStore();
  useKeyboardShortcuts();

  const renderView = () => {
    switch (viewMode) {
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
        return <SmartNotesInput />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-0">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8 overflow-y-auto">
        <div className="py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
