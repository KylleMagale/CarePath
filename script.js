
/* ==========================================================
   DUMMY USER DATABASE
========================================================== */

const users = [

    {
        role: "patient",
        // id: "2024-00123",
        id: "kylle",
        email: "juan@gmail.com",
        password: "123",
        name: "Juan Dela Cruz"
    },

    {
        role: "doctor",
        id: "D-024-00123",
        password: "1234",
        name: "Dr. Maria Santos"
    },

    {
        role: "admin",
        id: "A-024-00123",
        password: "12345",
        name: "Laurence Manacap"
    }

];

let currentUser = null;

// ── STATE ──


var curStep = 1;

var selDept = "";

var selDoc = "";

var selTime = "";

var selRoom = "";

var notifCount=3;

const DEMO_TODAY = '2025-06-19';
const MAX_APPOINTMENTS_PER_DAY = 2;
const doctorRooms = {
  'Dr. Maria Santos': 'Room 3',
  'Dr. Ramon Reyes': 'Room 7',
  'Dr. Ana Cruz': 'Room 12',
  'Dr. Jose Lim': 'Room 5'
};
let upcomingAppointments = [
  { department: 'General Consultation', doctor: 'Dr. Maria Santos', date: '2025-06-21', time: '9:00 AM', room: 'Room 3', reason: 'Routine checkup', status: 'Confirmed' },
  { department: 'Ophthalmology', doctor: 'Dr. Ramon Reyes', date: '2025-06-27', time: '2:00 PM', room: 'Room 7', reason: 'Vision follow-up', status: 'Pending' },
  { department: 'Cardiology', doctor: 'Dr. Ana Cruz', date: '2025-07-03', time: '10:00 AM', room: 'Room 12', reason: 'Cardiac review', status: 'Scheduled' }
];

// ── PAGE NAVIGATION ──
function go(p){
  document.querySelectorAll('.pg').forEach(e=>{e.classList.remove('on');});
  document.querySelectorAll('.tb-nav button').forEach(b=>b.classList.remove('on'));
  var el=document.getElementById('pg-'+p);
  if(el) el.classList.add('on');
  var nb=document.getElementById('nb-'+p);
  if(nb) nb.classList.add('on');
  closeNotif();
  if(p === 'sc') resetScheduleWizard();
  if(p === 'db') renderUpcomingAppointments();
  // show topbar only when not on login
  document.querySelector('.topbar').style.display = p==='lg'?'none':'flex';
}

// ── LOGIN ──
function doLogin(){

    const username =
        document.getElementById("lg-email").value.trim();

    const password =
        document.getElementById("lg-pw").value.trim();

    if(username==="" || password===""){

        showToast(
            "warning",
            "Missing Information",
            "Please enter your ID/email and password."
        );

        return;
    }

    let foundUser = null;

    for(let user of users){

        if(
            user.id === username ||
            user.email === username
        ){

            foundUser = user;
            break;

        }

    }

    if(foundUser===null){

        showToast(
            "warning",
            "Account Not Found",
            "Invalid ID or Email."
        );

        return;
    }

    if(foundUser.password!==password){

        showToast(
            "warning",
            "Incorrect Password",
            "Please try again."
        );

        return;
    }

    currentUser = foundUser;

    updateLoggedInUser();

    showToast(
        "success",
        "Welcome!",
        "Hello, " + currentUser.name
    );

    setTimeout(function(){

        switch(currentUser.role){

            case "patient":
                go("db");
                break;

            case "doctor":
                go("doctor");
                break;

            case "admin":
                go("admin");
                break;

        }

    },800);
    
}

function updateLoggedInUser(){

    document.getElementById("user-name").textContent =
        currentUser.name;
}

function doRegister() {

    // Registration successful
    showToast(
        "success",
        "Registration Successful",
        "Your account has been created successfully."
    );

    setTimeout(function(){

        switchTab("login");

    },800);
}

/* ==========================================================
   SWITCH LOGIN / REGISTER TAB
========================================================== */

