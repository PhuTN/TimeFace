// Kiểu dữ liệu cho 1 phòng ban
export type Department = {
  id: string;
  name: string; // Tên phòng ban
  head: string; // Trưởng phòng
  headEmployeeId: string //Id Trưởng phòng
  active: boolean; // Trạng thái hoạt động
  createdAt: string; // ISO date string
};

export enum PasswordChangeStatus {
  password_changed = "password_changed",
  waiting_for_password_change = "waiting_for_password_change",
  do_not_change = "do_not_change",
}

// Kiểu dữ liệu cho 1 nhân viên
export type Employee = {
  id: string;
  name: string;
  avatar: any; // require(...) ảnh cục bộ
  passwordChangeStatus: PasswordChangeStatus;
  accountActive: boolean;
  departmentId: Department["id"];
  position: string;
  createdAt: string;
};

// 10 phòng ban mẫu (đã Việt hóa có dấu)
export const DEPARTMENTS: Department[] = [
  {
    id: "d1",
    name: "Phòng Thông tin",
    head: "Trần Ngọc Phú",
    headEmployeeId: "e31",
    active: true,
    createdAt: "2023-11-12T09:15:00.000Z",
  },
  {
    id: "d2",
    name: "Phòng Nhân sự",
    head: "Nguyễn Thu Hà",
    headEmployeeId: "e32",
    active: true,
    createdAt: "2024-01-05T08:00:00.000Z",
  },
  {
    id: "d3",
    name: "Phòng Tài chính",
    head: "Phạm Minh Quân",
    headEmployeeId: "e33",
    active: false,
    createdAt: "2023-09-22T13:40:00.000Z",
  },
  {
    id: "d4",
    name: "Phòng Kỹ thuật",
    head: "Lê Đức Long",
    headEmployeeId: "e34",
    active: true,
    createdAt: "2024-03-18T10:30:00.000Z",
  },
  {
    id: "d5",
    name: "Phòng Marketing",
    head: "Vũ Thanh Tú",
    headEmployeeId: "e35",
    active: true,
    createdAt: "2023-12-01T07:20:00.000Z",
  },
  {
    id: "d6",
    name: "Phòng Chăm sóc khách hàng",
    head: "Bùi Hồng Phúc",
    headEmployeeId: "e36",
    active: true,
    createdAt: "2024-02-10T11:05:00.000Z",
  },
  {
    id: "d7",
    name: "Phòng Pháp chế",
    head: "Đặng Thu Trang",
    headEmployeeId: "e37",
    active: false,
    createdAt: "2023-08-14T16:55:00.000Z",
  },
  {
    id: "d8",
    name: "Phòng Nghiên cứu & Phát triển",
    head: "Trịnh Quốc Huy",
    headEmployeeId: "e38",
    active: true,
    createdAt: "2024-04-25T09:45:00.000Z",
  },
  {
    id: "d9",
    name: "Phòng Vận hành",
    head: "Hoàng Anh Dũng",
    headEmployeeId: "e39",
    active: true,
    createdAt: "2023-10-09T06:30:00.000Z",
  },
  {
    id: "d10",
    name: "Phòng Kiểm thử",
    head: "Ngô Hải Yến",
    headEmployeeId: "e40",
    active: true,
    createdAt: "2024-05-02T14:10:00.000Z",
  },
];

