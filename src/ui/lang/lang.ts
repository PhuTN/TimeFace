

export const LangCodes = ["vi", "en"] as const;
export type LangCode  = typeof LangCodes[number];
export type LangIndex = 0 | 1;

export function langToIndex(code: LangCode): LangIndex {
  return (LangCodes.indexOf(code) as LangIndex) ?? 0;
}

// Các path hợp lệ: key top-level hoặc "theme.light"/"theme.dark"
export type LangPath =
  | keyof Omit<typeof Lang, "theme">
  | `theme.${"light" | "dark"}`;

// t("hello", "vi") hoặc t("theme.light", 1)
export function t(path: LangPath, lang: LangCode | LangIndex): string {
  const idx: LangIndex = typeof lang === "number" ? lang : langToIndex(lang);
  if (path.startsWith("theme.")) {
    const key = path.split(".")[1] as "light" | "dark";
    return Lang.theme[key][idx];
  }
  const k = path as keyof Omit<typeof Lang, "theme">;

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
  hello:   ["Xin chào", "Hello"],
  logout:  ["Đăng xuất", "Logout"],
  settings:["Cài đặt", "Settings"],
  profile: ["Hồ sơ", "Profile"],   // <- thêm từ mới chỉ cần thêm 1 dòng ở đây
  rank:    ["Xếp hạng", "Ranking"],
  theme: {
    light: ["Chủ đề sáng", "Light theme"],
    dark:  ["Chủ đề tối",  "Dark theme"],
  },

  //CommonScreen3
  employee_name_label:     ["Tên nhân viên", "Employee name"],
  position_name_label:     ["Tên chức vụ", "Position name"],
  approval_status_label:   ["Trạng thái duyệt", "Approval status"],
  id_form_label:           ["Mã phiếu", "ID form"],
  department_label:        ["Phòng ban", "Department"],
  created_date_label:      ["Ngày tạo phiếu", "Created date"],
  start_date_label:        ["Ngày bắt đầu nghỉ", "Start date"],
  end_date_label:          ["Ngày kết thúc nghỉ", "End date"],
  sort_by_label:           ["Sắp xếp bởi", "Sort by"],
  // placeholders
  employee_placeholder:    ["Nhập tên", "Enter name"],
  position_placeholder:    ["Nhập chức vụ", "Enter position"],
  id_form_placeholder:     ["VD: MP-001", "e.g. FRM-001"],
  // approvals
  approval_approved:       ["Duyệt", "Approved"],
  approval_pending:        ["Chờ duyệt", "Pending"],
  approval_rejected:       ["Từ chối", "Rejected"],

   // sortings
  clear_filters:           ["Xóa lọc", "Clear filters"],
  apply_filters:           ["Áp dụng lọc", "Apply filters"],
  sort_created_desc:       ["Ngày tạo mới nhất đến ngày tạo cũ nhất", "Newest created → Oldest"],
  sort_created_asc:        ["Ngày tạo cũ nhất đến ngày tạo mới nhất", "Oldest created → Newest"],
  sort_name_asc:           ["Tên A → Z", "Name A → Z"],
  sort_name_desc:          ["Tên Z → A", "Name Z → A"],

  //DepartmentManagementScreen
  department_management:   ["Quản lý phòng ban", "Department Management"],
  list_department:         ["Danh sách phòng ban", "List of departments"],
  department_name_title:   ["Tên phòng ban", "Department name"],
  head_of_dept:            ["Trưởng phòng", "Head of Department"],
  active:                  ["Hoạt động", "Active"],
  inactive:                ["Ngừng hoạt động", "Inactive"],
  date_created:            ["Ngày tạo", "Date created"],

  add_employee:            ["Thêm nhân viên", "Add new employee"],
  add_department:          ["Thêm phòng ban", "Add new department"],
  list_employee:           ["Danh sách nhân viên", "List of employees"],
  enter_department_name:   ["Nhập tên phòng ban", "Enter department name"],
  select_department_head:  ["Chọn trưởng phòng", "Select a department head"],

  password_changed:                ["Đã đổi mật khẩu", "Password changed"],
  waiting_for_password_change:     ["Chờ đổi mật khẩu","Waiting for password change"],
  do_not_change_password:          ["Không thể đổi mật khẩu", "Do not change password"],
  password_change_label:           ["Trạng thái đổi mật khẩu", "Password change status"],
  account_status_label:            ["Trạng thái tài khoản", "Account status"],
  cancel:                          ["Thoát", "Cancel"],
  save:                            ["Lưu thay đổi", "Save changes"],
  department_status:               ["Trạng thái phòng", "Department status"],
  department_active:               ["Hoạt động", "Active"],
  department_inactive:             ["Không hoạt động", "Inactive"],
  list_of_dp_employees:            ["DANH SÁCH NHÂN VIÊN CỦA PHÒNG", "List of department employees"],
  all_employees:            ["Tất cả nhân viên", "All employees"],
  employees_in_this_dept:   ["Nhân viên trong phòng ban", "Employees in the department"],
  type_of_employee:         ["Loại nhân viên", "Type of employees"]

} as const;