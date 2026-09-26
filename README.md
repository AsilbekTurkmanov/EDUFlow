# EduFlow — O'quv Markazini Boshqarish Tizimi (SaaS Multi-Tenant CRM & ERP)

EduFlow — o'quv markazi ma'muriyati (**Admin**), o'qituvchilari (**Teacher**), talabalari (**Student**) va ota-onalari (**Parent**) uchun mo'ljallangan to'liq siklli zamonaviy ta'lim boshqaruv platformasi.

🌐 **Jonli Demo (GitHub Pages)**: [https://asilbekturkmanov.github.io/EDUFlow/](https://asilbekturkmanov.github.io/EDUFlow/)

---

## 🚀 Loyihaning Asosiy Imkoniyatlari

Loyihaning arxitekturasi Clean Architecture va zamonaviy web texnologiyalari talablariga mos ishlab chiqilgan:
- **Backend**: C# ASP.NET Core (.NET 10) Clean Architecture (`Api` → `Application` → `Domain` → `Infrastructure`), Entity Framework Core 10, PostgreSQL ma'lumotlar bazasi, JWT authentication & Refresh Token mexanizmi, SignalR Real-Time xabarnomalar, unified `ApiResponse<T>` formati hamda **Scalar** (`Scalar.AspNetCore`) interaktiv API hujjatlashuvi.
- **Frontend**: React JS (Vite), to'liq responsiv, **Obsidian Slate, Zumrad Yashil (Emerald) va Qahrabo Oltin (Amber)** ranglar palitrasida tayyorlangan (ko'k rangsiz, premium UI/UX).

---

## 🛠️ Texnologiyalar Staki

