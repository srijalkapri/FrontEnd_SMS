import { useCallback, useEffect, useState } from 'react';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = 'Enter password',
  autoComplete = 'current-password',
  disabled = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const showPassword = useCallback(() => {
    if (!disabled && value) {
      setVisible(true);
    }
  }, [disabled, value]);

  const hidePassword = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    function handleRelease() {
      hidePassword();
    }

    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('touchend', handleRelease);

    return () => {
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchend', handleRelease);
    };
  }, [visible, hidePassword]);

  useEffect(() => {
    if (!value) {
      hidePassword();
    }
  }, [value, hidePassword]);

  return (
    <div className={`password-input ${visible ? 'password-input--visible' : ''}`}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="form-input password-input__field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        className="password-input__toggle"
        onMouseDown={(event) => {
          event.preventDefault();
          showPassword();
        }}
        onTouchStart={(event) => {
          event.preventDefault();
          showPassword();
        }}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            showPassword();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            hidePassword();
          }
        }}
        onBlur={hidePassword}
        disabled={disabled}
        aria-label="Hold to show password"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}
