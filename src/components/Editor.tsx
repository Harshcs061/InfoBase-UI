import { useRef, useState, type JSX } from "react";
import MarkdownViewer from "./MarkdownViewer";

type EditorProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
};

export default function Editor({
  value,
  onChange,
  placeholder = "Write your description (Markdown supported)...",
  disabled = false,
  rows = 10,
}: EditorProps) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [preview, setPreview] = useState<boolean>(false);

  const insertOrWrap = (before: string, after?: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const selStart = ta.selectionStart ?? 0;
    const selEnd = ta.selectionEnd ?? 0;
    const selected = value.slice(selStart, selEnd);
    const aft = after ?? before;

    if (selected.length > 0) {
      const newVal = value.slice(0, selStart) + before + selected + aft + value.slice(selEnd);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(selStart + before.length, selStart + before.length + selected.length);
      });
    } else {
      const newVal = value.slice(0, selStart) + before + aft + value.slice(selEnd);
      onChange(newVal);
      const caret = selStart + before.length;
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(caret, caret);
      });
    }
  };

  const makeCodeBlock = () => {
    const ta = taRef.current;
    if (!ta) return;
    const selStart = ta.selectionStart ?? 0;
    const selEnd = ta.selectionEnd ?? 0;
    const selected = value.slice(selStart, selEnd);

    if (selected.includes("\n")) {
      const newVal = value.slice(0, selStart) + "```javascript\n" + selected + "\n```" + value.slice(selEnd);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(selStart + 14, selStart + 14 + selected.length);
      });
    } else {
      const insertion = "```javascript\n\n```";
      const newVal = value.slice(0, selStart) + insertion + value.slice(selEnd);
      onChange(newVal);
      const caret = selStart + 14;
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(caret, caret);
      });
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <button
          type="button"
          onClick={() => insertOrWrap("**")}
          disabled={disabled || preview}
          className="px-3 py-1.5 rounded-md hover:bg-gray-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => insertOrWrap("*")}
          disabled={disabled || preview}
          className="px-3 py-1.5 rounded-md hover:bg-gray-200 text-sm italic transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          I
        </button>

        <button
          type="button"
          onClick={makeCodeBlock}
          disabled={disabled || preview}
          className="px-3 py-1.5 rounded-md hover:bg-gray-200 text-sm font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Code block"
          aria-label="Code block"
        >
          {"</>"}
        </button>

        <button
          type="button"
          onClick={() => insertOrWrap("`")}
          disabled={disabled || preview}
          className="px-3 py-1.5 rounded-md hover:bg-gray-200 text-xs font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Inline code"
          aria-label="Inline code"
        >
          `code`
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => insertOrWrap("### ", "")}
          disabled={disabled || preview}
          className="px-3 py-1.5 rounded-md hover:bg-gray-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Heading"
          aria-label="Heading"
        >
          H
        </button>

        <button
          type="button"
          onClick={() => insertOrWrap("- ", "")}
          disabled={disabled || preview}
          className="px-3 py-1.5 rounded-md hover:bg-gray-200 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Bullet list"
          aria-label="Bullet list"
        >
          • List
        </button>

        {/* spacer */}
        <div className="flex-1" />

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ${
            preview
              ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
          }`}
          aria-pressed={preview}
          title={preview ? "Switch to editor" : "Preview markdown"}
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Editor area or Preview area */}
      {!preview ? (
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="w-full p-4 resize-vertical min-h-60 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-b-lg"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace' }}
        />
      ) : (
        <div className="p-4 min-h-60 overflow-auto rounded-b-lg bg-white">
          <MarkdownViewer content={value} />
        </div>
      )}
    </div>
  );
}