| Qatlam | Texnologiya | Tavsif |
|---|---|---|
| **Backend** | .NET 10 (C#) | Web API, Clean Architecture, Dependency Injection |
| **Real-time** | Microsoft SignalR | Real vaqt rejimida bildirishnomalar va hodisalar uzatish |
| **Database & ORM** | PostgreSQL 18 + EF Core 10 | Npgsql provider, code-first munosabatlar, avtomatik migratsiya va seed |
| **API Doc** | Scalar (`Scalar.AspNetCore`) | Zamonaviy interaktiv API explorer (`/scalar/v1`) |
| **Xavfsizlik** | JWT Bearer, Refresh Token, BCrypt | Xavfsiz xesh, HttpClaims, Role-based policy ruxsatlar |
| **Frontend** | React 19 + Vite | SPA arxitekturasi, Lucide ikonalar to'plami |
| **Styling** | Custom Vanilla CSS | Obsidian Slate & Emerald/Amber dizayn tizimi (ko'k rangsiz) |

---

## 👥 Foydalanuvchi Rollari va Modullar

### 1. 🏢 Admin (Ma'muriyat)
- **Asosiy Dashboard**: O'quv markazining umumiy KPI ko'rsatkichlari (talabalar, ustozlar, guruhlar soni, oylik va jami tushum dinamikasi).
- **Foydalanuvchilar**: Admin, Teacher, Student, Parent foydalanuvchilar ustidan to'liq nazorat va qidiruv.
- **Kurslar va Guruhlar**: Narxlar, davomiylik, o'qituvchi va o'quvchilarni biriktirish.
- **Xonalar va To'qnashuvlar (Room Management)**: O'quv xonalari sig'imi, jihozlari (proyektor, AC, doska) va darslar to'qnashuvi intellektual tekshiruvi.
- **O'qituvchilar Payroll (Oylik hisob-kitob)**: O'quvchilar soniga/foizga asoslangan ulush, bonuslar, ushlanmalar va to'lov statuslari.
- **O'quvchilar Churn Risk (Dropout tahlili)**: Davomat va to'lov intizomiga ko'ra o'qishni tashlab ketish xavfi (Yuqori / O'rta / Xavfsiz) algoritmi va tezkor choralar.
- **Sertifikatlar Generator**: Kursni bitirganlarga rasmiy raqamli sertifikat, yuklab olish/chop etish hamda maxsus QR verification tizimi.
- **Moliya & Audit**: To'lovlar, qarzdorliklar reyestri, cheklar va tizimdagi barcha amallarning to'liq audit jurnali.

### 2. 👨‍🏫 Teacher (O'qituvchi)
- Biriktirilgan guruhlar va o'quvchilar ro'yxati.
- Dars jadvali, xonalar va onlayn dars havolalari.
- **Davomat jurnali**: Keldi, Kechikdi, Kelmadi belgilash va izoh kiritish.
- **Uy vazifalari**: Deadline va ballar belgilash, o'quvchilar topshirgan yechimlarni tekshirish va baholash.
- **Imtihonlar (Exams)**: Oraliq va yakuniy imtihonlarni tashkil qilish, A/B/C/D/F shkalasi bo'yicha baholash.

### 3. 👨‍🎓 Student (Talaba)
- O'zi o'qiydigan kurslar, guruhlar va dars jadvali.
- Shaxsiy davomat ko'rsatkichi va foizlari.
- Uy vazifalarini ko'rish, yechim topshirish va ustoz izohlarini o'qish.
- Imtihon natijalari va erishilgan sertifikatlar.
- Shaxsiy to'lovlar tarixi, qarzdorlik va to'lov kvitansiyalari.

### 4. 👨‍👩‍👧 Parent (Ota-onalar portali)
- Farzandlarining ta'lim jarayonini jonli kuzatish (bitta ota-onaga bir nechta farzand birikishi mumkin).
- Farzandning davomat statistikasi (Keldi / Kechikdi / Sababli / Kelmadi).
- O'zlashtirish va imtihon baholari tahlili.
- O'quv to'lovlari holati, qoldiq qarzdorlik va onlayn to'lovga yo'naltirish.
- O'qituvchi bilan tezkor aloqa.

---

## 🔑 Namuna (Seed) Akkauntlari

Tizim birinchi marta ishga tushganda barcha namunaviy ma'lumotlar avtomatik shakllanadi. Frontend kirish sahifasida **1-bosishda tezkor kirish tugmalari** orqali tizimni sinab ko'rishingiz mumkin:

| Rol | Email | Parol | To'liq Ism |
|---|---|---|---|
| **Admin** | `admin@eduflow.uz` | `Admin123!` | Sardor Rahimov (Admin) |
| **Teacher** | `anvar.ustoz@eduflow.uz` | `Teacher123!` | Anvar Karimov (Senior .NET) |
| **Teacher** | `madina.ustoz@eduflow.uz` | `Teacher123!` | Madina Alimova (Frontend Lead) |
| **Student** | `jasur@eduflow.uz` | `Student123!` | Jasur Bekmirzayev |
| **Student** | `shahzod@eduflow.uz` | `Student123!` | Shahzod Normatov |
| **Parent** | `ota.dilshod@eduflow.uz` | `Admin123!` | Dilshod Bekmirzayev (Jasurning otasi) |

---

## 🛠️ Loyihani Ishga Tushirish

### 1. Talablar
- .NET 10 SDK
- PostgreSQL (Standart: `localhost:5432`, `postgres`, parol: `1234` yoki `appsettings.json` orqali)
- Node.js v18+ va npm

### 2. Backendni ishga tushirish
```bash
cd backend
dotnet restore
dotnet run --project EduFlow.Api/EduFlow.Api.csproj
```
Backend `http://localhost:5000` portida ishga tushadi:
- **Scalar API Dokumentatsiyasi**: `http://localhost:5000/scalar/v1`
- **SignalR Hub**: `http://localhost:5000/hubs/eduflow`

### 3. Frontendni ishga tushirish
```bash
cd frontend
npm install
npm run dev
```
Frontend brauzerda `http://localhost:5173` manzilida ochiladi.

---

## 🌐 Jonli Demo & Deploy
Loyiha GitHub Pages orqali doimiy tarzda deploy qilinadi:
- **Demo havola**: [https://asilbekturkmanov.github.io/EDUFlow/](https://asilbekturkmanov.github.io/EDUFlow/)
