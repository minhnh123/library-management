"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- BỘ ICON CHO MODULE ĐỘC GIẢ ---
const IconUsers = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>);
const IconBadge = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>);
const IconShieldCheck = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const IconShieldAlert = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);
// Các icon dùng chung
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const IconEdit = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>);
const IconTrash = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>);
const IconClose = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);

// --- CẤU HÌNH MÀU SẮC TRẠNG THÁI ---
const statusConfig = {
  'ACTIVE': { label: 'Hoạt động', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'LOCKED': { label: 'Bị khóa',   bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  'EXPIRED':{ label: 'Hết hạn',   bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
};

export default function ReadersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const defaultForm = {
    fullName: '', readerCode: '', phoneNumber: '', email: '', status: 'ACTIVE'
  };
  const [formData, setFormData] = useState(defaultForm);

  // KIỂM TRA SESSION ĐĂNG NHẬP
  useEffect(() => {
    // Đẩy logic đọc LocalStorage ra khỏi luồng đồng bộ bằng setTimeout 0ms
    const timer = setTimeout(() => {
      const userStr = localStorage.getItem('library_user');
      if (!userStr) {
        router.push('/login');
        return;
      }
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        localStorage.removeItem('library_user');
        router.push('/login');
      }
    }, 0);

    return () => clearTimeout(timer); // Dọn dẹp bộ nhớ chống rò rỉ (Memory Leak)
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('library_user');
    setCurrentUser(null);
    router.push('/login');
  };

  // FETCH DỮ LIỆU ĐỘC GIẢ
  const fetchReaders = useCallback(() => {
    if (!currentUser) return;
    setLoading(true);

    const params = new URLSearchParams({
      search: searchText,
      status: filterStatus,
      regionId: currentUser?.region?._id || currentUser?.regionId || ''
    });

    fetch(`/api/readers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReaders(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, [currentUser, searchText, filterStatus]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReaders();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText, filterStatus, currentUser, fetchReaders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (reader) => {
    setFormData({
      fullName: reader.fullName,
      readerCode: reader.readerCode,
      phoneNumber: reader.phoneNumber,
      email: reader.email || '',
      status: reader.status
    });
    setEditingId(reader._id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa (vô hiệu hóa) độc giả này không?")) return;
    try {
      const res = await fetch(`/api/readers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReaders(readers.filter(r => r._id !== id));
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi xóa!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const url = editingId ? `/api/readers/${editingId}` : '/api/readers';
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      regionId: currentUser?.region?._id || currentUser?.regionId || '',
      createdBy: currentUser?._id || '',
      updatedBy: currentUser?._id || ''
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setReaders(readers.map(r => r._id === editingId ? data.data : r));
        } else {
          setReaders([data.data, ...readers]);
        }
        setIsModalOpen(false);
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi hệ thống!');
    }
  };

  // THỐNG KÊ
  const totalReaders = readers.length;
  const activeReaders = readers.filter(r => r.status === 'ACTIVE').length;
  const lockedReaders = readers.filter(r => r.status === 'LOCKED').length;
  const expiredReaders = readers.filter(r => r.status === 'EXPIRED').length;

  const hasActiveFilter = searchText || filterStatus;
  const inputClass = "mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="p-6 text-center text-slate-600">Đang xác thực người dùng...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Be Vietnam Pro', sans-serif; }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-2px); }
        .row-hover { transition: background 0.15s; }
        .row-hover:hover { background: #f8f7ff; }
        .modal-enter { animation: modalIn 0.2s ease-out; }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .btn-edit { transition: all 0.15s; }
        .btn-edit:hover { background: #ede9fe; color: #6d28d9; }
        .btn-delete { transition: all 0.15s; }
        .btn-delete:hover { background: #fee2e2; color: #b91c1c; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
      `}</style>

      <div className="min-h-screen bg-slate-100">

        {/* HEADER: Chú ý thanh Menu đã trỏ "Độc giả" làm mục active */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <IconUsers />
              </div>
              <div>
                <h1 className="text-lg font-800 text-slate-800 leading-tight">{currentUser?.region?.name || 'LibraryOS'}</h1>
                <p className="text-xs text-indigo-500 leading-tight">Quản lý Độc giả</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              {/* Link Ấn phẩm trở lại trang chủ */}
              <button onClick={() => router.push('/')} className="hover:text-slate-800 transition">Ấn phẩm</button>
              {/* Link Độc giả đang Active */}
              <a href="#" className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5">Độc giả</a>
              {/* ĐÃ SỬA THÀNH NÚT CHUYỂN TRANG */}
              <button onClick={() => router.push('/transactions')} className="hover:text-slate-800 transition">Mượn trả</button>
              <button onClick={() => router.push('/reports')} className="hover:text-slate-800 transition">Báo cáo</button>

              {/* NÚT ADMIN NỔI BẬT */}
              {currentUser?.role === 'ADMIN' && (
                <button onClick={() => router.push('/users')} className="text-rose-500 hover:text-rose-600 font-bold transition">Nhân sự (Admin)</button>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{currentUser?.fullName || 'Thủ thư'}</p>
                <p className="text-xs text-slate-500">Thủ thư</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'T'}
              </div>
              <button onClick={handleLogout} className="text-xs font-semibold text-rose-500 hover:text-rose-600">Đăng xuất</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Danh sách Độc giả</h2>
            <p className="text-sm text-slate-400 mt-1">Quản lý thông tin và trạng thái thẻ của người mượn</p>
          </div>

          {/* THỐNG KÊ ĐỘC GIẢ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng số</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><IconBadge /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalReaders}</p>
              <p className="text-xs text-slate-400 mt-1">độc giả có thẻ</p>
            </div>
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hoạt động</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500"><IconShieldCheck /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{activeReaders}</p>
              <p className="text-xs text-slate-400 mt-1">thẻ hợp lệ</p>
            </div>
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hết hạn</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{expiredReaders}</p>
              <p className="text-xs text-slate-400 mt-1">cần gia hạn</p>
            </div>
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bị khóa</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500"><IconShieldAlert /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{lockedReaders}</p>
              <p className="text-xs text-slate-400 mt-1">do vi phạm</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            {/* TOOLBAR */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Hồ sơ độc giả</h3>
              </div>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
              >
                <IconPlus />
                Thêm độc giả
              </button>
            </div>

            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Tìm theo tên, số điện thoại hoặc mã thẻ..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2.5 px-3 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 min-w-[160px]"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bị khóa">Bị khóa</option>
                <option value="Hết hạn">Hết hạn</option>
              </select>
              {hasActiveFilter && (
                <button
                  onClick={() => { setSearchText(''); setFilterStatus(''); }}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <IconClose /> Xóa lọc
                </button>
              )}
            </div>

            {/* BẢNG DỮ LIỆU */}
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-sm">Đang tải hồ sơ...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-3 text-left">Mã thẻ</th>
                      <th className="px-6 py-3 text-left">Tên độc giả</th>
                      <th className="px-6 py-3 text-left">Số điện thoại</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Trạng thái</th>
                      <th className="px-6 py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {readers.length > 0 ? (
                      readers.map((reader) => {
                        const statusBadge = statusConfig[reader.status] || statusConfig['ACTIVE'];
                        return (
                          <tr key={reader._id} className="row-hover">
                            <td className="px-6 py-4">
                              <code className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">{reader.readerCode}</code>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-800">{reader.fullName}</td>
                            <td className="px-6 py-4 text-slate-600">{reader.phoneNumber}</td>
                            <td className="px-6 py-4 text-slate-500">{reader.email || '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => handleEditClick(reader)} className="btn-edit flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200">
                                  <IconEdit /> Sửa
                                </button>
                                <button onClick={() => handleDeleteClick(reader._id)} className="btn-delete flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200">
                                  <IconTrash /> Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                              <IconUsers />
                            </div>
                            <p className="text-sm font-medium">{hasActiveFilter ? 'Không tìm thấy độc giả' : 'Chưa có hồ sơ độc giả nào'}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="modal-enter w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">{editingId ? "Cập nhật độc giả" : "Đăng ký thẻ mới"}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg"><IconClose /></button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên <span className="text-rose-400">*</span></label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClass} placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mã thẻ <span className="text-rose-400">*</span></label>
                  <input required type="text" name="readerCode" value={formData.readerCode} onChange={handleInputChange} className={inputClass} placeholder="VD: DG-001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại <span className="text-rose-400">*</span></label>
                  <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={inputClass} placeholder="09..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="Email (nếu có)" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Trạng thái thẻ</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
                    <option value="ACTIVE">Hoạt động bình thường</option>
                    <option value="LOCKED">Bị khóa (Vi phạm)</option>
                    <option value="EXPIRED">Hết hạn thẻ</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95">{editingId ? "Lưu thay đổi" : "Tạo thẻ độc giả"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}