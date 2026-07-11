'use client';

import React from 'react';
import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import styles from './PhoneInput.module.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  id?: string;
  placeholder?: string;
}

export default function PhoneInput({
  value,
  onChange,
  onBlur,
  id,
  placeholder = 'Enter phone number'
}: PhoneInputProps) {
  return (
    <div className={styles.phoneInputWrapper}>
      <PhoneInputLib
        international
        withCountryCallingCode
        defaultCountry="LK"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        id={id}
        placeholder={placeholder}
      />
    </div>
  );
}
