// ข้อมูลพนักงาน 10 คนในระบบ
let employees = [
    { id: "EMP001", name: "คุณสมชาย ใจดี", position: "Senior Developer", dept: "IT", avatar: "สช", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP002", name: "คุณสมหญิง รักงาน", position: "UI/UX Designer", dept: "Design", avatar: "สห", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP003", name: "คุณมานะ อดทน", position: "Backend Developer", dept: "IT", avatar: "มน", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP004", name: "คุณสมรักษ์ ดีพอ", position: "HR Manager", dept: "HR", avatar: "มร", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP005", name: "คุณวิชัย มั่นคง", position: "Accountant", dept: "Finance", avatar: "วช", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP006", name: "คุณสุดา รักดี", position: "Marketing Specialist", dept: "Marketing", avatar: "สด", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP007", name: "คุณปิติ ยินดี", position: "Sales Executive", dept: "Sales", avatar: "ปต", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP008", name: "คุณกานดา ภาวนา", position: "Customer Support", dept: "Operations", avatar: "กด", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP009", name: "คุณธนพล มั่นหมาย", position: "System Admin", dept: "IT", avatar: "ธพ", sickRemain: 30, personalRemain: 6, vacationRemain: 10 },
    { id: "EMP010", name: "คุณสุภา สว่างใส", position: "Content Creator", dept: "Marketing", avatar: "สภ", sickRemain: 30, personalRemain: 6, vacationRemain: 10 }
];

let leaveRequests = JSON.parse(localStorage.getItem('leaveRequests')) || [];
let currentEmpIndex = 0;
let currentRole = 'user'; // 'user' หรือ 'admin'

// รายการวันหยุดนักขัตฤกษ์ประเทศไทย (ปี 2026 / 2569)
const publicHolidays = [
    "2026-01-01", // วันขึ้นปีใหม่
    "2026-03-03", // วันมาฆบูชา
    "2026-04-06", // วันจักรี
    "2026-04-13", // วันสงกรานต์
    "2026-04-14", // วันสงกรานต์
    "2026-04-15", // วันสงกรานต์
    "2026-05-01", // วันแรงงานแห่งชาติ
    "2026-05-04", // วันฉัตรมงคล
    "2026-05-31", // วันวิสาขบูชา
    "2026-07-28", // วันเฉลิมพระชนมพรรษา ร.10
    "2026-08-12", // วันแม่แห่งชาติ
    "2026-10-13", // วันนวมินทรมหาราช
    "2026-10-23", // วันปิยมหาราช
    "2026-12-05", // วันพ่อแห่งชาติ
    "2026-12-10", // วันรัฐธรรมนูญ
    "2026-12-31"  // วันสิ้นปี
];

