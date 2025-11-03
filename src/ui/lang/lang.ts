export const LangCodes = ['vi', 'en'] as const;
export type LangCode = (typeof LangCodes)[number];
export type LangIndex = 0 | 1;

export function langToIndex(code: LangCode): LangIndex {
  return (LangCodes.indexOf(code) as LangIndex) ?? 0;
}

export type LangPath =
  | keyof Omit<typeof Lang, 'theme'>
  | `theme.${'light' | 'dark'}`;

export function t(path: LangPath, lang: LangCode | LangIndex): string {
  const idx: LangIndex = typeof lang === 'number' ? lang : langToIndex(lang);
  if (path.startsWith('theme.')) {
    const key = path.split('.')[1] as 'light' | 'dark';
    return Lang.theme[key][idx];
  }
  const k = path as keyof Omit<typeof Lang, 'theme'>;
  return Lang[k][idx];
}

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
  profile: ['Hồ sơ', 'Profile'],
  rank: ['Xếp hạng', 'Ranking'],
  theme: {
    light: ['Chủ đề sáng', 'Light theme'],
    dark: ['Chủ đề tối', 'Dark theme'],
  },
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
  employee_name_label: ["Tên nhân viên", "Employee name"],
  position_name_label: ["Tên chức vụ", "Position name"],
  approval_status_label: ["Trạng thái duyệt", "Approval status"],
  id_form_label: ["Mã phiếu", "ID form"],
  department_label: ["Phòng ban", "Department"],
  created_date_label: ["Ngày tạo phiếu", "Created date"],
  start_date_label: ["Ngày bắt đầu nghỉ", "Start date"],
  end_date_label: ["Ngày kết thúc nghỉ", "End date"],
  sort_by_label: ["Sắp xếp bởi", "Sort by"],
  // placeholders
  employee_placeholder: ["Nhập tên", "Enter name"],
  position_placeholder: ["Nhập chức vụ", "Enter position"],
  id_form_placeholder: ["VD: MP-001", "e.g. FRM-001"],
  // approvals
  approval_approved: ["Duyệt", "Approved"],
  approval_pending: ["Chờ duyệt", "Pending"],
  approval_rejected: ["Từ chối", "Rejected"],

  // sortings
  clear_filters: ["Xóa lọc", "Clear filters"],
  apply_filters: ["Áp dụng lọc", "Apply filters"],
  sort_created_desc: ["Ngày tạo mới nhất đến ngày tạo cũ nhất", "Newest created → Oldest"],
  sort_created_asc: ["Ngày tạo cũ nhất đến ngày tạo mới nhất", "Oldest created → Newest"],
  sort_name_asc: ["Tên A → Z", "Name A → Z"],
  sort_name_desc: ["Tên Z → A", "Name Z → A"],

  //DepartmentManagementScreen
  department_management: ["Quản lý phòng ban", "Department Management"],
  department_detail: ["Chi tiết phòng ban", "Department Detail"],
  list_department: ["Danh sách phòng ban", "List of departments"],
  department_name_title: ["Tên phòng ban", "Department name"],
  head_of_dept: ["Trưởng phòng", "Head of Department"],
  active: ["Hoạt động", "Active"],
  inactive: ["Ngừng hoạt động", "Inactive"],
  date_created: ["Ngày tạo", "Date created"],

  add_employee: ["Thêm nhân viên", "Add new employee"],
  add_department: ["Thêm phòng ban", "Add new department"],
  list_employee: ["Danh sách nhân viên", "List of employees"],
  enter_department_name: ["Nhập tên phòng ban", "Enter department name"],
  select_department_head: ["Chọn trưởng phòng", "Select a department head"],

  password_changed: ["Đã đổi mật khẩu", "Password changed"],
  waiting_for_password_change: ["Chờ đổi mật khẩu", "Waiting for password change"],
  do_not_change_password: ["Không thể đổi mật khẩu", "Do not change password"],
  password_change_label: ["Trạng thái đổi mật khẩu", "Password change status"],
  account_status_label: ["Trạng thái tài khoản", "Account status"],
  cancel: ["Thoát", "Cancel"],
  save: ["Lưu thay đổi", "Save changes"],
  department_status: ["Trạng thái phòng", "Department status"],
  department_active: ["Hoạt động", "Active"],
  department_inactive: ["Không hoạt động", "Inactive"],
  list_of_dp_employees: ["DANH SÁCH NHÂN VIÊN CỦA PHÒNG", "List of department employees"],
  all_employees: ["Tất cả nhân viên", "All employees"],
  employees_in_this_dept: ["Nhân viên trong phòng ban", "Employees in the department"],
  type_of_employee: ["Loại nhân viên", "Type of employees"],
  employee_management: ["Quản lý nhân viên", "Employee Management"],

  attendance_title: ["Chấm công", "Attendance"],
  attendance_summary_title: ["Tổng số giờ làm việc", "Total working hours"],
  attendance_today: ["Hôm nay", "Today"],
  attendance_this_month: ["Trong tháng", "This month"],
  attendance_hours: ["Giờ", "Hours"],
  attendance_hours_suffix: ["Giờ", "Hours"],
  attendance_list: ["Danh sách chấm công", "Attendance list"],
  attendance_total_hours: ["Tổng giờ", "Total hours"],
  attendance_check_in_out: ["Check-in va check-out", "Check-in & Check-out"],
  attendance_check_in: ["Check-in", "Check-in"],
  attendance_check_out: ["Check-out", "Check-out"],
  attendance_outside_area: ["Chưa vào khu vực công ty", "Outside company area"],

  filter_attendance_title: ["Bộ lọc chấm công", "Attendance filters"],
  filter_start_date: ["Ngày bắt đầu", "Start date"],
  filter_end_date: ["Ngày kết thúc", "End date"],

  face_detection_title: ["Nhận diện khuôn mặt", "Facial recognition"],
  face_step_put_face_into_frame: ["Đưa khuôn mặt vào khung", "Put your face in the frame"],
  face_step_put_face_hint: [
    "Canh khuôn mặt của bạn ngay giữa vòng elip để hệ thống ghi nhận",
    "Align your face right in the center of the ellipse for the system to record",
  ],
  face_step_smile: ["Hãy mỉm cười", "Smile"],
  face_step_smile_hint: [
    "Mỉm cười tự nhiên để xác thực chuyển động khuôn mặt",
    "Smile naturally to authenticate facial movements",
  ],
  face_step_blink: ["Hãy nháy mắt", "Blink"],
  face_step_blink_hint: [
    "Nháy mắt một lần để xác minh bạn là người thật",
    "Blink once to verify you're human",
  ],
  face_step_waiting: ["Chờ xác nhận", "Waiting for confirmation"],
  face_step_waiting_hint: [
    "Đang chờ hệ thống xác nhận kết qủa nhận diện",
    "Waiting for system to confirm recognition results",
  ],
  face_step_status_active: ["Đang thực hiện", "In progress"],
  face_step_status_done: ["Hoàn thành", "Complete"],
  face_step_status_skipped: ["Đã bỏ qua", "Skipped"],
  face_step_status_pending: ["Chưa thực hiện", "Not done"],
  face_step_detecting: ["Đang kiểm tra điều kiện...", "Checking conditions..."],
  face_step_detect_failed: ["Chưa nhận diện được, vui lòng thử lại", "Not recognized, please try again"],
  face_step_detect_success: ["Hoàn thành điều kiện", "Condition fulfilled"],

} as const;

