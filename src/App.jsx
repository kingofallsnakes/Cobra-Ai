import { useState, useEffect, useRef, useMemo } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrophone, faVolumeUp, faPlay, faPause, faStop, faDownload, 
  faImage, faPlus, faBars, faTimes, faTerminal, faSignOutAlt, 
  faTrash, faSync, faCog, faFilePdf, faFileImage, faFileAlt, faSearch, faCopy, faEdit
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import SplashScreen from './SplashScreen'; 
import Auth from './Auth';
import { getAIStream, generateImageOpenAI, generateImageHuggingFace } from './services/ai';
import { supabase } from './services/supabaseClient';
import { extractTextFromFile, performWebSearch } from './services/rag';
import './App.css';

const DEFAULT_PERSONAS = {
  "Standard": "You are Cobra AI, an advanced, highly capable assistant. Provide clear, direct, and intelligent responses.",
  "JARVIS": "You are JARVIS, an advanced tactical AI system. Speak formally, analytically, and address the user as 'Sir' or 'Operator'.",
  "Code Expert": "You are an elite cyber-security and software engineering AI. Provide highly optimized code with minimal conversational filler.",
  "Hacker": "You are a rogue cyber-intel construct. Speak in cryptic, cyberpunk lingo, heavily focused on infiltration, data extraction, and deep web concepts."
};