// Danh sách nhân viên mẫu (3 người mỗi phòng ban) — đầy đủ 30 người
export const EMPLOYEES: Employee[] = [
  // d1
  {
    id: "e1",
    name: "Nguyễn Văn Nam",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d1",
    position: "Chuyên viên Hệ thống",
    createdAt: "2024-03-10T08:30:00.000Z",
  },
  {
    id: "e2",
    name: "Phạm Thu Giang",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d1",
    position: "Nhân viên Hỗ trợ kỹ thuật",
    createdAt: "2024-04-02T10:15:00.000Z",
  },
  {
    id: "e3",
    name: "Lý Minh Hoàng",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d1",
    position: "Quản trị viên Mạng",
    createdAt: "2024-05-01T09:45:00.000Z",
  },

  // d2
  {
    id: "e4",
    name: "Đặng Thị Lan",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d2",
    position: "Chuyên viên Tuyển dụng",
    createdAt: "2024-01-18T07:50:00.000Z",
  },
  {
    id: "e5",
    name: "Ngô Văn Tùng",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: true,
    departmentId: "d2",
    position: "Chuyên viên Đào tạo",
    createdAt: "2024-02-12T09:30:00.000Z",
  },
  {
    id: "e6",
    name: "Trịnh Hải Yến",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: false,
    departmentId: "d2",
    position: "Nhân viên Tiền lương",
    createdAt: "2024-03-05T11:20:00.000Z",
  },

  // d3
  {
    id: "e7",
    name: "Vũ Quang Khải",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d3",
    position: "Kế toán trưởng",
    createdAt: "2023-12-14T08:40:00.000Z",
  },
  {
    id: "e8",
    name: "Lưu Thị Duyên",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d3",
    position: "Chuyên viên Kiểm soát chi phí",
    createdAt: "2024-01-22T09:10:00.000Z",
  },
  {
    id: "e9",
    name: "Trần Quốc Bảo",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d3",
    position: "Nhân viên Thu chi",
    createdAt: "2024-04-08T13:55:00.000Z",
  },

  // d4
  {
    id: "e10",
    name: "Bùi Minh Cường",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d4",
    position: "Kỹ sư Phần mềm",
    createdAt: "2024-02-28T08:20:00.000Z",
  },
  {
    id: "e11",
    name: "Huỳnh Ngọc Trâm",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d4",
    position: "Kỹ sư QA",
    createdAt: "2024-03-18T14:00:00.000Z",
  },
  {
    id: "e12",
    name: "Đoàn Văn Phúc",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d4",
    position: "Nhân viên Bảo trì",
    createdAt: "2024-05-06T07:45:00.000Z",
  },

  // d5
  {
    id: "e13",
    name: "Nguyễn Khánh Chi",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d5",
    position: "Chuyên viên Nội dung",
    createdAt: "2024-01-26T09:25:00.000Z",
  },
  {
    id: "e14",
    name: "Trần Gia Lộc",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d5",
    position: "Chuyên viên Digital",
    createdAt: "2024-02-19T08:55:00.000Z",
  },
  {
    id: "e15",
    name: "Phan Thảo My",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d5",
    position: "Thiết kế Đồ họa",
    createdAt: "2024-03-29T10:35:00.000Z",
  },

  // d6
  {
    id: "e16",
    name: "Lê Thanh Bình",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d6",
    position: "Trưởng nhóm Chăm sóc",
    createdAt: "2024-03-02T07:40:00.000Z",
  },
  {
    id: "e17",
    name: "Nguyễn Hữu Phát",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d6",
    position: "Nhân viên Tổng đài",
    createdAt: "2024-04-15T11:05:00.000Z",
  },
  {
    id: "e18",
    name: "Đặng Mỹ Ngọc",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d6",
    position: "Chuyên viên Phản hồi",
    createdAt: "2024-05-09T12:25:00.000Z",
  },

  // d7
  {
    id: "e19",
    name: "Phùng Văn Hải",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d7",
    position: "Chuyên viên Pháp chế",
    createdAt: "2023-11-21T09:10:00.000Z",
  },
  {
    id: "e20",
    name: "Nguyễn Hoài Phương",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d7",
    position: "Luật sư Nội bộ",
    createdAt: "2024-01-09T10:50:00.000Z",
  },
  {
    id: "e21",
    name: "Trần Thị Minh An",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d7",
    position: "Nhân viên Tuân thủ",
    createdAt: "2024-03-16T15:30:00.000Z",
  },

  // d8
  {
    id: "e22",
    name: "Đỗ Quốc Thịnh",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d8",
    position: "Trưởng nhóm R&D",
    createdAt: "2024-02-05T09:35:00.000Z",
  },
  {
    id: "e23",
    name: "Phạm Thiên Hương",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d8",
    position: "Nhà nghiên cứu chính",
    createdAt: "2024-03-21T08:15:00.000Z",
  },
  {
    id: "e24",
    name: "Lai Tuấn Khang",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d8",
    position: "Kỹ thuật viên Phòng lab",
    createdAt: "2024-04-27T10:05:00.000Z",
  },

  // d9
  {
    id: "e25",
    name: "Ngô Thị Kim Yến",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d9",
    position: "Quản lý ca Vận hành",
    createdAt: "2024-01-30T06:50:00.000Z",
  },
  {
    id: "e26",
    name: "Hồ Quốc Duy",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d9",
    position: "Điều phối viên Kho",
    createdAt: "2024-03-04T09:55:00.000Z",
  },
  {
    id: "e27",
    name: "Trương Minh Sơn",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d9",
    position: "Nhân viên Logistics",
    createdAt: "2024-04-18T13:25:00.000Z",
  },

  // d10
  {
    id: "e28",
    name: "La Mỹ Linh",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.password_changed,
    accountActive: true,
    departmentId: "d10",
    position: "Chuyên viên Kiểm toán nội bộ",
    createdAt: "2023-12-20T08:05:00.000Z",
  },
  {
    id: "e29",
    name: "Tạ Đình Khoa",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
    accountActive: true,
    departmentId: "d10",
    position: "Chuyên viên Giám sát quy trình",
    createdAt: "2024-02-14T10:40:00.000Z",
  },
  {
    id: "e30",
    name: "Chu Thảo Vy",
    avatar: require("../../assets/images/meow.jpg"),
    passwordChangeStatus: PasswordChangeStatus.do_not_change,
    accountActive: false,
    departmentId: "d10",
    position: "Nhân viên Báo cáo kiểm tra",
    createdAt: "2024-05-07T09:15:00.000Z",
  },
];
