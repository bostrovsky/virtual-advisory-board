'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Advisor } from '@/types';

interface AdvisorDisplayProps {
  advisors: Advisor[];
  onAdvisorToggle?: (advisorId: string) => void;
  layout?: 'grid' | 'horizontal' | 'vertical';
  showControls?: boolean;
  maxDisplay?: number;
}

interface AdvisorCardProps {
  advisor: Advisor;
  onToggle?: () => void;
  showControls?: boolean;
  size?: 'small' | 'medium' | 'large';
}

function AdvisorCard({
  advisor,
  onToggle,
  showControls = false,
  size = 'medium'
}: AdvisorCardProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const cardSizes = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6'
  };

  return (
    <motion.div
      className={`advisor-card relative ${cardSizes[size]} cursor-pointer ${
        advisor.isActive ? 'ring-2 ring-blue-500' : ''
      } ${advisor.isSpeaking ? 'speaking' : ''}`}
      onClick={onToggle}
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        boxShadow: advisor.isSpeaking
          ? '0 0 20px rgba(59, 130, 246, 0.5)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
    >
      {/* Speaking Indicator */}
      <AnimatePresence>
        {advisor.isSpeaking && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            initial={{ scale: 0 }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            exit={{ scale: 0 }}
            transition={{
              repeat: Infinity,
              duration: 1
            }}
          />
        )}
      </AnimatePresence>

      {/* Active Status Indicator */}
      {advisor.isActive && (
        <motion.div
          className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}

      {/* Avatar */}
      <div className={`${sizeClasses[size]} mx-auto mb-2 relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
        <Image
          src={advisor.avatar}
          alt={advisor.name}
          width={size === 'small' ? 64 : size === 'medium' ? 96 : 128}
          height={size === 'small' ? 64 : size === 'medium' ? 96 : 128}
          className="object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const initials = advisor.name.split(' ').map(n => n[0]).join('').toUpperCase();
              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-600 font-semibold text-lg bg-gradient-to-br from-blue-100 to-purple-100">${initials}</div>`;
            }
          }}
        />
      </div>

      {/* Name and Title */}
      <div className="text-center">
        <h3 className={`font-semibold text-gray-900 ${
          size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
        }`}>
          {advisor.name}
        </h3>
        <p className={`text-gray-600 ${
          size === 'small' ? 'text-xs' : size === 'medium' ? 'text-xs' : 'text-sm'
        }`}>
          {advisor.title}
        </p>
      </div>

      {/* Status */}
      <div className="mt-2 text-center">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
          advisor.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {advisor.isSpeaking ? 'Speaking' : advisor.isActive ? 'Active' : 'Available'}
        </span>
      </div>

      {/* Controls */}
      {showControls && advisor.isActive && (
        <motion.div
          className="absolute bottom-2 right-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
            title="Remove from session"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Expertise Tags */}
      {size === 'large' && advisor.personality.expertise.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1 justify-center">
          {advisor.personality.expertise.slice(0, 3).map((expertise, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {expertise}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function AdvisorDisplay({
  advisors,
  onAdvisorToggle,
  layout = 'grid',
  showControls = false,
  maxDisplay
}: AdvisorDisplayProps) {
  const displayAdvisors = maxDisplay ? advisors.slice(0, maxDisplay) : advisors;
  const activeAdvisors = displayAdvisors.filter(advisor => advisor.isActive);
  const availableAdvisors = displayAdvisors.filter(advisor => !advisor.isActive);

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-row space-x-4 overflow-x-auto pb-2';
      case 'vertical':
        return 'flex flex-col space-y-4';
      case 'grid':
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6';
    }
  };

  const getCardSize = () => {
    switch (layout) {
      case 'horizontal':
        return 'small';
      case 'vertical':
        return 'medium';
      case 'grid':
      default:
        return 'medium';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Advisors Section */}
      {activeAdvisors.length > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Active ({activeAdvisors.length})
          </h2>
          <div className={getLayoutClasses()}>
            <AnimatePresence>
              {activeAdvisors.map((advisor) => (
                <AdvisorCard
                  key={advisor.id}
                  advisor={advisor}
                  onToggle={() => onAdvisorToggle?.(advisor.id)}
                  showControls={showControls}
                  size={getCardSize()}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Available Advisors Section */}
      {availableAdvisors.length > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            Available ({availableAdvisors.length})
          </h2>
          <div className={getLayoutClasses()}>
            <AnimatePresence>
              {availableAdvisors.map((advisor) => (
                <AdvisorCard
                  key={advisor.id}
                  advisor={advisor}
                  onToggle={() => onAdvisorToggle?.(advisor.id)}
                  showControls={false}
                  size={getCardSize()}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayAdvisors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Advisors Available</h3>
          <p className="text-gray-600">Advisors will appear here once they are loaded.</p>
        </motion.div>
      )}

      {/* Summary Stats */}
      {displayAdvisors.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-green-600">{activeAdvisors.length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">
                {activeAdvisors.filter(a => a.isSpeaking).length}
              </div>
              <div className="text-sm text-gray-600">Speaking</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-600">{availableAdvisors.length}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}