# CashLog

<div align="center">
  <img src="https://res.cloudinary.com/dxurnpbrc/image/upload/v1748188613/dashboard-ss_v35hqa.png" alt="CashLog Dashboard" width="600"/>
  
  <p align="center">
    Aplikasi pencatatan pemasukan dan pengeluaran yang simpel dan terorganisir
    <br />
    <a href="https://cashlog.webtron.biz.id">View Demo</a>
    ·
    <a href="https://github.com/fadilsflow/keuangan/issues">Report Bug</a>
    ·
    <a href="https://github.com/fadilsflow/keuangan/issues">Request Feature</a>
  </p>
</div>

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/fadilsflow/keuangan?utm_source=oss&utm_medium=github&utm_campaign=fadilsflow%2Fkeuangan&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## 🌟 Fitur Utama

- 📝 **Pencatatan Transaksi Simpel**

  - Input transaksi yang mudah dan cepat
  - Kategorisasi pemasukan & pengeluaran
  - Upload bukti transaksi

- 📊 **Ringkasan Cashflow**

  - Total pemasukan & pengeluaran
  - Grafik tren cashflow
  - Analisis per kategori

- 📑 **Laporan & Ekspor**
  - Laporan cashflow bulanan
  - Filter berdasarkan kategori
  - Ekspor ke Excel/PDF

## 🚀 Tech Stack

- [Next.js 14](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn UI](https://ui.shadcn.com/) - Komponen UI
- [Clerk](https://clerk.com/) - Autentikasi
- [Prisma](https://www.prisma.io/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Bun](https://bun.sh/) - JavaScript Runtime

## 📦 Instalasi

1. Clone repository

```bash
git clone https://github.com/fadilsflow/cashlog.git
```

2. Install dependencies

```bash
bun install
```

3. Copy environment file

```bash
cp .env.example .env
```

4. Setup environment variables

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

5. Run database migrations

```bash
bunx prisma migrate dev
```

6. Start development server

```bash
bun dev
```

## 🤝 Kontribusi

Kontribusi membuat komunitas open source menjadi tempat yang luar biasa untuk belajar, menginspirasi, dan berkreasi. Setiap kontribusi yang Anda berikan akan sangat kami hargai.

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

## 📬 Kontak

Your Name - [@fadilsflow](https://twitter.com/fadilsflow)

Project Link: [https://github.com/fadilsflow/cashlog](https://github.com/fadilsflow/cashlog)
