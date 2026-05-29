# Deployment checklist

Quy che khuyen khich/bat buoc demo truc tiep tren URL production co domain va SSL. Checklist nay dung de chuan bi VPS.

## 1. Chuan bi VPS

- VPS Ubuntu 22.04/24.04.
- Domain tro A record ve IP VPS.
- Mo port `80`, `443`, `22`.
- Cai Docker va Docker Compose plugin.

## 2. Chuan bi source

```bash
git clone <GITHUB_REPO_URL>
cd <PROJECT_FOLDER>
cp .env.example .env
nano .env
```

Bien moi truong can co:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
QA_ADMIN_EMAIL=admin@dotus.test
QA_ADMIN_PASSWORD=
```

Khong dua `SUPABASE_DB_URL` len production neu khong can chay migration tren VPS.

## 3. Chay ung dung

```bash
docker compose up -d --build
docker compose logs -f web
```

Kiem tra local tren VPS:

```bash
curl http://localhost:3000
```

## 4. Cau hinh Nginx reverse proxy

Vi du file `/etc/nginx/sites-available/dotus`:

```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kich hoat:

```bash
sudo ln -s /etc/nginx/sites-available/dotus /etc/nginx/sites-enabled/dotus
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Cai SSL

Dung Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Hoac dung Cloudflare SSL neu da cau hinh proxy.

## 6. Kiem tra truoc khi nop

- URL production mo duoc bang HTTPS.
- Dang nhap admin duoc.
- Customer khong thay nut Admin.
- Tao san pham/upload anh thanh cong.
- Khach dat hang thanh cong.
- Admin xac nhan don va ton kho giam.
- GitHub repo co code moi nhat.
- LMS co bao cao PDF va phu luc AI.
