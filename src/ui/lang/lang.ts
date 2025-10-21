export const LangCodes = ['vi', 'en'] as const;
export type LangCode = (typeof LangCodes)[number];
export type LangIndex = 0 | 1;

export function langToIndex(code: LangCode): LangIndex {
  return (LangCodes.indexOf(code) as LangIndex) ?? 0;
}

// Các path hợp lệ: key top-level hoặc "theme.light"/"theme.dark"
export type LangPath =
  | keyof Omit<typeof Lang, 'theme'>
  | `theme.${'light' | 'dark'}`;

// t("hello", "vi") hoặc t("theme.light", 1)
export function t(path: LangPath, lang: LangCode | LangIndex): string {
  const idx: LangIndex = typeof lang === 'number' ? lang : langToIndex(lang);
  if (path.startsWith('theme.')) {
    const key = path.split('.')[1] as 'light' | 'dark';
    return Lang.theme[key][idx];
  }
  const k = path as keyof Omit<typeof Lang, 'theme'>;

  return Lang[k][idx];
}

// Trả về đối tượng đã resolve sẵn + helper t()
export function pickLanguage(code: LangCode) {
  const idx = langToIndex(code);
  return {
    code,
    idx,
    t: (path: LangPath) => t(path, idx),
  };
}

// [0] = vi, [1] = en
export const Lang = {
  hello: ['Xin chào', 'Hello'],
  logout: ['Đăng xuất', 'Logout'],
  settings: ['Cài đặt', 'Settings'],
  profile: ['Hồ sơ', 'Profile'], // <- thêm từ mới chỉ cần thêm 1 dòng ở đây
  rank: ['Xếp hạng', 'Ranking'],
  theme: {
    light: ['Chủ đề sáng', 'Light theme'],
    dark: ['Chủ đề tối', 'Dark theme'],
  },
  themeToggle: ['Giao diện', 'Theme'],
  languageToggle: ['Ngôn ngữ', 'Language'],
  lightMode: ['Sáng', 'Light'],
  darkMode: ['Tối', 'Dark'],
  vietnamese: ['Tiếng Việt', 'Vietnamese'],
  english: ['Tiếng Anh', 'English'],
  requestCode: ['Mã đơn', 'Request code'],
  createdAt: ['Ngày tạo đơn', 'Created at'],
  time: ['Thời gian', 'Time'],
  date: ['ngày', 'date'],
  approved: ['Đã duyệt', 'Approved'],
  rejected: ['Từ chối', 'Rejected'],
  pending: ['Đang chờ', 'Pending'],
  filterOptions: ['Tùy chọn lọc', 'Filter Options'],
  employeeName: ['Tên nhân viên', 'Employee Name'],
  position: ['Chức vụ', 'Position'],
  department: ['Phòng ban', 'Department'],
  status: ['Trạng thái', 'Status'],
  createdDate: ['Ngày tạo phiếu', 'Created Date'],
  otDate: ['Ngày OT', 'OT Date'],
  sortBy: ['Sắp xếp bởi', 'Sort By'],
  selectDepartment: ['Chọn phòng ban', 'Select Department'],
  selectStatus: ['Chọn trạng thái', 'Select Status'],
  selectDate: ['Chọn ngày', 'Select Date'],
  selectSortBy: ['Chọn tiêu chí sắp xếp', 'Select Sort By'],
  clearFilter: ['Xóa lọc', 'Clear Filter'],
  applyFilter: ['Áp dụng lọc', 'Apply Filter'],
  lateMinutes: ['Số phút đi trể', 'Late minutes'],
  occupies: ['Chiếm', 'Occupies'],
  shiftTime: ['thời gian ca làm việc', 'shift time'],
  leaveReason: ['Xin nghỉ lý do', 'Leave reason'],
  //CommonScreen3
  employee_name_label: ['Tên nhân viên', 'Employee name'],
  position_name_label: ['Tên chức vụ', 'Position name'],
  approval_status_label: ['Trạng thái duyệt', 'Approval status'],
  id_form_label: ['Mã phiếu', 'ID form'],
  department_label: ['Phòng ban', 'Department'],
  created_date_label: ['Ngày tạo phiếu', 'Created date'],
  start_date_label: ['Ngày bắt đầu nghỉ', 'Start date'],
  end_date_label: ['Ngày kết thúc nghỉ', 'End date'],
  sort_by_label: ['Sắp xếp bởi', 'Sort by'],
  clear_filters: ['Xóa lọc', 'Clear filters'],
  apply_filters: ['Áp dụng lọc', 'Apply filters'],
  // placeholders
  employee_placeholder: ['Nhập tên', 'Enter name'],
  position_placeholder: ['Nhập chức vụ', 'Enter position'],
  id_form_placeholder: ['VD: MP-001', 'e.g. FRM-001'],
  // approvals
  approval_approved: ['Duyệt', 'Approved'],
  approval_pending: ['Chờ duyệt', 'Pending'],
  approval_rejected: ['Từ chối', 'Rejected'],
  // sortings
  sort_created_desc: [
    'Ngày tạo mới nhất đến ngày tạo cũ nhất',
    'Newest created → Oldest',
  ],
  sort_created_asc: [
    'Ngày tạo cũ nhất đến ngày tạo mới nhất',
    'Oldest created → Newest',
  ],
  sort_name_asc: ['Tên A → Z', 'Name A → Z'],
  sort_name_desc: ['Tên Z → A', 'Name Z → A'],
  changeDate: ['Ngày thay đổi:', 'Change date:'],
  recentChangeDate: ['Ngày thay đổi gần đây', 'Recent change date'],
  icRequestTitle: ['DUYỆT ĐỔI THÔNG TIN', 'APPROVE INFORMATION CHANGE'],
  leaveRequestTitle: ['DUYỆT ĐƠN XIN NGHỈ', 'APPROVE LEAVE REQUEST'],
  otRequestTitle: ['DUYỆT ĐƠN XIN OT', 'APPROVE OT REQUEST'],
  timesheetTitle: ['DANH SÁCH BẢNG CÔNG', 'TIMESHEET LIST'],
  recentCreatedDate: ['Ngày tạo gần đây', 'Recent created date'],
  recentOTDate: ['Ngày OT gần đây', 'Recent OT date'],
} as const;
