import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  GitBranch,
  CheckCircle2,
  ChevronDown,
  Layers,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { staggerContainer, staggerItem } from '@/animations/variants';
import type { MindMapNode } from '@/types';

export const StudySummary = memo(function StudySummary() {
  const { material } = useStudyStore();

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
        <p className="text-lg font-semibold text-text-primary mt-2">No Study Summary Available</p>
        <p className="text-sm mt-1">Generate a study set to view your executive breakdown!</p>
      </div>
    );
  }

  const totalWords = (material.summary + ' ' + material.keyPoints.join(' ')).split(/\s+/).length;
  const readTimeMins = Math.max(1, Math.ceil(totalWords / 180));

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 md:px-0 space-y-8"
    >
      {/* Educational Topic Banner */}
      <motion.div
        variants={staggerItem}
        className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-primary-500/10 via-purple-500/5 to-transparent border border-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 flex-1 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-500">
            <Clock size={13} /> Executive Summary · {readTimeMins} min read
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            {material.title}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            {material.summary}
          </p>
        </div>
      </motion.div>

      {/* Subtle Separator */}
      <div className="h-px bg-surface-border/60" />

      {/* Concept Flow Architecture Diagram */}
      <motion.div variants={staggerItem} className="p-5 rounded-2xl bg-surface-50 border border-surface-border">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Layers size={16} className="text-primary-500" /> Structural Concept Diagram
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3 py-4 bg-surface-0 rounded-xl border border-surface-border/60 px-4">
          <span className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-xs font-bold text-primary-600 dark:text-primary-400 border border-primary-500/20">
            {material.title}
          </span>
          <span className="text-text-tertiary font-mono">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-surface-100 text-xs font-medium text-text-secondary">
            {material.keyPoints.length} Core Principles
          </span>
          <span className="text-text-tertiary font-mono">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-surface-100 text-xs font-medium text-text-secondary">
            {material.flashcards.length} Flashcard Stack
          </span>
          <span className="text-text-tertiary font-mono">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
            Mastery Goal
          </span>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Points */}
        <motion.div
          variants={staggerItem}
          className="p-6 rounded-2xl bg-surface-50 border border-surface-border space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <Lightbulb size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Key Principles</h3>
          </div>
          <ul className="space-y-3">
            {material.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-text-secondary leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Common Mistakes */}
        <motion.div
          variants={staggerItem}
          className="p-6 rounded-2xl bg-surface-50 border border-surface-border space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Common Misconceptions</h3>
          </div>
          <ul className="space-y-3">
            {material.mistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="text-rose-500 mt-0.5 flex-shrink-0 text-xs font-bold">•</span>
                <span className="text-sm text-text-secondary leading-relaxed">{mistake}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Revision Tips */}
        <motion.div
          variants={staggerItem}
          className="p-6 rounded-2xl bg-surface-50 border border-surface-border space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <BookOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Revision Tips</h3>
          </div>
          <ul className="space-y-3">
            {material.revisionTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0 text-xs font-bold">{index + 1}.</span>
                <span className="text-sm text-text-secondary leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Mind Map */}
        <motion.div
          variants={staggerItem}
          className="p-6 rounded-2xl bg-surface-50 border border-surface-border space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <GitBranch size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Interactive Topic Map</h3>
          </div>
          <MindMapTree nodes={material.mindmap} />
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-center gap-6 p-4 rounded-xl bg-surface-50 border border-surface-border"
      >
        <Stat icon={<FileText size={16} />} label="Flashcards" value={material.flashcards.length} />
        <div className="w-px h-8 bg-surface-border" />
        <Stat icon={<Lightbulb size={16} />} label="Key Points" value={material.keyPoints.length} />
        <div className="w-px h-8 bg-surface-border" />
        <Stat icon={<AlertTriangle size={16} />} label="Mistakes" value={material.mistakes.length} />
      </motion.div>
    </motion.div>
  );
});

// ─── Mind Map Tree Renderer ──────────────────────────────────────────────────────

function MindMapTree({ nodes }: { nodes: MindMapNode[] }) {
  const rootNodes = nodes.filter((n) => n.parent === null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  function renderNode(node: MindMapNode, depth: number): React.ReactNode {
    const children = nodes.filter((n) => n.parent === node.id);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedNodes.has(node.id);

    return (
      <div key={node.id} className={cn('relative', depth > 0 && 'ml-4')}>
        <div className="flex items-center gap-1.5 py-1">
          {depth > 0 && <div className="w-2.5 border-t border-surface-border" />}

          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-0.5 rounded hover:bg-surface-200 text-text-tertiary transition-colors"
              aria-label="Toggle node children"
            >
              <ChevronDown
                size={14}
                className={cn('transition-transform duration-200', isCollapsed && '-rotate-90')}
              />
            </button>
          )}

          <span
            onClick={() => hasChildren && toggleNode(node.id)}
            className={cn(
              'text-sm px-2.5 py-1 rounded-lg transition-colors cursor-pointer',
              depth === 0
                ? 'font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border border-primary-500/20'
                : 'text-text-secondary hover:bg-surface-100'
            )}
          >
            {node.label}
          </span>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="border-l border-surface-border ml-3 pl-1">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rootNodes.map((node) => renderNode(node, 0))}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-tertiary">{icon}</span>
      <div>
        <span className="text-lg font-bold text-text-primary">{value}</span>
        <span className="text-xs text-text-tertiary ml-1.5">{label}</span>
      </div>
    </div>
  );
}
