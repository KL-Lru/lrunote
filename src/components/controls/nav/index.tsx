import clsx from 'clsx';
import type { NavConfig, NavItem } from '@/utils/navbar';
import styles from './index.module.css';
import { useState } from 'react';
import {
  AnimatePresence,
  motion,
  type MotionProps,
  type Variants,
} from 'framer-motion';

const variants = {
  close: { opacity: 0, display: 'none' },
  open: { opacity: 1, display: 'flex' },
} as Variants;
const props = {
  variants,
  transition: { duration: 0.2 },
} as MotionProps;

type Props = {
  config: NavConfig;
};

export function Navigation({ config }: Props) {
  return (
    <nav className={styles.navContainer}>
      <ul className={styles.navList}>
        {config.navigation.map((item) => (
          <NavigationItem key={item.label} item={item} />
        ))}
      </ul>
    </nav>
  );
}

function NavigationItem({ item }: { item: NavItem }) {
  const [show, setShow] = useState(false);

  const dropDownShow = () => {
    setShow(true);
  };
  const dropDownHide = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      <li
        className={clsx(styles.navItem, { [styles.navDrop]: item.items })}
        onMouseEnter={dropDownShow}
        onMouseLeave={dropDownHide}
        tabIndex={0}
        role="menuitem"
      >
        {
          item.link
            ? <a href={item.link}>{item.label}</a>
            : <span>{item.label}</span>
        }
        {
          item.items && (
            <motion.div
              {...props}
              initial="close"
              animate={show ? 'open' : 'close'}
              exit="close"
            >
              <div className={styles.navDropMenuContainer}>
                <ul className={styles.navDropMenu}>
                  {item.items.map((subItem) => (
                    <li key={subItem.label} className={styles.navDropMenuItem}>
                      <a href={subItem.link}>{subItem.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )
        }
      </li>
    </AnimatePresence>
  );
}
