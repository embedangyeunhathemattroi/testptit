# Hướng dẫn làm đề OfficeMart trong 150 phút

Tài liệu này bám theo `Thực hành.docx`, starter kit và hai ảnh [desktop.png](officemart_admin/public/mockup/desktop.png), [mobile.png](officemart_admin/public/mockup/mobile.png).

Trong phòng thi, **phút 0–90 không dùng AI**. Mã hoàn chỉnh trong thư mục [src](officemart_admin/src) của bản này chỉ để học và tự luyện; đừng dùng nó như bài làm pha 1. Bài nộp cần là mã em tự viết đúng thời điểm.

Các file của đề **không được sửa**: [package.json](officemart_admin/package.json), [package-lock.json](officemart_admin/package-lock.json), [main.jsx](officemart_admin/src/main.jsx), [sample.js](officemart_admin/src/data/sample.js), [axiosClient.js](officemart_admin/src/api/axiosClient.js), [mock-api](officemart_admin/mock-api), [vite.config.js](officemart_admin/vite.config.js), [tu_kiem_tra](officemart_admin/tu_kiem_tra), [useProductSearch_ai.js](officemart_admin/src/ai/useProductSearch_ai.js).

## 1. Mở terminal IntelliJ và chạy thử

1. Mở **File → Open**, chọn thư mục `starter-kit` hoặc [officemart_admin](officemart_admin).
2. Ở thanh dưới IntelliJ chọn **Terminal** (phím `Alt+F12`). Gõ `pwd` để xem terminal đang ở đâu.
3. Nếu đang ở `starter-kit`, gõ `cd officemart_admin`. Gõ `dir package.json`; thấy [package.json](officemart_admin/package.json) nghĩa là đã vào đúng thư mục.
4. Mở **hai tab terminal** bằng nút `+`, chạy mỗi lệnh trong một tab:

```powershell
# Tab 1: API mock ở cổng 3001; để tab này chạy liên tục
npm.cmd run api
# Tab 2: React/Vite ở cổng 5173
npm.cmd run dev
```

Trên macOS/Linux dùng `npm` thay `npm.cmd`. Mở `http://localhost:5173/products`.

`npm run api` chạy [server.js](officemart_admin/mock-api/server.js) trong máy. [vite.config.js](officemart_admin/vite.config.js) chuyển request `/api` sang cổng 3001. [axiosClient.js](officemart_admin/src/api/axiosClient.js) đặt `baseURL: '/api'`, nên `api.get('/products')` gọi GET `/api/products`. API trả JSON; không cần lấy API ngoài.

Nếu máy chưa có thư viện và được phép cài, chạy `npm.cmd ci` tại thư mục có `package.json`. Lỗi “running scripts is disabled” thì dùng `npm.cmd`. Lỗi “vite is not recognized” thì kiểm tra thư mục; nếu vẫn thiếu thư viện, báo giám thị. Cổng 3001 bận thì dừng tab API cũ bằng `Ctrl+C`. Lỗi Network Error: kiểm tra tab API. `Ctrl+C` cũng dùng để dừng Vite.

Muốn kiểm tra API riêng, mở tab thứ ba và gõ:

```powershell
Invoke-RestMethod http://localhost:3001/api/categories
Invoke-RestMethod 'http://localhost:3001/api/products?page=1&limit=10'
```

Trên macOS dùng `curl`. Trong trình duyệt nhấn F12 → **Network** → lọc `Fetch/XHR`; nhìn Method, URL, Query String và Response. Khi thử lỗi/chậm, dừng tab API rồi chạy `npm.cmd run api:loi` hoặc `npm.cmd run api:cham`; sau đó đổi lại `npm.cmd run api`.

## 2. Kiến thức tối thiểu phải hiểu trước khi gõ code

**JavaScript — xem ví dụ trong [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx) và [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx):**

- `const` tạo biến không gán lại; `let` dành cho biến cần đổi.
- Object `{ name: 'A', price: 100 }` chứa các trường; array `[a, b]` chứa nhiều phần tử.
- `products.map(p => <ProductRow key={p.id} product={p} />)` biến mỗi sản phẩm thành một dòng. Xem [ProductTable.jsx](officemart_admin/src/components/ProductTable.jsx).
- `products.filter(p => p.id !== id)` tạo mảng mới bỏ một sản phẩm.
- `...old` sao chép các trường cũ. `setForm(old => ({ ...old, [e.target.name]: e.target.value }))` chỉ thay ô đang nhập.
- `===` so sánh nghiêm ngặt; `?.` truy cập an toàn khi dữ liệu có thể thiếu; `??` lấy giá trị dự phòng.

