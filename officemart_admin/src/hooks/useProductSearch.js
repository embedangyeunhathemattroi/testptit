import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axiosClient.js';

export default function useProductSearch({ q, category, status, page, limit = 10 }, refresh = 0) {
  const [result, setResult] = useState({ data: [], total: 0, loading: true, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    setResult((old) => ({ ...old, loading: true, error: '' }));
    api.get('/products', { params: { q, category, status, page, limit }, signal: controller.signal })
      .then(({ data }) => setResult({ data: data.data, total: data.total, loading: false, error: '' }))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setResult({ data: [], total: 0, loading: false, error: err.response?.data?.message ?? err.message });
      });
    return () => controller.abort();
  }, [q, category, status, page, limit, refresh]);
  return result;
}
