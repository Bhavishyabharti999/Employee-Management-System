const API = "http://localhost:5000/api"; // change if your backend runs elsewhere
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");
if (!token || !user) location.href = "login.html";

const $ = (s) => document.querySelector(s);
const main = $("#main");
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const thisMonth = () => new Date().toISOString().slice(0, 7);

function logout() { localStorage.clear(); location.href = "login.html"; }

function toast(msg, bad) {
  const t = $("#toast");
  t.textContent = msg; t.className = "show" + (bad ? " bad" : "");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => (t.className = ""), 2600);
}

// One function for every call to the backend
async function api(path, method = "GET", body) {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { logout(); throw new Error(data.message); }
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

// Small helpers for building pages
const tr = (...cells) => "<tr>" + cells.map((c) => `<td>${c}</td>`).join("") + "</tr>";
const table = (heads, rows) =>
  `<div class="table-wrap"><table><thead><tr>${heads.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
  (rows.length ? rows.join("") : `<tr><td colspan="${heads.length}" class="empty">Nothing here yet.</td></tr>`) + "</tbody></table></div>";

function onSubmit(sel, fn) {
  $(sel).addEventListener("submit", async (e) => {
    e.preventDefault();
    try { await fn(Object.fromEntries(new FormData(e.target))); } catch (err) { toast(err.message, true); }
  });
}
function onClick(sel, fn) {
  main.querySelectorAll(sel).forEach((el) => (el.onclick = async () => {
    try { await fn(el); } catch (err) { toast(err.message, true); }
  }));
}

// ---------- Pages ----------
const views = {};

views.dashboard = async () => {
  const d = await api("/reports/dashboard");
  main.innerHTML = `<h1>Dashboard</h1><div class="cards">
    <div><b>${d.activeEmployees}</b>Active employees</div>
    <div><b>${d.presentToday}</b>Checked in today</div>
    <div><b>${d.pendingLeaves}</b>Pending leave requests</div></div>`;
};

// Admin
views.departments = async () => {
  const rows = await api("/admin/departments");
  main.innerHTML = `<h1>Departments</h1>
    <form id="f" class="inline"><input name="name" placeholder="Department name" required><button>Add department</button></form>
    ${table(["Name", "Employees"], rows.map((r) => tr(esc(r.name), r.staff)))}`;
  onSubmit("#f", async (d) => { await api("/admin/departments", "POST", d); toast("Department added."); views.departments(); });
};

views.users = async () => {
  const rows = await api("/admin/users");
  main.innerHTML = `<h1>System users</h1>
    <form id="f" class="inline"><input name="username" placeholder="Username" required>
      <input name="password" type="password" placeholder="Password" required>
      <select name="role"><option>HR Manager</option><option>Admin</option></select><button>Create user</button></form>
    <p class="note">Employee logins are created automatically when HR adds an employee (password welcome123).</p>
    ${table(["Username", "Role", "Status", ""], rows.map((r) => tr(esc(r.username), esc(r.role), r.active ? "Active" : "Disabled",
      `<button class="grey" data-toggle="${r.id}">${r.active ? "Disable" : "Enable"}</button>`)))}`;
  onSubmit("#f", async (d) => { await api("/admin/users", "POST", d); toast("User created."); views.users(); });
  onClick("[data-toggle]", async (b) => { await api(`/admin/users/${b.dataset.toggle}/toggle`, "PUT"); views.users(); });
};

// HR Manager
views.employees = async () => {
  const [rows, depts] = await Promise.all([api("/employees"), api("/admin/departments")]);
  main.innerHTML = `<h1>Employees</h1>
    <form id="f" class="panel grid"><input type="hidden" name="id">
      <label>Full name<input name="name" required></label>
      <label>Email<input name="email" type="email" required></label>
      <label>Phone<input name="phone" pattern="\\d{10}" title="10 digits"></label>
      <label>Department<select name="department_id"><option value="">None</option>
        ${depts.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join("")}</select></label>
      <label>Designation<input name="designation"></label>
      <label>Basic salary<input name="basic_salary" type="number" min="0" step="0.01" required></label>
      <label>Joining date<input name="join_date" type="date" required></label>
      <label>Status<select name="status"><option>Active</option><option>Inactive</option></select></label>
      <div class="full"><button>Save employee</button> <button type="button" class="grey" id="clear">Clear form</button></div></form>
    ${table(["ID", "Name", "Department", "Designation", "Basic salary", "Status", ""], rows.map((r) => tr(r.id,
      `${esc(r.name)}<br><small>${esc(r.email)}</small>`, esc(r.department || "-"), esc(r.designation || ""), r.basic_salary, r.status,
      `<button class="grey" data-edit="${r.id}">Edit</button> <button class="red" data-del="${r.id}">Delete</button>`)))}`;
  const form = $("#f");
  onSubmit("#f", async (d) => {
    d.id ? await api("/employees/" + d.id, "PUT", d) : await api("/employees", "POST", d);
    toast("Employee saved."); views.employees();
  });
  onClick("#clear", () => form.reset());
  onClick("[data-edit]", (b) => {
    const e = rows.find((r) => r.id == b.dataset.edit);
    Object.keys(e).forEach((k) => { if (form.elements[k]) form.elements[k].value = e[k] ?? ""; });
    form.scrollIntoView({ behavior: "smooth" });
  });
  onClick("[data-del]", async (b) => {
    if (!confirm("Delete this employee? Their attendance, leave and payroll are removed too.")) return;
    await api("/employees/" + b.dataset.del, "DELETE"); toast("Employee deleted."); views.employees();
  });
};

views.leaves = async () => {
  const rows = await api("/leaves");
  main.innerHTML = `<h1>Leave requests</h1>${table(["Employee", "Type", "From", "To", "Reason", "Status", ""],
    rows.map((r) => tr(esc(r.name), r.leave_type, r.from_date, r.to_date, esc(r.reason || ""), r.status,
      r.status === "Pending" ? `<button data-d="Approved" data-id="${r.id}">Approve</button> <button class="red" data-d="Rejected" data-id="${r.id}">Reject</button>` : "")))}`;
  onClick("[data-d]", async (b) => {
    await api("/leaves/" + b.dataset.id, "PUT", { status: b.dataset.d });
    toast("Leave " + b.dataset.d.toLowerCase() + "."); views.leaves();
  });
};

views.payroll = async (month = thisMonth()) => {
  const rows = await api("/payroll?month=" + month);
  main.innerHTML = `<h1>Payroll</h1>
    <div class="inline"><input type="month" id="m" value="${month}"><button id="gen">Generate payroll</button></div>
    <p class="note">Net pay = basic + 20% allowance - 12% PF - basic/30 for each absent day (26 working days a month).</p>
    ${table(["Employee", "Basic", "Allowances", "Deductions", "Net pay"],
      rows.map((r) => tr(esc(r.name), r.basic, r.allowances, r.deductions, `<b>${r.net}</b>`)))}`;
  $("#m").onchange = () => views.payroll($("#m").value);
  onClick("#gen", async () => {
    const r = await api("/payroll/generate", "POST", { month: $("#m").value });
    toast(r.message); views.payroll($("#m").value);
  });
};

// Admin + HR
views.reports = async (month = thisMonth()) => {
  const r = await api("/reports/summary?month=" + month);
  main.innerHTML = `<h1>Reports</h1><input type="month" id="m" value="${month}">
    <h2>Attendance in ${esc(r.month)}</h2>${table(["Employee", "Days present"], r.attendance.map((a) => tr(esc(a.name), a.days_present)))}
    <h2>Departments</h2>${table(["Department", "Employees", "Total basic salary"], r.departments.map((d) => tr(esc(d.name), d.staff, d.total_basic)))}
    <h2>Leave requests</h2>${table(["Status", "Count"], r.leaves.map((l) => tr(l.status, l.total)))}
    <h2>Payroll paid for ${esc(r.month)}</h2><p><b>${r.payrollTotal}</b></p>
    <button class="grey" onclick="window.print()">Print report</button>`;
  $("#m").onchange = () => views.reports($("#m").value);
};

// Employee
views.profile = async () => {
  const e = await api("/employees/me");
  main.innerHTML = `<h1>My profile</h1>
    ${table(["Field", "Value"], [["Name", e.name], ["Email", e.email], ["Department", e.department || "-"],
      ["Designation", e.designation || "-"], ["Joined", e.join_date]].map(([k, v]) => tr(k, esc(v))))}
    <h2>Update contact details</h2>
    <form id="f" class="panel"><label>Phone<input name="phone" value="${esc(e.phone)}" pattern="\\d{10}" title="10 digits"></label>
      <label>Address<textarea name="address">${esc(e.address)}</textarea></label><button>Save changes</button></form>
    <h2>Change password</h2>
    <form id="p" class="panel"><label>Old password<input name="oldPassword" type="password" required></label>
      <label>New password<input name="newPassword" type="password" minlength="6" required></label><button>Change password</button></form>`;
  onSubmit("#f", async (d) => { await api("/employees/me", "PUT", d); toast("Profile updated."); });
  onSubmit("#p", async (d) => { await api("/auth/password", "PUT", d); toast("Password changed."); $("#p").reset(); });
};

views.attendance = async () => {
  const rows = await api("/attendance/me");
  main.innerHTML = `<h1>Attendance</h1>
    <div class="inline"><button id="in">Check in</button><button id="out" class="grey">Check out</button></div>
    ${table(["Date", "Check in", "Check out"], rows.map((r) => tr(r.work_date, r.check_in || "-", r.check_out || "-")))}`;
  onClick("#in", async () => { toast((await api("/attendance/check-in", "POST")).message); views.attendance(); });
  onClick("#out", async () => { toast((await api("/attendance/check-out", "POST")).message); views.attendance(); });
};

views.leave = async () => {
  const rows = await api("/leaves/me");
  main.innerHTML = `<h1>Apply for leave</h1>
    <form id="f" class="panel"><label>Type<select name="leave_type"><option>Casual</option><option>Sick</option><option>Earned</option></select></label>
      <label>From<input name="from_date" type="date" required></label><label>To<input name="to_date" type="date" required></label>
      <label>Reason<input name="reason" required></label><button>Send request</button></form>
    <h2>My requests</h2>${table(["Type", "From", "To", "Reason", "Status"],
      rows.map((r) => tr(r.leave_type, r.from_date, r.to_date, esc(r.reason || ""), r.status)))}`;
  onSubmit("#f", async (d) => { toast((await api("/leaves", "POST", d)).message); views.leave(); });
};

views.payslips = async () => {
  const rows = await api("/payroll/me");
  main.innerHTML = `<h1>My payslips</h1>${table(["Month", "Basic", "Allowances", "Deductions", "Net pay"],
    rows.map((r) => tr(r.month, r.basic, r.allowances, r.deductions, `<b>${r.net}</b>`)))}
    <p><button class="grey" onclick="window.print()">Print</button></p>`;
};

// ---------- Menu by role ----------
const MENUS = {
  "Admin": [["dashboard", "Dashboard"], ["departments", "Departments"], ["users", "Users"], ["reports", "Reports"]],
  "HR Manager": [["dashboard", "Dashboard"], ["employees", "Employees"], ["leaves", "Leave requests"], ["payroll", "Payroll"], ["reports", "Reports"]],
  "Employee": [["profile", "My profile"], ["attendance", "Attendance"], ["leave", "Leave"], ["payslips", "Payslips"]],
};

function show(name) {
  document.querySelectorAll("#menu a").forEach((a) => a.classList.toggle("active", a.dataset.view === name));
  main.innerHTML = '<p class="note">Loading...</p>';
  views[name]().catch((e) => (main.innerHTML = `<p class="error">${esc(e.message)}</p>`));
}

const menu = MENUS[user.role] || [];
$("#menu").innerHTML = menu.map(([k, label]) => `<a href="#" data-view="${k}">${label}</a>`).join("");
$("#menu").onclick = (e) => { const a = e.target.closest("a"); if (a) { e.preventDefault(); show(a.dataset.view); } };
$("#who").textContent = `${user.username} (${user.role})`;
$("#logout").onclick = logout;
if (menu.length) show(menu[0][0]);
