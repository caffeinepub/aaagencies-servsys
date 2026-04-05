import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import type { AgentDefinition } from "../backend.d";
import { AgentChatInterface } from "./AgentChatInterface";

interface AgentChatDrawerProps {
  agent: AgentDefinition | null;
  open: boolean;
  onClose: () => void;
}

export function AgentChatDrawer({
  agent,
  open,
  onClose,
}: AgentChatDrawerProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      data-ocid="chat.sheet"
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col [&>button]:hidden"
      >
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/60 shrink-0 space-y-0">
          <SheetTitle className="font-display text-base">
            {agent?.name ?? "Agent Chat"}
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={onClose}
            data-ocid="chat.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {agent && <AgentChatInterface agent={agent} onClose={onClose} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
