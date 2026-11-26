import { useNavigate } from 'react-router-dom';
import { categoryNames } from '../data/sample.js';

const priceText = (price) => `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;

export default function ProductRow({ product, onDelete }) {
  const navigate = useNavigate();
  const cells = [
    ['Tên', product.name], ['SKU', product.sku], ['Danh mục', categoryNames[product.category] ?? product.category],
    ['Giá', priceText(product.price)], ['Tồn kho', product.stock === 0 ? <span className="out-of-stock">Hết hàng</span> : product.stock],
    ['Trạng thái', <span data-testid="product-status" className={`status ${product.status}`}>{product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}</span>],
    ['Thao tác', <span className="row-actions"><button type="button" data-testid="edit-button" onClick={() => navigate(`/products/${product.id}/edit`)}>Sửa</button><button type="button" className="danger-button" data-testid="delete-button" onClick={() => onDelete?.(product)}>Xoá</button></span>],
  ];
  return <tr data-testid="product-row">{cells.map(([label, value]) => <td key={label} data-label={label}>{value}</td>)}</tr>;
}
