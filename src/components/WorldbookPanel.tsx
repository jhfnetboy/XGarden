import { useState, useEffect } from 'react';
import { dbService } from '../services/database';
import { X } from 'lucide-react';

interface WorldbookPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorldbookPanel({ isOpen, onClose }: WorldbookPanelProps) {
  const [worldDescription, setWorldDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDescription();
    }
  }, [isOpen]);

  async function loadDescription() {
    const desc = await dbService.getWorldDescription();
    setWorldDescription(desc);
  }

  async function handleSave() {
    await dbService.saveWorldDescription(worldDescription);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50" onClick={onClose}>
      <div 
        className="bg-white h-full w-96 shadow-2xl flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Worldbook Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              World Description
            </label>
            <textarea
              value={worldDescription}
              onChange={(e) => setWorldDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 h-48 resize-none"
              placeholder="Describe the world setting, background, theme, and atmosphere..."
            />
            <p className="text-xs text-gray-500 mt-2">
              This description helps AI understand the world context for better roleplay and storytelling.
            </p>
          </div>

          {/* Future: Add more worldbook settings here */}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
