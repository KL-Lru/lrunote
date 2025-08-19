import styles from './index.module.css';

type Props = {
  rfcNumber: string;
  href: string;
  title?: string;
};

export function RfcLink({ rfcNumber, href, title }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>
        RFC
        {rfcNumber}
        :
      </span>
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {title || href}
      </a>
    </div>
  );
}
