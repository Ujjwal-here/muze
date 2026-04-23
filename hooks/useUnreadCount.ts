import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { fetchInbox, subscribeToInbox } from "@/shared/services/chat";

export function useUnreadCount(): number {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setCount(0);
      return;
    }

    let cancelled = false;

    const refresh = async () => {
      try {
        const inbox = await fetchInbox(user.id);
        if (cancelled) return;

        setCount(inbox.reduce((sum, c) => sum + (c.unread_count ?? 0), 0));
      } catch {}
    };

    refresh();
    const unsubscribe = subscribeToInbox(user.id, refresh);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user?.id]);

  return count;
}
