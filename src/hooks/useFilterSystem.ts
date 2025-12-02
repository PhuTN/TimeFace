import {useState, useCallback} from 'react';

export type FilterChipData = {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
};

export function useFilterSystem<T extends Record<string, any>>() {
  const [activeFilters, setActiveFilters] = useState<FilterChipData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rawFilters, setRawFilters] = useState<T | null>(null);

  const openModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);

  const applyFilters = useCallback(
    (filters: T, formattedFilters: FilterChipData[]) => {
      setRawFilters(filters);
      setActiveFilters(formattedFilters);
      closeModal();
    },
    [closeModal],
  );

  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
    setRawFilters(null);
  }, []);

  return {
    activeFilters,
    isModalVisible,
    rawFilters,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
    clearAllFilters,
    setActiveFilters,
  };
}
