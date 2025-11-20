import { useState, useEffect } from 'react';
import { globalConfigService } from '../services/globalConfig';
import { dbService, Chapter } from '../services/database';
import { X, Plus, Edit2, Trash2, Play } from 'lucide-react';
import { ChapterDialog } from './ChapterDialog';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'chapters'>('ai');
  const [provider, setProvider] = useState<'openai' | 'gemini'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [model, setModel] = useState('');
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      loadChapters();
    }
  }, [isOpen]);

  async function loadConfig() {
    const config = await globalConfigService.getConfig();
    setProvider(config.provider || 'gemini');
    setApiKey(config.apiKey || '');
    setApiUrl(config.apiUrl || (config.provider === 'gemini' ? '' : 'https://api.openai.com/v1'));
    setModel(config.model || (config.provider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-3.5-turbo'));
  }

  async function loadChapters() {
    const allChapters = await dbService.getAllChapters();
    allChapters.sort((a, b) => a.order - b.order);
    setChapters(allChapters);
  }

  async function handleSave() {
    await globalConfigService.saveConfig({ provider, apiKey, apiUrl, model });
    onClose();
  }

  async function handleSetActive(chapter: Chapter) {
    await dbService.saveChapter({ ...chapter, isActive: true });
    loadChapters();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[600px] max-h-[85vh] flex flex-col p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">System Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'ai'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Config
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'chapters'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chapters ({chapters.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'ai' ? (
            <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value as 'openai' | 'gemini';
                setProvider(newProvider);
                // Set defaults when switching
                if (newProvider === 'gemini') {
                  setApiUrl('');
                  setModel('gemini-pro');
                } else {
                  setApiUrl('https://api.openai.com/v1');
                  setModel('gpt-3.5-turbo');
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="openai">OpenAI Compatible</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="sk-..."
            />
          </div>

          {provider === 'openai' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                placeholder="https://api.openai.com/v1"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            {provider === 'gemini' ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <optgroup label="Gemini 2.5 (Preview)">
                  <option value="gemini-2.5-pro-preview-03-25">gemini-2.5-pro-preview-03-25</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-pro-preview-05-06">gemini-2.5-pro-preview-05-06</option>
                  <option value="gemini-2.5-pro-preview-06-05">gemini-2.5-pro-preview-06-05</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                </optgroup>
                <optgroup label="Gemini 2.0 (Flash & Pro)">
                  <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                  <option value="gemini-2.0-flash-001">gemini-2.0-flash-001</option>
                  <option value="gemini-2.0-flash-lite-001">gemini-2.0-flash-lite-001</option>
                  <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                  <option value="gemini-2.0-pro-exp">gemini-2.0-pro-exp</option>
                  <option value="gemini-2.0-pro-exp-02-05">gemini-2.0-pro-exp-02-05</option>
                </optgroup>
                <optgroup label="Gemini 1.5 & Others">
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-pro">gemini-pro</option>
                </optgroup>
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                placeholder="gpt-3.5-turbo"
              />
            )}
          </div>

          <div className="text-xs text-gray-500 mt-2">
            <p>Need an API Key?</p>
            {provider === 'gemini' ? (
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                Get Gemini API Key
              </a>
            ) : (
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                Get OpenAI API Key
              </a>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium mt-4"
          >
            Save
          </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Manage story chapters and progression</p>
                <button
                  onClick={() => {
                    setEditingChapter(undefined);
                    setIsChapterDialogOpen(true);
                  }}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Chapter
                </button>
              </div>

              {chapters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No chapters yet. Create your first chapter to begin!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        chapter.isActive
                          ? 'border-purple-500 bg-purple-50'
                          : chapter.isCompleted
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Ch. {chapter.order}</span>
                            <h3 className="font-semibold text-gray-800">{chapter.title}</h3>
                            {chapter.isActive && (
                              <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">Active</span>
                            )}
                            {chapter.isCompleted && (
                              <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full">Completed</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                          <div className="flex gap-2 mt-2 text-xs text-gray-500">
                            <span>Trigger: {chapter.triggerType}</span>
                            {chapter.backgroundImage && <span>• Has Background</span>}
                            {chapter.backgroundMusic && <span>• Has Music</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {!chapter.isActive && !chapter.isCompleted && (
                            <button
                              onClick={() => handleSetActive(chapter)}
                              className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                              title="Set as Active"
                            >
                              <Play size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingChapter(chapter);
                              setIsChapterDialogOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete chapter "${chapter.title}"?`)) {
                                await dbService.deleteChapter(chapter.id!);
                                loadChapters();
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ChapterDialog
        isOpen={isChapterDialogOpen}
        onClose={() => setIsChapterDialogOpen(false)}
        onSave={loadChapters}
        initialData={editingChapter}
      />
    </div>
  );
}
