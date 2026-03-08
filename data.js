// data.js – Danh sách mặc định 34 học sinh
// Dữ liệu thật được lưu trên Firestore (collection: "students")
// File này chỉ dùng để hiển thị tên mặc định khi chưa có data trên cloud

const defaultStudents = [
  { id: 1, name: "Học sinh 01" },
  { id: 2, name: "Học sinh 02" },
  { id: 3, name: "Học sinh 03" },
  { id: 4, name: "Học sinh 04" },
  { id: 5, name: "Học sinh 05" },
  { id: 6, name: "Học sinh 06" },
  { id: 7, name: "Học sinh 07" },
  { id: 8, name: "Học sinh 08" },
  { id: 9, name: "Học sinh 09" },
  { id: 10, name: "Học sinh 10" },
  { id: 11, name: "Học sinh 11" },
  { id: 12, name: "Học sinh 12" },
  { id: 13, name: "Học sinh 13" },
  { id: 14, name: "Học sinh 14" },
  { id: 15, name: "Học sinh 15" },
  { id: 16, name: "Học sinh 16" },
  { id: 17, name: "Học sinh 17" },
  { id: 18, name: "Học sinh 18" },
  { id: 19, name: "Học sinh 19" },
  { id: 20, name: "Học sinh 20" },
  { id: 21, name: "Học sinh 21" },
  { id: 22, name: "Học sinh 22" },
  { id: 23, name: "Học sinh 23" },
  { id: 24, name: "Học sinh 24" },
  { id: 25, name: "Học sinh 25" },
  { id: 26, name: "Học sinh 26" },
  { id: 27, name: "Học sinh 27" },
  { id: 28, name: "Học sinh 28" },
  { id: 29, name: "Học sinh 29" },
  { id: 30, name: "Học sinh 30" },
  { id: 31, name: "Học sinh 31" },
  { id: 32, name: "Học sinh 32" },
  { id: 33, name: "Học sinh 33" },
  { id: 34, name: "Học sinh 34" }
];

// Lấy document ID từ số thứ tự (padded: "01", "02", ...)
function getDocId(num) {
  return String(num).padStart(2, '0');
}

// Đọc thông tin 1 học sinh từ Firestore, fallback về defaultStudents
async function loadStudentById(num) {
  const docId = getDocId(num);
  try {
    const snap = await db.collection('students').doc(docId).get();
    const def = defaultStudents.find(s => s.id === num) || { id: num, name: `Học sinh ${docId}` };
    if (snap.exists) {
      return { ...def, ...snap.data(), id: num };
    }
    return { ...def, photoURL: null, message: '' };
  } catch (e) {
    console.warn('Firestore error:', e);
    const def = defaultStudents.find(s => s.id === num) || { id: num, name: `Học sinh ${docId}` };
    return { ...def, photoURL: null, message: '' };
  }
}

// Lưu thông tin học sinh lên Firestore
async function saveStudentToFirestore(num, name, message, photoURL) {
  const docId = getDocId(num);
  const data = { name, message };
  if (photoURL) data.photoURL = photoURL;
  await db.collection('students').doc(docId).set(data, { merge: true });
}
