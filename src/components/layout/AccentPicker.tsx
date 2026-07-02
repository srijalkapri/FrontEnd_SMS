import { type CSSProperties } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { THEME_ACCENTS, type ThemeAccent } from '../../themes/themeConfig';
import './AccentPicker.css';

interface AccentPickerProps {
  layout?: 'grid' | 'compact';
}

export function AccentPicker({ layout = 'grid' }: AccentPickerProps) {
  const { accent, setAccent } = useTheme();

  return (
    <div className={`accent-picker accent-picker--${layout}`} role="group" aria-label="Accent color">
      {THEME_ACCENTS.map((item) => (
        <AccentOption
          key={item.id}
          id={item.id}
          label={item.label}
          swatch={item.swatch}
          previewBg={item.previewBg}
          previewBgLight={item.previewBgLight}
          selected={accent === item.id}
          onSelect={setAccent}
        />
      ))}
    </div>
  );
}

interface AccentOptionProps {
  id: ThemeAccent;
  label: string;
  swatch: string;
  previewBg: string;
  previewBgLight: string;
  selected: boolean;
  onSelect: (accent: ThemeAccent) => void;
}

function AccentOption({
  id,
  label,
  swatch,
  previewBg,
  previewBgLight,
  selected,
  onSelect,
}: AccentOptionProps) {
  return (
    <button
      type="button"
      className={`accent-option${selected ? ' accent-option--selected' : ''}`}
      onClick={() => onSelect(id)}
      aria-label={`${label} theme`}
      aria-pressed={selected}
    >
      <span
        className="accent-option__preview"
        style={
          {
            '--preview-dark': previewBg,
            '--preview-light': previewBgLight,
            '--accent-color': swatch,
          } as CSSProperties
        }
      >
        <span className="accent-option__preview-bar" />
        <span className="accent-option__preview-dot" />
      </span>
      <span className="accent-option__label">{label}</span>
    </button>
  );
}
