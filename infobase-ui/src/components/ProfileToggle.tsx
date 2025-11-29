import { useEffect, useRef, useState } from "react";

type Props = {
  name?: string;
  avatarUrl?: string | null;
  onViewProfile?: () => void;
  onLogout?: () => void;
  className?: string;
};

export default function ProfileToggle({
  name,
  avatarUrl,
  onViewProfile,
  onLogout,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handleDocClick);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const initials = name
    ? name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name ?? "Profile"} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-medium text-sm">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Profile"
          className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b">
            <div className="text-sm font-medium text-gray-800">{name ?? "Profile"}</div>
          </div>

          <div className="flex flex-col p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onViewProfile?.();
              }}
              className="text-left px-3 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
              role="menuitem"
            >
              View profile
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
              className="text-left px-3 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
