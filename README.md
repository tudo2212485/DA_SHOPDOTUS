# DOTUS Store - Website ban hang streetwear

DOTUS Store la ung dung web full-stack ban hang thoi trang streetwear. Du an su dung Next.js App Router, TypeScript, Tailwind CSS va Supabase de xay dung storefront cho khach hang, gio hang, dat hang, tra cuu hoa don, trang admin quan ly san pham/don hang va AI Stylist tu van outfit theo catalog san pham con hang.

## Ten de tai

**Xay dung website thuong mai dien tu ban hang thoi trang DOTUS Store su dung Next.js va Supabase**

## Cong nghe

- Next.js 14 App Router, React Server Components, Client Components, Server Actions
- TypeScript
- Tailwind CSS
- Zustand persist cho gio hang
- Supabase Auth, PostgreSQL Database, Row Level Security, Storage
- PostgreSQL RPC cho dat hang va xu ly don hang
- Gemini API cho tinh nang AI Stylist
- Docker va Docker Compose
- Playwright smoke test

## Chuc nang chinh

### Storefront

- Xem trang chu, danh sach san pham va chi tiet san pham.
- Tim kiem, loc san pham theo dong san pham, loai san pham, gia va tinh trang ton kho.
- Chon size, them vao gio hang.
- Khi them vao gio hang co toast thong bao va hieu ung anh san pham bay vao icon gio hang.
- Gio hang duoc luu tren trinh duyet bang Zustand persist.
- Dat hang voi ten nguoi nhan, so dien thoai, dia chi, ghi chu va phuong thuc thanh toan.
- Tra cuu lich su don hang va in hoa don.

### Xac thuc va phan quyen

- Khach hang dang ky, dang nhap, dang xuat bang Supabase Auth.
- Customer khong thay link Admin va bi redirect ve dashboard neu truy cap `/admin`.
- Admin duoc xac dinh bang role `admin` trong bang `profiles`.

### Admin Panel

- Dashboard tong quan van hanh.
- Quan ly san pham: them, sua, an/hien, xoa san pham.
- Upload anh san pham len Supabase Storage bucket `product-images`.
- Quan ly don hang: xem danh sach, loc theo trang thai, cap nhat trang thai.
- Ton kho chi giam khi admin xac nhan don hang sang trang thai da thanh toan/dang giao.
- Don bi huy duoc xu ly hoan kho theo logic RPC.

### AI Stylist

- Tu van outfit theo dip mac, ngan sach, thoi tiet va catalog san pham con hang.
- Tu van size theo chieu cao, can nang va form mac.
- Hieu intent mua hang, vi du: "minh muon mua Boxy Tee Core White" hoac "mua mon so 1".
- Khi goi y san pham, chatbot chi tra ten san pham, gia va tong tam tinh; khong tra URL dai.
- Co fallback tra loi khi Gemini API loi hoac chua cau hinh.

## Cau truc thu muc

```text
app/                 Route, page, layout, Server Actions va API route
components/          UI, layout, product, cart, admin, AI Stylist
contexts/            Cart context va Zustand store
lib/                 Supabase client/server, helper catalog, order, admin
scripts/             Smoke test Playwright
supabase/migrations/ SQL migration schema, RLS, RPC
supabase/seed/       Du lieu mau san pham
types/               TypeScript types
public/              Static assets va QA report khi chay smoke test
docs/                Tai lieu bao cao, diagram, checklist
```

## Cau hinh moi truong

Tao file `.env.local` tu `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
AI_PROVIDER=gemini
SUPABASE_DB_URL=
QA_ADMIN_EMAIL=admin@dotus.test
QA_ADMIN_PASSWORD=
```

Ghi chu:

- `NEXT_PUBLIC_SUPABASE_URL` va `NEXT_PUBLIC_SUPABASE_ANON_KEY` dung cho app.
- `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_PROVIDER` dung cho AI Stylist.
- `SUPABASE_DB_URL` chi dung cho migration/kiem thu database tu may local, khong dua len frontend.
- Khong commit `.env.local` len GitHub.

## Chay local

```bash
npm install
npm run dev
```

Mo ung dung tai:

```text
http://localhost:3000
```

Neu vua chay `npm run build` trong luc dev server dang mo, nen tat va chay lai `npm run dev` de tranh Next dev server bi lech static chunks.

## Kiem thu

```bash
npm run typecheck
npm run build
npm run qa:smoke
```

Smoke test kiem tra cac luong chinh:

- Render homepage va products page.
- Dang nhap customer/admin.
- Customer khong truy cap duoc admin.
- Admin tao san pham.
- Storefront hien san pham moi.
- Them gio hang va dat hang.
- Customer xem don trong dashboard.
- Admin xem va cap nhat trang thai don.
- Kiem tra RPC `place_order`.

Bao cao smoke test duoc xuat tai:

```text
public/qa-report.html
public/qa-report.json
```

## Chay bang Docker

Docker Compose doc bien moi truong tu shell hoac file `.env`. Neu muon dung `.env.local`, chay:

```bash
docker compose --env-file .env.local up --build
```

Hoac tao file `.env` tu `.env.example`, sau do chay:

```bash
docker compose up --build
```

Ung dung chay tai:

```text
http://localhost:3000
```

## Supabase

Migration nam trong:

```text
supabase/migrations
```

Cac bang chinh:

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

Khi cai moi Supabase, chay lan luot cac file SQL trong `supabase/migrations`, sau do chay seed trong `supabase/seed` neu can du lieu mau.

## Trien khai

Co the trien khai tren Vercel:

1. Push source code len GitHub.
2. Import repo vao Vercel.
3. Khai bao cac bien moi truong Supabase va Gemini trong Vercel Project Settings.
4. Dam bao SQL migrations da duoc chay tren Supabase production.
5. Deploy.

## Goi nop bai

Thu muc `submission/` tren may local gom cac file nop LMS:

- `2212485_DOTUS_BaoCaoToanVan.pdf`
- `2212485_DOTUS_SourceCode.zip`
- `2212485_DOTUS_Supabase_SQL.zip`
- `2212485_DOTUS_PhuLuc_Prompts.xlsx`

Thu muc nay khong commit len GitHub.

## Tai khoan demo

- Admin: `admin@dotus.test`
- Khach hang: tao moi tren trang dang nhap/dang ky hoac dung tai khoan QA trong smoke test.

Khong commit mat khau tai khoan demo len GitHub. Khi nop bai, ghi mat khau trong LMS hoac noi rieng neu giang vien can truy cap.
