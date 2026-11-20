const API = location.port === '5000' ? '/api' : 'http://localhost:5000/api';

async function api(path, method = 'GET', body) {
  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Tidak bisa terhubung ke server (localhost:5000). Pastikan backend sudah dijalankan.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan pada server.');
  return data;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
// Tanggal dari PostgreSQL -> "YYYY-MM-DD" (zona waktu lokal browser)
const ymd = d => { if (!d) return ''; const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
const today = () => ymd(new Date());
const fmtTgl = t => t ? new Date(ymd(t) + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// Backend tidak mengisi status "Terlambat" otomatis, jadi dihitung di sini
function statusPinjam(p) {
  if (p.status === 'Dipinjam' && p.tanggal_kembali && ymd(p.tanggal_kembali) < today()) return 'Terlambat';
  return p.status;
}


const warnaBtn = {
  biru:  'bg-blue-600 hover:bg-blue-700 border-blue-800',
  merah: 'bg-red-600 hover:bg-red-700 border-red-800',
  abu:   'bg-gray-500 hover:bg-gray-600 border-gray-700',
};
const btn = (warna = 'biru', kecil = false) =>
  `${warnaBtn[warna]} text-white border rounded-sm disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:border-gray-400 disabled:cursor-not-allowed ${kecil ? 'px-2 py-0.5 text-sm' : 'px-3 py-1.5'}`;
const TD = 'border border-gray-400 px-2 py-1.5';
const TH = 'border border-gray-400 bg-slate-200 px-2 py-1.5 text-left';

const badgeWarna = {
  Dipinjam:     'bg-blue-100 text-blue-800 border-blue-800',
  Terlambat:    'bg-red-100 text-red-800 border-red-800',
  Dikembalikan: 'bg-green-100 text-green-800 border-green-800',
};
const badge = s => `<span class="border px-1.5 py-0.5 text-xs font-bold ${badgeWarna[s]}">${s}</span>`;

// Pesan di bagian atas layar
function notif(msg, ok = false) {
  let el = document.getElementById('notif');
  if (!el) { el = document.createElement('div'); el.id = 'notif'; document.body.appendChild(el); }
  el.className = 'fixed top-0 inset-x-0 z-50 text-center text-white px-5 py-2 ' + (ok ? 'bg-green-600' : 'bg-red-600');
  el.textContent = msg; el.style.display = 'block';
  clearTimeout(el._t); el._t = setTimeout(() => el.style.display = 'none', 4000);
}

// Menu + tombol pintasan yang sama untuk semua halaman
function renderNav(active) {
  const links = [['alat', 'Alat', 'alat.html'], ['kategori', 'Kategori', 'kategori.html'], ['peminjaman', 'Peminjaman', 'peminjaman.html']];
  const pintasan = {
    alat:       [['Kelola Kategori', 'kategori.html'], ['Lihat Peminjaman', 'peminjaman.html']],
    kategori:   [['Kembali ke Data Alat', 'alat.html'], ['Lihat Peminjaman', 'peminjaman.html']],
    peminjaman: [['Pinjam Alat', 'alat.html'], ['Kelola Kategori', 'kategori.html']],
  }[active] || [];
  document.getElementById('nav').innerHTML = `
    <div class="bg-blue-900 text-white px-5 py-3 flex flex-wrap justify-between items-center gap-2">
      <a href="index.html" class="text-xl font-bold">Sistem Peminjaman Alat</a>
      <div class="flex gap-1">
        ${links.map(([id, label, href]) => `<a href="${href}" class="px-3 py-1.5 border ${id === active ? 'bg-white text-blue-900 border-white font-bold' : 'border-blue-900 hover:border-white'}">${label}</a>`).join('')}
      </div>
    </div>
    <div class="px-5 pt-3 flex flex-wrap gap-1.5">
      ${pintasan.map(([label, href]) => `<a href="${href}" class="inline-block ${btn()}">${label}</a>`).join('')}
    </div>`;
}
