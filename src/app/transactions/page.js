"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- BỘ ICON CHO MODULE MƯỢN TRẢ ---
const IconClipboard = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const IconCheckCircle = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const IconClock = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const IconClose = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const IconReturn = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>);

// --- CẤU HÌNH TRẠNG THÁI ---
const statusConfig = {
  'BORROWED': { label: 'Đang mượn', bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'RETURNED': { label: 'Đã trả',    bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'OVERDUE':  { label: 'Quá hạn',   bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500' },
};

export default function TransactionsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho dropdown chọn Sách và Độc giả
  const [availableBooks, setAvailableBooks] = useState([]);
  const [activeReaders, setActiveReaders] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // Khởi tạo ngày hẹn trả mặc định là 7 ngày sau
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const defaultForm = {
    readerId: '', bookId: '', 
    dueDate: nextWeek.toISOString().split('T')[0], // Format YYYY-MM-DD cho thẻ input type="date"
    note: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  // 1. KIỂM TRA SESSION ĐĂNG NHẬP (Dùng setTimeout chống lỗi Hydration)
  useEffect(() => {
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
    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('library_user');
    setCurrentUser(null);
    router.push('/login');
  };

  // 2. FETCH DỮ LIỆU PHIẾU MƯỢN
  const fetchTransactions = useCallback(() => {
    if (!currentUser) return;
    setLoading(true);

    const params = new URLSearchParams({
      status: filterStatus,
      regionId: currentUser?.region?._id || currentUser?.regionId || ''
    });

    fetch(`/api/transactions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Lọc lại những phiếu quá hạn (chưa trả và qua ngày hẹn)
          const now = new Date();
          const processedData = data.data.map(t => {
            if (t.status === 'BORROWED' && new Date(t.dueDate) < now) {
              return { ...t, status: 'OVERDUE' };
            }
            return t;
          });
          setTransactions(processedData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, [currentUser, filterStatus]);

  useEffect(() => {
    // Đẩy việc gọi API ra khỏi luồng đồng bộ bằng setTimeout
    const delayDebounceFn = setTimeout(() => {
      fetchTransactions();
    }, 100); // Trì hoãn 100ms để React kịp render giao diện tĩnh trước

    // Dọn dẹp bộ nhớ nếu component bị unmount
    return () => clearTimeout(delayDebounceFn);
  }, [currentUser, filterStatus, fetchTransactions]);

  // 3. FETCH DỮ LIỆU ĐỔ VÀO SELECT BOX KHI MỞ MODAL
  const handleOpenAdd = async () => {
    const regionId = currentUser?.region?._id || currentUser?.regionId;
    
    // Tải Sách và Độc giả từ API
    const [resBooks, resReaders] = await Promise.all([
      fetch(`/api/books?regionId=${regionId}`),
      fetch(`/api/readers?regionId=${regionId}&status=Hoạt động`)
    ]);
    
    const dataBooks = await resBooks.json();
    const dataReaders = await resReaders.json();

    if (dataBooks.success) {
      // Chỉ cho mượn sách có số lượng > 0
      setAvailableBooks(dataBooks.data.filter(b => b.availableQuantity > 0));
    }
    if (dataReaders.success) {
      setActiveReaders(dataReaders.data);
    }

    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. LƯU PHIẾU MƯỢN MỚI
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.readerId || !formData.bookId) {
      alert('Vui lòng chọn Độc giả và Sách!');
      return;
    }

    const payload = {
      ...formData,
      regionId: currentUser?.region?._id || currentUser?.regionId || '',
      createdBy: currentUser?._id || '',
      updatedBy: currentUser?._id || ''
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchTransactions(); // Gọi lại API để lấy dữ liệu có populate (kèm tên sách)
        alert('Tạo phiếu mượn thành công! Số lượng sách trong kho đã được trừ.');
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi hệ thống!');
    }
  };

  // 5. XỬ LÝ TRẢ SÁCH
  const handleReturnBook = async (id) => {
    if (!window.confirm("Xác nhận độc giả đã trả cuốn sách này?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RETURNED', updatedBy: currentUser?._id || '' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTransactions(); // Tải lại danh sách
        alert('Trả sách thành công! Đã cộng lại sách vào kho.');
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi trả sách!');
    }
  };

  // FORMAT NGÀY THÁNG HIỂN THỊ
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // THỐNG KÊ
  const totalTransactions = transactions.length;
  const borrowingCount = transactions.filter(t => t.status === 'BORROWED').length;
  const overdueCount = transactions.filter(t => t.status === 'OVERDUE').length;

  const inputClass = "mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="p-6 text-center text-slate-600">Đang đồng bộ giao dịch...</div>
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
        .btn-return { transition: all 0.15s; }
        .btn-return:hover { background: #dcfce7; color: #166534; }
      `}</style>

      <div className="min-h-screen bg-slate-100">

        {/* HEADER: Chú ý thanh Menu đã trỏ "Mượn trả" làm mục active */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <IconClipboard />
              </div>
              <div>
                <h1 className="text-lg font-800 text-slate-800 leading-tight">{currentUser?.region?.name || 'LibraryOS'}</h1>
                <p className="text-xs text-indigo-500 leading-tight">Quản lý Mượn Trả</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <button onClick={() => router.push('/')} className="hover:text-slate-800 transition">Ấn phẩm</button>
              <button onClick={() => router.push('/readers')} className="hover:text-slate-800 transition">Độc giả</button>
              <a href="#" className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5">Mượn trả</a>
              <button onClick={() => router.push('/reports')} className="hover:text-slate-800 transition">Báo cáo</button>

              {/* NÚT ADMIN NỔI BẬT */}
              {currentUser?.role === 'ADMIN' && (
                <button onClick={() => router.push('/users')} className="text-rose-500 hover:text-rose-600 font-bold transition">Nhân sự (Admin)</button>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{currentUser?.fullName || 'Thủ thư'}</p>
                <p className="text-xs text-slate-500 font-medium">{currentUser?.role === 'ADMIN' ? 'Super Admin' : 'Thủ thư'}</p>
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
            <h2 className="text-2xl font-bold text-slate-800">Giao dịch mượn trả sách</h2>
            <p className="text-sm text-slate-400 mt-1">Ghi nhận phiếu mượn và tự động kiểm soát số lượng kho</p>
          </div>

          {/* THỐNG KÊ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tổng Phiếu</p>
                <p className="text-3xl font-bold text-slate-800">{totalTransactions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><IconClipboard /></div>
            </div>
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Đang mượn</p>
                <p className="text-3xl font-bold text-indigo-600">{borrowingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500"><IconClock /></div>
            </div>
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cảnh báo Quá hạn</p>
                <p className="text-3xl font-bold text-rose-600">{overdueCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            {/* TOOLBAR */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex gap-4 items-center">
                <h3 className="font-semibold text-slate-800">Lịch sử giao dịch</h3>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-1.5 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                >
                  <option value="Tất cả">Tất cả trạng thái</option>
                  <option value="BORROWED">Đang mượn</option>
                  <option value="RETURNED">Đã trả</option>
                </select>
              </div>
              <button onClick={handleOpenAdd} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95">
                <IconPlus /> Lập phiếu mượn
              </button>
            </div>

            {/* BẢNG DỮ LIỆU */}
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-sm">Đang tải giao dịch...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-3 text-left">Độc giả</th>
                      <th className="px-6 py-3 text-left">Tên sách</th>
                      <th className="px-6 py-3 text-left">Ngày mượn</th>
                      <th className="px-6 py-3 text-left">Hẹn trả</th>
                      <th className="px-6 py-3 text-left">Trạng thái</th>
                      <th className="px-6 py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.length > 0 ? (
                      transactions.map((t) => {
                        const statusBadge = statusConfig[t.status] || statusConfig['BORROWED'];
                        return (
                          <tr key={t._id} className="row-hover">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800">{t.readerId?.fullName || 'Độc giả đã bị xóa'}</p>
                              <p className="text-xs text-slate-400">{t.readerId?.readerCode}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800">{t.bookId?.title || 'Sách đã bị xóa'}</p>
                              <p className="text-xs text-slate-400">ISBN: {t.bookId?.isbn}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{formatDate(t.borrowDate)}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{formatDate(t.dueDate)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {t.status !== 'RETURNED' ? (
                                <button onClick={() => handleReturnBook(t._id)} className="btn-return inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                  <IconReturn /> Trả sách
                                </button>
                              ) : (
                                <span className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
                                  <IconCheckCircle /> Hoàn tất
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-20 text-center">
                          <p className="text-slate-400 text-sm">Chưa có giao dịch mượn trả nào trong hệ thống.</p>
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

      {/* MODAL TẠO PHIẾU MƯỢN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="modal-enter w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Lập Phiếu Mượn Mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg"><IconClose /></button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chọn Độc giả (Chỉ hiển thị thẻ Hợp lệ) <span className="text-rose-400">*</span></label>
                <select required name="readerId" value={formData.readerId} onChange={handleInputChange} className={inputClass}>
                  <option value="" disabled>-- Bấm để chọn người mượn --</option>
                  {activeReaders.map(r => (
                    <option key={r._id} value={r._id}>{r.readerCode} - {r.fullName}</option>
                  ))}
                </select>
                {activeReaders.length === 0 && <p className="text-xs text-rose-500 mt-1">Không có độc giả nào hợp lệ để mượn sách!</p>}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chọn Ấn phẩm (Chỉ hiển thị sách còn kho) <span className="text-rose-400">*</span></label>
                <select required name="bookId" value={formData.bookId} onChange={handleInputChange} className={inputClass}>
                  <option value="" disabled>-- Bấm để chọn cuốn sách --</option>
                  {availableBooks.map(b => (
                    <option key={b._id} value={b._id}>{b.title} (Còn: {b.availableQuantity} cuốn)</option>
                  ))}
                </select>
                {availableBooks.length === 0 && <p className="text-xs text-rose-500 mt-1">Kho hiện tại đã hết sách!</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày hẹn trả <span className="text-rose-400">*</span></label>
                <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú (Tình trạng sách lúc mượn)</label>
                <input type="text" name="note" value={formData.note} onChange={handleInputChange} className={inputClass} placeholder="VD: Sách bị nhăn bìa..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Hủy bỏ</button>
                <button type="submit" disabled={activeReaders.length === 0 || availableBooks.length === 0} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  Hoàn tất & Giao sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}