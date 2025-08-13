import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Trash2, Settings } from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";
import { Link } from "react-router-dom";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export const ChatSidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: ChatSidebarProps) => {
  return (
    <div className="w-64 chat-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewSession}
          className="w-full gradient-primary text-white shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          {APP_CONFIG.CHAT.NEW_CHAT}
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {APP_CONFIG.CHAT.CHAT_HISTORY}
          </h3>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {sessions.length === 0 ? (
              <div className="text-center p-4">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {APP_CONFIG.CHAT.EMPTY_HISTORY}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative rounded-lg p-3 cursor-pointer transition-smooth hover:bg-muted/50 ${
                      currentSessionId === session.id
                        ? "bg-muted border border-border"
                        : ""
                    }`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Link to="/admin">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              {APP_CONFIG.NAVIGATION.ADMIN}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};