import React from 'react';
import { TabProps } from '../types';

const Tab: React.FC<TabProps> = ({ children, isActive, onClick, label }) => {
  return (
    <div className="flex flex-col h-full">
      <button
        className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
          isActive
            ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={onClick}
      >
        {label}
      </button>
      {isActive && <div className="p-4 flex-1 bg-white rounded-b-lg rounded-tr-lg border border-gray-200 overflow-auto">
        {children}
      </div>}
    </div>
  );
};

export default Tab;