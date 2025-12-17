// Smart Lab - Simple Multi-Page Script
// Works by checking what elements exist on the page.

const $ = (id) => document.getElementById(id);

function setWho() {
  const who = $("who");
  const email = sessionStorage.getItem("email");
  if (who) who.textContent = email ? `(${email})` : "";
}

function logoutSetup() {
  const btn = $("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
  });
}

function guardRole(requiredRole) {
  const role = sessionStorage.getItem("role");
  if (role !== requiredRole) window.location.href = "index.html";
}

function setupOthersToggle(chkId, inputId) {
  const chk = $(chkId);
  const txt = $(inputId);
  if (!chk || !txt) return;

  const update = () => {
    txt.disabled = !chk.checked;
    if (!chk.checked) txt.value = "";
  };

  chk.addEventListener("change", update);
  update();
}

function setupPurposeOthers(radioId, inputId) {
  const othersRadio = $(radioId);
  const txt = $(inputId);
  if (!othersRadio || !txt) return;

  const update = () => {
    txt.disabled = !othersRadio.checked;
    if (!othersRadio.checked) txt.value = "";
  };

  document.querySelectorAll('input[name="purpose"]').forEach(r => r.addEventListener("change", update));
  update();
}

function setupNewCancel(formId, onResetExtra) {
  const form = $(formId);
  if (!form) return;

  const newBtn = $("newRequestBtn");
  const cancelBtn = $("cancelBtn");

  const resetAll = () => {
    form.reset();
    onResetExtra?.();
    form.querySelector("input, select, textarea")?.focus();
  };

  if (newBtn) {
    newBtn.addEventListener("click", () => {
      if (confirm("Start a new request? Current entries will be cleared.")) resetAll();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (confirm("Cancel this request?")) resetAll();
    });
  }
}

/* =========================================================
   INDEX (LOGIN)
========================================================= */
(function loginPage() {
  const form = $("loginForm");
  if (!form) return;

  const accounts = [
    { role: "Student", email: "student@smartlab.com", password: "student123", page: "student.html" },
    { role: "Faculty", email: "faculty@smartlab.com", password: "faculty123", page: "faculty.html" },
    { role: "Admin",   email: "admin@smartlab.com",   password: "admin123",   page: "admin.html" }
  ];

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;
    const err = $("errorMsg");

    const user = accounts.find(a => a.email === email && a.password === password);

    if (!user) {
      if (err) err.style.display = "block";
      return;
    }

    if (err) err.style.display = "none";
    sessionStorage.setItem("role", user.role);
    sessionStorage.setItem("email", user.email);
    window.location.href = user.page;
  });
})();

/* =========================================================
   STUDENT
========================================================= */
(function studentPage() {
  const form = $("borrowForm");
  if (!form) return;

  guardRole("Student");
  setWho();
  logoutSetup();

  setupOthersToggle("partOthersChk", "partOthersTxt");
  setupPurposeOthers("purposeOthersRad", "purposeOthersTxt");

  setupNewCancel("borrowForm", () => {
    const partTxt = $("partOthersTxt");
    const purposeTxt = $("purposeOthersTxt");
    if (partTxt) partTxt.disabled = true;
    if (purposeTxt) purposeTxt.disabled = true;
  });
})();

