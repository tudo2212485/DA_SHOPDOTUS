# De cuong bao cao toan van - DOTUS

Goi y dinh dang theo quy che: PDF, Times New Roman 13, line spacing 1.5, toi thieu 20 trang khong tinh screenshot lon.

## 1. Trang bia

- Truong, khoa, mon hoc: Cac cong nghe moi trong phat trien phan mem.
- Lop: CTK46-PM.
- Ten de tai: Website ban hang streetwear DOTUS.
- Ho ten, ma sinh vien.
- Giang vien huong dan.
- Ngay nop: 29/05/2026.

## 2. Muc luc

Tao tu dong bang Word/Google Docs sau khi viet xong.

## 3. Gioi thieu

- Boi canh: nhu cau ban hang online, quan ly san pham/don hang/tai khoan.
- Muc tieu: xay dung website ban hang full-stack co khach hang va admin.
- Pham vi: san pham thoi trang, gio hang, dat hang, hoa don, quan ly san pham va don hang.

## 4. Cong nghe su dung

- Next.js App Router: route, server component, client component, server action.
- TypeScript: type an toan cho product/order.
- Tailwind CSS: thiet ke giao dien responsive.
- Supabase Auth: dang ky, dang nhap, dang xuat.
- Supabase Database: PostgreSQL, bang products/orders/order_items/profiles.
- Supabase Storage: upload anh san pham.
- RLS: phan quyen khach hang/admin.
- Docker/Docker Compose: dong goi ung dung.
- AI tool: ho tro thiet ke, debug, kiem thu, viet tai lieu.

## 5. Kien truc he thong

Nen chen so do:

- Browser -> Next.js App Router -> Supabase Auth/Database/Storage.
- Admin va customer dung cung backend Supabase nhung khac layout/quyen.
- Server Actions xu ly thao tac nhay cam: tao don, cap nhat san pham, cap nhat trang thai don.

Mo ta cac bang:

- `profiles(id, full_name, avatar_url, role, created_at, updated_at)`.
- `products(id, owner_id, name, slug, description, price, image_url, image_hover_url, category, line, gender, stock, is_active, created_at, updated_at)`.
- `orders(id, user_id, status, total_amount, order_code, receiver_name, receiver_phone, shipping_address, customer_note, payment_method, created_at, updated_at)`.
- `order_items(id, order_id, product_id, quantity, unit_price, selected_size)`.

## 6. Phan tich chuc nang

### 6.1. Authentication

- Dang ky/dang nhap/dang xuat bang Supabase Auth.
- Middleware va layout kiem tra session.
- Tai khoan admin duoc xac dinh qua `profiles.role = 'admin'`.

### 6.2. Storefront khach hang

- Trang chu, danh sach san pham, loc/tim kiem.
- Chi tiet san pham, chon size, them gio hang.
- Gio hang luu o client, tao don qua server action.

### 6.3. Dat hang va hoa don

- Form thong tin nguoi nhan.
- Phuong thuc COD/chuyen khoan.
- RPC `place_order` tao order/order_items.
- Dashboard hien lich su don va nut in hoa don.

### 6.4. Admin san pham

- Them san pham moi.
- Upload anh len Supabase Storage.
- Sua gia, ton kho, mo ta, danh muc, trang thai hien/ẩn.
- Xoa san pham neu chua co rang buoc don hang; san pham da co don thi nen an.

### 6.5. Admin don hang

- Xem danh sach don hang.
- Loc theo trang thai.
- Cap nhat trang thai: cho xu ly, da thanh toan, dang giao, da huy.
- Ton kho giam khi admin xac nhan don sang da thanh toan/dang giao.

### 6.6. RLS va phan quyen

- Khach hang chi xem don cua minh.
- Khach hang khong vao duoc `/admin`.
- Admin xem/cap nhat san pham va don hang.
- Storage cho public read va authenticated upload.

## 7. AI trong phat trien

Tom tat cach dung AI:

- Doc quy che va lap checklist.
- Thiet ke schema Supabase.
- Debug loi RLS recursion, loi missing column, loi image host.
- Cai thien UX admin.
- Tao smoke test tu dong.

Dan sang `docs/phu-luc-ai-prompts.md`.

## 8. Docker va Deployment

- Mo ta Dockerfile multi-stage.
- Lenh chay local bang Docker Compose.
- Quy trinh deploy VPS:
  - Cai Docker/Docker Compose.
  - Clone repo.
  - Tao `.env`.
  - `docker compose up -d --build`.
  - Cau hinh Nginx reverse proxy.
  - Cai SSL bang Certbot hoac Cloudflare.

## 9. Ket qua kiem thu

Chen anh/screenshot:

- `npm run typecheck`.
- `npm run lint`.
- `npm run build`.
- `npm run qa:smoke`.
- Trang `public/qa-report.html`.

## 10. Ket luan va han che

Ket luan:

- Da xay dung duoc website ban hang full-stack voi Supabase, RLS, Storage, Docker.

Han che:

- Chua tich hop thanh toan online that.
- Chua co thong bao email/SMS.
- Chua co phan quyen nhieu cap nhan vien.

Huong phat trien:

- Tich hop VNPay/Momo.
- Email xac nhan don.
- Dashboard thong ke doanh thu nang cao.

## 11. Tai lieu tham khao

- Next.js documentation.
- Supabase documentation.
- Tailwind CSS documentation.
- Docker documentation.
- OpenAI documentation.
