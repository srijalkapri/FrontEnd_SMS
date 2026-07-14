interface AuthSubmitButtonProps {
  loading: boolean;
  loadingLabel: string;
  label: string;
  className?: string;
  type?: 'submit' | 'button';
  onClick?: () => void;
}

export function AuthSubmitButton({
  loading,
  loadingLabel,
  label,
  className = 'auth-form__submit',
  type = 'submit',
  onClick,
}: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      className={`${className}${loading ? ' auth-form__submit--loading' : ''}`}
      disabled={loading}
      aria-busy={loading}
      onClick={onClick}
    >
      {loading && <span className="auth-spinner auth-spinner--inline" aria-hidden="true" />}
      {loading ? loadingLabel : label}
    </button>
  );
}
