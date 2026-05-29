"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  PackagePlus,
  Pencil,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { createProduct, deleteProduct, updateProduct } from "@/app/admin/products/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STREETWEAR_CATEGORIES, normalizeCategory } from "@/lib/catalog";
import { PRODUCT_LINES } from "@/lib/product-taxonomy";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/product";

type AdminFormProps = {
  products: Product[];
};

type ActionMessage = {
  type: "success" | "error";
  text: string;
} | null;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function ProductAdminForm({ products }: AdminFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden" | "low">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage>(null);
  const [isPending, startTransition] = useTransition();

  const activeProducts = products.filter((product) => product.is_active !== false);
  const hiddenProducts = products.filter((product) => product.is_active === false);
  const lowStockProducts = products.filter((product) => (product.stock ?? 0) <= 3);
  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => normalizeCategory(product.category)).filter(Boolean)),
      ).sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return products.filter((product) => {
      const haystack = `${product.name} ${product.category ?? ""} ${product.line ?? ""}`.toLowerCase();
      if (keyword && !haystack.includes(keyword)) return false;
      if (categoryFilter !== "all" && normalizeCategory(product.category) !== categoryFilter) return false;
      if (statusFilter === "active" && product.is_active === false) return false;
      if (statusFilter === "hidden" && product.is_active !== false) return false;
      if (statusFilter === "low" && (product.stock ?? 0) > 3) return false;
      return true;
    });
  }, [categoryFilter, products, query, statusFilter]);

  function runProductAction(
    action: (formData: FormData) => Promise<{ ok: boolean; message: string }>,
    formData: FormData,
    afterSuccess?: () => void,
  ) {
    setActionMessage(null);
    startTransition(() => {
      void (async () => {
        try {
          const result = await action(formData);
          setActionMessage({
            type: result.ok ? "success" : "error",
            text: result.message,
          });
          if (result.ok) {
            afterSuccess?.();
            router.refresh();
          }
        } catch {
          setActionMessage({
            type: "error",
            text: "Không thể xử lý thao tác này. Vui lòng kiểm tra lại dữ liệu và thử lại.",
          });
        }
      })();
    });
  }

  function toggleVisibility(product: Product) {
    const formData = new FormData();
    formData.set("id", product.id);
    formData.set("name", product.name);
    formData.set("description", product.description ?? "");
    formData.set("category", normalizeCategory(product.category));
    formData.set("line", product.line ?? "Graphic Tee");
    formData.set("gender", product.gender ?? "nam");
    formData.set("price", String(product.price));
    formData.set("stock", String(product.stock ?? 0));
    formData.set("image_url", product.image_url);
    formData.set("image_hover_url", product.image_hover_url ?? "");
    formData.set("is_active", String(product.is_active === false));
    runProductAction(updateProduct, formData);
  }

  function requestDelete(product: Product) {
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xóa "${product.name}"? Nếu sản phẩm đã có trong đơn hàng, hệ thống sẽ không cho xóa để giữ lịch sử hóa đơn.`,
    );

    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", product.id);
    runProductAction(deleteProduct, formData);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Đang hiển thị", value: activeProducts.length, icon: Eye, tone: "bg-emerald-50 text-emerald-600" },
          { label: "Đang ẩn", value: hiddenProducts.length, icon: EyeOff, tone: "bg-neutral-100 text-neutral-600" },
          { label: "Sắp hết hàng", value: lowStockProducts.length, icon: AlertTriangle, tone: "bg-amber-50 text-amber-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">{item.label}</p>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.tone}`}>
                <item.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      {actionMessage ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            actionMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {actionMessage.text}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Sản phẩm trong shop</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Danh sách gọn để kiểm tra nhanh ảnh, tên, tồn kho và trạng thái hiển thị.
              </p>
            </div>
            <Button type="button" onClick={() => setCreating(true)} className="h-11">
              <PackagePlus className="mr-2 h-4 w-4" />
              Thêm sản phẩm mới
            </Button>
          </div>

          <div className="mt-5 grid gap-2 lg:grid-cols-[minmax(260px,1fr)_160px_190px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên, dòng, danh mục..."
                className="h-10 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-neutral-500"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | "active" | "hidden" | "low")
              }
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hiện</option>
              <option value="hidden">Đang ẩn</option>
              <option value="low">Sắp hết hàng</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
            >
              <option value="all">Mọi danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            Chưa có sản phẩm nào. Bấm Thêm sản phẩm mới để tạo sản phẩm đầu tiên.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            Không có sản phẩm phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 p-4 transition hover:bg-orange-50/40 lg:grid-cols-[72px_minmax(0,1fr)_140px_160px_320px] lg:items-center"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{product.name}</p>
                    {product.is_active === false ? (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        Đang ẩn
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Đang hiện
                      </span>
                    )}
                    {(product.stock ?? 0) <= 3 ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Sắp hết
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-neutral-500">
                    {product.category ?? "Streetwear"} · {product.line ?? "Graphic Tee"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-neutral-400">Giá</p>
                  <p className="mt-1 font-semibold">{currencyFormatter.format(product.price)}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-neutral-400">Tồn kho</p>
                  <p className="mt-1 text-lg font-semibold">{product.stock ?? 0}</p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => toggleVisibility(product)}
                    disabled={isPending}
                  >
                    {product.is_active === false ? (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Hiện
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Ẩn
                      </>
                    )}
                  </Button>
                  <Button type="button" onClick={() => setEditingProduct(product)} disabled={isPending}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => requestDelete(product)}
                    disabled={isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {creating ? (
        <ProductEditorDialog
          mode="create"
          product={null}
          pending={isPending}
          onClose={() => setCreating(false)}
          onSubmit={(formData) =>
            runProductAction(createProduct, formData, () => {
              setCreating(false);
            })
          }
        />
      ) : null}

      {editingProduct ? (
        <ProductEditorDialog
          mode="edit"
          product={editingProduct}
          pending={isPending}
          onClose={() => setEditingProduct(null)}
          onSubmit={(formData) =>
            runProductAction(updateProduct, formData, () => {
              setEditingProduct(null);
            })
          }
          onDelete={(formData) =>
            runProductAction(deleteProduct, formData, () => {
              setEditingProduct(null);
            })
          }
        />
      ) : null}
    </div>
  );
}