function switchTab(tab){

    // Highlight the selected tab
    document.querySelectorAll(".tab").forEach(function(element){

        element.classList.remove("on");

    });

    if(tab === "login"){

        document.querySelectorAll(".tab")[0].classList.add("on");

        document.getElementById("login-form").style.display = "block";

        document.getElementById("register-form").style.display = "none";

    }

    else{

        document.querySelectorAll(".tab")[1].classList.add("on");

        document.getElementById("login-form").style.display = "none";

        document.getElementById("register-form").style.display = "block";

    }

}

function togglePw(id, btn){
  const input = document.getElementById(id);
  if(!input) return;
  const icon = btn.querySelector('i');
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  if(icon){
    icon.classList.toggle('fa-eye', !isPassword);
    icon.classList.toggle('fa-eye-slash', isPassword);
  }
}

// ── SCHEDULE STEPS ──
function nextStep(n){
  document.querySelectorAll('.step-panel').forEach(p=>p.classList.remove('on'));
  document.getElementById('panel-'+n).classList.add('on');
  curStep=n;
  updateStepBar();
  if(n===4){
    updateAppointmentPreview();
  }
}
function updateStepBar(){
  for(var i=1;i<=4;i++){
    var s=document.getElementById('s'+i);
    s.classList.remove('dn','ac');
    if(i<curStep) s.classList.add('dn');
    else if(i===curStep) s.classList.add('ac');
    if(i<4){var l=document.getElementById('sl'+i);l.classList.toggle('dn',i<curStep);}
  }
}

function updateNextButtons(){

    const btn1 = document.getElementById("next-step1");
    const btn2 = document.getElementById("next-step2");
    const btn3 = document.getElementById("next-step3");

    if(btn1)
        btn1.disabled = (selDept === "");

    if(btn2)
        btn2.disabled = (selDoc === "");

    const date = document.getElementById("appt-date")?.value || "";
    const validation = validateAppointmentSelection();

    if(btn3)
        btn3.disabled = !(selDept && selDoc && date && selTime && validation.valid);

}

function getDemoToday(){
  return new Date(DEMO_TODAY + 'T00:00:00');
}

function parseAppointmentDate(dateValue){
  return new Date(dateValue + 'T00:00:00');
}

function isPastAppointmentDate(dateValue){
  if(!dateValue) return true;
  return parseAppointmentDate(dateValue) < getDemoToday();
}

function getAppointmentCountForDate(dateValue){
  return upcomingAppointments.filter(app => app.date === dateValue).length;
}

function findDuplicateAppointment(appointment){
  return upcomingAppointments.find(app =>
    app.patient === appointment.patient &&
    app.doctor === appointment.doctor &&
    app.department === appointment.department &&
    app.date === appointment.date &&
    app.time === appointment.time &&
    app.reason === appointment.reason
  );
}

function buildAppointmentPayload(){
  const date = document.getElementById('appt-date')?.value || '';
  return {
    patient: 'Juan Dela Cruz',
    department: selDept,
    doctor: selDoc,
    date: date,
    time: selTime,
    room: selRoom || doctorRooms[selDoc] || 'TBD',
    reason: 'General consultation',
    status: 'Confirmed'
  };
}

function validateAppointmentSelection(){
  const date = document.getElementById('appt-date')?.value || '';

  if(!selDept) return { valid: false, message: 'Please select a department first.' };
  if(!selDoc) return { valid: false, message: 'Please select a doctor first.' };
  if(!date) return { valid: false, message: 'Please choose a preferred date.' };
  if(isPastAppointmentDate(date)) return { valid: false, message: 'Past dates are not allowed in this demo system.' };
  if(!selTime) return { valid: false, message: 'Please select a time slot.' };
  if(getAppointmentCountForDate(date) >= MAX_APPOINTMENTS_PER_DAY){
    return { valid: false, message: 'Only 2 appointments are allowed per day for the same date.' };
  }
  if(findDuplicateAppointment(buildAppointmentPayload())){
    return { valid: false, message: 'This exact appointment already exists.' };
  }
  return { valid: true, message: '' };
}

