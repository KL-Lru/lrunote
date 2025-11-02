import { persistentAtom } from '@nanostores/persistent';

export const sidebarCollapsed = persistentAtom<'true' | 'false'>('sidebar-collapsed', 'false');
