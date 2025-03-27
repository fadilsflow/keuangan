
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

### Deployment
- Vercel (Frontend & API)
- Supabase (Database)

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

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth (jika menggunakan)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Upload (jika menggunakan)
UPLOAD_API_KEY="your-api-key"
```

## Project Structure

```
├── app/                   # Next.js app router
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   └── transactions/     # Transaction pages
├── components/           # React components
│   ├── ui/              # UI components
│   └── forms/           # Form components
├── lib/                 # Utilities & configs
├── prisma/              # Database schema
└── public/              # Static files
```

## API Routes

### Transactions
- `GET /api/transactions` - List transaksi
- `POST /api/transactions` - Create transaksi
- `GET /api/transactions/[id]` - Detail transaksi
- `PUT /api/transactions/[id]` - Update transaksi
- `DELETE /api/transactions/[id]` - Delete transaksi

### Analytics
- `GET /api/transactions/laba-rugi` - Data laba rugi
- `GET /api/transactions/chart` - Data untuk charts

## Development

### Commands

```bash
# Run development
npm run dev

# Build production
npm run build

# Start production
npm start

# Run tests
npm test

# Run linter
npm run lint
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

## Roadmap

### v1.0 - Core Features ✅
- Basic transaction management
- Dashboard analytics
- Transaction history

### v1.1 - Master Data 🚧
- Category management
- Related party management
- Data consistency

### v1.2 - Enhancements (Planning)
- Advanced reporting
- Export/Import
- Bulk operations

## License

MIT License - Lihat [LICENSE](LICENSE) untuk detail lebih lanjut.