function updateAppointmentPreview(){
  const date = document.getElementById('appt-date')?.value || '';
  const room = selRoom || doctorRooms[selDoc] || 'TBD';
  const previewDate = date ? formatDate(date) : 'your selected date';
  const previewTime = selTime || 'your selected time';
  const previewDoctor = selDoc || 'your doctor';

  document.getElementById('cf-dept').textContent = selDept || '—';
  document.getElementById('cf-doc').textContent = selDoc || '—';
  document.getElementById('cf-time').textContent = selTime || '—';
  document.getElementById('cf-room').textContent = room;
  document.getElementById('cf-date').textContent = date ? formatDate(date) : '—';
  document.getElementById('sum-dept').textContent = selDept || '—';
  document.getElementById('sum-doc').textContent = selDoc || '—';
  document.getElementById('sum-date').textContent = date ? formatDate(date) : '—';
  document.getElementById('sum-time').textContent = selTime || '—';

  document.getElementById('sms-preview-text').textContent = 'Your appointment on ' + previewDate + ' at ' + previewTime + ' with ' + previewDoctor + ' is confirmed. — CarePath PHPMS';
}

function renderUpcomingAppointments(){
  const listEl = document.getElementById('dashboard-upcoming-list');
  const countEl = document.getElementById('upcoming-count');
  const nextEl = document.getElementById('next-appointment-label');
  if(!listEl) return;

  const sorted = [...upcomingAppointments].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  listEl.innerHTML = '';

  if(sorted.length === 0){
    listEl.innerHTML = '<div class="row"><div class="ri"><div class="rn">No upcoming appointments</div><div class="rd">Book your next visit to see it here.</div></div></div>';
  }else{
    sorted.forEach(item => {
      const iconMap = {
        'General Consultation': 'fa-stethoscope',
        'Ophthalmology': 'fa-eye',
        'Cardiology': 'fa-heart-pulse',
        'Neurology': 'fa-brain',
        'Orthopedics': 'fa-bone',
        'Pediatrics': 'fa-baby',
        'Immunization': 'fa-syringe',
        'Pulmonology': 'fa-lungs'
      };
      const badgeClass = item.status === 'Confirmed' ? 'bg' : (item.status === 'Pending' ? 'ba' : 'bs');
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = '<div class="ico"><i class="fa-solid ' + (iconMap[item.department] || 'fa-calendar') + '"></i></div><div class="ri"><div class="rn">' + item.department + '</div><div class="rd">' + formatDate(item.date) + ' · ' + item.time + ' · ' + item.doctor + ' · ' + item.room + '</div></div><span class="bdg ' + badgeClass + '">' + item.status + '</span>';
      listEl.appendChild(row);
    });
  }

  if(countEl) countEl.textContent = sorted.length;
  if(nextEl){
    const nextAppointment = sorted[0];
    nextEl.textContent = nextAppointment ? 'Next: ' + formatDate(nextAppointment.date) : 'Next: none';
  }
}

function resetScheduleWizard(){
  curStep = 1;
  selDept = "";
  selDoc = "";
  selTime = "";
  selRoom = "";

  document.querySelectorAll('.step-panel').forEach(panel => panel.classList.remove('on'));
  const panel1 = document.getElementById('panel-1');
  if(panel1) panel1.classList.add('on');

  document.querySelectorAll('.dc').forEach(card => card.classList.remove('sel'));
  document.querySelectorAll('.doc-card').forEach(card => card.classList.remove('sel'));
  document.querySelectorAll('.slot:not(.tk)').forEach(slot => slot.classList.remove('sel'));

  const dateInput = document.getElementById('appt-date');
  if(dateInput) dateInput.value = '';
  const docInput = document.getElementById('appt-doc');
  if(docInput) docInput.value = '';
  const reasonInput = document.getElementById('appt-reason');
  if(reasonInput) reasonInput.value = '';

  ['sum-dept','sum-doc','sum-date','sum-time','sum-reason','cf-dept','cf-doc','cf-date','cf-time','cf-room','cf-reason'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.textContent = '—';
  });
  const smsPreview = document.getElementById('sms-preview-text');
  if(smsPreview) smsPreview.textContent = 'Waiting for appointment details...';

  updateStepBar();
  updateNextButtons();
}

