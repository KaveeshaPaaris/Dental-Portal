'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}

export default function PasswordField({
  label, value, onChange, autoComplete = 'new-password', required = true,
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="form-input"
          style={{ paddingRight: 44 }}
          required={required}
          value={value}
          maxLength={72}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 6,
            color: 'var(--color-text-secondary)', display: 'flex',
          }}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
