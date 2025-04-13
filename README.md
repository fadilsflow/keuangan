
# Aplikasi Manajemen Keuangan

Aplikasi manajemen keuangan berbasis web untuk mencatat dan menganalisis transaksi keuangan dengan mudah dan efisien.

## Fitur Utama

### 1. Manajemen Transaksi
- ✅ Pencatatan transaksi pemasukan dan pengeluaran
- ✅ Kategorisasi transaksi
- ✅ Multiple items per transaksi
- ✅ Upload bukti transaksi
- ✅ Riwayat transaksi dengan timeline view

### 2. Dashboard & Analitik
- ✅ Ringkasan keuangan
- ✅ Grafik laba rugi
- ✅ Tren transaksi bulanan
- ✅ Analisis per kategori
- ✅ Aktivitas transaksi terbaru

### 3. Master Data
- Manajemen kategori transaksi
- Manajemen pihak terkait (supplier, customer, dll)
- Manajemen item/produk
- Konsistensi data transaksi

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Query
- React Hook Form
- Zod Validation

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- Zod Schema Validation

## Instalasi

```bash
# Clone repository
git clone https://github.com/fadilsflow/keuangan.git

# Install dependencies
cd keuangan
npm install

# Setup environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Run development server
npm run dev
```

### Database Migrations

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request


MIT [LICENSE](LICENSE)

