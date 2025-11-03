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
};

export default function LabeledSelectCity({
  label,
  countryCode,
  stateCode,
  value,
  onChange,
  theme,
}: Props) {
  const options = React.useMemo<Option[]>(() => {
    if (!countryCode) {
      return [];
    }
    const data =
      stateCode
        ? City.getCitiesOfState(countryCode, stateCode) ?? []
        : City.getCitiesOfCountry(countryCode) ?? [];

    return data
      .map(item => ({
        label: item.name,
        value: item.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countryCode, stateCode]);

  const disabled = !countryCode || options.length === 0;
  const fallback: Option = {
    label: !countryCode ? 'Select country first' : 'No cities available',
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

export function getCityLabel(
  countryCode?: string,
  stateCode?: string,
  cityName?: string,
) {
  if (!countryCode || !cityName) {
    return '';
  }
  const list =
    stateCode
      ? City.getCitiesOfState(countryCode, stateCode) ?? []
      : City.getCitiesOfCountry(countryCode) ?? [];
  return list.find(item => item.name === cityName)?.name ?? '';
}
