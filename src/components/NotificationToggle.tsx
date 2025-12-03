import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

export default function NotificationToggle() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell size={20} />
      </button>
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-100 p-4 z-50"
        >
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            Notifications
          </h3>
          <div className="text-sm text-gray-500">
            No notifications yet.
          </div>
        </div>
      )}
    </div>
  );
}
