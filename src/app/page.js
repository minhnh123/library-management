"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const categoryConfig = {
  'Công nghệ thông tin': { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-400' },
  'An ninh mạng':        { bg: 'bg-rose-100',   text: 'text-rose-700',   dot: 'bg-rose-400' },
  'Văn học':             { bg: 'bg-amber-100',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  'Khoa học':            { bg: 'bg-cyan-100',    text: 'text-cyan-700',   dot: 'bg-cyan-400' },
  'Lịch sử':             { bg: 'bg-orange-100',  text: 'text-orange-700', dot: 'bg-orange-400' },
  'Khác':                { bg: 'bg-gray-100',    text: 'text-gray-600',   dot: 'bg-gray-400' },
};

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconCollection = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const IconWarehouse = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const IconCategory = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const IconChevronLeft = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>);
const IconChevronRight = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>);

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const defaultForm = {
    title: '', author: '', isbn: '', category: 'Công nghệ thông tin',
    publishedYear: new Date().getFullYear(), totalQuantity: 1, availableQuantity: 1
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);

    const userStr = localStorage.getItem('library_user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setCurrentUser(parsedUser);
    } catch {
      localStorage.removeItem('library_user');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('library_user');
    setCurrentUser(null);
    router.push('/login');
  };

  const fetchBooks = useCallback(() => {
    if (!currentUser) {
      // Chờ user xác thực xong trước khi gọi API
      return;
    }

    setLoading(true);
    // Gom các bộ lọc thành chuỗi URL (vd: ?search=abc&category=IT)
    const params = new URLSearchParams({
      search: searchText,
      category: filterCategory,
      year: filterYear,
      regionId: currentUser?.region?._id || currentUser?.regionId || '',
      page: currentPage,
      limit: 5
    });

    fetch(`/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooks(data.data);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
            setTotalBooks(data.pagination.total || data.data.length);
          } else {
            setTotalPages(1);
            setTotalBooks(data.data.length);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, [currentUser, searchText, filterCategory, filterYear, currentPage]);

  useEffect(() => {
    // Kỹ thuật Debounce: Đợi 400ms sau khi ngừng gõ mới gọi API để tiết kiệm tài nguyên Cloud
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText, filterCategory, filterYear, currentUser, fetchBooks]);

  const handleSearchTextChange = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterCategoryChange = (value) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const handleFilterYearChange = (value) => {
    setFilterYear(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (book) => {
    setFormData(book);
    setEditingId(book._id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?")) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBooks(books.filter(book => book._id !== id));
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi xóa!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Vui lòng đăng nhập trước khi thêm / cập nhật sách');
      router.push('/login');
      return;
    }

    const url = editingId ? `/api/books/${editingId}` : '/api/books';
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      regionId: currentUser?.region?._id || currentUser?.regionId || '',
      createdBy: currentUser?._id || currentUser?.id || '',
      updatedBy: currentUser?._id || currentUser?.id || ''
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
          setBooks(books.map(b => b._id === editingId ? data.data : b));
        } else {
          setBooks([data.data, ...books]);
        }
        setIsModalOpen(false);
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi hệ thống!');
    }
  };

  const displayedBooks = books.length;
  const totalCopies = books.reduce((s, b) => s + (b.totalQuantity || 0), 0);
  const availableCopies = books.reduce((s, b) => s + (b.availableQuantity || 0), 0);
  const uniqueCategories = [...new Set(books.map(b => b.category))].length;

  const yearOptions = [...new Set(books.map(b => b.publishedYear))].sort((a, b) => b - a);

  const filteredBooks = books;

  const hasActiveFilter = searchText || filterCategory || filterYear;

  const inputClass = "mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

  if (!isMounted || !currentUser) {
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

        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <IconBook />
              </div>
              <div>
                <h1 className="text-lg font-800 font-bold text-slate-800 leading-tight">{currentUser?.region?.name || currentUser?.branch || 'LibraryOS'}</h1>
                <p className="text-xs text-indigo-500 leading-tight">{currentUser?.region?.name ? 'Chi nhánh' : 'Hệ thống quản lý thư viện'}</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5">Ấn phẩm</a>
              <button onClick={() => router.push('/readers')} className="hover:text-slate-800 transition">Độc giả</button>
              <button onClick={() => router.push('/transactions')} className="hover:text-slate-800 transition">Mượn trả</button>
              <button onClick={() => router.push('/reports')} className="hover:text-slate-800 transition">Báo cáo</button>
              {currentUser?.role === 'ADMIN' && (
                <button onClick={() => router.push('/users')} className="hover:text-rose-600 text-rose-500 font-bold transition">Nhân sự (Admin)</button>
              )}
            </nav>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{currentUser?.fullName || currentUser?.name || currentUser?.username || 'Thủ thư'}</p>
                <p className="text-xs text-slate-500">Thủ thư</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : (currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'T')}
              </div>
              <button onClick={handleLogout} className="text-xs font-semibold text-rose-500 hover:text-rose-600">Đăng xuất</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Ấn phẩm</h2>
            <p className="text-sm text-slate-400 mt-1">Quản lý toàn bộ danh mục sách và tài liệu trong thư viện</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đầu sách</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><IconCollection /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalBooks}</p>
              <p className="text-xs text-slate-400 mt-1">tên sách</p>
            </div>
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng bản</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500"><IconWarehouse /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalCopies}</p>
              <p className="text-xs text-slate-400 mt-1">bản in</p>
            </div>
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Có sẵn</span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{availableCopies}</p>
              <p className="text-xs text-slate-400 mt-1">bản trên kệ</p>
            </div>
            <div className="stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thể loại</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500"><IconCategory /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{uniqueCategories}</p>
              <p className="text-xs text-slate-400 mt-1">danh mục</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Danh sách ấn phẩm</h3>
                <p className="text-xs text-slate-400 mt-0.5">{totalBooks} đầu sách trong hệ thống</p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
              >
                <IconPlus />
                Thêm sách mới
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
                  onChange={(e) => handleSearchTextChange(e.target.value)}
                  placeholder="Tìm theo tên sách hoặc tác giả..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => handleFilterCategoryChange(e.target.value)}
                className="py-2.5 px-3 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Tất cả thể loại</option>
                <option>Công nghệ thông tin</option>
                <option>An ninh mạng</option>
                <option>Văn học</option>
                <option>Khoa học</option>
                <option>Lịch sử</option>
                <option>Khác</option>
              </select>
              <select
                value={filterYear}
                onChange={(e) => handleFilterYearChange(e.target.value)}
                className="py-2.5 px-3 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Tất cả năm</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {hasActiveFilter && (
                <button
                  onClick={() => { setSearchText(''); setFilterCategory(''); setFilterYear(''); }}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <IconClose />
                  Xóa lọc
                </button>
              )}
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
                    <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-3 text-left">Tên sách</th>
                      <th className="px-6 py-3 text-left">Tác giả</th>
                      <th className="px-6 py-3 text-left">Mã ISBN</th>
                      <th className="px-6 py-3 text-left">Thể loại</th>
                      <th className="px-6 py-3 text-center">Năm XB</th>
                      <th className="px-6 py-3 text-center">Kho</th>
                      <th className="px-6 py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => {
                        const cat = categoryConfig[book.category] || categoryConfig['Khác'];
                        const ratio = book.totalQuantity > 0 ? book.availableQuantity / book.totalQuantity : 0;
                        const stockColor = ratio > 0.5 ? 'text-emerald-600' : ratio > 0 ? 'text-amber-600' : 'text-red-500';
                        return (
                          <tr key={book._id} className="row-hover">
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-800">{book.title}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{book.author}</td>
                            <td className="px-6 py-4">
                              <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{book.isbn}</code>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cat.bg} ${cat.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`}></span>
                                {book.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-500">{book.publishedYear}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`font-semibold ${stockColor}`}>{book.availableQuantity}</span>
                              <span className="text-slate-300 mx-1">/</span>
                              <span className="text-slate-500">{book.totalQuantity}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditClick(book)}
                                  className="btn-edit flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200"
                                >
                                  <IconEdit /> Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(book._id)}
                                  className="btn-delete flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200"
                                >
                                  <IconTrash /> Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                              <IconBook />
                            </div>
                            {hasActiveFilter ? (
                              <>
                                <p className="text-sm font-medium">Không tìm thấy kết quả</p>
                                <p className="text-xs">Thử thay đổi từ khóa hoặc bộ lọc</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium">Chưa có cuốn sách nào</p>
                                <p className="text-xs">Nhấn Thêm sách mới để bắt đầu</p>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && totalBooks > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
                <span className="text-sm text-slate-500">
                  Tổng cộng <strong className="text-slate-700">{totalBooks}</strong> đầu sách
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600">Trang {currentPage} / {totalPages}</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1}
                      className="page-btn p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 shadow-sm"
                    >
                      <IconChevronLeft />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages}
                      className="page-btn p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 shadow-sm"
                    >
                      <IconChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="mt-12 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} LibraryOS · Hệ thống quản lý thư viện</p>
            <p>Phiên bản 1.0.0</p>
          </div>
        </footer>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="modal-enter w-full max-w-lg rounded-2xl bg-white shadow-2xl shadow-slate-900/20 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingId ? "Cập nhật thông tin sách" : "Thêm sách mới"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingId ? "Chỉnh sửa thông tin cuốn sách" : "Điền đầy đủ thông tin để thêm vào thư viện"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên sách <span className="text-rose-400">*</span></label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Nhập tên sách..." className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tác giả <span className="text-rose-400">*</span></label>
                  <input required type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="Tên tác giả..." className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mã ISBN <span className="text-rose-400">*</span></label>
                  <input required type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} placeholder="978-..." className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Thể loại</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={inputClass}>
                    <option>Công nghệ thông tin</option>
                    <option>An ninh mạng</option>
                    <option>Văn học</option>
                    <option>Khoa học</option>
                    <option>Lịch sử</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Năm xuất bản</label>
                  <input type="number" name="publishedYear" value={formData.publishedYear} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tổng số lượng</label>
                  <input type="number" min="1" name="totalQuantity" value={formData.totalQuantity} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sẵn có (Kho)</label>
                  <input type="number" min="0" name="availableQuantity" value={formData.availableQuantity} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
                >
                  {editingId ? "Cập nhật sách" : "Lưu sách"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}