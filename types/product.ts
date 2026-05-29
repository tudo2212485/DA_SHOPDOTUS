export type Product = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  price: number;
  image_url: string;
  image_hover_url?: string | null;
  category?: string | null;
  stock?: number | null;
  owner_id?: string | null;
  is_active?: boolean | null;
  line?: string | null;
  gender?: "nam" | "nu" | "unisex" | null;
  created_at?: string | null;
};
