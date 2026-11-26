import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import { useToast } from '../App.jsx';

const blank = { name: '', sku: '', category: '', price: '', stock: '', status: 'active' };
function validate(form) {
  const errors = {};
  const name = form.name.trim();
  if (name.length < 3 || name.length > 100) errors.name = 'Tên cần từ 3 đến 100 ký tự.';
  if (!/^[A-Z]{3}-\d{4}$/.test(form.sku)) errors.sku = 'SKU phải có dạng ABC-1234.';
  if (!form.category) errors.category = 'Hãy chọn danh mục.';
  if (form.price === '' || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) errors.price = 'Giá phải lớn hơn 0.';
  if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = 'Tồn kho phải là số nguyên không âm.';
  return errors;
}

export default function ProductForm() {
  const { id } = useParams();
  const editing = id !== undefined;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(blank);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/categories').then((res) => { if (active) setCategories(res.data); }).catch((err) => { if (active) setLoadError(err.response?.data?.message ?? 'Không tải được danh mục'); });
    if (editing) api.get(`/products/${id}`).then((res) => { if (active) setForm(res.data); }).catch((err) => { if (active) setLoadError(err.response?.status === 404 ? 'Không tìm thấy sản phẩm' : err.response?.data?.message ?? 'Không tải được sản phẩm'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, editing]);

  function change(e) {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
    setErrors((old) => ({ ...old, [name]: '' }));
  }
  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim(), price: Number(form.price), stock: Number(form.stock) };
      if (editing) await api.put(`/products/${id}`, payload); else await api.post('/products', payload);
      toast(editing ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm');
      navigate('/products');
    } catch (err) {
      const field = err.response?.data?.field;
      const message = err.response?.status === 404 ? 'Không tìm thấy sản phẩm' : err.response?.data?.message ?? 'Không lưu được sản phẩm';
      if (field) setErrors((old) => ({ ...old, [field]: message })); else setLoadError(message);
    } finally { setSaving(false); }
  }
  return <>
    <div className="page-heading"><h1>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1><button onClick={() => navigate('/products')}>Quay lại</button></div>
    {loading ? <p data-testid="loading">Đang tải sản phẩm...</p> : loadError ? <p role="alert" data-testid="error-message">{loadError}</p> : <form data-testid="product-form" className="product-form" onSubmit={submit} noValidate>
      <label htmlFor="name">Tên sản phẩm</label><input id="name" name="name" value={form.name} onChange={change} />{errors.name && <p className="field-error" data-testid="field-error-name">{errors.name}</p>}
      <label htmlFor="sku">SKU</label><input id="sku" name="sku" value={form.sku} onChange={change} />{errors.sku && <p className="field-error" data-testid="field-error-sku">{errors.sku}</p>}
      <label htmlFor="category">Danh mục</label><select id="category" name="category" value={form.category} onChange={change}><option value="">Chọn danh mục</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.category && <p className="field-error" data-testid="field-error-category">{errors.category}</p>}
      <label htmlFor="price">Giá (₫)</label><input id="price" name="price" type="number" value={form.price} onChange={change} />{errors.price && <p className="field-error" data-testid="field-error-price">{errors.price}</p>}
      <label htmlFor="stock">Tồn kho</label><input id="stock" name="stock" type="number" value={form.stock} onChange={change} />{errors.stock && <p className="field-error" data-testid="field-error-stock">{errors.stock}</p>}
      <label htmlFor="status">Trạng thái</label><select id="status" name="status" value={form.status} onChange={change}><option value="active">Đang bán</option><option value="inactive">Ngừng bán</option></select>
      <button className="primary" data-testid="submit-button" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu sản phẩm'}</button>
    </form>}
  </>;
}
