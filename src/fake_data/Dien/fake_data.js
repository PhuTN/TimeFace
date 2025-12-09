// Chỉ lưu "mã" (value). Label sẽ lấy qua lang.t(...)
export const APPROVAL_VALUES = ['approved', 'pending', 'rejected'];
export const DEPARTMENTS = ['g1', 'g2', 'g3', 'g4', 'g5'];
export const SORTING_VALUES = [
  'created_desc',
  'created_asc',
  'name_asc',
  'name_desc',
];

// Helpers tạo options có {label, value}
export function makeApprovalOptions(lang) {
  return APPROVAL_VALUES.map(v => ({
    value: v,
    label: lang.t(`approval_${v}`), // ví dụ: approval_approved
  }));
}

export function makeDepartmentOptions(lang) {
  return DEPARTMENTS.map(v => ({
    value: v,
    label: v.toUpperCase().replace('G', 'G'), // -> G1..G5
  }));
}

export function makeSortingOptions(lang) {
  return SORTING_VALUES.map(v => ({
    value: v,
    label: lang.t(`sort_${v}`), // ví dụ: sort_created_desc
  }));
}

//Test Firebase xx
