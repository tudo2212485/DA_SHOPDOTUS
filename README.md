# DOTUS - Website ban hang streetwear

DOTUS la ung dung web full-stack ban hang thoi trang, xay dung bang Next.js App Router, TypeScript, Tailwind CSS va Supabase. Du an co storefront cho khach hang, gio hang, dat hang, tra cuu hoa don va trang admin rieng de quan ly san pham/don hang.

## Cong nghe

- Next.js App Router, Server Components, Client Components, Server Actions
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, Row Level Security, Storage
- Docker va Docker Compose
- OpenAI API cho tinh nang AI stylist

## Chuc nang chinh

- Khach hang dang ky, dang nhap, dang xuat bang Supabase Auth.
- Xem danh sach san pham, tim kiem, loc theo danh muc/gia/tinh trang ton kho.
- Xem chi tiet san pham, chon size, them vao gio hang.
- Dat hang voi thong tin nguoi nhan, so dien thoai, dia chi, ghi chu va phuong thuc thanh toan.
- Tra cuu lich su don hang va in hoa don.
- Admin dang nhap vao giao dien rieng.
- Admin them, sua, an/hien, xoa san pham va upload anh len Supabase Storage.
- Admin xem don hang, loc theo trang thai, cap nhat trang thai don.
- Ton kho chi giam khi admin xac nhan don hang thanh da thanh toan/dang giao.

## Cau hinh moi truong

Tao file `.env.local` tu `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
SUPABASE_DB_URL=
QA_ADMIN_EMAIL=admin@dotus.test
QA_ADMIN_PASSWORD=
```

`SUPABASE_DB_URL` chi dung cho migration/kiem thu database tu may local, khong dua vao frontend.

## Chay local

```bash
npm install
npm run dev
```

Mo `http://localhost:3000`.

## Kiem thu

```bash
npm run typecheck
npm run lint
npm run build
npm run qa:smoke
```

Bao cao smoke test duoc xuat tai `public/qa-report.html`.

## Chay bang Docker

```bash
docker compose up --build
```

Ung dung chay tai `http://localhost:3000`.

## Supabase

Migration nam trong `supabase/migrations`. Cac bang chinh:

- `profiles`: thong tin nguoi dung va vai tro `customer/admin`.
- `products`: san pham, gia, ton kho, anh, trang thai hien thi.
- `orders`: don hang, ma don, trang thai, thong tin giao hang.
- `order_items`: chi tiet san pham trong don.

Storage bucket:

- `product-images`: luu anh san pham.

RPC quan trong:

- `place_order(items, customer)`: tao don hang.
- `admin_order_rows()`: admin doc danh sach don hang.
- `admin_update_order_status(order_id, status)`: cap nhat trang thai va xu ly ton kho.

## Tai khoan demo

- Admin: `admin@dotus.test`
- Khach hang: tao moi tren trang dang nhap/dang ky hoac dung tai khoan QA trong smoke test.

Khong commit mat khau tai khoan demo len GitHub. Khi nop bai, ghi mat khau trong LMS hoac noi rieng neu giang vien can truy cap.
