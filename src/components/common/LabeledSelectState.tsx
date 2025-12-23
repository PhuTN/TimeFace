import React from 'react';
import {State} from 'country-state-city';

import LabeledSelect from './LabeledSelect';
import type {Option} from '../../types/common';

type Props = {
  label?: string;
  countryCode?: string;
  value?: string;
  onChange: (opt: Option) => void;
  theme: any;
  editable?: boolean; // default = true
};

export default function LabeledSelectState({
  label,
  countryCode,
  value,
  onChange,
  theme,
  editable = true,
}: Props) {

  // ====== BUILD STATE OPTIONS ======
  const options = React.useMemo<Option[]>(() => {
    if (!countryCode) return []; // ⛔ Không trả option khi chưa chọn country
    return State.getStatesOfCountry(countryCode)
      .map(item => ({
        label: item.name,
        value: item.isoCode,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countryCode]);

  // ====== CONDITIONS ======
  const disabledSystem = !countryCode || options.length === 0;
  const disabled = disabledSystem || !editable;

  // text fallback
  const fallback: Option = {
    label: !countryCode ? 'Chưa chọn quốc gia' : 'Không có tỉnh/bang',
    value: '',
  };

  const displayOptions = disabledSystem ? [fallback] : options;

  // ====== SELECTED VALUE (NO AUTO SELECT WHEN COUNTRY EMPTY) ======
  const selected = disabledSystem
    ? fallback
    : options.find(o => o.value === value) ?? fallback;

  // ====== AUTO-SET ONLY WHEN COUNTRY EXISTS ======
  React.useEffect(() => {
    if (!editable) return;

    // ⛔ Stop nếu chưa chọn country
    if (!countryCode) return;

    // ⛔ Stop nếu không có state list
    if (!options.length) return;

    // ⛔ Stop nếu value hợp lệ
    if (value && options.some(o => o.value === value)) return;

    // ✔ Auto set state đầu tiên khi có country và có danh sách state
    onChange(options[0]);
  }, [editable, countryCode, options, value, onChange]);

  return (
    <LabeledSelect
      label={label}
      selected={selected}
      options={displayOptions}
      onSelect={editable ? onChange : () => {}}
      theme={theme}
      disabled={disabled}
    />
  );
}

// KEEP FUNCTION
export function getStateLabel(countryCode?: string, stateCode?: string) {
  if (!countryCode || !stateCode) return '';
  const match = State.getStatesOfCountry(countryCode).find(
    item => item.isoCode === stateCode,
  );
  return match?.name ?? '';
}
