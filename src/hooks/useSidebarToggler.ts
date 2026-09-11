import { useState } from 'react';

/**
 * Manages only sidebar open/close state.
 * Availability state is now handled inside Sidebar component.
 */
export function useSidebarToggler() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return {
    sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
  };
}
