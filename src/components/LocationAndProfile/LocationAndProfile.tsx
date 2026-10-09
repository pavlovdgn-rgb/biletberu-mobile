import { Icon } from '../Icon';
import { Avatar } from '../Avatar';

/** Location and Profile — шапка главной: город и вход в профиль. Figma: `132:18113`. */
export function LocationAndProfile({ city = 'Санкт-Петербург', avatar, onProfile, className }: { city?: string; avatar?: string; /** Тап по аватару — профиль. */ onProfile?: () => void; className?: string }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
      padding: 'var(--spacing-xl) var(--spacing-2xl)', background: 'var(--color-base-white)' }}>
      <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', color: 'var(--color-text-primary)' }}>
        <Icon name="navigation-pointer" size={20} />
        <span className="ds-heading-h3">{city}</span>
      </button>
      <button type="button" aria-label="Профиль" onClick={onProfile} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex' }}><Avatar size="xs" src={avatar} /></button>
    </div>
  );
}
