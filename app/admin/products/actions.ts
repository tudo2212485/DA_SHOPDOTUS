"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { normalizeCategory } from "@/lib/catalog";
import { isAdminUser } from "@/lib/admin";
import type { ProductLine } from "@/lib/product-taxonomy";
import { createClient } from "@/lib/supabase/server";

export type ProductActionResult = {
  ok: boolean;
  message: string;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const isAdmin = await isAdminUser(supabase, user);

  return { supabase, user, isAdmin };
}

function readGender(value: FormDataEntryValue | null): "nam" | "nu" | "unisex" {
  const gender = String(value ?? "nam");
  if (gender === "nu" || gender === "unisex") return gender;
  return "nam";
}

function readLine(value: FormDataEntryValue | null): ProductLine {
  const line = String(value ?? "Graphic Tee");
  return line as ProductLine;
}

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toProductErrorMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("duplicate") || lower.includes("unique")) {
    return "Tên/slug sản phẩm đã tồn tại. Vui lòng đổi tên sản phẩm.";
  }

  if (lower.includes("row-level security") || lower.includes("permission")) {
    return "Tài khoản hiện tại không có quyền thao tác sản phẩm này.";
  }

  if (lower.includes("violates check constraint")) {
    return "Dữ liệu sản phẩm không hợp lệ. Vui lòng kiểm tra giá và tồn kho.";
  }

  return "Không thể lưu sản phẩm lúc này. Vui lòng kiểm tra dữ liệu và thử lại.";
}

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const category = normalizeCategory(String(formData.get("category") ?? ""));
  const imageUrl = String(formData.get("image_url") ?? "");
  const imageHoverUrl = String(formData.get("image_hover_url") ?? "");
  const line = readLine(formData.get("line"));
  const gender = readGender(formData.get("gender"));
  const price = Number(formData.get("price") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);

  if (!name.trim()) {
    return { ok: false, message: "Vui lòng nhập tên sản phẩm." };
  }

  if (!imageUrl.trim()) {
    return { ok: false, message: "Vui lòng thêm hoặc upload ảnh chính cho sản phẩm." };
  }

  if (!isValidImageUrl(imageUrl)) {
    return { ok: false, message: "URL ảnh chính không hợp lệ. Vui lòng dùng link bắt đầu bằng http:// hoặc https://." };
  }

  if (imageHoverUrl && !isValidImageUrl(imageHoverUrl)) {
    return { ok: false, message: "URL ảnh hover không hợp lệ." };
  }

  if (Number.isNaN(price) || price <= 0) {
    return { ok: false, message: "Vui lòng nhập giá sản phẩm lớn hơn 0." };
  }

  if (Number.isNaN(stock) || stock < 0) {
    return { ok: false, message: "Vui lòng nhập tồn kho từ 0 trở lên." };
  }

  const { error } = await supabase.from("products").insert({
    owner_id: user.id,
    name,
    slug: toSlug(name),
    description,
    category,
    image_url: imageUrl,
    image_hover_url: imageHoverUrl || null,
    line,
    gender,
    price,
    stock,
    is_active: true,
  });

  if (error) {
    return { ok: false, message: toProductErrorMessage(error.message) };
  }

  revalidatePath("/");
  revalidatePath("/admin/products");

  return { ok: true, message: "Đã tạo sản phẩm thành công." };
}

export async function updateProduct(formData: FormData): Promise<ProductActionResult> {
  const { supabase, user, isAdmin } = await requireUser();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const category = normalizeCategory(String(formData.get("category") ?? ""));
  const imageUrl = String(formData.get("image_url") ?? "");
  const imageHoverUrl = String(formData.get("image_hover_url") ?? "");
  const line = readLine(formData.get("line"));
  const gender = readGender(formData.get("gender"));
  const price = Number(formData.get("price") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);
  const isActive = String(formData.get("is_active") ?? "true") === "true";

  if (!id) {
    return { ok: false, message: "Không tìm thấy sản phẩm cần cập nhật." };
  }

  if (!name.trim()) {
    return { ok: false, message: "Vui lòng nhập tên sản phẩm." };
  }

  if (!imageUrl.trim()) {
    return { ok: false, message: "Vui lòng thêm ảnh chính cho sản phẩm." };
  }

  if (!isValidImageUrl(imageUrl)) {
    return { ok: false, message: "URL ảnh chính không hợp lệ. Vui lòng dùng link bắt đầu bằng http:// hoặc https://." };
  }

  if (imageHoverUrl && !isValidImageUrl(imageHoverUrl)) {
    return { ok: false, message: "URL ảnh hover không hợp lệ." };
  }

  if (Number.isNaN(price) || price <= 0) {
    return { ok: false, message: "Vui lòng nhập giá sản phẩm lớn hơn 0." };
  }

  if (Number.isNaN(stock) || stock < 0) {
    return { ok: false, message: "Vui lòng nhập tồn kho từ 0 trở lên." };
  }

  let query = supabase
    .from("products")
    .update({
      name,
      slug: toSlug(name),
      description,
      category,
      image_url: imageUrl,
      image_hover_url: imageHoverUrl || null,
      line,
      gender,
      price,
      stock,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (!isAdmin) {
    query = query.eq("owner_id", user.id);
  }

  const { error } = await query.select("id").single();

  if (error) {
    return { ok: false, message: toProductErrorMessage(error.message) };
  }

  revalidatePath("/");
  revalidatePath(`/product/${id}`);
  revalidatePath("/admin/products");

  return { ok: true, message: "Đã cập nhật sản phẩm thành công." };
}

export async function deleteProduct(formData: FormData): Promise<ProductActionResult> {
  const { supabase, user, isAdmin } = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { ok: false, message: "Không tìm thấy sản phẩm cần xóa." };
  }

  let query = supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (!isAdmin) {
    query = query.eq("owner_id", user.id);
  }

  const { error } = await query.select("id").single();

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23503"
          ? "Sản phẩm đã nằm trong đơn hàng nên không thể xóa vĩnh viễn. Hãy bấm Ẩn để không hiển thị ở trang khách hàng."
          : "Không thể xóa sản phẩm này. Vui lòng kiểm tra quyền quản trị hoặc thử chuyển trạng thái sang Ẩn.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/products");

  return { ok: true, message: "Đã xóa sản phẩm." };
}