**React — mở [App.jsx](officemart_admin/src/App.jsx), [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx), [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx):**

- Component là hàm trả JSX. `props` là dữ liệu cha truyền xuống, ví dụ `ProductTable({ products })`.
- `state` là dữ liệu có thể đổi và làm màn hình vẽ lại, ví dụ `const [saving, setSaving] = useState(false)`.
- `onClick={() => doThing(id)}` chờ bấm mới chạy; `onClick={doThing(id)}` gọi ngay khi render.
- `useEffect(() => { ... }, [page])` chạy sau render và khi `page` đổi. Hàm `return` trong effect dọn timer/request.
- Form dùng `value` và `onChange` để React giữ giá trị. `e.preventDefault()` ngăn browser tải lại trang khi submit.
- `async/await` chờ API; `try/catch/finally` xử lý thành công, lỗi, rồi mở lại nút.

**Router và Axios — đối chiếu [App.jsx](officemart_admin/src/App.jsx), [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx) và [axiosClient.js](officemart_admin/src/api/axiosClient.js):**

- `Routes` chọn trang theo URL. `useNavigate()` chuyển trang sau khi bấm/lưu.
- `useParams()` lấy `id` từ `/products/:id/edit` dưới dạng chuỗi.
- `useSearchParams()` đọc và ghi phần `?q=...&page=...`.
- `res.data` là body API; `err.response?.status` là mã 400/404/409/500; `err.response?.data?.message` là thông báo server.
- `Number('')` bằng `0`, nên kiểm tra chuỗi rỗng **trước** khi kiểm tra giá/tồn kho. `Number.isInteger(Number(stock))` kiểm tra tồn kho nguyên.
- `/^[A-Z]{3}-\d{4}$/` nghĩa là đúng ba chữ hoa, dấu gạch và bốn chữ số. Xem hàm `validate` trong [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx).

## 3. Pha 1, phút 0–90: tự làm 4.1 và 4.2

**Ranh giới các file theo pha:** Bản mã trong thư mục hiện là **kết quả cuối sau P3**, không phải ảnh chụp P1/P2. Ở P1, tự tạo [App.jsx](officemart_admin/src/App.jsx), [ProductTable.jsx](officemart_admin/src/components/ProductTable.jsx), [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx), [App.css](officemart_admin/src/App.css) và truyền 8 sản phẩm từ [sample.js](officemart_admin/src/data/sample.js). Ở P2, tiếp tục sửa App/CSS/Row và tự tạo [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx), [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx) để gọi API và làm CRUD. Chỉ **sau phút 90**, ở P3 mới bổ sung tìm kiếm, lọc, phân trang, URL trong `ProductList.jsx` và tạo [useProductSearch.js](officemart_admin/src/hooks/useProductSearch.js) để huỷ request cũ. [useProductSearch_ai.js](officemart_admin/src/ai/useProductSearch_ai.js) là file đề cho để phản biện, không sửa.

| Thời gian | Việc cần hoàn thành | Mốc tự kiểm |
|---|---|---|
| 0–10 | Đọc đề, chạy hai terminal, xem [mockup](officemart_admin/public/mockup/desktop.png), nhận diện [sample.js](officemart_admin/src/data/sample.js) và API | Trang mở được, API trả JSON |
| 10–30 | 4.1: layout, bảng, hai component, định dạng và CSS mobile | 8 dòng mẫu; chạy `npm.cmd run tu-kiem-tra` |
| 30–35 | Commit `P1:` | `git log --oneline -1` có P1 |
| 35–53 | 4.2.1: thay mẫu bằng GET API, loading/lỗi/rỗng/thử lại | 10 dòng, thử `api:loi` |
| 53–72 | Form thêm và sửa, validate, POST/PUT, 409/404 | Submit trống không gửi request |
| 72–82 | Xoá với dialog, toast; thử mobile và các lỗi | Huỷ không gửi DELETE |
| 82–90 | Điền [bai_lam.md](bai_lam.md), commit/push P2, nộp mã commit | Portal nhận mã trước phút 90 |

### 4.1: dựng đúng mockup

**Bước 1 — bố cục và đường dẫn: mở [App.jsx](officemart_admin/src/App.jsx).**

- Đặt header có chữ `OfficeMart Admin`.
- Đặt `h1` “Sản phẩm” và nút `data-testid="add-button"` bên trong `main`.
- Route `/` chuyển sang `/products`.
- Riêng giai đoạn 4.1, truyền `sampleProducts` từ [sample.js](officemart_admin/src/data/sample.js) vào bảng. Sau khi hoàn thành 4.1 mới thay bằng dữ liệu API. Bản mã tham khảo hiện đã ở giai đoạn cuối nên danh sách đang lấy API.

