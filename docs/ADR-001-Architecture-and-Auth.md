# ADR-001: Clean Architecture va JWT Autentifikatsiya Qarori

## Holat
Qabul qilindi (Accepted).

## Kontekst
EduFlow loyihasi o'quv markazini boshqarish uchun ko'p rolli (Admin, Teacher, Student) tizim bo'lib, har bir modul qat'iy biznes qoidalariga, darslar to'qnashuvi va dublikat tekshiruvlariga ega. Arxitektura barqaror, testlash oson va qatlamlari mustaqil bo'lishi talab etiladi.

## Qaror
1. **Clean / Layered Architecture**:
   - `EduFlow.Domain`: Asosiy entitilar va enumlar, tashqi qaramliklarsiz.
   - `EduFlow.Application`: Biznes mantiq interfeyslari, DTOlar va unifikatsiyalangan `ApiResponse<T>` / `PagedResult<T>`.
   - `EduFlow.Infrastructure`: PostgreSQL DbContext, xavfsizlik (BCrypt, JWT generator), servislar realizatsiyasi va Seed Initializer.
   - `EduFlow.Api`: Kontrollerlar, Global Exception Middleware, CORS va Scalar OpenAPI.
2. **JWT Authentication & Role-Based Authorization**:
   - Parollar `BCrypt.Net-Next` yordamida tuzlanadi (salt) va xeshlanadi.
   - Foydalanuvchi tizimga kirganda uning `Id`, `Email`, `Role` va `FullName` parametrlari HMAC-SHA256 bilan imzolangan JWT token ichiga joylashtiriladi.
   - Har bir controller va endpoint `[Authorize(Roles = "...")]` orqali himoyalanadi (masalan, to'lov kiritish faqat Admin, davomad qo'yish faqat Teacher, shaxsiy ma'lumotlar faqat o'quvchining o'ziga).

## Oqibatlar
- Tizim mustaqil modullarga ajratildi, kod takrorlanishi minimallashtirildi.
- Token asosidagi autentifikatsiya orqali frontend va mobil ilovalar bilan qulay integratsiya ta'minlandi.