function selectDept(el,name){
  document.querySelectorAll('#dept-grid .dc').forEach(function(card){
    card.classList.remove('sel');
  });

  el.classList.add('sel');
  selDept = name;
  selDoc = '';
  selTime = '';
  selRoom = '';

  document.getElementById('sum-dept').textContent = name;
  document.getElementById('sum-doc').textContent = '—';
  document.getElementById('sum-time').textContent = '—';
  document.getElementById('appt-doc').value = '';

  document.querySelectorAll('.slot:not(.tk)').forEach(slot => slot.classList.remove('sel'));

  filterDoctors();
  updateNextButtons();
}

function selectDoc(el,name){
  document.querySelectorAll('.doc-card').forEach(function(card){
    card.classList.remove('sel');
  });

  el.classList.add('sel');
  selDoc = name;
  selRoom = el.getAttribute('data-room') || doctorRooms[name] || 'TBD';

  document.getElementById('sum-doc').textContent = name;
  document.getElementById('appt-doc').value = name;

  updateAppointmentPreview();
  updateNextButtons();
}

function filterDoctors(){
  document.querySelectorAll('.doc-card').forEach(function(card){
    card.style.display = (card.dataset.department === selDept) ? 'flex' : 'none';
  });
}

function selectSlot(el,time){
  document.querySelectorAll('.slot:not(.tk)').forEach(function(slot){
    slot.classList.remove('sel');
  });

  el.classList.add('sel');
  selTime = time;

  document.getElementById('sum-time').textContent = time;

  updateAppointmentPreview();
  updateNextButtons();
}

function updateSummary(){
  var d = document.getElementById('appt-date').value;

  if(d){
    document.getElementById('sum-date').textContent = formatDate(d);
  }

  updateAppointmentPreview();
  updateNextButtons();
}

function formatDate(d){
  var dt=new Date(d+'T00:00:00');
  return dt.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
}
function confirmAppt(){
  const validation = validateAppointmentSelection();
  if(!validation.valid){
    showToast('warning','Unable to confirm',validation.message);
    return;
  }

  const appointment = buildAppointmentPayload();
  upcomingAppointments.push(appointment);
  renderUpcomingAppointments();

  showToast('success','Appointment confirmed!','Your appointment has been booked. Check your SMS for confirmation.');
  setTimeout(()=>{
    showSMS('Your appointment on '+(document.getElementById('cf-date').textContent)+' at '+selTime+' with '+selDoc+' is confirmed. — CarePath PHPMS');
    addNotif('Appointment confirmed for '+selTime+' with '+selDoc+'.','g','fa-calendar-check');
    addDashboardNotification('Appointment confirmed for '+selTime+' with '+selDoc+'.','fa-calendar-check');
  },600);
  setTimeout(()=>go('db'),2200);
}

// ── NOTIFICATIONS ──
function toggleNotif(){
  document.getElementById('notif-dropdown').classList.toggle('open');
}
function closeNotif(){
  document.getElementById('notif-dropdown').classList.remove('open');
}
function clearNotifs(){
  document.querySelectorAll('.nd-unread').forEach(d=>d.remove());
  notifCount=0;
  document.getElementById('notif-badge').style.display='none';
  showToast('info','Notifications','All notifications marked as read.');
}
function addNotif(msg,iconClass,icon){
  notifCount++;
  document.getElementById('notif-badge').style.display='flex';
  document.getElementById('notif-badge').textContent=notifCount;
  var list=document.getElementById('notif-list');
  var item=document.createElement('div');
  item.className='nd-item';
  item.innerHTML='<div class="nd-icon '+iconClass+'"><i class="fa-solid '+icon+'" style="font-size:14px;"></i></div><div class="nd-body"><div class="nd-msg">'+msg+'</div><div class="nd-time">Just now</div></div><div class="nd-unread"></div>';
  list.insertBefore(item,list.firstChild);
}

