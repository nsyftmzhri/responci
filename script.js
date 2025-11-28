const STORAGE_KEY = 'students_dashboard_v1';

const sampleData = [
  { id: generateId(), nama: 'Ayu Putri', nim: '2019001', prodi: 'TI', angkatan: 2019 },
  { id: generateId(), nama: 'Budi Santoso', nim: '2020005', prodi: 'SI', angkatan: 2020 },
];

function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
    return [...sampleData];
  }
  try { return JSON.parse(raw) || []; } catch(e){ return []; }
}

function saveData(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function generateId(){

  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

const tableBody = document.getElementById('tableBody');
const totalCount = document.getElementById('totalCount');
const searchInput = document.getElementById('searchInput');

const addForm = document.getElementById('addForm');
const addNama = document.getElementById('addNama');
const addNim = document.getElementById('addNim');
const addProdi = document.getElementById('addProdi');
const addAngkatan = document.getElementById('addAngkatan');

const editForm = document.getElementById('editForm');
const editId = document.getElementById('editId');
const editNama = document.getElementById('editNama');
const editNim = document.getElementById('editNim');
const editProdi = document.getElementById('editProdi');
const editAngkatan = document.getElementById('editAngkatan');

const deleteInfo = document.getElementById('deleteInfo');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const addModalEl = document.getElementById('addModal');
const editModalEl = document.getElementById('editModal');
const deleteModalEl = document.getElementById('deleteModal');

const addModal = bootstrap.Modal.getOrCreateInstance(addModalEl);
const editModal = bootstrap.Modal.getOrCreateInstance(editModalEl);
const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);

let students = loadData();
let toDeleteId = null;

function renderTable(filter = '') {

  tableBody.innerHTML = '';

  
  const q = filter.trim().toLowerCase();
  const filtered = students.filter(s => {
    if(!q) return true;
    return (s.nama || '').toLowerCase().includes(q)
      || (s.nim || '').toLowerCase().includes(q)
      || (s.prodi || '').toLowerCase().includes(q);
  });

  filtered.forEach((s, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(s.nama)}</td>
      <td>${escapeHtml(s.nim)}</td>
      <td>${escapeHtml(s.prodi)}</td>
      <td>${escapeHtml(String(s.angkatan || ''))}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${s.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${s.id}">Hapus</button>
      </td>
    `;


    tableBody.appendChild(tr);
  });

  totalCount.textContent = students.length;
}

function escapeHtml(unsafe){
  return String(unsafe)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

addForm.addEventListener('submit', function(e){
  e.preventDefault();
  const nama = addNama.value.trim();
  const nim = addNim.value.trim();
  const prodi = addProdi.value.trim();
  const angkatan = Number(addAngkatan.value) || '';

  if(!nama || !nim){
    alert('Nama dan NIM harus diisi.');
    return;
  }

  const newItem = { id: generateId(), nama, nim, prodi, angkatan };
  students.unshift(newItem);
  saveData(students);
  renderTable(searchInput.value);

  addForm.reset();
  addModal.hide(); 
});

tableBody.addEventListener('click', function(e){
  const btn = e.target.closest('button');
  if(!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if(action === 'edit') {
    openEditModal(id);
  } else if(action === 'delete') {
    openDeleteModal(id);
  }
});

function openEditModal(id) {
  const item = students.find(s => s.id === id);
  if(!item) return;
  editId.value = item.id;
  editNama.value = item.nama;
  editNim.value = item.nim;
  editProdi.value = item.prodi;
  editAngkatan.value = item.angkatan;
  editModal.show();
}

editForm.addEventListener('submit', function(e){
  e.preventDefault();
  const id = editId.value;
  const idx = students.findIndex(s => s.id === id);
  if(idx === -1) return;

  students[idx].nama = editNama.value.trim();
  students[idx].nim = editNim.value.trim();
  students[idx].prodi = editProdi.value.trim();
  students[idx].angkatan = Number(editAngkatan.value) || '';

  saveData(students);
  renderTable(searchInput.value);
  editModal.hide();
});

/* --------- Delete flow --------- */
function openDeleteModal(id) {
  const item = students.find(s => s.id === id);
  if(!item) return;
  toDeleteId = id;
  deleteInfo.textContent = `${item.nama} — ${item.nim}`;
  deleteModal.show();
}

confirmDeleteBtn.addEventListener('click', function(){
  if(!toDeleteId) return;
  students = students.filter(s => s.id !== toDeleteId);
  saveData(students);
  renderTable(searchInput.value);
  toDeleteId = null;
  deleteModal.hide();
});

searchInput.addEventListener('input', function(e){
  renderTable(e.target.value);
});

$(document).ready(function(){
  const $sidebar = $('#sidebar');

  if($(window).width() < 768) $sidebar.addClass('collapsed');

  $('#btn-toggle-sidebar').on('click', function(){
    $sidebar.toggleClass('collapsed'); 
  });

  $(document).on('click touchstart', function(e){
    if($(window).width() < 768){
      if(!$(e.target).closest('#sidebar, #btn-toggle-sidebar').length){
        $sidebar.addClass('collapsed');
      }
    }
  });

  $(window).on('resize', function(){
    if($(this).width() >= 768){
      $sidebar.removeClass('collapsed');
    }
  });
});

renderTable();

function refreshCountStyle(){
  const cnt = students.length;
  if(cnt === 0){
    totalCount.style.color = 'red';
  } else {
    totalCount.style.color = '';
  }
}
refreshCountStyle();

const originalRender = renderTable;
renderTable = function(filter){ originalRender(filter); refreshCountStyle(); };