**Bước 2 — bảng: mở [ProductTable.jsx](officemart_admin/src/components/ProductTable.jsx) và [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx).**

- `ProductTable` nhận prop `{ products }`;
- dùng `products.map(...)` để tạo từng `ProductRow`. `ProductRow` nhận `{ product }`.
- Dùng `table`, `thead`, `tbody` và đúng 7 cột: **Tên, SKU, Danh mục, Giá, Tồn kho, Trạng thái, Thao tác**.
- Mỗi dòng có `data-testid="product-row"`. Nút Sửa/Xoá có `edit-button`/`delete-button`.
- Tên danh mục lấy từ `categoryNames[product.category]` trong [sample.js](officemart_admin/src/data/sample.js).

**Bước 3 — định dạng: kiểm tra [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx).**

- Giá dùng `new Intl.NumberFormat('vi-VN').format(product.price)` rồi thêm ` ₫`. Ví dụ `1290000` thành `1.290.000 ₫`.
- `stock === 0` hiện “Hết hàng” màu đỏ.
- `active` hiện nhãn “Đang bán” nền xanh; `inactive` hiện “Ngừng bán” nền xám. Nhãn có `data-testid="product-status"`.

**Bước 4 — giao diện: xem [desktop.png](officemart_admin/public/mockup/desktop.png), [mobile.png](officemart_admin/public/mockup/mobile.png), rồi sửa [App.css](officemart_admin/src/App.css).**

- Desktop: nền xám nhạt, header đỏ cao gần 48px, nội dung rộng khoảng 1070px, bảng trắng, viền hàng mỏng.
- Mobile dưới 768px: lề nội dung khoảng 16px; ẩn `thead`; cho `table`, `tbody`, `tr`, `td` thành `display:block`. Mỗi `tr` là một thẻ trắng bo góc.
- Mỗi `td` dùng `display:flex; justify-content:space-between`. Trong [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx), thêm `data-label` cho ô; CSS `td::before { content: attr(data-label) }` hiện tên trường bên trái.
- Mở DevTools ở 375px, cuộn đến cuối 8 thẻ. Nếu có thanh ngang, kiểm tra `width`, `min-width`, padding và `box-sizing:border-box` trong [App.css](officemart_admin/src/App.css).

### 4.2: thay dữ liệu mẫu bằng API và CRUD

**Bước 1 — tải danh sách: mở [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx), [useProductSearch.js](officemart_admin/src/hooks/useProductSearch.js) và [axiosClient.js](officemart_admin/src/api/axiosClient.js).**

- Gọi `api.get('/products', { params: { page: 1, limit: 10 } })`. `res.data` có `{ data, total }`, nên bảng nhận `res.data.data`.
- Trước request hiện `loading`; thành công lưu data; thất bại hiện **message server** và nút Thử lại; không có sản phẩm hiện `empty-state`.
- Cho state `retry` tăng khi bấm Thử lại để effect chạy lại. Kiểm tra từng trạng thái bằng API thường, `api:loi` và bộ dữ liệu rỗng.

**Bước 2 — form thêm: mở [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx) và route trong [App.jsx](officemart_admin/src/App.jsx).**

- Nút thêm mở `/products/new`. Form có `name`, `sku`, `category`, `price`, `stock`, `status`; mỗi ô có `id`, `name` và `label htmlFor` trùng nhau.
- Lấy option danh mục từ GET `/categories`; status mặc định `active`.
- Trong hàm `validate`, `trim()` tên rồi kiểm tra 3–100 ký tự; SKU đúng regex; category đã chọn; price > 0; stock là số nguyên ≥ 0.
- Tạo object `errors` theo tên trường. Hiện lỗi ngay dưới ô với `data-testid="field-error-name"` và các tên tương ứng. Có lỗi thì `return` **trước POST**.

**Bước 3 — gửi form: tiếp tục trong [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx), kiểm tra toast ở [App.jsx](officemart_admin/src/App.jsx).**

- Nút lưu có `type="submit"`, `data-testid="submit-button"`; đặt `saving=true` khi gửi, disabled nút và chặn thêm ở đầu hàm submit.
- API 409: lấy message server đặt vào lỗi `sku`, giữ nguyên dữ liệu trong form.
- POST thành công: `navigate('/products')`, hiện toast “Đã thêm sản phẩm”. API sắp xếp mới nhất trước nên dữ liệu mới ở đầu.

**Bước 4 — sửa: mở [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx), [App.jsx](officemart_admin/src/App.jsx), [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx).**

