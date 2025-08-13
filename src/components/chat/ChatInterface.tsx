import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Plus, MessageSquare } from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";
import { supabase } from "@/integrations/supabase/client";
import { ChatSidebar } from "./ChatSidebar";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading sessions:", error);
      return;
    }

    setSessions(data || []);
  };

  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages((data || []) as Message[]);
  };

  const createNewSession = async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert([{ title: APP_CONFIG.CHAT.NEW_CHAT }])
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat session",
        variant: "destructive",
      });
      return;
    }

    setCurrentSessionId(data.id);
    setMessages([]);
    loadSessions();
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadMessages(sessionId);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    let sessionId = currentSessionId;

    // Create a new session if none exists
    if (!sessionId) {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert([{ title: input.slice(0, 50) + "..." }])
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error);
        toast({
          title: "Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
        return;
      }

      sessionId = data.id;
      setCurrentSessionId(sessionId);
      loadSessions();
    }

    const userMessage = {
      session_id: sessionId,
      role: "user" as const,
      content: input,
    };

    // Add user message to database
    const { error: userError } = await supabase
      .from("chat_messages")
      .insert([userMessage]);

    if (userError) {
      console.error("Error saving user message:", userError);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
      return;
    }

    // Add user message to UI
    const newUserMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Here you would call your Python API endpoint
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantResponse = `I received your message: "${input}". This is a simulated response. Please connect your Python API endpoint to replace this.`;

      const assistantMessage = {
        session_id: sessionId,
        role: "assistant" as const,
        content: assistantResponse,
      };

      // Add assistant message to database
      const { error: assistantError } = await supabase
        .from("chat_messages")
        .insert([assistantMessage]);

      if (assistantError) {
        console.error("Error saving assistant message:", assistantError);
        return;
      }

      // Add assistant message to UI
      const newAssistantMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: assistantResponse,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast({
        title: "Error",
        description: APP_CONFIG.CHAT.ERROR_MESSAGE,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
      return;
    }

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }

    loadSessions();
    toast({
      title: "Success",
      description: "Chat session deleted",
    });
  };

  return (
    <div className="flex h-screen chat-container">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="chat-panel border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{APP_CONFIG.APP_NAME}</h1>
            <Button
              onClick={createNewSession}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {APP_CONFIG.CHAT.NEW_CHAT}
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-8">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarFallback className="text-2xl gradient-primary text-white">
                    AI
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-2 gradient-text">
                  {APP_CONFIG.CHAT.WELCOME_TITLE}
                </h2>
                <p className="text-muted-foreground">
                  {APP_CONFIG.CHAT.WELCOME_MESSAGE}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="gradient-primary text-white text-sm">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "gradient-primary text-white"
                        : "chat-input border border-border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="gradient-primary text-white text-sm">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="chat-input border border-border rounded-lg px-4 py-2">
                    <p className="text-muted-foreground">{APP_CONFIG.CHAT.LOADING_MESSAGE}</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="chat-panel border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={APP_CONFIG.CHAT.INPUT_PLACEHOLDER}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
                className="chat-input border-border"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="gradient-primary text-white shadow-glow"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {APP_CONFIG.BRANDING.SHOW_POWERED_BY && (
              <div className="text-center mt-2">
                <p className="text-xs text-muted-foreground">
                  Powered by {APP_CONFIG.BRANDING.POWERED_BY}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};