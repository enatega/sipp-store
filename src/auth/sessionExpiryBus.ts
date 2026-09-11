type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export const sessionExpiryBus = {
  subscribe(listener: SessionExpiredListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  emit() {
    listeners.forEach((listener) => listener());
  },
};

