import { useTheme } from '../context/ThemeContext';
import { getAccentLabel } from '../themes/themeConfig';
import { AccentPicker } from '../components/layout/AccentPicker';
import { PageHeader } from '../components/layout/PageHeader';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import './AppearancePage.css';

export function AppearancePage() {
  const { mode, accent } = useTheme();

  return (
    <div className="page-content appearance-page">
      <PageHeader
        title="Appearance"
        description="Customize light or dark mode and choose an accent color. Backgrounds, sidebar, and buttons update together."
        badge="Settings"
      />

      <section className="appearance-section">
        <h2 className="appearance-section__title">Color mode</h2>
        <p className="appearance-section__desc">Switch between light and dark interface.</p>
        <div className="appearance-mode">
          <ThemeToggle />
          <span className="appearance-mode__current">
            Currently using <strong>{mode === 'dark' ? 'Dark' : 'Light'}</strong> mode with{' '}
            <strong>{getAccentLabel(accent)}</strong> accent.
          </span>
        </div>
      </section>

      <section className="appearance-section">
        <h2 className="appearance-section__title">Accent color</h2>
        <p className="appearance-section__desc">
          Each theme tints the page background, sidebar, cards, and primary actions.
        </p>
        <AccentPicker />
      </section>

      <section className="appearance-preview card">
        <h3 className="appearance-preview__title">Live preview</h3>
        <p className="appearance-preview__desc">
          This card uses your current background, border, and accent colors.
        </p>
        <div className="appearance-preview__actions">
          <button type="button" className="btn btn--primary">
            Primary button
          </button>
          <span className="appearance-preview__badge">Badge</span>
        </div>
      </section>
    </div>
  );
}
