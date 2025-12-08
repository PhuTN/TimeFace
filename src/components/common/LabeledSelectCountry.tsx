import React from 'react';
import {Country} from 'country-state-city';

import LabeledSelect from './LabeledSelect';
import type {Option} from '../../types/common';

type Props = {
  label?: string;
  value?: string;
  onChange: (opt: Option) => void;
  theme: any;
};

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
  if (!selectOptions.length) {
    return null;
  }

  const selected =
    selectOptions.find(option => option.value === value) ?? selectOptions[0];

  React.useEffect(() => {
    if (!value) {
      onChange(selectOptions[0]);
    }
  }, [onChange, value]);

  return (
    <LabeledSelect
      label={label}
      selected={selected}
      options={selectOptions}
      onSelect={onChange}
      theme={theme}

      // ⭐ ONLY ADD SEARCH — everything else kept exactly the same
      searchable
      searchPlaceholder="Search country..."
    />
  );
}

export function getCountryLabel(code?: string) {
  return selectOptions.find(option => option.value === code)?.label ?? '';
}