// ฟังก์ชันคำนวณวันลาจริง (หักวันอาทิตย์และวันหยุดนักขัตฤกษ์ออก)
function calculateEffectiveLeaveDays(startDateStr, endDateStr) {
    let start = new Date(startDateStr);
    let end = new Date(endDateStr);
    let count = 0;

    let curDate = new Date(start);
    while (curDate <= end) {
        let dayOfWeek = curDate.getDay(); // 0 = วันอาทิตย์
        let dateString = curDate.toISOString().split('T')[0];

        // ถ้าไม่ใช่ "วันอาทิตย์" และ "ไม่ใช่" วันหยุดนักขัตฤกษ์ นับเป็น 1 วันทำงาน
        if (dayOfWeek !== 0 && !publicHolidays.includes(dateString)) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count > 0 ? count : 1;
}

document.addEventListener('DOMContentLoaded', () => {
    initUserDropdown();
    updateUI();

    // Event: เปลี่ยนชื่อพนักงานจาก Dropdown
    document.getElementById('userSelectDropdown').addEventListener('change', (e) => {
        currentEmpIndex = parseInt(e.target.value);
        updateUI();
    });

    // Event: ปุ่มโหมดพนักงาน
    document.getElementById('btnRoleUser').addEventListener('click', () => {
        currentRole = 'user';
        document.getElementById('btnRoleUser').classList.add('active', 'btn-outline-primary');
        document.getElementById('btnRoleUser').classList.remove('btn-outline-secondary');
        document.getElementById('btnRoleAdmin').classList.remove('active', 'btn-warning');
        document.getElementById('btnRoleAdmin').classList.add('btn-outline-warning', 'text-dark');
        
        document.getElementById('userScreen').classList.remove('d-none');
        document.getElementById('adminScreen').classList.add('d-none');
        document.getElementById('roleBadge').className = 'badge ms-3 fs-6 px-3 py-2 rounded-pill shadow-sm bg-primary text-white';
        document.getElementById('roleBadge').innerText = 'โหมดพนักงาน';
        document.getElementById('userSelectorGroup').style.display = 'flex';
    });

    // Event: ปุ่มโหมดผู้บริหาร (Admin) -> เปิด Modal ใส่ PIN
    document.getElementById('btnRoleAdmin').addEventListener('click', () => {
        const pinModal = new bootstrap.Modal(document.getElementById('pinModal'));
        document.getElementById('pinInput').value = '';
        pinModal.show();
    });

    // Event: ยืนยันรหัส PIN (รหัสคือ 1234)
    document.getElementById('btnSubmitPin').addEventListener('click', () => {
        const pin = document.getElementById('pinInput').value;
        if (pin === '1234') {
            currentRole = 'admin';
            document.getElementById('btnRoleAdmin').classList.add('active', 'btn-warning');
            document.getElementById('btnRoleAdmin').classList.remove('btn-outline-warning', 'text-dark');
            document.getElementById('btnRoleUser').classList.remove('active', 'btn-outline-primary');

            document.getElementById('userScreen').classList.add('d-none');
            document.getElementById('adminScreen').classList.remove('d-none');
            document.getElementById('roleBadge').className = 'badge ms-3 fs-6 px-3 py-2 rounded-pill shadow-sm bg-warning text-dark';
            document.getElementById('roleBadge').innerText = 'โหมดผู้บริหาร: คุณพิชญ์สินี ทับพยุง';
            document.getElementById('userSelectorGroup').style.display = 'none';

            const pinModalEl = bootstrap.Modal.getInstance(document.getElementById('pinModal'));
            pinModalEl.hide();
            renderAdminDashboard();
        } else {
            alert('รหัส PIN ไม่ถูกต้อง (รหัสทดสอบคือ 1234)');
        }
    });

    // Event: ส่งฟอร์มขอลางาน
    document.getElementById('leaveForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('leaveType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const reason = document.getElementById('leaveReason').value;

        if (!startDate || !endDate) {
            alert('กรุณาระบุวันที่เริ่มต้นและสิ้นสุดการลา');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            alert('วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น');
            return;
        }

        // คำนวณวันลาจริง (หักวันอาทิตย์และวันหยุดนักขัตฤกษ์ออก)
        const diffDays = calculateEffectiveLeaveDays(startDate, endDate);

        let emp = employees[currentEmpIndex];
        let remainKey = type === 'ลาป่วย' ? 'sickRemain' : (type === 'ลากิจ' ? 'personalRemain' : 'vacationRemain');

        if (emp[remainKey] < diffDays) {
            alert(`วันลาคงเหลือของคุณไม่เพียงพอ (ต้องการ ${diffDays} วัน, คงเหลือ ${emp[remainKey]} วัน เนื่องจากระบบหักวันหยุดอาทิตย์และนักขัตฤกษ์ออกให้แล้ว)`);
            return;
        }

        const newRequest = {
            id: 'LR' + Date.now(),
            empIndex: currentEmpIndex,
            empId: emp.id,
            empName: emp.name,
            dept: emp.dept,
            type: type,
            startDate: startDate,
            endDate: endDate,
            days: diffDays,
            reason: reason,
            status: 'รออนุมัติ',
            dateSubmitted: new Date().toLocaleDateString('th-TH')
        };

        leaveRequests.unshift(newRequest);
        saveStorage();
        document.getElementById('leaveForm').reset();
        updateUI();
        alert(`ยื่นคำขอลางานสำเร็จ! (ระบบคำนวณวันลาหักวันหยุดให้ ${diffDays} วัน)`);
    });
});

