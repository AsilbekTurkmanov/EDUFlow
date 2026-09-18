# EduFlow — O'quv Markazini Boshqarish Tizimi

EduFlow — o'quv markazi ma'muriyati (**Admin**), o'qituvchilari (**Teacher**) va talabalari (**Student**) uchun mo'ljallangan to'liq siklli zamonaviy boshqaruv platformasi.

Loyihaning arxitekturasi va texnologiyalari topshiriq talablariga muvofiq ishlab chiqilgan:
- **Backend**: C# ASP.NET Core (.NET 10) Clean Architecture, Entity Framework Core, PostgreSQL ma'lumotlar bazasi, JWT authentication & role-based authorization, unified `ApiResponse<T>` formati hamda **Scalar** (`Scalar.AspNetCore`) interaktiv API hujjatlashuvi.
- **Frontend**: React JS (Vite), to'liq responsiv, **mutlaqo ko'k rangsiz** — yuqori estetikadagi **Obsidian Slate, Zumrad Yashil (Emerald) va Qahrabo Oltin (Amber)** ranglar palitrasida tayyorlangan.

---

## 🚀 Texnologiyalar Staki

| Qatlam | Texnologiya | Tavsif |
|---|---|---|
| **Backend** | .NET 10 (C#) | Web API, Clean Architecture, Dependency Injection |
| **Database & ORM** | PostgreSQL 18 + EF Core 10 | Npgsql provider, code-first munosabatlar, avtomatik migratsiya va seed |
| **API Doc** | Scalar (`Scalar.AspNetCore`) | Zamonaviy interaktiv API explorer (`/scalar/v1`) |
| **Xavfsizlik** | JWT Bearer, BCrypt.Net | Xavfsiz xesh, HttpClaims, Role-based policy ruxsatlar |
| **Frontend** | React JS + Vite | SPA arxitekturasi, Lucide ikonalar to'plami |
| **Styling** | Custom Vanilla CSS | Obsidian Slate & Emerald/Amber dizayn tizimi (ko'k rangsiz) |

---

## 👥 Foydalanuvchi Rollari va Imkoniyatlari

### 1. Admin (Ma'mur)
- O'quv markazining umumiy KPI ko'rsatkichlari (talabalar, o'qituvchilar, guruhlar soni, jami va oylik tushum).
- Foydalanuvchilar (Admin, Teacher, Student) ustidan to'liq CRUD amallari, qidiruv va status nazorati.
- Kurslar va o'quv guruhlarini yaratish, tahrirlash, o'qituvchi biriktirish.
- Guruhlarga o'quvchilarni biriktirish (dublikatdan himoyalangan).
- Dars jadvalini shakllantirish (xona va o'qituvchi bandlik to'qnashuvlari tekshiruvi bilan).
- To'lovlarni qayd etish, to'lov kvitansiyasini ko'rish va talabalar qarzdorlik hisoboti.
- Tizimdagi harakatlarning to'liq **Audit tarixi** nazorati.

### 2. Teacher (O'qituvchi)
- O'ziga biriktirilgan guruhlar va o'quvchilar ro'yxati.
- O'z darslari jadvali va darsga video-konferensiya havolasi kiritish.
- **Davomad jurnali**: O'z guruhlari bo'yicha har bir o'quvchiga `Keldi`, `Kechikdi`, `Kelmadi` holatlarini belgilash va izoh kiritish.
- Uy vazifalarini e'lon qilish (deadline va maksimal ball belgilash).
- O'quvchilar topshirgan ishlarni ko'rib chiqish, baholash va izoh qoldirish.

### 3. Student (Talaba)
- O'zi o'qiydigan kurslar va guruhlar holati.
- Dars jadvali va xona/havolalarni ko'rish.
- Shaxsiy davomad ko'rsatkichi (foizda).
- Berilgan uy vazifalarini ko'rish, yechim havolasini yuborish, baho va ustoz fikrini kuzatish.
- To'lovlar tarixi, to'langan summa va qoldiq shartnoma qarzdorligini ko'rish.

---

## 🔑 Namuna (Seed) Akkauntlari

Tizim birinchi marta ishga tushganda barcha kerakli ma'lumotlar avtomatik shakllanadi. Frontendning Login sahifasida va yuqori panelida **1-bosishda tezkor kirish tugmalari** mavjud:

| Rol | Email | Parol | To'liq Ism |
|---|---|---|---|
| **Admin** | `admin@eduflow.uz` | `Admin123!` | Sardor Rahimov (Admin) |
| **Teacher** | `anvar.ustoz@eduflow.uz` | `Teacher123!` | Anvar Karimov (Senior .NET) |
| **Teacher** | `madina.ustoz@eduflow.uz` | `Teacher123!` | Madina Alimova (Frontend Lead) |
| **Student** | `jasur@eduflow.uz` | `Student123!` | Jasur Bekmirzayev |
| **Student** | `shahzod@eduflow.uz` | `Student123!` | Shahzod Normatov |
| **Student** | `dilnoza@eduflow.uz` | `Student123!` | Dilnoza Rahimova |
| **Student** | `malika@eduflow.uz` | `Student123!` | Malika Yusupova |

---

## 🛠️ Loyihani Ishga Tushirish

### 1. Talablar
- .NET 10 SDK
- PostgreSQL (Standart sozlama: `localhost:5432`, `postgres`, parol: `1234`)
- Node.js v18+ va npm

### 2. Backendni ishga tushirish
```bash
cd backend
dotnet restore
dotnet run --project EduFlow.Api/EduFlow.Api.csproj
```
Backend `http://localhost:5000` portida ishga tushadi.
- **Scalar API Dokumentatsiyasi**: `http://localhost:5000/scalar/v1`

### 3. Frontendni ishga tushirish
```bash
cd frontend
npm install
npm run dev
```
Frontend brauzerda `http://localhost:5173` manzilida ochiladi.
