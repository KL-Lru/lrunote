// Type for Starlight's sidebar configuration
interface Badge {
  variant: 'note' | 'danger' | 'success' | 'caution' | 'tip' | 'default';
  text: string;
}
interface SidebarLink {
  type: 'link';
  label: string;
  href: string;
  isCurrent: boolean;
  badge: Badge | undefined;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  attrs: {};
}
interface SidebarGroup {
  type: 'group';
  label: string;
  entries: (SidebarLink | SidebarGroup)[];
  collapsed: boolean;
  badge: Badge | undefined;
}
type SidebarEntry = SidebarLink | SidebarGroup;

// Type for sidebar configuration file
export interface SidebarConfig {
  navigation: Array<SidebarItem>;
}
interface SidebarLinkItem {
  label: string;
  link: string;
}
interface SidebarGroupItem {
  label: string;
  items: Array<SidebarLinkItem>;
}
export type SidebarItem = SidebarLinkItem | SidebarGroupItem;

// config file to entries
export function configToEntries(config: SidebarConfig, currentContent: string): SidebarEntry[] {
  const entries: SidebarEntry[] = [];

  for (const item of config.navigation) {
    if (isSidebarGroupItem(item)) {
      entries.push(itemToGroup(item, currentContent));
    } else if (isSidebarLinkItem(item)) {
      entries.push(itemToLink(item, currentContent));
    }
  }

  return entries;
}

function itemToLink(item: SidebarLinkItem, currentContent: string): SidebarLink {
  const isCurrentLink = item.link !== undefined && item.link !== '/' && (item.link.startsWith('/') ? item.link.slice(1) === currentContent : item.link === currentContent);

  return {
    type: 'link',
    label: item.label,
    href: item.link || '',
    isCurrent: isCurrentLink,
    badge: undefined,
    attrs: {},
  };
}

function itemToGroup(item: SidebarGroupItem, currentContent: string): SidebarGroup {
  return {
    type: 'group',
    label: item.label,
    entries: item.items.map((subItem) => itemToLink(subItem, currentContent)),
    collapsed: false,
    badge: undefined,
  };
}

// Type Guard
export function isSidebarConfig(config: unknown): config is SidebarConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const sidebar = (config as SidebarConfig).navigation;
  if (!Array.isArray(sidebar)) {
    return false;
  }
  for (const item of sidebar) {
    if (!isSidebarItem(item)) {
      return false;
    }
  }

  return true;
}

function isSidebarItem(item: unknown): item is SidebarItem {
  return isSidebarLinkItem(item) || isSidebarGroupItem(item);
}

function isSidebarLinkItem(item: unknown): item is SidebarLinkItem {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const linkItem = item as SidebarLinkItem;
  return typeof linkItem.label === 'string' && typeof linkItem.link === 'string';
}

function isSidebarGroupItem(item: unknown): item is SidebarGroupItem {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const groupItem = item as SidebarGroupItem;
  if (typeof groupItem.label !== 'string' || !Array.isArray(groupItem.items)) {
    return false;
  }
  for (const subItem of groupItem.items) {
    if (!isSidebarLinkItem(subItem)) {
      return false;
    }
  }

  return true;
}
