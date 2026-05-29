import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const publicDir = path.join(root, "public");
const reportPath = path.join(publicDir, "qa-report.json");
const baseUrl = process.env.QA_BASE_URL || "http://localhost:3000";
const adminEmail = process.env.QA_ADMIN_EMAIL || "admin@dotus.test";
const adminPassword = process.env.QA_ADMIN_PASSWORD || "Admin@123456";
const customerEmail = `qa_customer_${Date.now()}@dotus.test`;
const customerPassword = "Customer@123456";
const productName = `QA Hoodie ${Date.now()}`;
const productImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

const report = {
  baseUrl,
  customerEmail,
  productName,
  startedAt: new Date().toISOString(),
  finishedAt: null,
  steps: [],
};

fs.mkdirSync(publicDir, { recursive: true });

function writeReport() {
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

async function step(name, fn) {
  const item = { name, status: "RUNNING", detail: "", startedAt: new Date().toISOString() };
  report.steps.push(item);
  writeReport();
  console.log(`RUNNING | ${name}`);

  try {
    const detail = await fn();
    item.status = "PASS";
    item.detail = detail || "";
    console.log(`PASS    | ${name}${detail ? ` | ${detail}` : ""}`);
  } catch (error) {
    item.status = "FAIL";
    item.detail = error?.stack || error?.message || String(error);
    console.log(`FAIL    | ${name} | ${error?.message || error}`);
  } finally {
    item.finishedAt = new Date().toISOString();
    writeReport();
  }
}

function markSkip(name, detail) {
  report.steps.push({
    name,
    status: "SKIP",
    detail,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  });
  console.log(`SKIP    | ${name} | ${detail}`);
  writeReport();
}

function readEnvFile() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

async function login(page, email, password) {
  await page.goto(`${baseUrl}/auth/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForLoadState("networkidle").catch(() => {});
}

async function isVisible(page, text, timeout = 8000) {
  return page.getByText(text, { exact: false }).first().isVisible({ timeout });
}

async function assertVisible(page, text, timeout = 8000) {
  if (!(await isVisible(page, text, timeout))) {
    throw new Error(`Khong thay text: ${text}`);
  }
}

async function main() {
  writeReport();

  const env = readEnvFile();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  if (supabase) {
    await step("Create QA customer through Supabase Auth", async () => {
      const { data, error } = await supabase.auth.signUp({
        email: customerEmail,
        password: customerPassword,
      });
      if (error) throw error;
      if (!data.user) throw new Error("Supabase did not return a QA customer user");
      return `${customerEmail} (${data.user.id})`;
    });
  } else {
    markSkip("Create QA customer through Supabase Auth", "Missing Supabase env vars");
  }

  const browser = await chromium.launch({
    channel: "msedge",
    headless: process.env.QA_HEADED !== "1",
    slowMo: process.env.QA_HEADED === "1" ? 250 : 0,
  });
  const reportContext = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const customerContext = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await publicContext.newPage();
  const customerPage = await customerContext.newPage();
  const adminPage = await adminContext.newPage();

  await step("Open QA report page", async () => {
    const reportPage = await reportContext.newPage();
    await reportPage.goto(`${baseUrl}/qa-report.html`, { waitUntil: "domcontentloaded" });
    return `${baseUrl}/qa-report.html`;
  });

  await step("Public homepage renders", async () => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await assertVisible(page, "DOTUS");
    return page.url();
  });

  await step("Products page and filters render", async () => {
    await page.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
    await assertVisible(page, "Dòng sản phẩm");
    return page.url();
  });

  await step("Customer login and dashboard access", async () => {
    await login(customerPage, customerEmail, customerPassword);
    await customerPage.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
    await assertVisible(customerPage, "Lịch sử đơn hàng");
    await assertVisible(customerPage, customerEmail);
    return customerEmail;
  });

  await step("Customer header does not show Admin link", async () => {
    const count = await customerPage.getByRole("link", { name: /^Admin$/ }).count();
    if (count !== 0) throw new Error(`Customer van thay ${count} link Admin`);
    return "Admin link hidden for customer";
  });

  await step("Customer cannot access /admin", async () => {
    await customerPage.goto(`${baseUrl}/admin`, { waitUntil: "domcontentloaded" }).catch(() => {});
    await customerPage.waitForLoadState("networkidle").catch(() => {});
    if (!customerPage.url().includes("/dashboard")) {
      throw new Error(`Expected /dashboard redirect, got ${customerPage.url()}`);
    }
    return customerPage.url();
  });

  await step("Admin login opens admin dashboard", async () => {
    await login(adminPage, adminEmail, adminPassword);
    if (!adminPage.url().includes("/admin")) throw new Error(`Admin login url=${adminPage.url()}`);
    await assertVisible(adminPage, "DOTUS Admin");
    await assertVisible(adminPage, "Tổng quan vận hành");
    return adminPage.url();
  });

  await step("Admin creates a product", async () => {
    await adminPage.goto(`${baseUrl}/admin/products`, { waitUntil: "networkidle" });
    await adminPage.getByRole("button", { name: "Thêm sản phẩm mới" }).click();
    await adminPage.locator('input[name="name"]').fill(productName);
    await adminPage.locator('input[name="price"]').fill("199000");
    await adminPage.locator('input[name="stock"]').fill("5");
    await adminPage.locator('input[name="description"]').fill("Sản phẩm QA tự động");
    await adminPage.locator('input[name="image_url"]').fill(productImage);
    await adminPage.getByRole("button", { name: "Lưu" }).click();
    await adminPage.waitForLoadState("networkidle").catch(() => {});
    await adminPage.reload({ waitUntil: "networkidle" });
    await assertVisible(adminPage, productName);
    return productName;
  });

  await step("Storefront lists newly created product", async () => {
    await page.goto(`${baseUrl}/products?q=${encodeURIComponent(productName)}`, {
      waitUntil: "networkidle",
    });
    await assertVisible(page, productName);
    return page.url();
  });

  await step("Cart persists after navigation", async () => {
    await customerPage.goto(`${baseUrl}/products?q=${encodeURIComponent(productName)}`, {
      waitUntil: "networkidle",
    });
    await customerPage.getByRole("button", { name: "Thêm vào giỏ" }).first().click();
    await customerPage.goto(`${baseUrl}/cart`, { waitUntil: "networkidle" });
    await assertVisible(customerPage, productName);
    return "Product remains in cart";
  });

  let checkoutPassed = false;
  let stockBeforeConfirm = null;
  await step("Checkout creates order", async () => {
    await customerPage.locator('input[name="receiver_name"]').fill("Khách QA");
    await customerPage.locator('input[name="receiver_phone"]').fill("0900000000");
    await customerPage
      .locator('input[name="shipping_address"]')
      .fill("12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh");
    const checkout = customerPage
      .getByRole("button", { name: /Xác nhận đặt hàng|Đặt hàng|Thanh toán|Checkout/i })
      .first();
    if (!(await checkout.isVisible({ timeout: 8000 }))) {
      throw new Error("Khong thay nut checkout");
    }
    await checkout.click();
    await customerPage.waitForLoadState("networkidle").catch(() => {});
    await customerPage.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
    if (!(await isVisible(customerPage, productName, 8000))) {
      throw new Error(
        "Dashboard chua hien don hang. Hay kiem tra migration 005_order_checkout_with_size.sql.",
      );
    }
    if (supabase) {
      const { data: productRows } = await supabase
        .from("products")
        .select("stock")
        .eq("name", productName)
        .limit(1);
      stockBeforeConfirm = productRows?.[0]?.stock ?? null;
      if (stockBeforeConfirm !== 5) {
        throw new Error(
          `Ton kho phai giu nguyen 5 sau khi khach dat don, hien tai=${stockBeforeConfirm}. Can chay migration 010_order_stock_on_confirmation.sql.`,
        );
      }
    }
    checkoutPassed = true;
    return "Order visible on customer dashboard";
  });

  if (checkoutPassed) {
    await step("Admin sees order", async () => {
    await adminPage.goto(`${baseUrl}/admin/orders`, { waitUntil: "networkidle" });
      await assertVisible(adminPage, "Quản lý đơn hàng");
      await assertVisible(adminPage, productName);
      return "Order visible in admin";
    });

    await step("Admin updates order status", async () => {
      await adminPage.locator('select[name="status"]').first().selectOption("paid");
      await adminPage.getByRole("button", { name: "Lưu" }).first().click();
      await adminPage.waitForLoadState("networkidle").catch(() => {});
      await adminPage.reload({ waitUntil: "networkidle" });
      await assertVisible(adminPage, "Đã xác nhận");
      if (supabase && stockBeforeConfirm !== null) {
        const { data: productRows } = await supabase
          .from("products")
          .select("stock")
          .eq("name", productName)
          .limit(1);
        const stockAfterConfirm = productRows?.[0]?.stock ?? null;
        if (stockAfterConfirm !== stockBeforeConfirm - 1) {
          throw new Error(
            `Ton kho phai giam tu ${stockBeforeConfirm} xuong ${stockBeforeConfirm - 1} sau xac nhan, hien tai=${stockAfterConfirm}.`,
          );
        }
      }
      return "Order status updated";
    });
  } else {
    markSkip(
      "Admin order visibility/status update",
      "Skipped because checkout/order creation failed.",
    );
  }

  if (supabase) {
    await step("Supabase RPC place_order exists", async () => {
      const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
        email: customerEmail,
        password: customerPassword,
      });
      if (authError) throw authError;

      const { data: products, error: productError } = await supabase
        .from("products")
        .select("id")
        .eq("name", productName)
        .limit(1);
      if (productError) throw productError;
      const productId = products?.[0]?.id;
      if (!productId || !auth.user) throw new Error("Khong tim thay product/user test");

      const { error } = await supabase.rpc("place_order", {
        items: [{ product_id: productId, quantity: 1, selected_size: "M" }],
        customer: {
          receiver_name: "Khách QA",
          receiver_phone: "0900000000",
          shipping_address: "12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
          payment_method: "cod",
        },
      });
      if (error) {
        throw new Error(
          `${error.message}\nCan chay migration: supabase/migrations/005_order_checkout_with_size.sql`,
        );
      }

      return "RPC callable";
    });
  } else {
    markSkip("Supabase RPC place_order exists", "Missing Supabase env vars");
  }

  await browser.close();
  report.finishedAt = new Date().toISOString();
  writeReport();

  const hasFailure = report.steps.some((item) => item.status === "FAIL");
  process.exit(hasFailure ? 1 : 0);
}

main().catch((error) => {
  report.steps.push({
    name: "QA runner crashed",
    status: "FAIL",
    detail: error?.stack || error?.message || String(error),
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  });
  report.finishedAt = new Date().toISOString();
  writeReport();
  console.error(error);
  process.exit(1);
});
