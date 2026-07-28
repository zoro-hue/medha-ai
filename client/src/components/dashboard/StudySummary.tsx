/**
 * Study Summary
 *
 * Displays the AI-generated summary, key points, common mistakes,
 * revision tips, and mind map in a clean, organized layout.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  GitBranch,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { staggerContainer, staggerItem } from '@/animations/variants';
import type { MindMapNode } from '@/types';

export const StudySummary = memo(function StudySummary() {
  const { material } = useStudyStore();

  if (!material) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto px-4 md:px-0"
    >
      {/* Title */}
      <motion.div variants={staggerItem} className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight mb-2">
          {material.title}
        </h2>
        <p className="text-base text-text-secondary leading-relaxed">
          {material.summary}
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Points */}
        <motion.div
          variants={staggerItem}
          className="p-5 rounded-2xl bg-surface-50 border border-surface-border"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <Lightbulb size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Key Points</h3>
          </div>
          <ul className="space-y-2.5">
            {material.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-primary-500 mt-1 flex-shrink-0" />
                <span className="text-sm text-text-secondary leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Common Mistakes */}
        <motion.div
          variants={staggerItem}
          className="p-5 rounded-2xl bg-surface-50 border border-surface-border"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Common Mistakes</h3>
          </div>
          <ul className="space-y-2.5">
            {material.mistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="text-rose-500 mt-0.5 flex-shrink-0">•</span>
                <span className="text-sm text-text-secondary leading-relaxed">{mistake}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Revision Tips */}
        <motion.div
          variants={staggerItem}
          className="p-5 rounded-2xl bg-surface-50 border border-surface-border"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <BookOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Revision Tips</h3>
          </div>
          <ul className="space-y-2.5">
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
          className="p-5 rounded-2xl bg-surface-50 border border-surface-border"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <GitBranch size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Topic Map</h3>
          </div>
          <MindMapTree nodes={material.mindmap} />
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div
        variants={staggerItem}
        className="mt-6 flex items-center justify-center gap-6 p-4 rounded-xl bg-surface-50 border border-surface-border"
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

  function renderNode(node: MindMapNode, depth: number): React.ReactNode {
    const children = nodes.filter((n) => n.parent === node.id);

    return (
      <div key={node.id} className={cn('relative', depth > 0 && 'ml-4')}>
        <div className="flex items-center gap-2 py-1">
          {depth > 0 && (
            <div className="w-3 border-t border-surface-300" />
          )}
          <span
            className={cn(
              'text-sm px-2.5 py-1 rounded-lg',
              depth === 0
                ? 'font-semibold text-text-primary bg-primary-50 dark:bg-primary-900/30'
                : 'text-text-secondary'
            )}
          >
            {node.label}
          </span>
        </div>
        {children.length > 0 && (
          <div className="border-l border-surface-300 ml-1.5">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {rootNodes.map((node) => renderNode(node, 0))}
    </div>
  );
}

// ─── Stat Component ──────────────────────────────────────────────────────────────

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
