import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import ProductTable from '../components/ProductTable.jsx';
import useProductSearch from '../hooks/useProductSearch.js';
import { useToast } from '../App.jsx';

export default function ProductList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [url, setUrl] = useSearchParams();
  const q = url.get('q') ?? '';
  const category = url.get('category') ?? '';
  const status = url.get('status') ?? '';
  const rawPage = Number(url.get('page') || 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [typed, setTyped] = useState(q);
  const [categories, setCategories] = useState([]);
  const [retry, setRetry] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [busy, setBusy] = useState(false);
  const { data, total, loading, error } = useProductSearch({ q, category, status, page }, retry);
  const pages = Math.max(1, Math.ceil(total / 10));

  useEffect(() => { setTyped(q); }, [q]);
  useEffect(() => { api.get('/categories').then((res) => setCategories(res.data)).catch(() => {}); }, []);
  useEffect(() => {
    if (typed === q) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(url);
      if (typed.trim()) next.set('q', typed.trim()); else next.delete('q');
      next.delete('page');
      setUrl(next);
    }, 400);
    return () => clearTimeout(timer);
  }, [typed, q, url, setUrl]);

  function updateFilter(field, value) {
    const next = new URLSearchParams(url);
    if (value) next.set(field, value); else next.delete(field);
    next.delete('page');
    setUrl(next);
  }
  function changePage(value) { const next = new URLSearchParams(url); next.set('page', String(value)); setUrl(next); }
  async function confirmDelete() {
    if (busy || !deleting) return;
    setBusy(true); setDeleteError('');
    try {
      await api.delete(`/products/${deleting.id}`);
      setDeleting(null); toast('Đã xoá sản phẩm');
      if (data.length === 1 && page > 1) changePage(page - 1); else setRetry((n) => n + 1);
    } catch (err) { setDeleteError(err.response?.data?.message ?? 'Không xoá được sản phẩm'); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    if (!loading && !error && page > pages) changePage(pages);
  }, [loading, error, total, page, pages]);

  return <>
    <div className="page-heading"><h1>Sản phẩm</h1><button className="primary" data-testid="add-button" onClick={() => navigate('/products/new')}>Thêm sản phẩm</button></div>
    <div className="filters"><input aria-label="Tìm kiếm" placeholder="Tìm tên hoặc SKU" data-testid="search-input" value={typed} onChange={(e) => setTyped(e.target.value)} /><select aria-label="Lọc danh mục" data-testid="category-filter" value={category} onChange={(e) => updateFilter('category', e.target.value)}><option value="">Tất cả danh mục</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Lọc trạng thái" data-testid="status-filter" value={status} onChange={(e) => updateFilter('status', e.target.value)}><option value="">Tất cả trạng thái</option><option value="active">Đang bán</option><option value="inactive">Ngừng bán</option></select></div>
    {loading ? <p data-testid="loading">Đang tải sản phẩm...</p> : error ? <div data-testid="error-message" role="alert">{error} <button data-testid="retry-button" onClick={() => setRetry((n) => n + 1)}>Thử lại</button></div> : data.length === 0 ? <p data-testid="empty-state">Không có sản phẩm</p> : <ProductTable products={data} onDelete={setDeleting} />}
    {!loading && !error && total > 0 && <nav className="pagination" data-testid="pagination"><button data-testid="page-prev" disabled={page <= 1} onClick={() => changePage(page - 1)}>Trước</button><span data-testid="page-current">{page} / {pages}</span><button data-testid="page-next" disabled={page >= pages} onClick={() => changePage(page + 1)}>Sau</button></nav>}
    {deleting && <div className="modal-backdrop"><div className="dialog" role="dialog" aria-modal="true" aria-label="Xác nhận xoá" data-testid="confirm-dialog"><h2>Xoá sản phẩm?</h2><p>Bạn có chắc muốn xoá {deleting.name}?</p>{deleteError && <p role="alert">{deleteError}</p>}<div className="dialog-actions"><button data-testid="confirm-no" disabled={busy} onClick={() => { setDeleting(null); setDeleteError(''); }}>Huỷ</button><button className="danger-button" data-testid="confirm-yes" disabled={busy} onClick={confirmDelete}>{busy ? 'Đang xoá...' : 'Đồng ý'}</button></div></div></div>}
  </>;
}
