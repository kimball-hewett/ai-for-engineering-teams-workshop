'use client';

import React from 'react';

export interface HealthIndicatorProps {
  score: number;
  variant?: 'badge' | 'bar' | 'dot' | 'text';
  size?: 'small' | 'medium' | 'large';
  showScore?: boolean;
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
  ariaLabel?: string;
}

type HealthLevel = 'critical' | 'warning' | 'healthy';

interface HealthConfig {
  level: HealthLevel;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon: string;
}

function getHealthConfig(score: number): HealthConfig {
  if (score <= 30) {
    return {
      level: 'critical',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      label: 'Critical',
      icon: '⚠️',
    };
  } else if (score <= 70) {
    return {
      level: 'warning',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      label: 'Warning',
      icon: '⚡',
    };
  } else {
    return {
      level: 'healthy',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      label: 'Healthy',
      icon: '✓',
    };
  }
}

function clampScore(score: number | null | undefined): number | null {
  if (score === null || score === undefined) {
    return null;
  }
  if (score < 0) return 0;
  if (score > 100) return 100;
  return score;
}

export default function HealthIndicator({
  score: rawScore,
  variant = 'badge',
  size = 'medium',
  showScore = true,
  showLabel = false,
  showIcon = false,
  className = '',
  ariaLabel,
}: HealthIndicatorProps) {
  const score = clampScore(rawScore);

  // Handle null/undefined scores
  if (score === null) {
    const naClasses = `inline-flex items-center justify-center ${
      size === 'small' ? 'text-xs px-2 py-0.5' : size === 'large' ? 'text-base px-4 py-2' : 'text-sm px-3 py-1'
    } rounded-full bg-gray-100 text-gray-500 border border-gray-300 ${className}`;

    return (
      <span className={naClasses} role="status" aria-label={ariaLabel || 'Health status not available'}>
        N/A
      </span>
    );
  }

  const config = getHealthConfig(score);
  const defaultAriaLabel = `Customer health: ${config.label}, score ${score}`;

  // Size-based styling
  const sizeClasses = {
    small: {
      height: 'h-5',
      text: 'text-xs',
      padding: 'px-2 py-0.5',
      iconSize: 'text-xs',
      barHeight: 'h-2',
    },
    medium: {
      height: 'h-7',
      text: 'text-sm',
      padding: 'px-3 py-1',
      iconSize: 'text-sm',
      barHeight: 'h-3',
    },
    large: {
      height: 'h-9',
      text: 'text-base',
      padding: 'px-4 py-2',
      iconSize: 'text-base',
      barHeight: 'h-4',
    },
  };

  const sizeConfig = sizeClasses[size];

  // Badge variant
  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center justify-center gap-1 rounded-full border ${config.bgColor} ${config.color} ${config.borderColor} ${sizeConfig.padding} ${sizeConfig.text} ${className}`}
        role="status"
        aria-label={ariaLabel || defaultAriaLabel}
      >
        {showIcon && <span className={sizeConfig.iconSize}>{config.icon}</span>}
        {showLabel && <span className="font-medium">{config.label}</span>}
        {showScore && <span className="font-semibold">{score}</span>}
        {!showLabel && !showScore && <span className="font-medium">{config.label}</span>}
      </span>
    );
  }

  // Bar variant
  if (variant === 'bar') {
    return (
      <div
        className={`w-full ${className}`}
        role="status"
        aria-label={ariaLabel || defaultAriaLabel}
      >
        <div className={`relative w-full ${sizeConfig.barHeight} bg-gray-200 rounded-full overflow-hidden`}>
          <div
            className={`absolute top-0 left-0 h-full ${config.bgColor} ${config.borderColor} border-r-2 transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>
        {showScore && (
          <div className={`mt-1 ${sizeConfig.text} ${config.color} font-semibold text-center`}>
            {score}
          </div>
        )}
      </div>
    );
  }

  // Dot variant
  if (variant === 'dot') {
    const dotSizes = {
      small: 'w-2 h-2',
      medium: 'w-3 h-3',
      large: 'w-4 h-4',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 ${className}`}
        role="status"
        aria-label={ariaLabel || defaultAriaLabel}
      >
        <span className={`rounded-full ${config.bgColor} ${config.borderColor} border-2 ${dotSizes[size]}`} />
        {showLabel && <span className={`${sizeConfig.text} ${config.color} font-medium`}>{config.label}</span>}
        {showScore && <span className={`${sizeConfig.text} ${config.color} font-semibold`}>{score}</span>}
      </span>
    );
  }

  // Text variant
  if (variant === 'text') {
    return (
      <span
        className={`inline-flex items-center gap-1 ${sizeConfig.text} ${config.color} font-medium ${className}`}
        role="status"
        aria-label={ariaLabel || defaultAriaLabel}
      >
        {showIcon && <span>{config.icon}</span>}
        {showLabel && <span>{config.label}</span>}
        {showScore && <span className="font-semibold">{score}</span>}
        {!showLabel && !showScore && <span>{config.label}</span>}
      </span>
    );
  }

  return null;
}