function initUserDropdown() {
    const dropdown = document.getElementById('userSelectDropdown');
    dropdown.innerHTML = '';
    employees.forEach((emp, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.text = `${emp.name} (${emp.position})`;
        dropdown.appendChild(opt);
    });
}

function updateUI() {
    let emp = employees[currentEmpIndex];
    document.getElementById('userAvatar').innerText = emp.avatar;
    document.getElementById('userName').innerText = emp.name;
    document.getElementById('userId').innerText = emp.id;
    document.getElementById('userPosition').innerText = emp.position;
    document.getElementById('userDept').innerText = emp.dept;

    document.getElementById('sickRemain').innerText = emp.sickRemain;
    document.getElementById('personalRemain').innerText = emp.personalRemain;
    document.getElementById('vacationRemain').innerText = emp.vacationRemain;

    renderUserHistory();
}

function renderUserHistory() {
    const tbody = document.getElementById('userHistoryTableBody');
    const userReqs = leaveRequests.filter(r => r.empIndex === currentEmpIndex);
    document.getElementById('userRecordCount').innerText = `${userReqs.length} รายการ`;

    if (userReqs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">ยังไม่มีประวัติการส่งคำขอ</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    userReqs.forEach(req => {
        let badgeClass = req.status === 'อนุมัติแล้ว' ? 'bg-success' : (req.status === 'ไม่อนุมัติ' ? 'bg-danger' : 'bg-warning text-dark');
        tbody.innerHTML += `
            <tr>
                <td class="ps-3 fw-medium">${req.type}</td>
                <td>${req.startDate} ถึง ${req.endDate}</td>
                <td class="text-center fw-bold text-primary">${req.days} วัน</td>
                <td class="text-center"><span class="badge ${badgeClass}">${req.status}</span></td>
            </tr>
        `;
    });
}

function renderAdminDashboard() {
    renderAllEmployeesSummary();
    renderAdminTable();
}

function renderAllEmployeesSummary() {
    const tbody = document.getElementById('allEmployeesSummaryTable');
    tbody.innerHTML = '';
    employees.forEach((emp, idx) => {
        tbody.innerHTML += `
            <tr>
                <td class="ps-3 fw-semibold">${emp.id} - ${emp.name}</td>
                <td><small class="text-muted">${emp.position} (${emp.dept})</small></td>
                <td class="text-center fw-bold text-primary">${emp.sickRemain} วัน</td>
                <td class="text-center fw-bold text-success">${emp.personalRemain} วัน</td>
                <td class="text-center fw-bold text-info">${emp.vacationRemain} วัน</td>
            </tr>
        `;
    });
    renderQuotaManageTable();
}

function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    if (leaveRequests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">ยังไม่มีรายการคำขอลางานในระบบ</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    leaveRequests.forEach((req, idx) => {
        let badgeClass = req.status === 'อนุมัติแล้ว' ? 'bg-success' : (req.status === 'ไม่อนุมัติ' ? 'bg-danger' : 'bg-warning text-dark');
        tbody.innerHTML += `
            <tr>
                <td class="ps-3 text-muted small">${req.dateSubmitted}</td>
                <td class="fw-semibold">${req.empName}</td>
                <td>${req.type}</td>
                <td>${req.startDate} ถึง ${req.endDate}</td>
                <td class="text-center">${req.days} วัน</td>
                <td class="text-center"><span class="badge ${badgeClass}">${req.status}</span></td>
                <td class="text-center pe-3">
                    <button class="btn btn-sm btn-outline-primary px-3" onclick="openDetailModal(${idx})">ตรวจสอบ</button>
                </td>
            </tr>
        `;
    });
}