function addDashboardNotification(msg,icon){
  const countEl = document.getElementById('dashboard-notif-count');
  const listEl = document.getElementById('dashboard-notif-list');
  if(!countEl || !listEl) return;
  const currentCount = parseInt(countEl.textContent,10) || 0;
  countEl.textContent = currentCount + 1;
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = '<div class="ico"><i class="fa-solid '+icon+'"></i></div><div class="ri"><div class="rn">Appointment update</div><div class="rd">'+msg+'</div></div><div style="font-size:11px;color:var(--gray-text);">Now</div>';
  listEl.insertBefore(row, listEl.firstChild);
}

// ── TOAST ──
function showToast(type,title,msg){
  var icons={success:'fa-circle-check',info:'fa-circle-info',warning:'fa-triangle-exclamation'};
  var c=document.getElementById('toast-container');
  var t=document.createElement('div');
  t.className='toast '+type;
  t.innerHTML='<i class="fa-solid '+icons[type]+' toast-icon"></i><div class="toast-body"><div class="toast-title">'+title+'</div><div class="toast-msg">'+msg+'</div></div><span class="toast-close" onclick="this.parentElement.remove()">✕</span>';
  c.appendChild(t);
  setTimeout(()=>{t.style.animation='slideOut .3s ease forwards';setTimeout(()=>t.remove(),300);},4000);
}

// ── SMS MODAL ──
function showSMS(text){
  document.getElementById('sms-text').textContent=text||'Your appointment has been confirmed. — CarePath PHPMS';
  document.getElementById('sms-time').textContent=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('sms-modal').classList.add('open');
}
function closeModal(){
  document.getElementById('sms-modal').classList.remove('open');
}

// ── TOGGLES ──
function toggleNtf(el){
  el.classList.toggle('off');
  var on=!el.classList.contains('off');
  showToast(on?'success':'info',on?'Notifications enabled':'Notifications disabled',on?'You will now receive this type of notification.':'This notification type has been turned off.');
}
function toggleSMS(){
  var t=document.getElementById('sms-tog');
  var s=document.getElementById('sms-status');
  t.classList.toggle('off');
  var on=!t.classList.contains('off');
  s.textContent=on?'Enabled':'Disabled';
  s.style.color=on?'var(--teal)':'var(--gray-text)';
  showToast(on?'success':'info','SMS alerts '+(on?'enabled':'disabled'),on?'You will receive SMS updates for your queue.':'SMS queue alerts have been turned off.');
}

// ── RECORDS SEARCH ──
function filterRecords(q){
  const searchText = typeof q === 'string' ? q : (document.getElementById('records-search')?.value || '');
  const selectedDate = document.getElementById('records-date')?.value || '';
  const selectedCategory = document.getElementById('records-category')?.value || 'all';
  const rows = document.querySelectorAll('.record-row');

  rows.forEach(row => {
    const rowText = row.textContent.toLowerCase();
    const matchesSearch = rowText.includes(searchText.toLowerCase());
    const matchesDate = !selectedDate || (row.getAttribute('data-date') || '').includes(selectedDate);
    const matchesCategory = selectedCategory === 'all' || row.getAttribute('data-category') === selectedCategory;
    row.style.display = (matchesSearch && matchesDate && matchesCategory) ? '' : 'none';
  });
}

function showRecordModal(title,date,doctor,department,details){
  const body = document.getElementById('record-modal-body');
  const sub = document.getElementById('record-modal-sub');
  if(body){
    body.innerHTML = '<div style="display:grid;gap:10px;">' +
      '<div style="background:var(--gray-bg);padding:12px 14px;border-radius:10px;"><strong style="color:var(--dark);">Record:</strong> ' + title + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">' +
      '<div style="background:var(--gray-bg);padding:10px 12px;border-radius:10px;"><strong>Date</strong><br>' + date + '</div>' +
      '<div style="background:var(--gray-bg);padding:10px 12px;border-radius:10px;"><strong>Doctor</strong><br>' + doctor + '</div>' +
      '<div style="background:var(--gray-bg);padding:10px 12px;border-radius:10px;"><strong>Department</strong><br>' + department + '</div>' +
      '<div style="background:var(--gray-bg);padding:10px 12px;border-radius:10px;"><strong>Status</strong><br>Completed</div>' +
      '</div>' +
      '<div style="background:var(--gray-bg);padding:12px 14px;border-radius:10px;line-height:1.6;"><strong>Summary:</strong> ' + details + ' was reviewed during this visit and documented in the patient record.</div>' +
      '</div>';
  }
  if(sub) sub.textContent = 'Viewing ' + title;
  const modal = document.getElementById('record-modal');
  if(modal) modal.classList.add('open');
}

