"use client";
import { ArrowUp, Paperclip } from "lucide-react";


export const MessageComposer = () => {
  return (
    <div className="shrink-0 border-t border-neutral-200 px-5 py-4">
      <form className="mx-auto flex max-w-[760px] items-center gap-1.5 rounded-[6px] border border-neutral-200 bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
        <button
          type="button"
          aria-label="Attach file"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
        >
          <Paperclip
            size={12}
            strokeWidth={1.6}
          />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          className="h-7 min-w-0 flex-1 bg-transparent px-1 text-[10px] text-black outline-none placeholder:text-neutral-400"
        />

        <button
          type="submit"
          aria-label="Send message"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-black text-white transition-all hover:bg-neutral-800 active:scale-95"
        >
          <ArrowUp
            size={11}
            strokeWidth={1.8}
          />
        </button>
      </form>
    </div>
  );
};