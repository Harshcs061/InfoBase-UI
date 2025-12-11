// src/components/NotificationToggle.tsx
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, X, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Award } from "lucide-react";
import type { AppDispatch, RootState } from "../redux/store";
import type { NotificationDto } from "../services/NotificationService";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
} from "../redux/slices/NotificationSlice";

// Notification Icon Component
const NotificationIcon: React.FC<{ type: NotificationDto['notificationType'] }> = ({ type }) => {
  const iconClass = "w-5 h-5";
  
  switch (type) {
    case 'ANSWER_QUESTION':
      return <MessageSquare className={`${iconClass} text-blue-600`} />;
    case 'COMMENT_QUESTION':
    case 'COMMENT_ANSWER':
      return <MessageSquare className={`${iconClass} text-purple-600`} />;
    case 'VOTE_UP':
      return <ThumbsUp className={`${iconClass} text-green-600`} />;
    case 'VOTE_DOWN':
      return <ThumbsDown className={`${iconClass} text-red-600`} />;
    case 'ANSWER_ACCEPTED':
      return <CheckCircle className={`${iconClass} text-emerald-600`} />;
    case 'BADGE_AWARDED':
      return <Award className={`${iconClass} text-yellow-600`} />;
    default:
      return <Bell className={`${iconClass} text-gray-600`} />;
  }
};

const timeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return past.toLocaleDateString();
};

const NotificationItem: React.FC<{
  notification: NotificationDto;
  onClick: (notification: NotificationDto) => void;
}> = ({ notification, onClick }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(notification)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(notification);
      }}
      className={`flex items-start gap-3 p-3 rounded-lg transition cursor-pointer hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="mt-1 shrink-0">
        <NotificationIcon type={notification.notificationType} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {notification.message}
        </p>
        {notification.parentTitle && (
          <p className="text-xs text-gray-600 mt-0.5 truncate">
            "{notification.parentTitle}"
          </p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {!notification.read && (
        <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 ml-2" aria-hidden />
      )}
    </div>
  );
};

export default function NotificationToggle() {
  const [open, setOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { notifications, unreadCount, loading, error } = useSelector(
    (state: RootState) => state.notification
  );


  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications(10));
    }
  }, [open, dispatch]);


  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  
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


  const handleNotificationClick = async (notification: NotificationDto) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }

    if (notification.parentId) {
      switch (notification.notificationType) {
        case 'ANSWER_QUESTION':
        case 'COMMENT_QUESTION':
        case 'VOTE_UP':
        case 'VOTE_DOWN':
          navigate(`/question/${notification.parentId}`);
          break;
        case 'COMMENT_ANSWER':
        case 'ANSWER_ACCEPTED':
          navigate(`/question/${notification.parentId}`);
          break;
        default:
          break;
      }
    }
    
    setOpen(false);
  };

  const displayedNotifications = showUnreadOnly
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-lg border border-gray-200 z-50 max-h-[600px] flex flex-col"
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Notifications
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition"
              aria-label="Close notifications"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="flex border-b border-gray-200 px-4">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`flex-1 py-2 text-sm font-medium transition ${
                !showUnreadOnly
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`flex-1 py-2 text-sm font-medium transition ${
                showUnreadOnly
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <button
                  onClick={() => dispatch(fetchNotifications(10))}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-600">
                  {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}