- Nút Sửa mở `/products/:id/edit`. `useParams()` lấy id, GET `/products/:id` rồi điền sẵn form.
- Dùng lại `validate`, sau đó PUT `/products/:id`. API 404 hiện “Không tìm thấy sản phẩm”.

**Bước 5 — xoá: mở [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx).**

- Bấm Xoá chỉ đặt sản phẩm vào state `deleting`, rồi hiện dialog tự làm.
- `confirm-no` đóng dialog và không gọi API; `confirm-yes` mới DELETE.
- Sau 204, tải lại danh sách và hiện toast. Không dùng `window.confirm`/`alert`.

**Bước 6 — nộp P2: điền [bai_lam.md](bai_lam.md), kiểm tra [.gitignore](officemart_admin/.gitignore).**

Từ **thư mục gốc repository**, chạy lần lượt:

```powershell
git add bai_lam.md officemart_admin
git commit -m "P2: CRUD san pham"
git push
git log --oneline -1
```

Nộp **mã commit P2** lên Portal trước phút 90. Commit P1 cần làm trước P2. Không đưa `node_modules` lên repository. Thông tin cá nhân, link repo, mã commit và nhật ký trong [bai_lam.md](bai_lam.md) phải đúng thực tế.

## 4. Pha 2, phút 90–150: 4.3 và AI có kiểm soát

| Thời gian | Việc | Kiểm tra |
|---|---|---|
| 90–107 | Search + debounce 400ms, filter category/status | Gõ liền `ban`: một GET sau khi ngừng gõ |
| 107–118 | Phân trang và URL | `2 / 12`; Back/Forward đúng |
| 118–133 | Thử [hook AI gốc](officemart_admin/src/ai/useProductSearch_ai.js) bằng `api:cham`, viết [hook sửa](officemart_admin/src/hooks/useProductSearch.js) | Request cũ bị abort |
| 133–145 | Thử lỗi/rỗng/CRUD lại; viết 4.3.4, nhật ký AI trong [bai_lam.md](bai_lam.md) | Có bằng chứng cụ thể |
| 145–150 | Commit `P3:`, push, nộp link repo | Repo mở được, đủ file |

**Bước 1 — tìm kiếm, lọc: mở [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx).**

- Giữ từ khoá nhập trong state `typed`. Sau `setTimeout(..., 400)` mới ghi `q` lên URL; `clearTimeout` huỷ timer cũ. Gõ `b`, `ba`, `ban` liên tiếp chỉ gửi một GET sau khi ngừng gõ.
- Danh mục lấy từ API. Select trạng thái có ba lựa chọn: Tất cả, Đang bán, Ngừng bán.
- Đổi q/category/status thì xoá `page` để quay về trang 1.

**Bước 2 — phân trang và URL: vẫn ở [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx), đối chiếu request trong [useProductSearch.js](officemart_admin/src/hooks/useProductSearch.js).**

- Đọc `page` từ URL, gọi GET với `limit:10`, tính `pages = Math.ceil(total/10)`. `page-current` hiện dạng `2 / 12`; khoá Prev/Next ở biên.
- Dùng `URLSearchParams` để giữ các bộ lọc khác khi đổi một giá trị. Mở thẳng URL có q/category/status/page và thử Back/Forward: ô nhập, select, số trang, bảng phải khớp URL.
- `page=-3` hoặc chữ không phải số xử lý thành 1; trang quá lớn đưa về trang cuối sau khi biết `total`; từ khoá chỉ có khoảng trắng coi như rỗng.

**Bước 3 — phản biện mã AI: đọc [useProductSearch_ai.js](officemart_admin/src/ai/useProductSearch_ai.js), sửa trong [useProductSearch.js](officemart_admin/src/hooks/useProductSearch.js), dùng hook sửa ở [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx).**

- Hook AI gốc gửi request mới khi tham số đổi nhưng **không dọn request cũ**.
- Chạy `api:cham`, tìm `ban` (GET trễ 2,5 giây). Sau khi request đã gửi, xoá và nhập từ khoá khác (GET trễ 0,1 giây). Kết quả mới về trước, rồi kết quả `ban` về sau ghi đè bảng: ô tìm kiếm và bảng lệch nhau.
- Trong hook sửa, tạo `const controller = new AbortController()`, gọi `api.get('/products', { params, signal: controller.signal })`, rồi `return () => controller.abort()` trong effect.
- Trong `catch`, bỏ qua lỗi huỷ bằng `axios.isCancel(err)`. Mở Network kiểm tra request `ban` bị huỷ, bảng cuối khớp từ khoá mới.
- Viết bước tái hiện, kết quả sai, kết quả đúng và nguyên nhân vào mục 4.3.4 của [bai_lam.md](bai_lam.md).

