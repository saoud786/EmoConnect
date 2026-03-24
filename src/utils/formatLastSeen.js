// src/utils/formatLastSeen.js

export const formatLastSeen = (timestamp) => {
  if (!timestamp?.seconds) return "Offline";

  const lastSeenDate = new Date(timestamp.seconds * 1000);
  const now = new Date();

  const diffMs = now - lastSeenDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  // ✅ Just now
  if (diffMinutes < 1) return "last seen just now";

  // ✅ Minutes ago
  if (diffMinutes < 60)
    return `last seen ${diffMinutes} minute${
      diffMinutes > 1 ? "s" : ""
    } ago`;

  // ✅ Today
  if (now.toDateString() === lastSeenDate.toDateString()) {
    return `last seen today at ${lastSeenDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // ✅ Yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (yesterday.toDateString() === lastSeenDate.toDateString()) {
    return `last seen yesterday at ${lastSeenDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // ✅ Older date
  return `last seen on ${lastSeenDate.toLocaleDateString()}`;
};