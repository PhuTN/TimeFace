import React from 'react';
import {Country} from 'country-state-city';

import LabeledSelect from './LabeledSelect';
import type {Option} from '../../types/common';

type Props = {
  label?: string;
  value?: string;               // ISO
  onChange: (opt: Option) => void;
  theme: any;
};

// Build options only once
const selectOptions: Option[] = Country.getAllCountries()
  .map(country => ({
    label: country.name,
    value: country.isoCode,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function LabeledSelectCountry({
  label,
  value,
  onChange,
  theme,
}: Props) {

  // ==== Nếu value rỗng → default fallback ====
  const fallback: Option = {
    label: 'Chưa chọn quốc gia',
    value: '',
  };

  const selected =
    value
      ? selectOptions.find(o => o.value === value) ?? fallback
      : fallback;

  // ❌ Không auto change khi value rỗng
  React.useEffect(() => {
    // nếu value = "" → do nothing
    if (!value) return;

    // nếu value không match option → tự fix bằng option đầu tiên
    if (!selectOptions.some(o => o.value === value)) {
      onChange(selectOptions[0]);
    }
  }, [value, onChange]);

  return (
    <LabeledSelect
      label={label}
      selected={selected}
      options={[fallback, ...selectOptions]}
      onSelect={onChange}
      theme={theme}
      searchable
      searchPlaceholder="Search country..."
    />
  );
}

export function getCountryLabel(code?: string) {
  if (!code) return '';
  return selectOptions.find(option => option.value === code)?.label ?? '';
}
