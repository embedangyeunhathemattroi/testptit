import { createContext, useContext, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import ProductList from './pages/ProductList.jsx';
import ProductForm from './pages/ProductForm.jsx';

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

function Layout() {
  const [toast, setToast] = useState('');
  return <ToastContext.Provider value={setToast}>
    <header className="site-header">OfficeMart Admin</header>

    <main className="container"><Outlet /></main>
    {toast && <div className="toast" data-testid="toast" role="status" onClick={() => setToast('')}>{toast}</div>}
  </ToastContext.Provider>;
}

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<Navigate to="/products" replace />} />
      <Route path="products" element={<ProductList />} />
      <Route path="products/new" element={<ProductForm />} />
      <Route path="products/:id/edit" element={<ProductForm />} />
      <Route path="*" element={<p>Không tìm thấy trang</p>} />
    </Route>
  </Routes>;
}
