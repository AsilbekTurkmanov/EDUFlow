# ADR-002: PostgreSQL Ma'lumotlar Bazasi va Scalar API Dokumentatsiyasi

## Holat
Qabul qilindi (Accepted).

## Kontekst
Foydalanuvchi ma'lumotlar bazasi sifatida PostgreSQL (`localhost:5432`, `eduflow_db`) dan foydalanishni va API hujjatlashuvi hamda interaktiv sinovlar uchun an'anaviy Swagger o'rniga zamonaviy **Scalar** interfeysini qo'llashni belgilab berdi.

## Qaror
1. **PostgreSQL va EF Core (Npgsql)**:
   - `Npgsql.EntityFrameworkCore.PostgreSQL` 10.0 provayderi tanlandi.
   - Code-First uslubida jadvallar va munosabatlar shakllantirildi.
   - Tranzaksiyalar, relatsion bog'lanishlar, indekslar va unikal cheklovlar (`Email`, `Enrollment(GroupId, StudentId)`) bazada ta'minlandi.
   - Tizim dastlabki yuklanganda `DatabaseInitializer` orqali to'liq sinov (Seed) ma'lumotlari shakllantirilishi yo'lga qo'yildi.
2. **Scalar API Reference (`Scalar.AspNetCore`)**:
   - .NET 10 ning rasmiy `Microsoft.AspNetCore.OpenApi` paketi va `Scalar.AspNetCore` ulandi.
   - Interaktiv API marshruti: `/scalar/v1`.
   - Scalar "Moon" mavzusi asosida qora va zamonaviy ko'rinishda taqdim etildi.

## Oqibatlar
- PostgreSQL ning yuqori ishonchliligi va tezligi orqali ma'lumotlar xavfsizligi kafolatlandi.
- Dasturchilar va o'quvchilar uchun API endpointlarni testdan o'tkazish tajribasi yuqori darajada qulaylashdi.