function closeRecordModal(){
  const modal = document.getElementById('record-modal');
  if(modal) modal.classList.remove('open');
}

function enableProfileEditing(){
  const editBtn = document.getElementById('edit-profile-btn');
  const inputs = document.querySelectorAll('.profile-input');
  const saveButtons = document.querySelectorAll('.profile-save-btn');
  if(editBtn) editBtn.disabled = true;
  inputs.forEach(input => input.disabled = false);
  saveButtons.forEach(btn => btn.disabled = false);
  showToast('info','Edit mode','Profile fields are now editable.');
}

function saveProfileChanges(){
  const firstName = document.getElementById('profile-first-name')?.value.trim() || 'Juan';
  const lastName = document.getElementById('profile-last-name')?.value.trim() || 'Dela Cruz';
  const email = document.getElementById('profile-email')?.value.trim() || 'juan.delacruz@email.com';
  const phone = document.getElementById('profile-phone')?.value.trim() || '+63 912 345 6789';
  const address = document.getElementById('profile-address')?.value.trim() || '123 Mabini St., Barangay San Antonio, Cebu City, 6000';
  const emergencyName = document.getElementById('profile-emergency-name')?.value.trim() || 'Maria Dela Cruz';
  const emergencyRelationship = document.getElementById('profile-emergency-relationship')?.value.trim() || 'Spouse';
  const emergencyPhone = document.getElementById('profile-emergency-phone')?.value.trim() || '+63 917 876 5432';
  const emergencyEmail = document.getElementById('profile-emergency-email')?.value.trim() || 'maria@email.com';

  const fullName = firstName + ' ' + lastName;
  const initials = (firstName[0] || 'J') + (lastName[0] || 'D');

  const nameEl = document.getElementById('profile-display-name');
  const userNameEl = document.getElementById('user-name');
  const avatarEl = document.getElementById('profile-avatar-initials');
  const dashboardNameEl = document.querySelector('#pg-db .ph');
  const dashboardPatientEl = document.querySelector('#pg-db .ps');

  if(nameEl) nameEl.textContent = fullName;
  if(userNameEl) userNameEl.textContent = fullName;
  if(avatarEl) avatarEl.innerHTML = initials + '<div class="av-edit" onclick="showToast(\'info\',\'Upload photo\',\'Click to upload a new profile photo.\')"><i class="fa-solid fa-camera"></i></div>';
  if(dashboardNameEl) dashboardNameEl.textContent = 'Good morning, ' + fullName + ' 👋';
  if(dashboardPatientEl) dashboardPatientEl.innerHTML = 'Patient ID: 2024-00123 &nbsp;·&nbsp; ' + address;

  document.querySelectorAll('.profile-input').forEach(input => input.disabled = true);
  document.querySelectorAll('.profile-save-btn').forEach(btn => btn.disabled = true);
  const editBtn = document.getElementById('edit-profile-btn');
  if(editBtn) editBtn.disabled = false;

  showToast('success','Changes saved','Your personal information has been updated.');
}

// ── INIT ──
document.addEventListener('click',function(e){
  if(!e.target.closest('.notif-btn')&&!e.target.closest('.notif-dropdown')) closeNotif();
});
go("lg");

updateStepBar();

switchTab("login");

updateNextButtons();

const dateInput =
    document.getElementById("appt-date");

if(dateInput){

    dateInput.min =
        new Date().toISOString().split("T")[0];

}
