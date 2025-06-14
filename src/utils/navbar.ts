// Type for navigation bar configuration
export interface NavConfig {
  navigation: Array<NavItem>;
};

export interface NavItem {
  label: string;
  link?: string;
  items?: Array<{
    label: string;
    link: string;
  }>;
};

// Type guard
export function isNavConfig(config: unknown): config is NavConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const navigation = (config as NavConfig).navigation;
  if (!Array.isArray(navigation)) {
    return false;
  }
  for (const item of navigation) {
    if (!isNavItem(item)) {
      return false;
    }
  }

  return true;
}

function isNavItem(item: unknown): item is NavItem {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const navItem = item as NavItem;
  if (typeof navItem.label !== 'string') {
    return false;
  }
  if (navItem.link && typeof navItem.link !== 'string') {
    return false;
  }
  if (navItem.items) {
    if (!Array.isArray(navItem.items)) {
      return false;
    }
    for (const subItem of navItem.items) {
      if (typeof subItem.label !== 'string') {
        return false;
      }
      if (subItem.link && typeof subItem.link !== 'string') {
        return false;
      }
    }
  }

  return true;
}
