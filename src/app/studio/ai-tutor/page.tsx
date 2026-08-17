"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Link as LinkIcon, RefreshCcw, Mic, Square, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PermutationVisualizer } from "@/components/studio/PermutationVisualizer";
import { SecurityVisualizer } from "@/components/studio/SecurityVisualizer";
import { InteractiveStateGrid } from "@/components/studio/InteractiveStateGrid";
import { useAsconStore } from "@/store/useAsconStore";
import { Expand, Shrink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "dark" });

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>("");
  const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    mermaid.render(id, chart).then((result) => {
      setSvg(result.svg);
    }).catch(e => console.error(e));
  }, [chart]);

  if (!svg) return <div className="text-zinc-500 text-sm animate-pulse">Rendering diagram...</div>;
  return <div dangerouslySetInnerHTML={{ __html: svg }} className="bg-white/5 p-4 rounded-xl overflow-x-auto w-full my-4 flex justify-center" />;
};

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  image?: string;
  sources?: string[];
  actions?: Record<string, any>;
  isStreaming?: boolean;
}

export default function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "Hello! I am your ASCON AI Tutor. Ask me anything about the ASCON permutation, 320-bit state, or cryptographic structural vulnerabilities." }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const currentStepIndex = useAsconStore(state => state.currentStepIndex);
  const learningMode = useAsconStore(state => state.learningMode);
  
  const ws = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket("ws://127.0.0.1:8000/ws/ai-tutor");
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "chunk") {
        setMessages((prev) => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last.role === "ai" && last.isStreaming) {
            newMsgs[newMsgs.length - 1] = { ...last, content: last.content + data.message };
          } else {
            newMsgs.push({ role: "ai", content: data.message, isStreaming: true });
          }
          return newMsgs;
        });
      } else if (data.type === "done") {
        setMessages((prev) => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last.role === "ai") {
            newMsgs[newMsgs.length - 1] = { 
              ...last, 
              isStreaming: false, 
              actions: data.actions, 
              sources: data.sources 
            };
          }
          return newMsgs;
        });
      }
    };
  };

  useEffect(() => {
    connectWebSocket();

    // Initialize Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setInput((prev) => prev + " " + transcript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
           console.error("Speech recognition error", event.error);
           if (event.error === 'not-allowed') {
             setIsListening(false);
             isListeningRef.current = false;
           }
        };

        recognitionRef.current.onend = () => {
           if (isListeningRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error(e);
              }
           }
        };
      }
    }

    return () => {
      ws.current?.close();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if ((!input.trim() && !selectedImage) || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    setMessages((prev) => [...prev, { role: "user", content: input, image: selectedImage || undefined }]);
    const payload = {
       text: input,
       image: selectedImage || undefined,
       context: { step: currentStepIndex, mode: learningMode }
    };
    ws.current.send(JSON.stringify(payload));
    setInput("");
    setSelectedImage(null);
  };

  const handleStop = () => {
    // Forcefully close to sever the connection, and then reconnect seamlessly
    if (ws.current) {
      ws.current.close();
      setMessages((prev) => {
        const newMsgs = [...prev];
        const last = newMsgs[newMsgs.length - 1];
        if (last && last.role === "ai" && last.isStreaming) {
           newMsgs[newMsgs.length - 1] = { ...last, isStreaming: false, content: last.content + " [Aborted by user]" };
        }
        return newMsgs;
      });
      connectWebSocket();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to start listening", e);
      }
    }
  };

  const isGenerating = messages[messages.length - 1]?.role === "ai" && messages[messages.length - 1]?.isStreaming;
  // Get the last highlighted action if it exists in history
  const activeAction = [...messages].reverse().find(m => m.actions?.highlight)?.actions?.highlight;
  const showSidePanel = [...messages].reverse().find(m => m.actions?.open_side_panel)?.actions?.open_side_panel;

  return (
    <div className={`flex h-[calc(100vh-4rem)] p-4 md:p-6 gap-6 ${isFullscreen ? "hidden md:flex flex-col-reverse" : ""}`}>
      
      {/* Left: Chatbot Window */}
      <div className={`w-full flex flex-col bg-[#09090b] rounded-2xl border border-white/10 shadow-xl overflow-hidden transition-all ${isFullscreen ? "h-1/3 md:w-full" : "md:w-1/2 h-full"}`}>
        <header className="p-4 border-b border-white/10 bg-black/50 flex items-center gap-3">
           <Bot className="w-6 h-6 text-blue-400" />
           <div>
             <h2 className="font-semibold text-white">ASCON Copilot</h2>
             <p className="text-xs text-zinc-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse block" /> Connected to RAG Pipeline</p>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-blue-600'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-2xl text-sm ${msg.role === "user" ? "bg-white/10 text-white rounded-tr-none px-5 py-3" : "bg-[#111116] text-zinc-300 border border-white/5 rounded-tl-none shadow-md max-w-full overflow-hidden"}`}>
                    {msg.image && (
                       <img src={msg.image} alt="Upload" className="max-w-full h-auto rounded-lg mb-3 border border-white/10" style={{ maxHeight: "200px" }} />
                    )}
                    <div className="space-y-3 leading-relaxed w-full overflow-x-auto font-sans">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            if (!inline && match && match[1] === "mermaid") {
                              return <MermaidDiagram chart={String(children).replace(/\n$/, "")} />;
                            }
                            return !inline ? (
                              <pre className="bg-black border border-white/10 p-3 rounded-lg overflow-x-auto font-mono text-xs text-blue-300 my-2">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-blue-500/10 text-blue-300 px-1 py-0.5 rounded font-mono text-xs border border-blue-500/20" {...props}>
                                {children}
                              </code>
                            );
                          },
                          table: ({node, ...props}: any) => <div className="overflow-x-auto w-full"><table className="w-full text-left border-collapse my-4" {...props} /></div>,
                          th: ({node, ...props}: any) => <th className="border-b border-white/10 p-2 text-zinc-300 font-semibold" {...props} />,
                          td: ({node, ...props}: any) => <td className="border-b border-white/5 p-2 text-zinc-400" {...props} />,
                          p: ({node, ...props}: any) => <p className="mb-2 last:mb-0" {...props} />,
                          a: ({node, ...props}: any) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          ul: ({node, ...props}: any) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                          ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded w-fit">
                      <LinkIcon className="w-3 h-3" />
                      <span>{msg.sources.join(", ")}</span>
                    </div>
                  )}
                  {msg.actions && Object.keys(msg.actions).length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded w-fit">
                      <RefreshCcw className="w-3 h-3" />
                      <span>Trigger: {msg.actions.highlight}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endOfMessagesRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-black/50">
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: 10, height: 0 }}
                className="mb-3 relative inline-block"
              >
                 <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-white/20" />
                 <button 
                   onClick={() => setSelectedImage(null)} 
                   className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                 >
                   <X className="w-3 h-3" />
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl aspect-square w-12 flex items-center justify-center transition-colors border border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
              title="Upload Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />
            <button 
              onClick={toggleListening}
              className={`rounded-xl aspect-square w-12 flex items-center justify-center transition-colors border border-white/10 shrink-0 ${isListening ? "bg-red-500/20 text-red-500" : "bg-white/5 hover:bg-white/10 text-white"}`}
              title="Voice Dictation"
            >
              <Mic className="w-4 h-4" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => !isGenerating && e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening... (Speak now)" : "Ask about cryptography..."}
              disabled={isGenerating}
              className={`flex-1 bg-white/5 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors ${isListening ? "border-red-500/50 bg-red-500/10 placeholder:text-red-400" : "border-white/10 placeholder:text-zinc-500"}`}
            />
            {isGenerating ? (
              <button 
                onClick={handleStop}
                className="bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-xl aspect-square w-12 flex items-center justify-center transition-colors border border-red-500/50"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button 
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl aspect-square w-12 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Dynamic Context Window */}
      <div className={`hidden md:flex flex-col justify-center items-center bg-black rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black overflow-hidden relative transition-all ${isFullscreen ? "h-2/3 w-full" : "w-1/2 h-full"}`}>
         <button onClick={() => setIsFullscreen(!isFullscreen)} className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white transition-colors">
            {isFullscreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
         </button>
         
         {activeAction === "permutation-view" ? (
           <PermutationVisualizer />
         ) : activeAction === "security-view" ? (
           <SecurityVisualizer />
         ) : activeAction === "state-view" ? (
           <InteractiveStateGrid />
         ) : (
           <div className="text-center p-8">
              <Bot className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
              <h3 className="text-zinc-500 font-medium">Visual Context Window</h3>
              <p className="text-zinc-600 text-sm mt-2 max-w-sm">When the AI identifies a cryptographic operation, live visualizations will render here dynamically based on the RAG pipeline commands.</p>
           </div>
         )}
      </div>
      
    </div>
  );
}