AI chỉ được dùng từ phút 90. Hai prompt vừa sức cho fresher, có thể chép **sau mốc này**:

1. “Trong React 18, giải thích bằng ví dụ ngắn tại sao hai GET tìm kiếm trả về ngược thứ tự làm danh sách sai. Gợi ý sửa custom hook bằng `AbortController` và axios có `signal`; đừng sửa file AI gốc. Tôi sẽ tự đọc và thử bằng `api:cham`.”
2. “Review riêng logic đồng bộ `useSearchParams` với input tìm kiếm debounce 400ms, lọc danh mục/trạng thái và page. Chỉ ra trường hợp Back/Forward, trang âm, trang quá lớn; nêu cách thử thủ công. Không viết lại toàn bộ app.”

Nếu còn thời gian, prompt 3: “Cho checklist kiểm thử thủ công POST/PUT/DELETE với API 400/404/409, disabled khi lưu, toast và 375px. Mỗi kiểm thử nêu thao tác và kết quả mong đợi.”

Sau mỗi lần: đọc ý AI, quyết định giữ/sửa/loại, chạy thử, ghi **đúng prompt thực gửi, file chịu ảnh hưởng, lý do và bằng chứng thật** vào bảng 4.3.5 của [bai_lam.md](bai_lam.md). Không bịa hai lần dùng AI. Nếu không dùng AI thì ghi đúng “Không sử dụng AI trong Pha 2”.

## 5. Khi giảng viên hỏi hoặc yêu cầu sửa chức năng nhỏ

Trả lời theo chuỗi **URL → state/effect → request → render**:

| Câu hỏi | Trả lời ngắn | Mở file kiểm tra |
|---|---|---|
| Vì sao search chờ 400ms? | `typed` đổi từng phím; timer cũ bị huỷ; sau 400ms ghi q lên URL rồi GET. | [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx) |
| Vì sao cần AbortController? | Request chậm cũ có thể ghi đè kết quả mới; cleanup huỷ nó. | [useProductSearch.js](officemart_admin/src/hooks/useProductSearch.js) |
| Vì sao form trống không gửi? | `validate` tạo errors rồi `return` trước axios. | [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx) |
| Vì sao toast còn sau navigate? | State toast ở Layout bao quanh các route. | [App.jsx](officemart_admin/src/App.jsx) |
| Vì sao mobile không cuộn ngang? | Mỗi `tr` thành thẻ, các `td` xếp nhãn và giá trị theo chiều dọc. | [App.css](officemart_admin/src/App.css), [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx) |

Khi được yêu cầu đổi nhỏ, tìm đúng file:

| Cần đổi | File cần mở |
|---|---|
| Nhãn hoặc cột | [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx), [ProductTable.jsx](officemart_admin/src/components/ProductTable.jsx) |
| Quy tắc form | Hàm `validate` trong [ProductForm.jsx](officemart_admin/src/pages/ProductForm.jsx) |
| Số sản phẩm mỗi trang | `limit` ở [useProductSearch.js](officemart_admin/src/hooks/useProductSearch.js) và phép chia trang ở [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx) |
| Tìm kiếm hoặc bộ lọc | [ProductList.jsx](officemart_admin/src/pages/ProductList.jsx) |
| Màu, khoảng cách, responsive | [App.css](officemart_admin/src/App.css) |

Ví dụ giảng viên yêu cầu đổi cảnh báo tồn kho từ `0` sang `<5`: sửa điều kiện render trong [ProductRow.jsx](officemart_admin/src/components/ProductRow.jsx), thử `stock=0,3,5`. Nêu dữ liệu vào/ra, sửa một chỗ, rồi thử cả hành vi cũ và mới.

## 6. Từ intern → fresher → junior: tiêu chí tự luyện

| Mức | Tự làm và tự giải thích được |
|---|---|
| Intern | Dựng bảng, props, state, form có label; biết đọc Console. |
| Fresher | Nối API, xử lý loading/error/empty/400/409, route và responsive; sửa thay đổi nhỏ. |
| Junior | Nhận diện race condition, xử lý URL và dữ liệu biên, thử nhiều bộ dữ liệu; giải thích lựa chọn. |

Mỗi mức đều cần thử trong trình duyệt. `npm.cmd run tu-kiem-tra` chỉ kiểm tra một phần 4.1; hãy tự thử form, API lỗi/chậm, mobile và Back/Forward theo các bước trên.
