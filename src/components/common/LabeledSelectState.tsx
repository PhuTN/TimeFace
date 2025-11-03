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
};

export default function LabeledSelectState({
  label,
  countryCode,
  value,
  onChange,
  theme,
}: Props) {
  const options = React.useMemo<Option[]>(() => {
    if (!countryCode) {
      return [];
    }
    return State.getStatesOfCountry(countryCode)
      .map(item => ({
        label: item.name,
        value: item.isoCode,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countryCode]);

  const disabled = !countryCode || options.length === 0;
  const fallback: Option = {
    label: !countryCode ? 'Select country first' : 'No states available',
    value: '',
  };
  const displayOptions = disabled ? [fallback] : options;

  const selected =
    displayOptions.find(option => option.value === value) ?? displayOptions[0];

  React.useEffect(() => {
    if (disabled || !options.length) {
      return;
    }
    if (value && options.some(option => option.value === value)) {
      return;
    }
    onChange(options[0]);
  }, [disabled, onChange, options, value]);

  return (
    <LabeledSelect
      label={label}
      selected={selected}
      options={displayOptions}
      onSelect={onChange}
      theme={theme}
      disabled={disabled}
    />
  );
}

export function getStateLabel(countryCode?: string, stateCode?: string) {
  if (!countryCode || !stateCode) {
    return '';
  }
  const match = State.getStatesOfCountry(countryCode).find(
    item => item.isoCode === stateCode,
  );
  return match?.name ?? '';
}
