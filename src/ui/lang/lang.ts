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
  sort_by: ['Sắp xếp bởi', 'Sort by'],
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

  //DepartmentManagementScreen
  department_management: ['Quản lý phòng ban', 'Department Management'],
  department_detail: ['Chi tiết phòng ban', 'Department Detail'],
  list_department: ['Danh sách phòng ban', 'List of departments'],
  department_name_title: ['Tên phòng ban', 'Department name'],
  head_of_dept: ['Trưởng phòng', 'Head of Department'],
  active: ['Hoạt động', 'Active'],
  inactive: ['Ngừng hoạt động', 'Inactive'],
  date_created: ['Ngày tạo', 'Date created'],

  add_employee: ['Thêm nhân viên', 'Add new employee'],
  add_department: ['Thêm phòng ban', 'Add new department'],
  list_employee: ['Danh sách nhân viên', 'List of employees'],
  enter_department_name: ['Nhập tên phòng ban', 'Enter department name'],
  select_department_head: ['Chọn trưởng phòng', 'Select a department head'],

  password_changed: ['Đã đổi mật khẩu', 'Password changed'],
  waiting_for_password_change: [
    'Chờ đổi mật khẩu',
    'Waiting for password change',
  ],
  do_not_change_password: ['Không thể đổi mật khẩu', 'Do not change password'],
  password_change_label: ['Trạng thái đổi mật khẩu', 'Password change status'],
  account_status_label: ['Trạng thái tài khoản', 'Account status'],
  cancel: ['Thoát', 'Cancel'],
  save: ['Lưu thay đổi', 'Save changes'],
  department_status: ['Trạng thái phòng', 'Department status'],
  department_active: ['Hoạt động', 'Active'],
  department_inactive: ['Không hoạt động', 'Inactive'],
  list_of_dp_employees: [
    'DANH SÁCH NHÂN VIÊN CỦA PHÒNG',
    'List of department employees',
  ],
  all_employees: ['Tất cả nhân viên', 'All employees'],
  employees_in_this_dept: [
    'Nhân viên trong phòng ban',
    'Employees in the department',
  ],
  type_of_employee: ['Loại nhân viên', 'Type of employees'],
  employee_management: ['Quản lý nhân viên', 'Employee Management'],

  attendance_title: ['Chấm công', 'Attendance'],
  attendance_summary_title: ['Tổng số giờ làm việc', 'Total working hours'],
  attendance_today: ['Hôm nay', 'Today'],
  attendance_this_month: ['Trong tháng', 'This month'],
  attendance_hours: ['Giờ', 'Hours'],
  attendance_hours_suffix: ['Giờ', 'Hours'],
  attendance_list: ['Danh sách chấm công', 'Attendance list'],
  attendance_total_hours: ['Tổng giờ', 'Total hours'],
  attendance_check_in_out: ['Check-in va check-out', 'Check-in & Check-out'],
  attendance_check_in: ['Check-in', 'Check-in'],
  attendance_check_out: ['Check-out', 'Check-out'],
  attendance_outside_area: ['Chưa vào khu vực công ty', 'Outside company area'],

  filter_attendance_title: ['Bộ lọc chấm công', 'Attendance filters'],
  filter_start_date: ['Ngày bắt đầu', 'Start date'],
  filter_end_date: ['Ngày kết thúc', 'End date'],

  face_detection_title: ['Nhận diện khuôn mặt', 'Facial recognition'],
  face_step_put_face_into_frame: [
    'Đưa khuôn mặt vào khung',
    'Put your face in the frame',
  ],
  face_step_smile: ['Hãy mỉm cười', 'Smile'],
  face_step_blink: ['Hãy nháy mắt', 'Blink'],
  face_step_waiting: ['Chờ nhận diện', 'Waiting for identification'],
  face_step_front: [
    'Đưa mặt thẳng vào khung',
    'Put your face straight into the frame',
  ],
  face_step_left: ['Nghiêng mặt sang trái', 'Turn your face to the left'],
  face_step_right: ['Nghiêng mặt sang phải', 'Turn your face to the right'],
  face_status_label: [
    'Hãy giữ yên trong khi chúng tôi chụp ảnh khuôn mặt bạn...',
    'Hold still while we capture your face...',
  ],
  face_retry_link: ['Thử lại', 'Try again'],
  face_camera_not_ready: [
    'Camera chưa sẵn sàng. Hãy kiểm tra quyền.',
    'Camera is not ready yet. Check permissions.',
  ],
  face_face_not_centered: [
    'Giữ khuôn mặt của bạn bên trong hình oval hơn một chút.',
    'Keep your face inside the oval a bit longer.',
  ],
  face_smile_not_detected: [
    'Hãy cho chúng tôi một nụ cười tươi hơn.',
    'Give us a clearer smile.',
  ],
  face_blink_not_detected: [
    'Nháy mắt thêm lần nữa để chúng tôi có thể phát hiện ra.',
    'Blink once more so we can detect it.',
  ],
  face_face_not_front: [
    'Vui lòng đưa khuôn mặt thẳng của bạn vào khung hình.',
    'Please put your face straight into the frame.',
  ],
  face_face_not_left: [
    'Vui lòng đưa khuôn mặt bên trái của bạn vào khung hình.',
    'Please put your left side face in the frame.',
  ],
  face_face_not_right: [
    'Vui lòng đưa khuôn mặt bên phải của bạn vào khung hình.',
    'Please put your right side face in the frame.',
  ],
  face_capture_failed: [
    'Không thể chụp ảnh. Vui lòng thử lại.',
    'Could not capture a snapshot. Please try again.',
  ],

  job_information: ['Thông tin công việc', 'Job information'],
  job_title: ['Tên công việc', 'Job title'],
  job_salary: ['Mức lương', 'Salary'],
  job_OT_salary: ['Lương OT/ giờ', 'Overtime pay/hour'],
  job_number_of_days_off: [
    'Số ngày phép trong năm',
    'Number of days off per year',
  ],
  job_contract_start_date: ['Ngày bắt đầu hợp đồng', 'Contract start date'],
  job_contract_end_date: ['Ngày kết thúc hợp đồng', 'Contract end date'],

  profile_information: ['Thông tin cá nhân', 'Personal information'],
  profile_upload_title: ['Tải ảnh lên', 'Uppload photo'],
  profile_upload_hint: [
    'Định dạng phải ở dạng .jpeg .png có kích thước ít nhất là 800x800px và nhỏ hơn 5MB',
    'Format should be in .jpeg .png at least 800x800px and less than 5MB',
  ],
  profile_first_name: ['Tên', 'First name'],
  profile_last_name: ['Họ', 'Last name'],
  profile_date_of_birth: ['Ngày sinh', 'Date of birth'],
  profile_address: ['Địa chỉ', 'Address'],
  profile_address_hint: [
    'Nơi cư trú hiện tại của bạn',
    'Your current domicile',
  ],
  profile_country: ['Quốc gia', 'Country'],
  profile_state: ['Tỉnh/ Thành phố', 'State'],
  profile_city: ['Thành phố/ Phường/ Huyện', 'City'],
  profile_full_address: ['Địa chỉ đầy đủ', 'Full address'],
  profile_faces: ['Khuôn mặt', 'Faces'],
  profile_faces_hint: ['Nhận dạng khuôn mặt', 'Facial recognition'],
  profile_left_side_photo: ['Ảnh mặt trái', 'Left side photo'],
  profile_front_side_photo: ['Ảnh mặt thẳng', 'Front side photo'],
  profile_right_side_photo: ['Ảnh mặt phải', 'Right side photo'],
  profile_button_update: ['Cập nhật', 'Update'],

  profile_select_avatar_title: ['Chọn ảnh đại diện', 'Select avatar'],
  profile_select_avatar_text: [
    'Bạn muốn lấy ảnh từ đâu?',
    'Where do you want to get the photo from?',
  ],
  profile_photo_library: ['Thư viện ảnh', 'Photo library'],
  profile_take_a_photo: ['Chụp ảnh', 'Take a photo'],
  profile_cancel: ['Hủy', 'Cancel'],
  changeDate: ['Ngày thay đổi:', 'Change date:'],
  recentChangeDate: ['Ngày thay đổi gần đây', 'Recent change date'],
  icRequestTitle: ['DUYỆT ĐỔI THÔNG TIN', 'APPROVE INFORMATION CHANGE'],
  leaveRequestTitle: ['DUYỆT ĐƠN XIN NGHỈ', 'APPROVE LEAVE REQUEST'],
  otRequestTitle: ['DUYỆT ĐƠN XIN OT', 'APPROVE OT REQUEST'],
  otRecordTitle: ['LỊCH SỬ OT', 'OT RECORDS'],
  timesheetTitle: ['DANH SÁCH BẢNG CÔNG', 'TIMESHEET LIST'],
  monthTimesheetTitle: ['BẢNG CÔNG THÁNG', 'MONTHLY TIMESHEET'],
  dailyRecordTitle: ['BẢNG CÔNG CHI TIẾT', 'DAILY TIMESHEET'],
  dailyRecordTitleWithMonth: ['BẢNG CÔNG THÁNG', 'DAILY RECORDS FOR'],
  notificationTitle: ['THÔNG BÁO', 'NOTIFICATIONS'],
  filterByMonth: ['Lọc theo tháng', 'Filter by month'],
  filterByDate: ['Lọc theo ngày', 'Filter by date'],
  recentCreatedDate: ['Ngày thay đổi gần đây', 'Recent change date'],
  recentOTDate: ['Ngày OT gần đây', 'Recent OT date'],
  // Month Timesheet
  workingDays: ['Số ngày công', 'Working days'],
  unpaidLeaveDays: ['Số ngày nghỉ không lương', 'Unpaid leave days'],
  monthlySalary: ['Lương tháng', 'Monthly salary'],
  month: ['Tháng', 'Month'],
  year: ['năm', 'year'],
  // Daily Record
  totalHours: ['Tổng giờ', 'Total hours'],
  checkInOut: ['Check-in và check-out', 'Check-in & check-out'],
  hours: ['giờ', 'hours'],
  // Status Toggle
  statusPending: ['Đang duyệt', 'Pending'],
  statusApproved: ['Đã duyệt', 'Approved'],
  statusRejected: ['Từ chối', 'Rejected'],
  // Notification
  approvedBy: ['Duyệt bởi', 'Approved by'],
  by: ['bởi', 'by'],
  // OT Record
  startAt: ['Bắt đầu vào', 'Start at'],
  otHours: ['Số giờ', 'Hours'],
  approvedOn: ['Duyệt vào', 'Approved on'],
  pendingApproval: ['Đang duyệt', 'Pending approval'],
  rejectedOn: ['Từ chối vào', 'Rejected on'],
  // Leave Record
  leaveDates: ['Ngày nghỉ', 'Leave dates'],
  numberOfDays: ['Số ngày', 'Number of days'],
  days: ['ngày', 'days'],
  leaveRecordTitle: ['LỊCH SỬ NGHỈ PHÉP', 'LEAVE RECORDS'],
  // Leave Summary
  leaveSummary: ['Số lần nghỉ phép', 'Leave summary'],
  year2025: ['Năm 2025', 'Year 2025'],
  createLeaveRequest: ['Tạo đơn nghỉ phép', 'Create leave request'],
  daysTaken: ['Số ngày đã nghỉ', 'Days taken'],
  remainingLeaveDays: ['Số ngày nghỉ phép còn lại', 'Remaining leave days'],
  paidLeaveDays: ['Số ngày nghỉ phép có lương', 'Paid leave days'],
  // OT Summary
  overtimeHours: ['Số giờ overtime', 'Overtime hours'],
  createOvertimeRequest: ['Tạo đơn overtime', 'Create OT request'],
  thisMonth: ['Tháng này', 'This month'],
  thisYear: ['Năm nay', 'This year'],
  // Add OT Modal
  otReason: ['Lý do OT', 'OT reason'],
  otReasonPlaceholder: ['Nhập lý do overtime...', 'Enter OT reason...'],
  exit: ['Thoát', 'Exit'],
  add: ['Thêm', 'Add'],
  // Add Leave Modal
  startDate: ['Ngày bắt đầu', 'Start date'],
  endDate: ['Ngày kết thúc', 'End date'],
  leaveReasonLabel: ['Lý do nghỉ phép', 'Leave reason'],
  leaveReasonPlaceholder: ['Nhập lý do nghỉ phép...', 'Enter leave reason...'],
  attachFile: ['Đính kèm tệp', 'Attach file'],
  fileAttached: ['Đã đính kèm tệp', 'File attached'],
  noFileAttached: ['Chưa có tệp', 'No file attached'],
  // Detail Modals
  leaveRequestDetails: ['Chi tiết đơn xin nghỉ', 'Leave Request Details'],
  otRequestDetails: ['Chi tiết đơn OT', 'OT Request Details'],
  timesheetDetails: ['Chi tiết bảng công', 'Timesheet Details'],
  leaveDuration: ['Thời gian nghỉ', 'Leave Duration'],
  otDetails: ['Thông tin OT', 'OT Details'],
  approve: ['Duyệt', 'Approve'],
  reject: ['Từ chối', 'Reject'],
  period: ['Kỳ', 'Period'],
  attendanceSummary: ['Tổng kết chấm công', 'Attendance Summary'],
  totalWorkingDays: ['Tổng số ngày công', 'Total Working Days'],
  actualWorkingDays: ['Số ngày đã làm', 'Actual Working Days'],
  lateCount: ['Số lần đi trễ', 'Late Count'],
  absentCount: ['Số ngày vắng', 'Absent Count'],
  leaveCount: ['Số ngày nghỉ', 'Leave Count'],
  attendanceRate: ['Tỷ lệ chấm công', 'Attendance Rate'],
  times: ['lần', 'times'],
} as const;
