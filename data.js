// Dữ liệu học sinh - Admin có thể chỉnh sửa qua trang admin.html
const ADMIN_PASSWORD = "admin83";

const students = [
  { id: 1,  name: "Nguyễn Thị An",        photo: "photos/01.jpg", message: "" },
  { id: 2,  name: "Trần Thị Bình",         photo: "photos/02.jpg", message: "" },
  { id: 3,  name: "Lê Thị Chi",            photo: "photos/03.jpg", message: "" },
  { id: 4,  name: "Phạm Thị Dung",         photo: "photos/04.jpg", message: "" },
  { id: 5,  name: "Hoàng Thị Em",          photo: "photos/05.jpg", message: "" },
  { id: 6,  name: "Vũ Thị Phương",         photo: "photos/06.jpg", message: "" },
  { id: 7,  name: "Đặng Thị Giang",        photo: "photos/07.jpg", message: "" },
  { id: 8,  name: "Bùi Thị Hà",            photo: "photos/08.jpg", message: "" },
  { id: 9,  name: "Ngô Thị Hương",         photo: "photos/09.jpg", message: "" },
  { id: 10, name: "Dương Thị Lan",         photo: "photos/10.jpg", message: "" },
  { id: 11, name: "Lý Thị Mai",            photo: "photos/11.jpg", message: "" },
  { id: 12, name: "Đinh Thị Ngân",         photo: "photos/12.jpg", message: "" },
  { id: 13, name: "Trịnh Thị Oanh",        photo: "photos/13.jpg", message: "" },
  { id: 14, name: "Cao Thị Phúc",          photo: "photos/14.jpg", message: "" },
  { id: 15, name: "Hà Thị Quỳnh",          photo: "photos/15.jpg", message: "" },
  { id: 16, name: "Lưu Thị Rạng",          photo: "photos/16.jpg", message: "" },
  { id: 17, name: "Tô Thị Sương",          photo: "photos/17.jpg", message: "" },
  { id: 18, name: "Phan Thị Thảo",         photo: "photos/18.jpg", message: "" },
  { id: 19, name: "Võ Thị Uyên",           photo: "photos/19.jpg", message: "" },
  { id: 20, name: "La Thị Vân",            photo: "photos/20.jpg", message: "" },
  { id: 21, name: "Châu Thị Xuân",         photo: "photos/21.jpg", message: "" },
  { id: 22, name: "Sum Thị Yến",           photo: "photos/22.jpg", message: "" },
  { id: 23, name: "Mạc Thị Zung",          photo: "photos/23.jpg", message: "" },
  { id: 24, name: "Huỳnh Thị Ánh",         photo: "photos/24.jpg", message: "" },
  { id: 25, name: "Đoàn Thị Bảo",          photo: "photos/25.jpg", message: "" },
  { id: 26, name: "Cù Thị Châu",           photo: "photos/26.jpg", message: "" },
  { id: 27, name: "Dư Thị Diệu",           photo: "photos/27.jpg", message: "" },
  { id: 28, name: "Ê Thị Đào",             photo: "photos/28.jpg", message: "" },
  { id: 29, name: "Ghê Thị Gấm",           photo: "photos/29.jpg", message: "" },
  { id: 30, name: "Hứa Thị Hân",           photo: "photos/30.jpg", message: "" },
  { id: 31, name: "Inh Thị Inh",           photo: "photos/31.jpg", message: "" },
  { id: 32, name: "Kha Thị Kim",           photo: "photos/32.jpg", message: "" },
  { id: 33, name: "La Thị Lài",            photo: "photos/33.jpg", message: "" },
  { id: 34, name: "Ma Thị Mận",            photo: "photos/34.jpg", message: "" }
];

// Tải dữ liệu từ localStorage nếu có (để admin có thể chỉnh sửa)
function loadStudentData() {
  const saved = localStorage.getItem('studentData_83');
  if (saved) {
    const savedData = JSON.parse(saved);
    // Gộp dữ liệu đã lưu
    savedData.forEach(saved => {
      const idx = students.findIndex(s => s.id === saved.id);
      if (idx !== -1) {
        students[idx] = { ...students[idx], ...saved };
      }
    });
  }
  return students;
}

function saveStudentData() {
  localStorage.setItem('studentData_83', JSON.stringify(students));
}
