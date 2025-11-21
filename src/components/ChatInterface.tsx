import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService, Message, Character, Chapter } from '../services/database';
import { globalConfigService } from '../services/globalConfig';
import { aiService } from '../services/ai';
import { Sidebar } from './Sidebar';
import { SettingsDialog } from './SettingsDialog';
import ReactMarkdown from 'react-markdown';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';

export function ChatInterface() {
  const navigate = useNavigate();
  const [currentChat, setCurrentChat] = useState<{ id: number | null; type: 'private' | 'group' }>({ id: null, type: 'private' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [participants, setParticipants] = useState<Character[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [worldDefaults, setWorldDefaults] = useState<{ backgroundImage?: string; backgroundMusic?: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentChat.id && currentChat.type) {
      loadChatSession();
    }
  }, [currentChat]);

  useEffect(() => {
    const checkConfig = async () => {
      const config = await globalConfigService.getConfig();
      if (!config.apiKey) {
        setIsSettingsOpen(true);
      }
    };
    checkConfig();
  }, []); // This useEffect runs once on mount for config check

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    loadActiveChapter();
    loadWorldDefaults();
  }, []);

  useEffect(() => {
    playBackgroundMusic();
  }, [activeChapter, worldDefaults]);

  async function loadActiveChapter() {
    const chapter = await dbService.getActiveChapter();
    
    if (chapter) {
      setActiveChapter(chapter);
      console.log('Loaded active chapter:', chapter);
    } else {
      // No active chapter - will use world defaults
      console.log('No active chapter, will use world defaults');
      setActiveChapter(null);
    }
  }

  async function loadWorldDefaults() {
    const defaults = await dbService.getWorldDefaults();
    console.log('Loaded world defaults:', defaults);
    setWorldDefaults(defaults);
  }

  function getMusicUrl(musicId: string): string {
    // Option 1: Use local files (requires adding MP3 files to public/assets/music/)
    const localMusicMap: Record<string, string> = {
      'peaceful-forest': chrome.runtime.getURL('assets/music/peaceful-forest.mp3'),
      'calm-piano': chrome.runtime.getURL('assets/music/calm-piano.mp3'),
      'ambient-space': chrome.runtime.getURL('assets/music/ambient-space.mp3'),
      'medieval-lute': chrome.runtime.getURL('assets/music/medieval-lute.mp3'),
      'gentle-rain': chrome.runtime.getURL('assets/music/gentle-rain.mp3')
    };
    
    // Option 2: Use online URLs (uncomment and replace with actual URLs)
    // const onlineMusicMap: Record<string, string> = {
    //   'peaceful-forest': 'https://example.com/peaceful-forest.mp3',
    //   'calm-piano': 'https://example.com/calm-piano.mp3',
    //   'ambient-space': 'https://example.com/ambient-space.mp3',
    //   'medieval-lute': 'https://example.com/medieval-lute.mp3',
    //   'gentle-rain': 'https://example.com/gentle-rain.mp3'
    // };
    // return onlineMusicMap[musicId] || '';
    
    return localMusicMap[musicId] || '';
  }

  function playBackgroundMusic() {
    if (!audioRef.current) return;

    // Priority: Active chapter music > World default music
    const musicId = activeChapter?.backgroundMusic || worldDefaults.backgroundMusic;
    
    if (musicId) {
      const musicUrl = getMusicUrl(musicId);
      
      if (musicUrl && audioRef.current.src !== musicUrl) {
        audioRef.current.src = musicUrl;
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3; // 30% volume
        
        // Try to play, but don't log errors if files don't exist or autoplay is blocked
        audioRef.current.play().catch(err => {
          // Silently handle - music is optional
          if (err.name !== 'NotSupportedError') {
            console.log('Background music playback info:', err.name);
          }
        });
      }
    } else {
      // No music configured, stop playback
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }

  async function checkChapterProgression(lastMessage: Message) {
    if (!activeChapter || activeChapter.isCompleted) {
      console.log('Chapter progression check skipped:', { activeChapter, isCompleted: activeChapter?.isCompleted });
      return;
    }

    // Skip check for pseudo default chapter
    if (activeChapter.id === -1) {
      console.log('Skipping progression check for default chapter');
      return;
    }

    let shouldAdvance = false;

    console.log('Checking chapter progression:', {
      triggerType: activeChapter.triggerType,
      triggerCondition: activeChapter.triggerCondition,
      messageContent: lastMessage.content
    });

    // Check trigger conditions
    if (activeChapter.triggerType === 'time') {
      // Time-based: check dialogue count
      const dialogueCount = activeChapter.triggerCondition?.dialogueCount || 10;
      if (messages.length + 1 >= dialogueCount) {
        shouldAdvance = true;
        console.log('Time trigger activated:', { currentCount: messages.length + 1, required: dialogueCount });
      }
    } else if (activeChapter.triggerType === 'keyword') {
      // Keyword-based: check if any keyword appears in the message
      const keywords = activeChapter.triggerCondition?.keywords || [];
      const messageText = lastMessage.content.toLowerCase();
      console.log('Checking keywords:', { keywords, messageText });
      
      shouldAdvance = keywords.some(keyword => {
        const found = messageText.includes(keyword.toLowerCase());
        console.log(`Keyword "${keyword}" found:`, found);
        return found;
      });
      
      if (shouldAdvance) {
        console.log('Keyword trigger activated!');
      }
    } else if (activeChapter.triggerType === 'ai-judgment') {
      // AI-judgment: ask AI if chapter should advance
      // For now, we'll implement a simple check - can be enhanced later
      // This would require an additional AI call to determine if story has progressed enough
      shouldAdvance = false; // TODO: Implement AI judgment
    }

    if (shouldAdvance) {
      console.log('Advancing to next chapter...');
      const nextChapter = await dbService.advanceToNextChapter();
      if (nextChapter) {
        setActiveChapter(nextChapter);
        // Show notification to user
        const notificationMsg: Message = {
          role: 'char',
          content: `📖 **章节推进**: ${nextChapter.title}\n\n${nextChapter.description}`,
          timestamp: Date.now(),
          sessionId: `${currentChat.type}_${currentChat.id}`,
          characterName: '系统'
        };
        await dbService.saveMessage(notificationMsg);
        setMessages(prev => [...prev, notificationMsg]);
        console.log('Chapter advanced to:', nextChapter.title);
      } else {
        console.log('No next chapter available');
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function loadChatSession() {
    if (!currentChat.id) return;
    
    const sessionId = `${currentChat.type}_${currentChat.id}`;
    const history = await dbService.getChatHistory(sessionId);
    setMessages(history);

    // Load participants
    if (currentChat.type === 'private') {
      const char = await dbService.getAllCharacters().then(chars => chars.find(c => c.id === currentChat.id));
      if (char) setParticipants([char]);
    } else {
      const group = await dbService.getAllGroups().then(groups => groups.find(g => g.id === currentChat.id));
      if (group) {
        const allChars = await dbService.getAllCharacters();
        const groupChars = allChars.filter(c => group.characterIds.includes(c.id!));
        setParticipants(groupChars);
      }
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || !currentChat.id || isLoading) return;

    const sessionId = `${currentChat.type}_${currentChat.id}`;
    const allChars = await dbService.getAllCharacters();
    const playerChar = allChars.find(c => c.isPlayer);
    
    // User message
    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
      sessionId,
      characterName: playerChar ? playerChar.name : 'User',
      isSent: true
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      await dbService.saveMessage(userMsg);

      // Get context
      const worldbooks = await dbService.getAllWorldbooks();
      const config = await globalConfigService.getConfig();
      const worldDescription = await dbService.getWorldDescription();

      if (!config.apiKey) {
        const errorMsg: Message = {
          role: 'char',
          content: 'Error: API Key not set. Please configure it in settings.',
          timestamp: Date.now(),
          sessionId,
          characterName: 'System'
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsLoading(false);
        return;
      }

      // Generate response
      const prompt = await aiService.constructPrompt(
        participants,
        [...messages, userMsg],
        worldbooks,
        playerChar || null,
        participants.length === 1 ? participants[0].name : null,
        currentChat.type === 'group',
        worldDescription
      );

      const responseText = await aiService.getAIResponse(prompt, config as any);
      
      // Parse response (simple parsing for now)
      let charName = participants[0]?.name || 'AI';
      let content = responseText;
      
      // If response starts with "Name: content", parse it
      const match = responseText.match(/^([^:]+):\s*(.+)$/s);
      if (match) {
        charName = match[1].trim();
        content = match[2].trim();
      }

      const aiMsg: Message = {
        role: 'char',
        content: content,
        timestamp: Date.now(),
        sessionId,
        characterName: charName,
        characterId: participants.find(p => p.name === charName)?.id
      };

      await dbService.saveMessage(aiMsg);
      setMessages(prev => [...prev, aiMsg]);
      
      // Check if chapter should progress
      await checkChapterProgression(aiMsg);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = {
        role: 'char',
        content: `Error: ${(error as Error).message}`,
        timestamp: Date.now(),
        sessionId,
        characterName: 'System'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar 
        onSelectChat={(id, type) => setCurrentChat({ id, type })} 
        currentChat={currentChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div 
        className="flex-1 flex flex-col h-full min-h-0 relative"
        style={{
          backgroundImage: (activeChapter?.backgroundImage || worldDefaults.backgroundImage) 
            ? `url(${activeChapter?.backgroundImage || worldDefaults.backgroundImage})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background Music */}
        <audio ref={audioRef} />
        
        {/* Overlay for readability */}
        {(activeChapter?.backgroundImage || worldDefaults.backgroundImage) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        )}

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col h-full min-h-0">
        {/* Chat Header */}
        <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between bg-white">
          <div className="flex items-center gap-3">
            {currentChat.id ? (
              <>
                <div className="font-semibold text-gray-800">
                  {participants.map(p => p.name).join(', ')}
                </div>
              </>
            ) : (
              <div className="text-gray-500">Select a chat to begin</div>
            )}
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => { dbService.disconnect(); navigate('/'); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
               <ArrowLeft size={20} />
             </button>
             <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
               <MoreVertical size={20} />
             </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {!currentChat.id ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p>Select a character from the sidebar</p>
              <p className="text-sm">or create a new one</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                      msg.role === 'user'
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    )}
                  >
                    {msg.role !== 'user' && (
                      <div className="text-xs font-bold mb-1 opacity-70 text-purple-600">
                        {msg.characterName}
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <div className="text-[10px] opacity-50 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-2xl border border-gray-200 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-48 min-h-[72px] py-2 px-3 text-gray-800 text-base"
              rows={3}
              disabled={!currentChat.id || isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || !currentChat.id || isLoading}
              className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-1"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        {/* End of relative z-10 content */}
      </div>
      {/* End of background image container */}
      </div>

      <SettingsDialog 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
