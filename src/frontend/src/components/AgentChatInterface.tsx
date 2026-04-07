import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { AlertTriangle, Bot, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type { backendInterface as FullBackend } from "../backend.d";
import type { AgentDefinition, ConversationMessage } from "../backend.d";
import { AgentStatus } from "../backend.d";

const STATUS_CONFIG: Record<string, { cls: string; label: string }> = {
  [AgentStatus.active]: {
    cls: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    label: "Active",
  },
  [AgentStatus.training]: {
    cls: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    label: "Training",
  },
  [AgentStatus.inactive]: {
    cls: "bg-muted text-muted-foreground border-border",
    label: "Inactive",
  },
};

function formatTs(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  msg: ConversationMessage;
}

function MessageBubble({ msg }: MessageBubbleProps) {
  const isUser = msg.senderRole === "user";

  if (msg.isError) {
    return (
      <div className="flex items-start gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
          <Bot className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span className="text-xs font-medium">Error</span>
          </div>
          <p className="text-sm leading-relaxed">{msg.content}</p>
          <p className="text-xs opacity-60 mt-1.5">{formatTs(msg.timestamp)}</p>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex flex-row-reverse items-end gap-2 mb-3">
        <div className="bg-primary/15 text-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 text-right">
            {formatTs(msg.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="bg-muted/60 text-foreground rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">
          {formatTs(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}

interface AgentChatInterfaceProps {
  agent: AgentDefinition;
  onClose?: () => void;
}

export function AgentChatInterface({ agent }: AgentChatInterfaceProps) {
  const { actor: rawActor } = useActor(createActor);
  // Cast to the full interface from backend.d.ts which includes conversation methods
  const actor = rawActor as FullBackend | null;
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Stable scroll ref — avoids exhaustive-deps issues with useCallback
  const scrollRef = useRef(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  });

  const statusCfg =
    STATUS_CONFIG[agent.status] ?? STATUS_CONFIG[AgentStatus.inactive];

  const loadHistory = useCallback(async () => {
    if (!actor) return;
    try {
      const result = await actor.getConversationHistory(agent.id);
      if (result.__kind__ === "ok") {
        setMessages(result.ok);
        scrollRef.current();
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to load conversation history");
    } finally {
      setLoading(false);
    }
  }, [actor, agent.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !actor || sending) return;
    setInput("");
    setSending(true);
    scrollRef.current();
    try {
      const result = await actor.sendAgentMessage(agent.id, trimmed);
      if (result.__kind__ === "ok") {
        setMessages(result.ok);
        scrollRef.current();
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card/50 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-semibold text-sm truncate">
              {agent.name}
            </span>
            <Badge
              variant="outline"
              className={`text-xs shrink-0 ${statusCfg.cls}`}
            >
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {agent.modelType}
          </p>
        </div>
      </div>

      {/* No endpoint warning */}
      {!agent.endpointUrl && (
        <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            No endpoint configured — this agent will echo messages back.
          </span>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 pt-4" data-ocid="chat.panel">
        {loading ? (
          <div
            className="flex items-center justify-center h-32"
            data-ocid="chat.loading_state"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-40 text-center"
            data-ocid="chat.empty_state"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Start a conversation</p>
            <p className="text-xs text-muted-foreground mt-1">
              Say hello to <span className="text-foreground">{agent.name}</span>
            </p>
          </div>
        ) : (
          <div>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {sending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/60 bg-card/30 shrink-0">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            data-ocid="chat.textarea"
            placeholder={`Message ${agent.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={sending || loading}
            className="resize-none min-h-[38px] max-h-32 flex-1 text-sm"
          />
          <Button
            size="icon"
            data-ocid="chat.submit_button"
            onClick={handleSend}
            disabled={!input.trim() || sending || loading}
            className="h-9 w-9 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 ml-0.5">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
