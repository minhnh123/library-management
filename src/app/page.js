"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Lưu ID của sách đang sửa (nếu có)
  
  const defaultForm = {
    title: '', author: '', isbn: '', category: 'Công nghệ thông tin',
    publishedYear: new Date().getFullYear(), totalQuantity: 1, availableQuantity: 1
  };
  const [formData, setFormData] = useState(defaultForm);

  const fetchBooks = () => {
    fetch('/api/books')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBooks(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Mở Form để THÊM mới
  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Mở Form để SỬA
  const handleEditClick = (book) => {
    setFormData(book); // Đổ dữ liệu cũ vào Form
    setEditingId(book._id);
    setIsModalOpen(true);
  };

  // Nút XÓA
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        // Lọc bỏ sách đã xóa khỏi giao diện
        setBooks(books.filter(book => book._id !== id));
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi xóa!');
    }
  };

  // Gọi API Gửi dữ liệu (POST hoặc PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingId ? `/api/books/${editingId}` : '/api/books';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        if (editingId) {
          // Cập nhật lại list sách nếu đang Sửa
          setBooks(books.map(b => b._id === editingId ? data.data : b));
        } else {
          // Thêm lên đầu list nếu là Thêm mới
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

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900 relative">
      <div className="mx-auto max-w-6xl rounded-lg bg-white p-6 shadow-md">
        
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-700">Hệ thống Quản lý Thư viện</h1>
          <button 
            onClick={handleOpenAdd}
            className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 shadow-sm"
          >
            + Thêm Sách Mới
          </button>
        </div>

        <h2 className="mb-4 text-xl font-semibold text-gray-700">Danh sách ấn phẩm</h2>

        {loading ? (
          <p className="py-10 text-center text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-4 font-semibold border-b">Tên sách</th>
                  <th className="p-4 font-semibold border-b">Tác giả</th>
                  <th className="p-4 font-semibold border-b">Mã ISBN</th>
                  <th className="p-4 font-semibold border-b">Thể loại</th>
                  <th className="p-4 font-semibold border-b text-center">Năm XB</th>
                  <th className="p-4 font-semibold border-b text-center">Kho</th>
                  <th className="p-4 font-semibold border-b text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.length > 0 ? (
                  books.map((book) => (
                    <tr key={book._id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{book.title}</td>
                      <td className="p-4 text-gray-600">{book.author}</td>
                      <td className="p-4 text-gray-500">{book.isbn}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {book.category}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-600">{book.publishedYear}</td>
                      <td className="p-4 text-center font-medium text-gray-700">
                        {book.availableQuantity} / {book.totalQuantity}
                      </td>
                      <td className="p-4 text-center space-x-2 w-32">
                        <button 
                          onClick={() => handleEditClick(book)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(book._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      Chưa có cuốn sách nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL THÊM/SỬA SÁCH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-2xl font-bold text-gray-800 border-b pb-2">
              {editingId ? "Cập nhật thông tin sách" : "Thêm sách mới"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên sách (*)</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tác giả (*)</label>
                  <input required type="text" name="author" value={formData.author} onChange={handleInputChange} className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mã ISBN (*)</label>
                  <input required type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thể loại</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="An ninh mạng">An ninh mạng</option>
                    <option value="Văn học">Văn học</option>
                    <option value="Khoa học">Khoa học</option>
                    <option value="Lịch sử">Lịch sử</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Năm xuất bản</label>
                  <input type="number" name="publishedYear" value={formData.publishedYear} onChange={handleInputChange} className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tổng số lượng</label>
                  <input type="number" min="1" name="totalQuantity" value={formData.totalQuantity} onChange={handleInputChange} className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sẵn có (Kho)</label>
                  <input type="number" min="1" name="availableQuantity" value={formData.availableQuantity} onChange={handleInputChange} className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  {editingId ? "Cập nhật Sách" : "Lưu Sách"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}