function ProductEditorDialog({
  mode,
  product,
  pending,
  onClose,
  onSubmit,
  onDelete,
}: {
  mode: "create" | "edit";
  product: Product | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  onDelete?: (formData: FormData) => void;
}) {
  const mainFileRef = useRef<HTMLInputElement | null>(null);
  const hoverFileRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [imageHoverUrl, setImageHoverUrl] = useState(product?.image_hover_url ?? "");
  const [uploading, setUploading] = useState<"main" | "hover" | null>(null);
  const [uploadMessage, setUploadMessage] = useState<ActionMessage>(null);

  useEffect(() => {
    setImageUrl(product?.image_url ?? "");
    setImageHoverUrl(product?.image_hover_url ?? "");
    setUploadMessage(null);
  }, [product]);

  async function uploadImage(file: File, mode: "main" | "hover") {
    setUploading(mode);
    setUploadMessage(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      if (mode === "main") setImageUrl(data.publicUrl);
      if (mode === "hover") setImageHoverUrl(data.publicUrl);
      setUploadMessage({ type: "success", text: "Upload ảnh thành công." });
    } catch {
      setUploadMessage({
        type: "error",
        text: "Upload ảnh thất bại. Vui lòng kiểm tra Supabase Storage.",
      });
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
              {mode === "create" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              {mode === "create" ? "Sản phẩm mới" : product?.name}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onSubmit(new FormData(event.currentTarget));
          }}
          className="grid max-h-[calc(92vh-73px)] gap-0 overflow-y-auto lg:grid-cols-[360px_minmax(0,1fr)]"
        >
          <div className="border-b border-neutral-200 bg-neutral-50 p-5 lg:border-b-0 lg:border-r">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {imageUrl ? (
                <Image src={imageUrl} alt="Ảnh sản phẩm" fill sizes="360px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-neutral-400">
                  Chưa có ảnh chính. Hãy upload hoặc dán URL ảnh.
                </div>
              )}
            </div>

            {uploadMessage ? (
              <p
                className={`mt-3 rounded-md border px-3 py-2 text-sm ${
                  uploadMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {uploadMessage.text}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => mainFileRef.current?.click()}
                disabled={uploading !== null}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading === "main" ? "Đang tải" : "Ảnh chính"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => hoverFileRef.current?.click()}
                disabled={uploading !== null}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading === "hover" ? "Đang tải" : "Ảnh hover"}
              </Button>
            </div>
            <input
              ref={mainFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(file, "main");
              }}
            />
            <input
              ref={hoverFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(file, "hover");
              }}
            />
          </div>

          <div className="space-y-4 p-5">
            {product ? <input type="hidden" name="id" value={product.id} /> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium">Tên sản phẩm</span>
                <Input name="name" defaultValue={product?.name ?? ""} placeholder="Áo hoodie wash đen" required />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Danh mục</span>
                <select
                  name="category"
                  defaultValue={normalizeCategory(product?.category)}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                >
                  {STREETWEAR_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Dòng sản phẩm</span>
                <select
                  name="line"
                  defaultValue={product?.line ?? "Graphic Tee"}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                >
                  {PRODUCT_LINES.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Giá bán</span>
                <Input name="price" type="number" min={0} defaultValue={product?.price ?? ""} required />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Tồn kho</span>
                <Input name="stock" type="number" min={0} defaultValue={product?.stock ?? ""} required />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Giới tính</span>
                <select
                  name="gender"
                  defaultValue={product?.gender ?? "nam"}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                >
                  <option value="nam">Nam</option>
                  <option value="unisex">Unisex</option>
                  <option value="nu">Nữ</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Hiển thị ở trang khách hàng</span>
                <select
                  name="is_active"
                  defaultValue={String(product?.is_active ?? true)}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                >
                  <option value="true">Hiển thị</option>
                  <option value="false">Ẩn khỏi storefront</option>
                </select>
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium">Mô tả ngắn</span>
                <Input
                  name="description"
                  defaultValue={product?.description ?? ""}
                  placeholder="Chất nỉ dày, form rộng, dễ phối."
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium">URL ảnh chính</span>
                <Input
                  name="image_url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://..."
                  required
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium">URL ảnh hover</span>
                <Input
                  name="image_hover_url"
                  value={imageHoverUrl}
                  onChange={(event) => setImageHoverUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              {mode === "edit" && onDelete && product ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={pending}
                  onClick={() => {
                    const confirmed = window.confirm(
                      `Bạn chắc chắn muốn xóa "${product.name}"? Nếu sản phẩm đã có trong đơn hàng, hệ thống sẽ không cho xóa để giữ lịch sử hóa đơn.`,
                    );

                    if (!confirmed) return;

                    const formData = new FormData();
                    formData.set("id", product.id);
                    onDelete(formData);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa sản phẩm
                </Button>
              ) : (
                <span />
              )}

              <div className="flex gap-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={pending || uploading !== null}>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
