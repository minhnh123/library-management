"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- BỘ ICON ---
const IconShield = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const IconClose = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const IconUserGroup = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>);

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', role: 'LIBRARIAN', regionId: '' });

  // 1. KIỂM TRA QUYỀN ADMIN
  useEffect(() => {
    const timer = setTimeout(() => {
      const userStr = localStorage.getItem('library_user');
      if (!userStr) {
        router.push('/login');
        return;
      }
      try {
        const parsedUser = JSON.parse(userStr);
        // NẾU KHÔNG PHẢI ADMIN -> ĐÁ VỀ TRANG CHỦ NGAY LẬP TỨC
        if (parsedUser.role !== 'ADMIN') {
          alert('Truy cập bị từ chối! Bạn không có quyền Giám đốc.');
          router.push('/');
          return;
        }
        setCurrentUser(parsedUser);
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

  // 2. FETCH DỮ LIỆU NHÂN SỰ & CHI NHÁNH
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchData = async () => {
      try {
        const [resUsers, resRegions] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/regions')
        ]);
        
        const dataUsers = await resUsers.json();
        const dataRegions = await resRegions.json();
        
        if (dataUsers.success) setUsers(dataUsers.data);
        if (dataRegions.success) {
            setRegions(dataRegions.data);
            if (dataRegions.data.length > 0) {
                setFormData(prev => ({ ...prev, regionId: dataRegions.data[0]._id }));
            }
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. XỬ LÝ TẠO TÀI KHOẢN MỚI
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert('Tạo tài khoản thành công!');
        const reloadRes = await fetch('/api/users');
        const reloadData = await reloadRes.json();
        if (reloadData.success) setUsers(reloadData.data);
        
        setIsModalOpen(false);
        setFormData({ username: '', password: '', fullName: '', role: 'LIBRARIAN', regionId: regions[0]?._id || '' });
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Lỗi hệ thống!');
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

  if (!currentUser) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-slate-500">Đang kiểm tra quyền truy cập...</div></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Be Vietnam Pro', sans-serif; }
        .row-hover:hover { background: #f8f7ff; }
        .modal-enter { animation: modalIn 0.2s ease-out; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div className="min-h-screen bg-slate-100">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-900 text-white shadow-md">
                <IconShield />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-tight">Admin Portal</h1>
                <p className="text-xs text-indigo-500 font-semibold leading-tight">Giám đốc hệ thống</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <button onClick={() => router.push('/')} className="hover:text-slate-800 transition">Trang chủ</button>
              <a href="#" className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5">Quản lý Nhân sự</a>
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{currentUser.fullName}</p>
                <p className="text-xs text-rose-500 font-semibold">Super Admin</p>
              </div>
              <button onClick={handleLogout} className="text-xs font-semibold text-rose-500 hover:text-rose-600">Đăng xuất</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Tài khoản Thủ thư</h2>
            <p className="text-sm text-slate-400 mt-1">Cấp phát tài khoản và phân quyền quản lý theo từng chi nhánh</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><IconUserGroup/> Danh sách nhân sự ({users.length})</h3>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-800 active:scale-95">
                <IconPlus /> Cấp tài khoản mới
              </button>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                 <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                 <p className="text-sm">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                      <th className="px-6 py-4 text-left">Tên đăng nhập</th>
                      <th className="px-6 py-4 text-left">Họ và Tên</th>
                      <th className="px-6 py-4 text-left">Quyền hạn</th>
                      <th className="px-6 py-4 text-left">Chi nhánh Quản lý</th>
                      <th className="px-6 py-4 text-left">Ngày cấp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map(user => (
                      <tr key={user._id} className="row-hover">
                        <td className="px-6 py-4 font-bold text-slate-700">{user.username}</td>
                        <td className="px-6 py-4 text-slate-600">{user.fullName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">{user.role === 'ADMIN' ? 'Toàn hệ thống' : (user.regionId?.name || 'Chưa phân vùng')}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL TẠO TÀI KHOẢN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="modal-enter w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Cấp tài khoản Thủ thư</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg"><IconClose /></button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên đăng nhập <span className="text-rose-400">*</span></label>
                <input required type="text" name="username" value={formData.username} onChange={handleInputChange} className={inputClass} placeholder="VD: thuthu_hcm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mật khẩu <span className="text-rose-400">*</span></label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className={inputClass} placeholder="Nhập mật khẩu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và Tên <span className="text-rose-400">*</span></label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClass} placeholder="Tên hiển thị" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phân công Chi nhánh <span className="text-rose-400">*</span></label>
                <select required name="regionId" value={formData.regionId} onChange={handleInputChange} className={inputClass}>
                  {regions.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Hủy</button>
                <button type="submit" className="rounded-xl bg-indigo-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-800 transition active:scale-95">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
