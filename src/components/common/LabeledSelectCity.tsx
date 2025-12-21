import React from 'react';
import {City} from 'country-state-city';

import LabeledSelect from './LabeledSelect';
import type {Option} from '../../types/common';

type Props = {
  label?: string;
  countryCode?: string;
  stateCode?: string;
  value?: string;
  onChange: (opt: Option) => void;
  theme: any;
  editable?: boolean; // nếu cần disable trong view-only
};

export default function LabeledSelectCity({
  label,
  countryCode,
  stateCode,
  value,
  onChange,
  theme,
  editable = true,
}: Props) {

  // ===== LOAD OPTIONS =====
  const options = React.useMemo<Option[]>(() => {
    if (!countryCode) return [];

    const list = stateCode
      ? City.getCitiesOfState(countryCode, stateCode) ?? []
      : City.getCitiesOfCountry(countryCode) ?? [];

    return list
      .map(item => ({
        label: item.name,
        value: item.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countryCode, stateCode]);

  // ===== FLAGS =====
  const disabledSystem = !countryCode || options.length === 0;
  const disabled = disabledSystem || !editable;

  const fallback: Option = {
    label: !countryCode ? 'Chọn quốc gia trước' : 'Không có thành phố',
    value: '',
  };

  const displayOptions = disabledSystem ? [fallback] : options;

  // ===== SELECTED =====
  const selected = disabledSystem
    ? fallback
    : options.find(o => o.value === value) ?? fallback;

  // ===== FIX AUTO-SET =====
  React.useEffect(() => {
    if (!editable) return;

    // ❌ stop nếu chưa chọn country
    if (!countryCode) return;

    // ❌ stop nếu không có cities
    if (!options.length) return;

    // ❌ stop nếu city đang valid
    if (value && options.some(o => o.value === value)) return;

    // ✔ nếu value = "" nhưng country/state đã có thì không auto pick
    if (!value) return;

    // ✔ trường hợp country thay đổi và value ko hợp lệ → fix về item đầu
    onChange(options[0]);
  }, [editable, countryCode, stateCode, options, value, onChange]);

  return (
    <LabeledSelect
      label={label}
      selected={selected}
      options={[fallback, ...displayOptions]}
      onSelect={editable ? onChange : () => {}}
      theme={theme}
      disabled={disabled}
    />
  );
}

// ===== GET LABEL =====
export function getCityLabel(countryCode?: string, stateCode?: string, cityName?: string) {
  if (!countryCode || !cityName) return '';

  const list = stateCode
    ? City.getCitiesOfState(countryCode, stateCode) ?? []
    : City.getCitiesOfCountry(countryCode) ?? [];

  return list.find(c => c.name === cityName)?.name ?? '';
}
