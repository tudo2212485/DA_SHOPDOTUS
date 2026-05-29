# Phu luc AI prompts

Quy che yeu cau co minh chung su dung AI tool, toi thieu tren 5 prompts. Khi nop bai, co the dua phu luc nay vao cuoi bao cao hoac nop rieng tren LMS.

## Prompt 1 - Doc quy che va lap checklist

**Muc dich:** Xac dinh cac tieu chi bat buoc cua do an cuoi ky.

**Prompt da dung:**

> Doc file PDF quy che thi cuoi ky va lap checklist cac tieu chi bat buoc, sau do doi chieu voi du an Next.js + Supabase hien tai.

**Ket qua:** Tao checklist gom Next.js App Router, TypeScript, Supabase Auth/DB/Storage, RLS, CRUD, Docker, Deployment, GitHub, bao cao va phu luc AI.

## Prompt 2 - Thiet ke database va RLS

**Muc dich:** Tao schema phu hop cho website ban hang.

**Prompt da dung:**

> Thiet ke schema Supabase cho website ban hang gom products, orders, order_items, profiles, co RLS cho customer va admin.

**Ket qua:** Tao migration cho cac bang chinh, khoa ngoai, check constraint, policy va trigger tao profile.

## Prompt 3 - Debug loi admin/customer role

**Muc dich:** Khach hang khong duoc thay nut Admin va khong vao trang Admin.

**Prompt da dung:**

> Sua logic hien thi nut Admin: chi tai khoan co role admin moi thay nut Admin va vao duoc /admin; customer phai bi redirect ve dashboard.

**Ket qua:** Them ham kiem tra role admin, sua header va admin layout.

## Prompt 4 - Hoan thien dat hang va ton kho

**Muc dich:** Xu ly dat hang dung nghiep vu ban hang.

**Prompt da dung:**

> Kiem thu flow khach hang: dang nhap, xem hang, them gio hang, dat hang, dien thong tin, tao hoa don; admin xac nhan don thi moi tru ton kho.

**Ket qua:** Bo sung RPC `place_order`, `admin_update_order_status`, form checkout va logic ton kho chi giam khi admin xac nhan.

## Prompt 5 - Cai thien giao dien admin san pham

**Muc dich:** Trang san pham admin gon, de dung, khong hien qua nhieu truong.

**Prompt da dung:**

> Sua trang admin/products: chi hien danh sach san pham gom anh, ten, ton kho, trang thai; co nut them san pham moi, nut chinh sua mo modal, nut an/hien tren storefront va nut luu.

**Ket qua:** Doi giao dien san pham thanh danh sach quan ly gon, modal tao/sua, upload anh, validate loi than thien.

## Prompt 6 - Kiem thu tu dong

**Muc dich:** Dam bao flow chinh khong bi hong truoc khi nop.

**Prompt da dung:**

> Viet smoke test tu dong bang Playwright cho flow customer/admin va xuat bao cao ket qua ra public/qa-report.html.

**Ket qua:** Tao `scripts/qa-smoke.mjs`, kiem thu render homepage, products, login customer/admin, gio hang, checkout, admin xem/cap nhat don.

## Prompt 7 - Debug Supabase migration

**Muc dich:** Sua loi database production nhu missing column, RLS recursion, function missing.

**Prompt da dung:**

> Kiem tra Supabase production, ap migration thieu cho order_code, invoice info, admin RPC va sua loi infinite recursion trong policy orders.

**Ket qua:** Ap migration 008-011, xac nhan schema va RPC dung tren Supabase.

## Prompt 8 - Tich hop Gemini API cho chatbot

**Muc dich:** Tao chatbot AI Stylist co the goi y set do dua tren san pham that trong Supabase.

**Prompt da dung:**

> Chuyen chatbot AI Stylist tu OpenAI sang Gemini API, doc catalog san pham active con hang tu Supabase va fallback neu Gemini bi qua tai.

**Ket qua:** Chatbot dung `GEMINI_API_KEY`, goi Gemini API tren server, khong lo key ra frontend, va van co cau tra loi fallback theo catalog khi API loi.

## Prompt 9 - Dong goi Docker

**Muc dich:** Dat tieu chi Dockerfile + Docker Compose.

**Prompt da dung:**

> Kiem tra Dockerfile/docker-compose theo quy che va chuyen sang production build phu hop de chay bang docker compose up.

**Ket qua:** Cap nhat Dockerfile multi-stage va docker-compose production.

## Ghi chu khi bao cao van dap

Khi giang vien hoi ve AI, khong noi "AI lam het". Nen trinh bay:

- AI duoc dung nhu tro ly lap trinh de goi y, debug va tao checklist.
- Sinh vien van chiu trach nhiem doc code, chay test, hieu schema/RLS/Docker.
- Cac ket qua AI deu duoc kiem chung bang lint, typecheck, build va smoke test.