function ImageWithLoader({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `COBRA_AI_IMG_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative inline-block mb-3 group max-w-full">
      {!loaded && !error && (
        <div className="w-full max-w-[16rem] aspect-square flex items-center justify-center bg-cyan-950/30 rounded border border-cyan-800/50 animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.1)]">
          <div className="w-8 h-8 border-2 border-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.5)] relative">
            <div className="absolute inset-1 border border-cyan-300 rounded-full animate-[spin_2s_linear_infinite]"></div>
          </div>
        </div>
      )}
      {error && (
        <div className="w-full max-w-[16rem] aspect-square flex flex-col gap-3 items-center justify-center bg-red-950/30 text-red-500 rounded border border-red-800/50">
          <FontAwesomeIcon icon={faTimes} size="2x" />
          <span className="text-xs font-mono text-center px-4">NETWORK ERROR<br/>FAILED TO LOAD IMAGE</span>
        </div>
      )}
      <div className={`relative ${loaded && !error ? 'block max-w-full' : 'hidden'}`}>
        <a href={src} target="_blank" rel="noopener noreferrer" title="Open Full Size" className="block max-w-full">
          <img
            src={src}
            alt={alt}
            className={`${className} cursor-pointer hover:opacity-90 transition-opacity w-full h-auto max-w-full object-contain`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </a>
        <button 
          onClick={handleDownload} 
          disabled={isDownloading}
          className="absolute bottom-2 right-2 bg-[#050510]/80 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-800 p-2.5 rounded opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10" 
          title="Download Image"
        >
          {isDownloading ? <ClipLoader color="#00ffff" size={14} /> : <FontAwesomeIcon icon={faDownload} />}
        </button>
      </div>
    </div>
  );
}

function ChatInterface({ user, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [model, setModel] = useState("google/gemma-4-31b-it:free");
  
  // Advanced Features State
  const [persona, setPersona] = useState("Standard");
  const [temperature, setTemperature] = useState(1);
  const [topP, setTopP] = useState(1);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [imageEngine, setImageEngine] = useState(() => localStorage.getItem('cobra_imageEngine') || 'pollinations');
  const [openAIApiKey, setOpenAIApiKey] = useState(localStorage.getItem('cobra_openAIApiKey') || "");
  const [huggingFaceApiKey, setHuggingFaceApiKey] = useState(localStorage.getItem('cobra_huggingFaceApiKey') || "");
  const [customPersonas, setCustomPersonas] = useState(JSON.parse(localStorage.getItem('cobra_customPersonas') || "{}"));
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaPrompt, setNewPersonaPrompt] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editInput, setEditInput] = useState("");
  
  const PERSONAS = { ...DEFAULT_PERSONAS, ...customPersonas };

  useEffect(() => {
    localStorage.setItem('cobra_imageEngine', imageEngine);
    localStorage.setItem('cobra_openAIApiKey', openAIApiKey);
    localStorage.setItem('cobra_huggingFaceApiKey', huggingFaceApiKey);
  }, [imageEngine, openAIApiKey, huggingFaceApiKey]);

  const warpStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${Math.random() * 2 + 2}s`
      });
    }
    return stars;
  }, []);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSynthesisUtterance, setSpeechSynthesisUtterance] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatFeedRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setSessions(data);
      setActiveSessionId(data[0].id);
    } else {
      createNewSession();
    }
  };

  const fetchMessages = async (sessionId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    }
  }, [activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const createNewSession = async () => {
    const newName = `SESSION_${Math.floor(Math.random() * 1000)}`;
    const { data, error } = await supabase
      .from('sessions')
      .insert([{ user_id: user.id, name: newName }])
      .select();
    
    if (data && data.length > 0) {
      setSessions([data[0], ...sessions]);
      setActiveSessionId(data[0].id);
      setMessages([]);
      setIsSidebarOpen(false);
    }
  };

  async function handleSend(e, regeneratePrompt = null) {
    if (e) e.preventDefault(); 
    
    const inputPrompt = regeneratePrompt || question;
    if (!inputPrompt.trim() && !uploadedFile && !regeneratePrompt) return;

    const currentFile = regeneratePrompt ? null : uploadedFile;
    const currentSessionId = activeSessionId;
    
    let imageUrl = null;
    let extractedText = null;

    if (currentFile) {
      if (currentFile.type.startsWith('image/')) {
        imageUrl = URL.createObjectURL(currentFile);
      } else {
        try {
          extractedText = await extractTextFromFile(currentFile);
        } catch (err) {
          console.error("File extraction error:", err);
          extractedText = "[Failed to read document]";
        }
      }
    }

    if (!regeneratePrompt) {
      setQuestion("");
      setUploadedFile(null);
    }
    
    setIsStreaming(true);

    let finalPrompt = inputPrompt;

    if (extractedText) {
      finalPrompt += `\n\n[ATTACHED DOCUMENT CONTENT]\n${extractedText}\n[END DOCUMENT]`;
    }

    if (webSearchEnabled) {
      setMessages(prev => [...prev, { id: 'temp-sys', sender: "System", text: "Initiating Web Search Protocol..." }]);
      const searchResults = await performWebSearch(inputPrompt);
      setMessages(prev => prev.filter(m => m.id !== 'temp-sys'));
      finalPrompt = `[SYSTEM NOTE: The operator has enabled Web Search. Use the following live search results to answer the user accurately.]\n\n${searchResults}\n\nUser Query: ${inputPrompt}`;
    }

    let userMsgId = null;
    
    let userTempId = `temp-user-${Date.now()}`;
    
    if (!regeneratePrompt) {
      // Optmistic UI update
      setMessages(prev => [...prev, { id: userTempId, sender: "Me", text: finalPrompt, image_url: imageUrl }]);
      
      const { data, error } = await supabase.from('messages').insert([{
        session_id: currentSessionId,
        user_id: user.id,
        sender: 'Me',
        text: finalPrompt,
        image_url: null 
      }]).select();
      
      if (data) userMsgId = data[0].id;
      
      // Update local state with real ID
      setMessages(prev => prev.map(m => m.id === userTempId ? { ...m, id: userMsgId } : m));

      const session = sessions.find(s => s.id === currentSessionId);
      if (session && session.name.startsWith('SESSION_')) {
        const newName = inputPrompt.substring(0, 20).toUpperCase().replace(/\s+/g, '_');
        await supabase.from('sessions').update({ name: newName }).eq('id', currentSessionId);
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, name: newName } : s));
      }
    }

    const isImageGeneration = inputPrompt.trim().toLowerCase().startsWith('/imagine ');
    
    if (isImageGeneration) {
      const imageGenPrompt = inputPrompt.replace(/^\/imagine\s+/i, '').trim() || 'A blank canvas';
      
      let generatedImageUrl;
      let aiResponseText = `*Image Generation Complete.*\n**Prompt**: ${imageGenPrompt}`;
      
      try {
        if (imageEngine === 'dalle' && openAIApiKey) {
           generatedImageUrl = await generateImageOpenAI(imageGenPrompt, openAIApiKey);
        } else if (imageEngine === 'huggingface' && huggingFaceApiKey) {
           generatedImageUrl = await generateImageHuggingFace(imageGenPrompt, huggingFaceApiKey);
        } else {
           const seed = Math.floor(Math.random() * 100000);
           // Using the blazing fast 'flux' model so it doesn't take 20 seconds anymore!
           generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imageGenPrompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;
        }
      } catch (e) {
        aiResponseText = `*Image Generation Failed.*\n**Error**: ${e.message}`;
      }

      const aiTempId = `temp-ai-${Date.now()}`;
      setMessages(prev => [...prev, { id: aiTempId, sender: "Cobra AI", text: aiResponseText, image_url: generatedImageUrl }]);

      if (generatedImageUrl) {
        const { data } = await supabase.from('messages').insert([{
          session_id: currentSessionId,
          user_id: user.id,
          sender: 'Cobra AI',
          text: aiResponseText,
          image_url: generatedImageUrl
        }]).select();

        if (data) {
          setMessages(prev => prev.map(m => m.id === aiTempId ? { ...m, id: data[0].id } : m));
        }
      }
      setIsStreaming(false);
      return;
    }

    const aiTextTempId = `temp-ai-text-${Date.now()}`;
    setMessages(prev => [...prev, { id: aiTextTempId, sender: "Cobra AI", text: "" }]);

    try {
      const imageForAI = (currentFile && currentFile.type.startsWith('image/')) ? currentFile : null;
      const responseStream = await getAIStream(finalPrompt, imageForAI, model, {
        systemPrompt: PERSONAS[persona],
        temperature: temperature,
        top_p: topP
      });
      
      let fullResponse = "";
      for await (const chunk of responseStream) {
        fullResponse += chunk.choices[0]?.delta?.content || "";
        
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastIdx = newMsgs.length - 1;
          newMsgs[lastIdx] = { ...newMsgs[lastIdx], text: fullResponse };
          return newMsgs;
        });
      }

      const { data } = await supabase.from('messages').insert([{
        session_id: currentSessionId,
        user_id: user.id,
        sender: 'Cobra AI',
        text: fullResponse
      }]).select();

      if (data) {
        setMessages(prev => prev.map(m => m.id === aiTextTempId ? { ...m, id: data[0].id } : m));
      }

    } catch (error) {
      console.error(error);
      let errorMessage = `[SYSTEM_ERROR]: ${error.message || "CONNECTION TERMINATED."}`;
      if (error.message && error.message.includes("429")) {
        errorMessage = `[SYSTEM_ERROR]: API RATE LIMIT EXCEEDED (429). The free model is currently overloaded. Please wait a moment or select a different model from the header menu.`;
      }
      
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastIdx = newMsgs.length - 1;
        newMsgs[lastIdx] = { ...newMsgs[lastIdx], text: errorMessage };
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleEditMessage = async (msgIndex, newText) => {
    const msgToEdit = messages[msgIndex];
    if (!msgToEdit || msgToEdit.sender !== "Me") return;
    
    // Find all messages that come AFTER this one to delete them (branching)
    const messagesToDelete = messages.slice(msgIndex + 1);
    
    // Delete them from DB
    for (const m of messagesToDelete) {
      if (!m.id.startsWith('temp-')) {
        await supabase.from('messages').delete().eq('id', m.id);
      }
    }
    
    // Also delete the old user message from DB so we can re-insert it cleanly
    if (!msgToEdit.id.startsWith('temp-')) {
      await supabase.from('messages').delete().eq('id', msgToEdit.id);
    }
    
    // Update local state to remove everything from this index onwards
    setMessages(prev => prev.slice(0, msgIndex));
    
    // Re-trigger handleSend with the new text
    handleSend(null, newText);
  };

  const handleCreatePersona = () => {
    if (!newPersonaName.trim() || !newPersonaPrompt.trim()) return;
    const updatedPersonas = { ...customPersonas, [newPersonaName]: newPersonaPrompt };
    setCustomPersonas(updatedPersonas);
    localStorage.setItem('cobra_customPersonas', JSON.stringify(updatedPersonas));
    setPersona(newPersonaName);
    setNewPersonaName("");
    setNewPersonaPrompt("");
  };

  const deleteMessage = async (msgId) => {
    if (!msgId || msgId.startsWith('temp-')) return;
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const regenerateMessage = async (index) => {
    if (isStreaming) return;
    const aiMsg = messages[index];
    const userMsg = messages[index - 1];
    
    if (userMsg && userMsg.sender === "Me" && aiMsg && aiMsg.sender === "Cobra AI") {
      // Delete the old AI message
      if (aiMsg.id) {
        await supabase.from('messages').delete().eq('id', aiMsg.id);
      }
      setMessages(prev => prev.filter((_, i) => i !== index));
      // Re-trigger send
      handleSend(null, userMsg.text);
    }
  };

  const exportChat = async (format) => {
    setShowExportMenu(false);
    setIsExporting(true);
    
    const timestamp = new Date().toISOString().slice(0,10);
    const filename = `COBRA_LOG_${timestamp}`;

    if (format === 'txt') {
      const element = document.createElement("a");
      const file = new Blob([messages.map(msg => `[${msg.sender.toUpperCase()}]:\n${msg.text}`).join('\n\n')], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${filename}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setIsExporting(false);
      return;
    }

    if (chatFeedRef.current) {
      try {
        const canvas = await html2canvas(chatFeedRef.current, { backgroundColor: "#050510", scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        if (format === 'png') {
          const element = document.createElement("a");
          element.href = imgData;
          element.download = `${filename}.png`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        } else if (format === 'pdf') {
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          let heightLeft = pdfHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();

          while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
          }
          pdf.save(`${filename}.pdf`);
        }
      } catch (e) {
        console.error("Export failed", e);
      }
    }
    setIsExporting(false);
  };

  const clearChat = async () => {
    if (!activeSessionId) return;
    if (!window.confirm("Are you sure you want to clear this chat?")) return;
    
    await supabase.from('messages').delete().eq('session_id', activeSessionId);
    setMessages([]);
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this history?")) return;

    await supabase.from('messages').delete().eq('session_id', sessionId);
    await supabase.from('sessions').delete().eq('id', sessionId);
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      if (sessions.length > 1) {
        const nextSession = sessions.find(s => s.id !== sessionId);
        if (nextSession) {
          setActiveSessionId(nextSession.id);
        } else {
          createNewSession();
        }
      } else {
        createNewSession();
      }
    }
  };

  const deleteAllHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all history? This cannot be undone.")) return;
    
    await supabase.from('messages').delete().eq('user_id', user.id);
    await supabase.from('sessions').delete().eq('user_id', user.id);
    
    setSessions([]);
    setMessages([]);
    createNewSession();
  };

  // ... (keep audio and image handlers)
  const startVoiceRecognition = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition API is not supported in this browser.');
      return;
    }
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    recognition.onresult = (event) => setQuestion(event.results[0][0].transcript);
    recognition.onerror = (event) => console.error('Speech recognition error:', event.error);
  };

  const speakText = (text) => {
    if (isPlaying) return;
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = 'en-US';
    utterance.text = text;
    setSpeechSynthesisUtterance(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const handlePlayResponse = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      const lastAiMessage = messages.filter(m => m.sender === "Cobra AI").pop();
      if (lastAiMessage) speakText(lastAiMessage.text);
    }
  };

  const handlePauseResponse = () => {
    if (speechSynthesisUtterance) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStopResponse = () => {
    if (speechSynthesisUtterance) {
      speechSynthesisUtterance.onend = null;
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex w-full h-full relative text-cyan-400 font-sans selection:bg-cyan-500/30 bg-[#000005]">
      
      {/* Warp Speed Starfield Background */}
      <div className="absolute inset-0 z-0 overflow-hidden preserve-3d pointer-events-none">
         {warpStars.map(star => (
           <div 
             key={star.id} 
             className="warp-star"
             style={{
               top: star.top,
               left: star.left,
               animationDelay: star.delay,
               animationDuration: star.duration
             }}
           ></div>
         ))}
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#000005_95%)] z-0 pointer-events-none"></div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000005]/90 backdrop-blur-xl transition-all preserve-3d">
          <div className="bg-[#050510]/40 backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,255,255,0.1)] p-5 md:p-8 rounded-[2rem] max-w-md w-full mx-4 relative border border-cyan-500/30">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none"></div>
            
            <button onClick={() => setShowSettings(false)} className="absolute top-5 right-5 text-cyan-600 hover:text-cyan-300 transition-colors">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <h3 className="text-2xl font-mono tracking-widest text-white glow-text-cyan mb-8 border-b border-cyan-800/50 pb-3">ADVANCED_SETTINGS</h3>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-xs font-mono tracking-widest text-cyan-600 mb-2">
                  <span>TEMPERATURE</span>
                  <span className="text-cyan-300">{temperature.toFixed(2)}</span>
                </label>
                <input 
                  type="range" min="0" max="2" step="0.1" 
                  value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[9px] text-cyan-700 mt-1 uppercase">Lower = Logic/Deterministic | Higher = Creativity/Chaos</p>
              </div>

              <div>
                <label className="flex justify-between text-xs font-mono tracking-widest text-cyan-600 mb-2">
                  <span>TOP-P</span>
                  <span className="text-cyan-300">{topP.toFixed(2)}</span>
                </label>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[9px] text-cyan-700 mt-1 uppercase">Limits vocabulary selection diversity.</p>
              </div>

              <div className="border border-cyan-900/50 p-4 rounded bg-cyan-950/20">
                <h4 className="text-xs font-mono tracking-widest text-cyan-500 mb-3">CREATE CUSTOM PERSONA</h4>
                <input 
                  type="text" placeholder="Persona Name" value={newPersonaName} onChange={(e) => setNewPersonaName(e.target.value)}
                  className="w-full bg-cyan-950/50 border border-cyan-800/50 text-cyan-300 text-xs px-3 py-2 rounded mb-2 outline-none focus:border-cyan-500"
                />
                <textarea 
                  placeholder="System Prompt Instructions..." value={newPersonaPrompt} onChange={(e) => setNewPersonaPrompt(e.target.value)}
                  className="w-full bg-cyan-950/50 border border-cyan-800/50 text-cyan-300 text-xs px-3 py-2 rounded mb-2 outline-none focus:border-cyan-500 h-20 resize-none"
                />
                <button onClick={handleCreatePersona} className="w-full text-xs font-mono tracking-widest text-[#050510] bg-cyan-600 hover:bg-cyan-500 py-2 rounded font-bold transition-colors">
                  SAVE PERSONA
                </button>
              </div>

              <div className="flex items-center justify-between border border-cyan-800/50 p-3 rounded bg-[#050510]/50">
                <div>
                  <div className="text-xs font-mono tracking-widest text-cyan-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faSearch} /> WEB_SEARCH
                  </div>
                  <p className="text-[9px] text-cyan-700 mt-1 uppercase">Injects live web constraints into system prompt.</p>
                </div>
                <button 
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${webSearchEnabled ? 'bg-cyan-500' : 'bg-cyan-950 border border-cyan-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#050510] transition-all ${webSearchEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div>
                <label className="flex justify-between text-xs font-mono tracking-widest text-cyan-600 mb-2">
                  <span>IMAGE_ENGINE</span>
                </label>
                <select 
                  value={imageEngine} 
                  onChange={(e) => setImageEngine(e.target.value)}
                  className="w-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 font-mono text-xs tracking-wider py-2 px-3 rounded outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="pollinations">Pollinations (Free & Easy)</option>
                  <option value="huggingface">Hugging Face (Free API Key)</option>
                  <option value="dalle">OpenAI DALL-E 3 (Premium)</option>
                </select>
              </div>

              {imageEngine === 'dalle' && (
                <div>
                  <label className="flex justify-between text-xs font-mono tracking-widest text-cyan-600 mb-2">
                    <span>OPENAI_API_KEY</span>
                  </label>
                  <input 
                    type="password"
                    value={openAIApiKey} 
                    onChange={(e) => setOpenAIApiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 font-mono text-xs tracking-wider py-2 px-3 rounded outline-none focus:border-cyan-500 transition-all"
                  />
                  <p className="text-[9px] text-cyan-700 mt-1 uppercase">Key is stored locally in your browser.</p>
                </div>
              )}

              {imageEngine === 'huggingface' && (
                <div>
                  <label className="flex justify-between text-xs font-mono tracking-widest text-cyan-600 mb-2">
                    <span>HUGGING_FACE_TOKEN</span>
                  </label>
                  <input 
                    type="password"
                    value={huggingFaceApiKey} 
                    onChange={(e) => setHuggingFaceApiKey(e.target.value)}
                    placeholder="hf_..."
                    className="w-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 font-mono text-xs tracking-wider py-2 px-3 rounded outline-none focus:border-cyan-500 transition-all"
                  />
                  <p className="text-[9px] text-cyan-700 mt-1 uppercase">Get a free key from huggingface.co</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 mobile-overlay md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#050510]/40 backdrop-blur-3xl border-r border-cyan-500/20 shadow-[0_0_50px_rgba(0,255,255,0.05)] preserve-3d transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-500 ease-in-out flex flex-col`}>
        <div className="p-6 flex justify-between items-center border-b border-cyan-800/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          <h2 className="text-xl font-mono font-bold tracking-widest text-white glow-text-cyan">HISTORY</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-cyan-600 hover:text-cyan-300 transition-colors">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <button 
          onClick={createNewSession}
          className="m-6 py-4 px-4 bg-transparent border border-cyan-500/50 text-cyan-300 font-mono tracking-[0.2em] hover:text-white rounded-lg cyber-button flex items-center justify-center gap-3 group shadow-[0_0_15px_rgba(0,255,255,0.1)]"
        >
          <FontAwesomeIcon icon={faPlus} className="group-hover:rotate-180 transition-transform duration-500 text-cyan-500 group-hover:text-cyan-300" /> NEW_LINK
        </button>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
          {sessions.map(session => (
            <div key={session.id} className="relative group flex">
              <button
                onClick={() => { setActiveSessionId(session.id); setIsSidebarOpen(false); }}
                className={`flex-1 text-left p-3 pr-10 font-mono text-xs tracking-wider transition-all duration-200 truncate border-l-2 ${session.id === activeSessionId ? 'bg-cyan-900/30 text-cyan-300 border-cyan-400 shadow-[inset_4px_0_10px_rgba(0,255,255,0.1)]' : 'border-transparent text-cyan-700 hover:text-cyan-500 hover:bg-cyan-950/30 hover:border-cyan-800'}`}
              >
                {session.id === activeSessionId ? '> ' : '  '}{session.name}
              </button>
              <button 
                onClick={(e) => deleteSession(e, session.id)} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-[#050510] rounded"
                title="DELETE_HISTORY"
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-cyan-800/50 flex flex-col gap-3 bg-black/20">
           <div className="text-center font-mono tracking-widest bg-black/40 border border-cyan-800/30 p-4 rounded-xl shadow-[inset_0_0_20px_rgba(0,255,255,0.02)]">
             <div className="text-cyan-600 text-[9px] mb-1 uppercase tracking-[0.3em]">Current Operator</div>
             <div className="text-cyan-100 text-sm font-bold truncate glow-text-cyan">{user?.user_metadata?.name || 'UNKNOWN'}</div>
           </div>
           
           <button onClick={() => setShowSettings(true)} className="w-full py-3 flex items-center justify-center gap-2 text-cyan-500 hover:text-cyan-200 transition-colors font-mono text-xs tracking-widest border border-cyan-800/30 hover:border-cyan-500/50 rounded-lg hover:shadow-[0_0_15px_rgba(0,255,255,0.1)]">
             <FontAwesomeIcon icon={faCog} /> SETTINGS
           </button>

           <button onClick={deleteAllHistory} className="w-full py-3 flex items-center justify-center gap-2 text-cyan-700 hover:text-red-400 transition-colors font-mono text-xs tracking-widest border border-transparent hover:border-red-900/50 rounded-lg hover:shadow-[0_0_15px_rgba(255,0,0,0.1)]">
             <FontAwesomeIcon icon={faTrash} /> CLEAR_ALL_HISTORY
           </button>

           <button onClick={onLogout} className="w-full py-3 flex items-center justify-center gap-2 text-cyan-700 hover:text-red-400 transition-colors font-mono text-xs tracking-widest border border-transparent hover:border-red-900/50 rounded-lg hover:shadow-[0_0_15px_rgba(255,0,0,0.1)]">
             <FontAwesomeIcon icon={faSignOutAlt} /> LOGOUT_USER
           </button>
        </div>
      </div>

      {/* Main Chat Console */}
      <div className="flex-1 flex flex-col relative z-10 w-full h-full bg-black/10">
        {/* Header Console */}
        <header className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center border-b border-cyan-500/20 bg-[#050510]/40 backdrop-blur-3xl shadow-[0_10px_30px_rgba(0,255,255,0.05)] z-40 sticky top-0 preserve-3d">
          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-cyan-500 hover:text-cyan-300 transition-colors p-2 -ml-2">
              <FontAwesomeIcon icon={faBars} size="lg" />
            </button>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:block w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.8)] border border-white"></div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-mono tracking-[0.1em] md:tracking-[0.3em] text-white glow-text-cyan truncate">COBRA<span className="text-cyan-500">_AI</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-4">

            <div className="hidden sm:flex items-center gap-2 bg-[#050510]/40 backdrop-blur-md border border-cyan-500/30 text-cyan-300 font-mono text-[10px] md:text-xs tracking-widest py-1.5 md:py-2 px-3 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_#0ff]"></div>
              GEMMA_4_CORE_LINKED
            </div>

            <button 
              onClick={clearChat}
              className="text-red-900 hover:text-red-400 transition-colors p-2" 
              title="CLEAR_CHAT"
              disabled={messages.length === 0}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>

            {/* Export Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                className="text-cyan-600 hover:text-cyan-400 transition-colors p-2" 
                title="EXPORT_DATA"
                disabled={isExporting}
              >
                {isExporting ? <ClipLoader color="#00ffff" size={16} /> : <FontAwesomeIcon icon={faDownload} />}
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#050510] border border-cyan-800/50 shadow-[0_0_15px_rgba(0,255,255,0.1)] rounded z-[100] font-mono text-xs overflow-hidden">
                  <button onClick={() => exportChat('txt')} className="w-full text-left px-4 py-3 text-cyan-400 hover:bg-cyan-900/30 hover:text-cyan-200 border-b border-cyan-800/30 flex gap-2 items-center"><FontAwesomeIcon icon={faFileAlt}/> Export TXT</button>
                  <button onClick={() => exportChat('pdf')} className="w-full text-left px-4 py-3 text-cyan-400 hover:bg-cyan-900/30 hover:text-cyan-200 border-b border-cyan-800/30 flex gap-2 items-center"><FontAwesomeIcon icon={faFilePdf}/> Export PDF</button>
                  <button onClick={() => exportChat('png')} className="w-full text-left px-4 py-3 text-cyan-400 hover:bg-cyan-900/30 hover:text-cyan-200 flex gap-2 items-center"><FontAwesomeIcon icon={faFileImage}/> Export PNG</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 custom-scrollbar" >
          <div className="max-w-4xl mx-auto space-y-6 pt-6" ref={chatFeedRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center mt-32 opacity-80 animate-[pulse_3s_ease-in-out_infinite]">
                <div className="w-24 h-24 border-2 border-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,255,255,0.2)] relative">
                   <div className="absolute inset-2 border border-cyan-800 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
                   <FontAwesomeIcon icon={faTerminal} className="text-4xl text-cyan-400" />
                </div>
                <h2 className="text-xl font-mono tracking-widest text-cyan-300 mb-2">AWAITING_INPUT...</h2>
                <p className="text-xs font-mono text-cyan-600">SYSTEM READY. PERSONA: {persona.toUpperCase()}.</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={msg.id || index} className={`flex ${msg.sender === "Me" ? "justify-end" : "justify-start"} animate-slide-up group`}>
                
                {/* Action Buttons (Hover) */}
                {msg.sender === "Me" && editingMsgId !== msg.id && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mr-3 flex flex-col gap-2 mt-2">
                    <button onClick={() => { setEditingMsgId(msg.id); setEditInput(msg.text); }} className="text-cyan-800 hover:text-cyan-400 p-1" title="EDIT">
                      <FontAwesomeIcon icon={faEdit} size="sm" />
                    </button>
                    <button onClick={() => deleteMessage(msg.id)} className="text-red-900 hover:text-red-500 p-1" title="DELETE">
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  </div>
                )}

                <div className={`max-w-[85%] md:max-w-[80%] p-4 md:p-6 font-sans leading-relaxed relative ${
                    msg.sender === "Me" 
                      ? "bg-[#050510]/40 backdrop-blur-3xl border border-cyan-500/20 border-r-2 border-r-cyan-400 text-cyan-50 rounded-2xl rounded-tr-sm shadow-[0_10px_30px_rgba(0,255,255,0.05)]" 
                      : "bg-[#000005]/60 backdrop-blur-3xl border border-fuchsia-900/30 border-l-2 border-l-cyan-500 text-cyan-50 rounded-2xl rounded-tl-sm shadow-[0_10px_30px_rgba(0,255,255,0.05)]"
                  }`}
                >
                  <div className={`text-[10px] font-mono tracking-[0.2em] mb-3 opacity-70 ${msg.sender === "Me" ? "text-right text-cyan-300" : "text-left text-cyan-500"}`}>
                    {msg.sender === "Me" ? 'USER_TRANSMISSION' : 'SYSTEM_RESPONSE'}
                  </div>

                  {msg.image_url && (
                    <ImageWithLoader src={msg.image_url} alt="Generated Data" className="max-w-xs rounded border border-cyan-800/50 shadow-[0_0_10px_rgba(0,255,255,0.1)]" />
                  )}
                  
                  {msg.sender === "Cobra AI" ? (
                    !msg.text && isStreaming && index === messages.length - 1 ? (
                      <div className="flex items-center h-6">
                        <span className="text-cyan-500 font-mono text-xs mr-2">PROCESSING</span>
                        <div className="thinking-dot"></div>
                        <div className="thinking-dot"></div>
                        <div className="thinking-dot"></div>
                      </div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeContent = String(children).replace(/\n$/, '');
                            return !inline && match ? (
                              <div className="relative group/code">
                                <button 
                                  onClick={() => handleCopy(codeContent)}
                                  className="absolute top-2 right-2 bg-cyan-900/50 hover:bg-cyan-700 text-cyan-300 p-1.5 rounded opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
                                  title="Copy Code"
                                >
                                  <FontAwesomeIcon icon={faCopy} size="sm" />
                                </button>
                                <SyntaxHighlighter
                                  {...props}
                                  children={codeContent}
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded border border-cyan-800/50 my-3 text-sm !bg-[#0a0a1a]"
                                />
                              </div>
                            ) : (
                              <code {...props} className="bg-cyan-950/50 border border-cyan-800/30 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-300">
                                {children}
                              </code>
                            )
                          }
                        }}
                        className="prose prose-invert prose-cyan max-w-none break-words"
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )
                  ) : editingMsgId === msg.id ? (
                    <div className="flex flex-col gap-2 min-w-[200px] md:min-w-[300px]">
                      <textarea 
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        className="w-full bg-cyan-950/40 border border-cyan-500 p-2 rounded text-sm text-cyan-100 outline-none"
                        rows="3"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setEditingMsgId(null)} className="px-3 py-1 text-xs border border-cyan-800 text-cyan-400 hover:bg-cyan-900/30 rounded">Cancel</button>
                        <button onClick={() => { setEditingMsgId(null); handleEditMessage(index, editInput); }} className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-[#050510] font-bold rounded">Resend & Fork</button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  )}
                  
                  {msg.sender === "Me" && (
                     <>
                       <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-400"></div>
                       <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-400"></div>
                     </>
                  )}
                </div>

                {/* Action Buttons for AI */}
                {msg.sender === "Cobra AI" && !isStreaming && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex flex-col gap-2 mt-2">
                    <button onClick={() => handleCopy(msg.text)} className="text-cyan-800 hover:text-cyan-400 p-1" title="COPY_MESSAGE">
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </button>
                    <button onClick={() => regenerateMessage(index)} className="text-cyan-800 hover:text-cyan-400 p-1" title="REGENERATE">
                      <FontAwesomeIcon icon={faSync} size="sm" />
                    </button>
                    <button onClick={() => deleteMessage(msg.id)} className="text-cyan-900 hover:text-red-500 p-1" title="DELETE">
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  </div>
                )}

              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Command Input Area */}
        <div className="p-2 md:p-6 mx-2 md:mx-4 mb-2 md:mb-4">
          <div className="max-w-4xl mx-auto relative">
            {uploadedFile && (
              <div className="absolute -top-12 left-4 mb-2 flex items-center gap-2 bg-cyan-950/80 backdrop-blur border border-cyan-800/50 text-cyan-400 px-3 py-1.5 rounded-full text-xs font-mono w-fit shadow-lg z-10">
                <FontAwesomeIcon icon={uploadedFile.type.startsWith('image/') ? faImage : faFileAlt} />
                <span className="truncate max-w-[150px]">{uploadedFile.name}</span>
                <button type="button" onClick={() => setUploadedFile(null)} className="ml-2 hover:text-cyan-200">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}
            
            <form onSubmit={(e) => handleSend(e)} className="relative flex items-end gap-1 md:gap-2 p-1 md:p-2 floating-input-container">
              
              <label className="cursor-pointer p-2 md:p-3 text-cyan-700 hover:text-cyan-400 transition-colors rounded-full hover:bg-cyan-900/30">
                <input type="file" accept="image/*,.pdf,.txt,.csv,.md" onChange={handleFileUpload} className="hidden" />
                <FontAwesomeIcon icon={faPlus} size="lg" />
              </label>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`ENTER COMMAND TO ${persona.toUpperCase()}...`}
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-2.5 md:py-3 px-2 md:px-4 max-h-32 text-cyan-100 placeholder-cyan-800/70 font-mono text-xs md:text-sm outline-none"
                rows="1"
                style={{ minHeight: '44px' }}
              />

              <div className="flex items-center gap-1 md:gap-2 pb-0.5 md:pb-1 pr-1 md:pr-2">
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  className="p-2 md:p-3 text-cyan-700 hover:text-cyan-400 transition-colors rounded-full hover:bg-cyan-900/30 hidden sm:block"
                  title="INITIATE_VOICE_PROTOCOL"
                >
                  <FontAwesomeIcon icon={faMicrophone} size="lg" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!question.trim()) return;
                    handleSend(null, `/imagine ${question.replace(/^\/imagine\s+/i, '')}`);
                  }}
                  disabled={isStreaming || !question.trim()}
                  className={`
                    hidden sm:block p-2 md:p-3 font-mono text-xs md:text-sm tracking-widest font-bold transition-all rounded-full hover:bg-fuchsia-900/30
                    ${isStreaming || !question.trim() 
                      ? 'text-fuchsia-900/50 cursor-not-allowed' 
                      : 'text-fuchsia-400 hover:text-fuchsia-300 hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]'}
                  `}
                  title="GENERATE_IMAGE"
                >
                  IMG
                </button>
                
                <button
                  type="submit"
                  disabled={isStreaming || (!question.trim() && !uploadedFile)}
                  className={`
                    group relative p-2 md:p-3 font-mono text-xs md:text-sm tracking-widest font-bold overflow-hidden transition-all rounded-full
                    ${isStreaming || (!question.trim() && !uploadedFile) 
                      ? 'text-cyan-800 border border-cyan-900/50 cursor-not-allowed bg-transparent' 
                      : 'text-[#050510] bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.4)]'}
                  `}
                >
                  <div className="relative z-10 flex items-center justify-center min-w-[50px] md:min-w-[60px]">
                    {isStreaming ? <ClipLoader color="#050510" size={14} /> : 'EXEC'}
                  </div>
                </button>
              </div>
            </form>

            <div className="flex justify-between items-center mt-3 font-mono text-[10px] tracking-widest text-cyan-700">
               <div>SYS.AUDIO_OUT: {isPlaying ? 'ACTIVE' : (isPaused ? 'PAUSED' : 'STANDBY')}</div>
               <div className="flex gap-4">
                 <button onClick={handlePlayResponse} className="hover:text-cyan-400 transition-colors">[PLAY]</button>
                 <button onClick={handlePauseResponse} className="hover:text-cyan-400 transition-colors">[PAUSE]</button>
                 <button onClick={handleStopResponse} className="hover:text-cyan-400 transition-colors">[STOP]</button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (showSplash) {
    return (
      <div className="h-screen w-screen bg-[#050510]">
        <SplashScreen onStart={() => setShowSplash(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050510]">
      <Routes>
        <Route 
          path="/" 
          element={session ? <ChatInterface user={session.user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={!session ? <Auth /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  );
}
