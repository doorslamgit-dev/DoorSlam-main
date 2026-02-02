// src/components/parent/rewards/PointWeightingConfig.tsx
// FEAT-013: Point Weighting Configuration Component

import React from 'react';
import type { WeightingMode } from '../../../types/parent/rewardTypes';

interface PointWeightingConfigProps {
  mode: WeightingMode;
  completionWeight: number;
  accuracyWeight: number;
  focusWeight: number;
  autoApproveThreshold: number;
  onChange: (field: string, value: number | string) => void;
  disabled?: boolean;
}

export function PointWeightingConfig({
  mode,
  completionWeight,
  accuracyWeight,
  focusWeight,
  autoApproveThreshold,
  onChange,
  disabled = false,
}: PointWeightingConfigProps) {
  const total = completionWeight + accuracyWeight + focusWeight;
  const isValid = mode === 'auto' || total === 100;

  const handleSliderChange = (field: string, value: number) => {
    if (mode === 'manual') {
      onChange(field, value);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Point Weighting
      </h3>
      
      <p className="text-sm text-gray-600 mb-6">
        Control how points are calculated when your child completes a session. 
        This helps ensure they're not just rushing through to collect points.
      </p>

      {/* Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
        <label className="text-sm font-medium text-gray-700">Mode:</label>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            type="button"
            onClick={() => onChange('mode', 'auto')}
            disabled={disabled}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'auto'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => onChange('mode', 'manual')}
            disabled={disabled}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Manual
          </button>
        </div>
      </div>

      {mode === 'auto' ? (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-2">Auto Mode</p>
          <p>
            Doorslam will use balanced defaults: 40% Completion, 35% Accuracy, 25% Focus.
            This ensures a good mix of finishing sessions, getting answers right, and staying focused.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Completion Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Completion
              </label>
              <span className="text-sm font-semibold text-purple-600">
                {completionWeight}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={completionWeight}
              onChange={(e) => handleSliderChange('completion_weight', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Did they finish the session?
            </p>
          </div>

          {/* Accuracy Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Accuracy
              </label>
              <span className="text-sm font-semibold text-green-600">
                {accuracyWeight}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={accuracyWeight}
              onChange={(e) => handleSliderChange('accuracy_weight', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Did they get practice questions right?
            </p>
          </div>

          {/* Focus Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Focus
              </label>
              <span className="text-sm font-semibold text-blue-600">
                {focusWeight}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={focusWeight}
              onChange={(e) => handleSliderChange('focus_weight', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Was Focus Mode on? Did they stay on task?
            </p>
          </div>

          {/* Total Indicator */}
          <div className={`flex justify-between items-center p-3 rounded-lg ${
            isValid ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span className={`text-lg font-bold ${
              isValid ? 'text-green-600' : 'text-red-600'
            }`}>
              {total}%
              {!isValid && <span className="text-sm font-normal ml-2">(must equal 100%)</span>}
            </span>
          </div>
        </div>
      )}

      {/* Auto-Approve Threshold */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            Auto-Approve Threshold
          </label>
          <span className="text-sm font-semibold text-gray-900">
            {autoApproveThreshold === 0 ? 'Off' : `${autoApproveThreshold} points`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="50"
          value={autoApproveThreshold}
          onChange={(e) => onChange('auto_approve_threshold', parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
        />
        <p className="text-xs text-gray-500 mt-1">
          {autoApproveThreshold === 0 
            ? 'All redemption requests require your approval.'
            : `Rewards costing ${autoApproveThreshold} points or less will be auto-approved.`
          }
        </p>
      </div>
    </div>
  );
}

export default PointWeightingConfig;