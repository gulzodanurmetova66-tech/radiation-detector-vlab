VIRTUAL LABORATORIYA SAYTINI ISHGA TUSHIRISH

1) ZIPni oching va website papkasini ajrating.
2) Windows PowerShell oching:
   cd "$env:USERPROFILE\Desktop\website"
   py -m http.server 8000
3) Brauzerda http://localhost:8000 saytini oching.
4) Simulyatsiya: detektor turini tanlang; kuchlanish, ajralgan energiya, hodisa tezligi, dead-time slayderlarini o'zgartiring; ikkita grafik jonli yangilanadi.
5) 'Download current simulated voltage scan' CSV faylini yuklaydi. Barcha sonlar SIMULATION, real tajriba emas.
6) Ikkinchi paneldagi 4 ta klinik-fizik mini-keys yordamida muammoli ta'limni amalga oshiring. Bu mashqlar rasmiy pre/post-test savollari emas.
7) Saytni internetga chiqarish: GitHub repository oching, website papkasidagi index.html, model.js, app.js, wolfram_data.json fayllarini repository rootiga yuklang. Settings -> Pages -> Deploy from a branch -> main / (root) -> Save. GitHub foydalanuvchiga URL ko'rsatadi. Sayt manzilini bosh sahifada inkognito rejimda tekshiring.
8) Maqoladagi `https://REPLACE-WITH-VERIFIED-LAB-URL.example` matnini faqat real sayt URL tasdiqlangandan keyin almashtiring.
9) Tadqiqot ballarini saytda avtomatik yig'ish yoq: pretest/posttest uchun universitet tasdiqlagan alohida tizimdan foydalaning. Student ism/familiyasini ochiq saytga kiritmang.
10) Sahifa jonli grafik chizadi va Wolfram CSVdan konvertatsiya qilingan JSON bilan hisoblarning mosligini tekshiradi.

MUHIM: sayt analitik formulaga mos kelishi haqiqiy detektor kalibrovkasi degani emas.