/* =========================================================
   FACULTY
========================================================= */
(function facultyPage() {
  const form = $("facultyRequestForm");
  if (!form) return;

  guardRole("Faculty");
  setWho();
  logoutSetup();

  setupOthersToggle("partOthersChk", "partOthersTxt");
  setupPurposeOthers("purposeOthersRad", "purposeOthersTxt");

  // Schedule feature (simple, minimal)
  const schedulesByLab = {
    "Lab 1": [
      { date: "2025-12-20", time: "09:00 - 11:00", faculty: "Prof. Reyes", purpose: "Lecture" },
      { date: "2025-12-21", time: "13:00 - 15:00", faculty: "Prof. Dizon", purpose: "Exam" }
    ],
    "Lab 2": [
      { date: "2025-12-20", time: "10:00 - 12:00", faculty: "Prof. Santos", purpose: "Tutorial" }
    ],
    "Lab 3": [
      { date: "2025-12-22", time: "08:00 - 10:00", faculty: "Prof. Cruz", purpose: "Seminar" }
    ]
  };

  const labChk = $("labChk");
  const labWrap = $("labSelectWrap");
  const labSelect = $("labSelect");
  const viewBtn = $("viewScheduleBtn");

  const scheduleCard = $("scheduleCard");
  const scheduleTitle = $("scheduleTitle");
  const scheduleBody = $("scheduleBody");
  const hideBtn = $("hideScheduleBtn");

  function updateLabUI() {
    if (!labChk || !labWrap || !labSelect || !viewBtn) return;

    labWrap.style.display = labChk.checked ? "block" : "none";
    if (!labChk.checked) labSelect.value = "";
    viewBtn.disabled = !labChk.checked || !labSelect.value;
  }

  function renderSchedule(labName) {
    if (!scheduleBody) return;
    const rows = schedulesByLab[labName] || [];
    scheduleBody.innerHTML = rows.length
      ? rows.map(r => `
          <tr>
            <td>${r.date}</td>
            <td>${r.time}</td>
            <td>${r.faculty}</td>
            <td>${r.purpose}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="4">No schedules found for ${labName}.</td></tr>`;
  }

  if (labChk && labSelect) {
    labChk.addEventListener("change", updateLabUI);
    labSelect.addEventListener("change", updateLabUI);
    updateLabUI();
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      const labName = labSelect?.value;
      if (!labName) return;

      if (scheduleTitle) scheduleTitle.textContent = `${labName} Schedule`;
      renderSchedule(labName);

      if (scheduleCard) scheduleCard.classList.remove("hidden");
      scheduleCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (hideBtn && scheduleCard) {
    hideBtn.addEventListener("click", () => scheduleCard.classList.add("hidden"));
  }

  setupNewCancel("facultyRequestForm", () => {
    const partTxt = $("partOthersTxt");
    const purposeTxt = $("purposeOthersTxt");
    if (partTxt) partTxt.disabled = true;
    if (purposeTxt) purposeTxt.disabled = true;

    updateLabUI();
    scheduleCard?.classList.add("hidden");
  });

  // Optional submit mock (kept simple)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Request submitted (mock). Check console.");

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.particulars = fd.getAll("particulars");
    payload.particularsOthers = $("partOthersTxt")?.value.trim() || "";
    payload.purposeOthers = $("purposeOthersTxt")?.value.trim() || "";

    console.log("Faculty Request:", payload);
  });
})();

/* =========================================================
   ADMIN
========================================================= */
(function adminPage() {
  const shell = document.querySelector(".adminShell");
  if (!shell) return;

  guardRole("Admin");
  setWho();
  logoutSetup();

  const navItems = document.querySelectorAll(".navItem");
  const panels = {
    users: $("tab-users"),
    schedule: $("tab-schedule"),
    requests: $("tab-requests"),
    equipment: $("tab-equipment"),
    reports: $("tab-reports")
  };

  function showTab(tab) {
    Object.values(panels).forEach(p => p?.classList.add("hidden"));
    panels[tab]?.classList.remove("hidden");

    navItems.forEach(n => n.classList.toggle("active", n.dataset.tab === tab));
  }

  navItems.forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.tab)));
  showTab("users"); // default

  const hook = (id, msg) => $(id)?.addEventListener("click", () => alert(msg));
  hook("addAccountBtn", "Add Account (mock) - connect to DB later.");
  hook("addScheduleBtn", "Add Schedule (mock) - connect to DB later.");
  hook("addEquipmentBtn", "Add Equipment (mock) - connect to DB later.");

  $("printReportsBtn")?.addEventListener("click", () => window.print());

  document.addEventListener("click", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;

    const action = el.getAttribute("data-action");
    if (action) alert(`Action: ${action} (mock)`);
  });
})();
