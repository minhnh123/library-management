"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- BỘ ICON ---
const IconChart = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2.25l2.25 9 1.5-18 2.25 18 1.5-18 2.25 18 2.25-9H21" /></svg>);
const IconAlert = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);

export default function ReportsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // States lưu trữ dữ liệu tổng hợp
  const [stats, setStats] = useState({
    books: { total: 0, available: 0, borrowed: 0 },
    readers: { total: 0, active: 0, locked: 0, expired: 0 },
    transactions: { total: 0, borrowing: 0, returned: 0, overdue: 0 },
    recentOverdue: []
  });

  // 1. XÁC THỰC NGƯỜI DÙNG
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

  // 2. FETCH DỮ LIỆU TỪ 3 MODULE CÙNG LÚC ĐỂ TỔNG HỢP
  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      const regionId = currentUser?.region?._id || currentUser?.regionId || '';
      
      try {
        // Gọi 3 API cùng lúc để tối ưu tốc độ (Parallel Fetching)
        const [resBooks, resReaders, resTrans] = await Promise.all([
          fetch(`/api/books?regionId=${regionId}`),
          fetch(`/api/readers?regionId=${regionId}`),
          fetch(`/api/transactions?regionId=${regionId}`)
        ]);

        const dataBooks = await resBooks.json();
        const dataReaders = await resReaders.json();
        const dataTrans = await resTrans.json();

        if (dataBooks.success && dataReaders.success && dataTrans.success) {
          const books = dataBooks.data;
          const readers = dataReaders.data;
          const trans = dataTrans.data;
          const now = new Date();

          // Tính toán số liệu Sách
          const totalBooks = books.reduce((sum, b) => sum + (b.totalQuantity || 0), 0);
          const availableBooks = books.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);
          
          // Tính toán số liệu Độc giả
          const activeReaders = readers.filter(r => r.status === 'ACTIVE').length;
          const lockedReaders = readers.filter(r => r.status === 'LOCKED').length;
          
          // Tính toán số liệu Giao dịch
          let borrowing = 0, returned = 0, overdue = 0;
          const overdueList = [];

          trans.forEach(t => {
            if (t.status === 'RETURNED') {
              returned++;
            } else if (t.status === 'BORROWED') {
              if (new Date(t.dueDate) < now) {
                overdue++;
                overdueList.push(t); // Đưa vào danh sách cần đòi
              } else {
                borrowing++;
              }
            }
          });

          setStats({
            books: { total: totalBooks, available: availableBooks, borrowed: totalBooks - availableBooks },
            readers: { total: readers.length, active: activeReaders, locked: lockedReaders, expired: readers.length - activeReaders - lockedReaders },
            transactions: { total: trans.length, borrowing, returned, overdue },
            recentOverdue: overdueList.slice(0, 5) // Chỉ lấy 5 phiếu quá hạn gần nhất
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải báo cáo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // HÀM TÍNH PHẦN TRĂM CHO THANH TIẾN TRÌNH
  const calcPercent = (part, total) => total === 0 ? 0 : Math.round((part / total) * 100);

  if (!currentUser) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-slate-500">Đang chuẩn bị báo cáo...</div></div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Be Vietnam Pro', sans-serif; }
        .progress-bar { transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      <div className="min-h-screen bg-slate-100 pb-12">
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <IconChart />
              </div>
              <div>
                <h1 className="text-lg font-800 text-slate-800 leading-tight">{currentUser?.region?.name || 'LibraryOS'}</h1>
                <p className="text-xs text-indigo-500 leading-tight">Báo cáo & Thống kê</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <button onClick={() => router.push('/')} className="hover:text-slate-800 transition">Ấn phẩm</button>
              <button onClick={() => router.push('/readers')} className="hover:text-slate-800 transition">Độc giả</button>
              <button onClick={() => router.push('/transactions')} className="hover:text-slate-800 transition">Mượn trả</button>
              <a href="#" className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5">Báo cáo</a>
            </nav>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'T'}
              </div>
              <button onClick={handleLogout} className="text-xs font-semibold text-rose-500 hover:text-rose-600">Đăng xuất</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Tổng quan hoạt động</h2>
            <p className="text-sm text-slate-400 mt-1">Số liệu trực tuyến được phân tích riêng cho <strong className="text-indigo-600">{currentUser?.region?.name}</strong></p>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-sm">Đang tổng hợp dữ liệu...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TẦNG 1: CÁC THẺ SỐ LIỆU NHANH */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 border-l-indigo-500">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Tổng Sách (Bản in)</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stats.books.total}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Độc giả hợp lệ</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stats.readers.active}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 border-l-sky-500">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Lượt mượn thành công</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stats.transactions.returned}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Đang quá hạn</p>
                  <p className="text-3xl font-bold text-rose-600 mt-1">{stats.transactions.overdue}</p>
                </div>
              </div>

              {/* TẦNG 2: BIỂU ĐỒ TRỰC QUAN BẰNG CSS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Biểu đồ Sách */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6">Tỉ lệ Sách trong kho</h3>
                  
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">Sẵn sàng cho mượn ({stats.books.available})</span>
                    <span className="font-bold text-emerald-600">{calcPercent(stats.books.available, stats.books.total)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                    <div className="bg-emerald-500 h-3 rounded-full progress-bar" style={{ width: `${calcPercent(stats.books.available, stats.books.total)}%` }}></div>
                  </div>

                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">Đang được mượn ({stats.books.borrowed})</span>
                    <span className="font-bold text-indigo-600">{calcPercent(stats.books.borrowed, stats.books.total)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-indigo-500 h-3 rounded-full progress-bar" style={{ width: `${calcPercent(stats.books.borrowed, stats.books.total)}%` }}></div>
                  </div>
                </div>

                {/* Biểu đồ Độc giả */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6">Trạng thái thẻ Độc giả</h3>
                  
                  <div className="flex h-4 w-full rounded-full overflow-hidden mb-4">
                    <div style={{width: `${calcPercent(stats.readers.active, stats.readers.total)}%`}} className="bg-emerald-500 progress-bar"></div>
                    <div style={{width: `${calcPercent(stats.readers.expired, stats.readers.total)}%`}} className="bg-amber-400 progress-bar"></div>
                    <div style={{width: `${calcPercent(stats.readers.locked, stats.readers.total)}%`}} className="bg-rose-500 progress-bar"></div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm mt-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-slate-600">Hoạt động ({stats.readers.active})</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div><span className="text-slate-600">Hết hạn ({stats.readers.expired})</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-slate-600">Bị khóa ({stats.readers.locked})</span></div>
                  </div>
                </div>
              </div>

              {/* TẦNG 3: DANH SÁCH CẦN CHÚ Ý (Sách quá hạn) */}
              <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
                <div className="bg-rose-50 px-6 py-4 flex items-center gap-2 border-b border-rose-100">
                  <div className="text-rose-500"><IconAlert /></div>
                  <h3 className="font-bold text-rose-800">Danh sách cần thu hồi khẩn cấp (Quá hạn)</h3>
                </div>
                <div className="p-0">
                  {stats.recentOverdue.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-xs font-semibold text-slate-500 text-left">
                          <th className="px-6 py-3">Độc giả</th>
                          <th className="px-6 py-3">Số điện thoại</th>
                          <th className="px-6 py-3">Cuốn sách đang giữ</th>
                          <th className="px-6 py-3">Ngày hẹn trả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {stats.recentOverdue.map(t => (
                          <tr key={t._id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-semibold text-slate-800">{t.readerId?.fullName}</td>
                            <td className="px-6 py-3 text-slate-600">{t.readerId?.phoneNumber}</td>
                            <td className="px-6 py-3 text-slate-600">{t.bookId?.title}</td>
                            <td className="px-6 py-3 text-rose-600 font-bold">{new Date(t.dueDate).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-6 py-8 text-center text-slate-500 text-sm">
                      Tuyệt vời! Hiện tại không có độc giả nào mượn sách quá hạn.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </>
  );
}