let activeReqIndex = null;
function openDetailModal(idx) {
    activeReqIndex = idx;
    let req = leaveRequests[idx];
    let emp = employees[req.empIndex];

    document.getElementById('modalEmpAvatar').innerText = emp.avatar;
    document.getElementById('modalEmpName').innerText = emp.name;
    document.getElementById('modalEmpId').innerText = emp.id;
    document.getElementById('modalEmpPos').innerText = emp.position;
    document.getElementById('modalEmpDept').innerText = emp.dept;

    document.getElementById('modalLeaveType').innerText = req.type;
    document.getElementById('modalLeaveDays').innerText = req.days + ' วัน';
    document.getElementById('modalLeavePeriod').innerText = `${req.startDate} ถึง ${req.endDate}`;
    document.getElementById('modalLeaveReason').innerText = req.reason;

    document.getElementById('modalEmpSickRemain').innerText = emp.sickRemain;
    document.getElementById('modalEmpPersonalRemain').innerText = emp.personalRemain;
    document.getElementById('modalEmpVacationRemain').innerText = emp.vacationRemain;

    const modal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
    modal.show();
}

document.getElementById('btnApprove').addEventListener('click', () => {
    if (activeReqIndex === null) return;
    let req = leaveRequests[activeReqIndex];
    if (req.status !== 'รออนุมัติ') {
        alert('รายการนี้ถูกดำเนินการไปแล้ว');
        return;
    }

    let emp = employees[req.empIndex];
    let remainKey = req.type === 'ลาป่วย' ? 'sickRemain' : (req.type === 'ลากิจ' ? 'personalRemain' : 'vacationRemain');

    if (emp[remainKey] < req.days) {
        alert('วันลาคงเหลือของพนักงานไม่เพียงพอสำหรับการอนุมัติ');
        return;
    }

    emp[remainKey] -= req.days;
    req.status = 'อนุมัติแล้ว';
    saveStorage();

    bootstrap.Modal.getInstance(document.getElementById('viewDetailModal')).hide();
    renderAdminDashboard();
    alert('อนุมัติคำขอเรียบร้อยแล้ว');
});

document.getElementById('btnReject').addEventListener('click', () => {
    if (activeReqIndex === null) return;
    let req = leaveRequests[activeReqIndex];
    req.status = 'ไม่อนุมัติ';
    saveStorage();

    bootstrap.Modal.getInstance(document.getElementById('viewDetailModal')).hide();
    renderAdminDashboard();
    alert('บันทึกสถานะไม่อนุมัติเรียบร้อย');
});

function renderQuotaManageTable() {
    const tbody = document.getElementById('quotaManageTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    employees.forEach((emp, index) => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-semibold">${emp.name} <br><small class="text-muted">${emp.position}</small></td>
                <td><input type="number" class="form-control form-control-sm text-center" id="editSick_${index}" value="${emp.sickRemain}"></td>
                <td><input type="number" class="form-control form-control-sm text-center" id="editPersonal_${index}" value="${emp.personalRemain}"></td>
                <td><input type="number" class="form-control form-control-sm text-center" id="editVacation_${index}" value="${emp.vacationRemain}"></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-success px-3" onclick="saveQuota(${index})">บันทึก</button>
                </td>
            </tr>
        `;
    });
}

function saveQuota(index) {
    let newSick = parseInt(document.getElementById(`editSick_${index}`).value);
    let newPersonal = parseInt(document.getElementById(`editPersonal_${index}`).value);
    let newVacation = parseInt(document.getElementById(`editVacation_${index}`).value);

    employees[index].sickRemain = isNaN(newSick) ? 0 : newSick;
    employees[index].personalRemain = isNaN(newPersonal) ? 0 : newPersonal;
    employees[index].vacationRemain = isNaN(newVacation) ? 0 : newVacation;

    saveStorage();
    alert(`อัปเดตโควต้าของ ${employees[index].name} เรียบร้อยแล้ว`);
    renderAdminDashboard();
    updateUI();
}

function saveStorage() {
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
}
