import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Admin (single account, no signup) ---
  const email = process.env.ADMIN_EMAIL || "admin@chadli-location.dz";
  const password = process.env.ADMIN_PASSWORD || "Chadli2026!";
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });
  console.log(`Admin ready: ${email}`);

  // --- Cars (name/desc in fr + ar + en) ---
  const cars = [
    {
      nameFr: "Dacia Logan",
      nameAr: "داسيا لوغان",
      nameEn: "Dacia Logan",
      descFr: "Citadine économique et fiable, parfaite pour la ville.",
      descAr: "سيارة مدينة اقتصادية وموثوقة، مثالية للمدينة.",
      descEn: "Economical and reliable city car, perfect for urban driving.",
      category: "Citadine",
      transmission: "Manuelle",
      seats: 5,
      fuel: "Diesel",
      pricePerDay: 3500,
      status: "available",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=900&q=80",
      ]),
    },
    {
      nameFr: "Volkswagen Golf 8",
      nameAr: "فولكس فاجن غولف 8",
      nameEn: "Volkswagen Golf 8",
      descFr: "Compacte moderne, confortable et bien équipée.",
      descAr: "سيارة مدمجة عصرية، مريحة ومجهزة جيداً.",
      descEn: "Modern compact, comfortable and well equipped.",
      category: "Citadine",
      transmission: "Automatique",
      seats: 5,
      fuel: "Diesel",
      pricePerDay: 6500,
      status: "available",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=900&q=80",
      ]),
    },
    {
      nameFr: "Mercedes Classe C",
      nameAr: "مرسيدس الفئة C",
      nameEn: "Mercedes C-Class",
      descFr: "Berline premium, élégance et performance réunies.",
      descAr: "سيارة سيدان فاخرة، تجمع بين الأناقة والأداء.",
      descEn: "Premium sedan combining elegance and performance.",
      category: "Berline",
      transmission: "Automatique",
      seats: 5,
      fuel: "Diesel",
      pricePerDay: 12500,
      status: "available",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&q=80",
      ]),
    },
    {
      nameFr: "Range Rover Sport",
      nameAr: "رينج روفر سبورت",
      nameEn: "Range Rover Sport",
      descFr: "SUV de luxe, dominant et puissant, idéal longues distances.",
      descAr: "دفع رباعي فاخر، قوي ومهيمن، مثالي للمسافات الطويلة.",
      descEn: "Luxury SUV, commanding and powerful, ideal for long distances.",
      category: "SUV",
      transmission: "Automatique",
      seats: 5,
      fuel: "Essence",
      pricePerDay: 22000,
      status: "available",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=80",
      ]),
    },
  ];

  for (const c of cars) {
    const existing = await prisma.car.findFirst({ where: { nameFr: c.nameFr } });
    if (existing) {
      await prisma.car.update({ where: { id: existing.id }, data: c });
    } else {
      await prisma.car.create({ data: c });
    }
  }
  console.log(`Cars ready: ${cars.length}`);

  // --- Site content (key → fr/ar/en) ---
  const content: Record<
    string,
    { fr: string; ar?: string; en?: string }
  > = {
    "hero.eyebrow": {
      fr: "Location de voitures premium en Algérie",
      ar: "تأجير سيارات فاخرة في الجزائر",
      en: "Premium car rental in Algeria",
    },
    "hero.title.line1": {
      fr: "Prenez la route.",
      ar: "انطلق في الطريق.",
      en: "Take the road.",
    },
    "hero.title.line2": {
      fr: "À votre {accent}rythme{/accent}.",
      ar: "على {accent}إيقاعك{/accent}.",
      en: "At your own {accent}pace{/accent}.",
    },
    "hero.subtext": {
      fr: "Réservez un véhicule en quelques secondes. Livraison rapide, tarifs transparents, sans surprise.",
      ar: "احجز سيارتك في ثوانٍ. توصيل سريع، أسعار شفافة، بدون مفاجآت.",
      en: "Book a vehicle in seconds. Fast delivery, transparent pricing, no surprises.",
    },
    "search.pickup.label": {
      fr: "Lieu de retrait",
      ar: "مكان الاستلام",
      en: "Pickup location",
    },
    "search.depart.label": { fr: "Départ", ar: "الانطلاق", en: "Pick-up" },
    "search.retour.label": { fr: "Retour", ar: "الإرجاع", en: "Return" },
    "fleet.title": {
      fr: "Véhicules disponibles",
      ar: "السيارات المتوفرة",
      en: "Available vehicles",
    },
    "fleet.subtitle": {
      fr: "Sélectionnés pour le confort, la fiabilité et le style.",
      ar: "مختارة للراحة والموثوقية والأناقة.",
      en: "Selected for comfort, reliability and style.",
    },
    "fleet.choose": { fr: "Choisir", ar: "اختر", en: "Choose" },
    "fleet.perDay": { fr: "/ jour", ar: "/ يوم", en: "/ day" },
    "fleet.badge.available": {
      fr: "Disponible",
      ar: "متوفرة",
      en: "Available",
    },
    "features.title": {
      fr: "Pourquoi nous choisir",
      ar: "لماذا تختارنا",
      en: "Why choose us",
    },
    "feature.1.title": {
      fr: "Réservation instantanée",
      ar: "حجز فوري",
      en: "Instant booking",
    },
    "feature.1.desc": {
      fr: "Vérifiez la disponibilité en temps réel et confirmez votre réservation en moins de deux minutes.",
      ar: "تحقق من التوفر في الوقت الفعلي وأكد حجزك في أقل من دقيقتين.",
      en: "Check real-time availability and confirm your booking in under two minutes.",
    },
    "feature.1.icon": { fr: "check", ar: "check", en: "check" },
    "feature.2.title": {
      fr: "Livraison à domicile",
      ar: "التوصيل إلى المنزل",
      en: "Home delivery",
    },
    "feature.2.desc": {
      fr: "Faites-vous livrer le véhicule où vous voulez : aéroport, hôtel, domicile.",
      ar: "احصل على سيارتك أينما كنت: المطار، الفندق، المنزل.",
      en: "Have the vehicle delivered wherever you are: airport, hotel, home.",
    },
    "feature.2.icon": { fr: "truck", ar: "truck", en: "truck" },
    "feature.3.title": {
      fr: "Sans frais cachés",
      ar: "بدون رسوم خفية",
      en: "No hidden fees",
    },
    "feature.3.desc": {
      fr: "Le prix affiché est le prix final. Assurance et kilométrage inclus selon la formule.",
      ar: "السعر المعروض هو السعر النهائي. التأمين والمسافة مشمولة حسب الصيغة.",
      en: "The displayed price is the final price. Insurance and mileage included depending on the plan.",
    },
    "feature.3.icon": { fr: "shield", ar: "shield", en: "shield" },
    "cta.title": {
      fr: "Prêt à prendre le volant ?",
      ar: "هل أنت مستعد للانطلاق؟",
      en: "Ready to take the wheel?",
    },
    "cta.button": {
      fr: "Voir la flotte complète",
      ar: "شاهد كل السيارات",
      en: "View the full fleet",
    },
    "nav.fleet": { fr: "Flotte", ar: "الأسطول", en: "Fleet" },
    "nav.rates": { fr: "Tarifs", ar: "الأسعار", en: "Rates" },
    "nav.agencies": { fr: "Agences", ar: "الوكالات", en: "Agencies" },
    "nav.contact": { fr: "Contact", ar: "اتصل بنا", en: "Contact" },
    "nav.book": { fr: "Réserver", ar: "احجز الآن", en: "Book now" },
    "contact.title": {
      fr: "Contactez-nous",
      ar: "اتصل بنا",
      en: "Contact us",
    },
    "contact.subtitle": {
      fr: "Une question ? Une demande spéciale ? Écrivez-nous.",
      ar: "سؤال؟ طلب خاص؟ راسلنا.",
      en: "A question? A special request? Write to us.",
    },
    "contact.phone": { fr: "+213 555 12 34 56", ar: "+213 555 12 34 56", en: "+213 555 12 34 56" },
    "contact.whatsapp": { fr: "+213 555 12 34 56", ar: "+213 555 12 34 56", en: "+213 555 12 34 56" },
    "contact.email": { fr: "contact@chadli-location.dz", ar: "contact@chadli-location.dz", en: "contact@chadli-location.dz" },
    "contact.address": {
      fr: "12 Rue Didouche Mourad, Alger",
      ar: "12 شارع ديدوش مراد، الجزائر",
      en: "12 Didouche Mourad Street, Algiers",
    },
    "agencies.list": {
      fr: "Alger — Aéroport|Alger — Centre|Oran — Aéroport|Constantine — Centre",
      ar: "الجزائر — المطار|الجزائر — الوسط|وهران — المطار|قسنطينة — الوسط",
      en: "Algiers — Airport|Algiers — Center|Oran — Airport|Constantine — Center",
    },
    "booking.title": {
      fr: "Réserver ce véhicule",
      ar: "احجز هذه السيارة",
      en: "Book this vehicle",
    },
    "booking.name": { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
    "booking.phone": { fr: "Téléphone", ar: "الهاتف", en: "Phone" },
    "booking.email": { fr: "Email (optionnel)", ar: "البريد الإلكتروني (اختياري)", en: "Email (optional)" },
    "booking.submit": { fr: "Demander la réservation", ar: "إرسال طلب الحجز", en: "Request booking" },
    "booking.success": {
      fr: "Demande envoyée ! Nous vous contactons rapidement.",
      ar: "تم إرسال الطلب! سنتواصل معك قريباً.",
      en: "Request sent! We will contact you shortly.",
    },
    "footer.rights": {
      fr: "Tous droits réservés.",
      ar: "جميع الحقوق محفوظة.",
      en: "All rights reserved.",
    },

    // ===== Tarifs page =====
    "tarifs.title": { fr: "Nos tarifs", ar: "أسعارنا", en: "Our rates" },
    "tarifs.subtitle": {
      fr: "Des prix clairs, sans frais cachés. Le kilométrage et l'assurance sont inclus selon la formule.",
      ar: "أسعار واضحة، بدون رسوم خفية. المسافة والتأمين مشمولان حسب الصيغة.",
      en: "Clear pricing, no hidden fees. Mileage and insurance included depending on the plan.",
    },
    "tarifs.perDay": { fr: "DA / jour", ar: "دج / يوم", en: "DA / day" },
    "tarifs.from": { fr: "À partir de", ar: "ابتداءً من", en: "Starting from" },
    "tarifs.bookBtn": { fr: "Réserver", ar: "احجز", en: "Book" },
    "tarifs.empty": {
      fr: "Aucun véhicule dans cette catégorie pour le moment.",
      ar: "لا توجد سيارات في هذه الفئة حالياً.",
      en: "No vehicles in this category yet.",
    },

    // ===== Agences page =====
    "agences.title": { fr: "Nos agences", ar: "وكالاتنا", en: "Our agencies" },
    "agences.subtitle": {
      fr: "Retirez et rendez votre véhicule où bon vous semble.",
      ar: "استلم وأعد سيارتك أينما يناسبك.",
      en: "Pick up and return your vehicle wherever suits you.",
    },
    "agences.hoursLabel": { fr: "Horaires", ar: "أوقات العمل", en: "Opening hours" },
    "agences.hours": {
      fr: "Tous les jours — 8h00 à 20h00",
      ar: "كل يوم — من 8:00 إلى 20:00",
      en: "Every day — 8:00 AM to 8:00 PM",
    },

    // ===== FAQ page =====
    "faq.title": { fr: "Questions fréquentes", ar: "الأسئلة الشائعة", en: "Frequently asked questions" },
    "faq.subtitle": {
      fr: "Tout ce qu'il faut savoir avant de réserver.",
      ar: "كل ما تحتاج معرفته قبل الحجز.",
      en: "Everything you need to know before booking.",
    },
    "faq.q1": {
      fr: "Quels documents faut-il pour louer une voiture ?",
      ar: "ما هي الوثائق اللازمة لاستئجار سيارة؟",
      en: "What documents do I need to rent a car?",
    },
    "faq.a1": {
      fr: "Une pièce d'identité ou passeport en cours de validité, un permis de conduire valide depuis au moins 2 ans, et une carte de paiement au nom du conducteur principal.",
      ar: "بطاقة هوية أو جواز سفر ساري المفعول، ورخصة قيادة سارية منذ سنتين على الأقل، وبطاقة دفع باسم السائق الرئيسي.",
      en: "A valid ID or passport, a driving license held for at least 2 years, and a payment card in the main driver's name.",
    },
    "faq.q2": {
      fr: "Quel est l'âge minimum pour louer ?",
      ar: "ما هو الحد الأدنى للسن للاستئجار؟",
      en: "What is the minimum age to rent?",
    },
    "faq.a2": {
      fr: "21 ans pour les catégories Citadine et Berline, 25 ans pour les SUV et véhicules de luxe.",
      ar: "21 سنة لفئتي المدينة والسيدان، و25 سنة للدفع الرباعي وسيارات الفخامة.",
      en: "21 for City and Sedan categories, 25 for SUVs and luxury vehicles.",
    },
    "faq.q3": {
      fr: "Puis-je me faire livrer le véhicule à l'aéroport ou à l'hôtel ?",
      ar: "هل يمكن توصيل السيارة إلى المطار أو الفندق؟",
      en: "Can the vehicle be delivered to the airport or my hotel?",
    },
    "faq.a3": {
      fr: "Oui, la livraison est gratuite dans un rayon de 15 km autour de nos agences, et payante au-delà ( tarif affiché au moment de la réservation ).",
      ar: "نعم، التوصيل مجاني في نطاق 15 كم حول وكالاتنا، ومؤدى عنه خارج هذا النطاق (يظهر السعر عند الحجز).",
      en: "Yes, delivery is free within 15 km of our agencies, and charged beyond that (price shown at booking).",
    },
    "faq.q4": {
      fr: "Le carburant est-il inclus dans le prix ?",
      ar: "هل الوقود مشمول في السعر؟",
      en: "Is fuel included in the price?",
    },
    "faq.a4": {
      fr: "Le véhicule vous est remis avec le plein et doit être rendu de la même façon. Sinon, des frais de remise à niveau s'appliquent.",
      ar: "تُسلَّم السيارة بخزان ممتلئ ويجب إعادتها بنفس الحالة. وإلا تُطبَّق رسوم إعادة التزويد.",
      en: "The vehicle is handed over with a full tank and must be returned the same way. Otherwise refuelling fees apply.",
    },
    "faq.q5": {
      fr: "Puis-je annuler ou modifier ma réservation ?",
      ar: "هل يمكنني إلغاء أو تعديل حجزي؟",
      en: "Can I cancel or modify my booking?",
    },
    "faq.a5": {
      fr: "Oui, gratuitement jusqu'à 48h avant le départ. Contactez-nous par téléphone ou WhatsApp avec votre référence de réservation.",
      ar: "نعم، مجاناً حتى 48 ساعة قبل الانطلاق. اتصل بنا هاتفياً أو عبر واتساب مع رقم حجزك.",
      en: "Yes, free of charge up to 48h before pick-up. Contact us by phone or WhatsApp with your booking reference.",
    },
    "faq.q6": {
      fr: "Que se passe-t-il en cas de panne ou d'accident ?",
      ar: "ماذا يحدث في حالة عطل أو حادث؟",
      en: "What happens in case of breakdown or accident?",
    },
    "faq.a6": {
      fr: "Une assistance 24/7 est incluse dans toutes nos formules. Le numéro figure sur votre contrat de location — appelez-nous et nous gérons le reste.",
      ar: "مساعدة على مدار الساعة مشمولة في جميع صيغنا. رقمها موجود في عقد الإيجار — اتصل بنا ونتولى الباقي.",
      en: "24/7 assistance is included in all plans. The number is on your rental contract — call us and we handle the rest.",
    },

    // ===== Footer =====
    "footer.about": {
      fr: "Location de voitures premium en Algérie. Livraison rapide, tarifs transparents, assistance 24/7.",
      ar: "تأجير سيارات فاخرة في الجزائر. توصيل سريع، أسعار شفافة، مساعدة على مدار الساعة.",
      en: "Premium car rental in Algeria. Fast delivery, transparent pricing, 24/7 assistance.",
    },
    "footer.faq": { fr: "FAQ", ar: "الأسئلة الشائعة", en: "FAQ" },

    // ===== Brand marquee (| separated, shown under the hero search bar) =====
    "marquee.brands": {
      fr: "Dacia|Renault|Volkswagen|Mercedes-Benz|BMW|Audi|Peugeot|Citroën|Toyota|Hyundai|Kia|Range Rover",
      ar: "داسيا|رينو|فولكس فاجن|مرسيدس|بي إم دبليو|أودي|بيجو|ستروين|تويوتا|هيونداي|كيا|رينج روفر",
      en: "Dacia|Renault|Volkswagen|Mercedes-Benz|BMW|Audi|Peugeot|Citroën|Toyota|Hyundai|Kia|Range Rover",
    },
    "marquee.label": {
      fr: "Notre flotte multimarques",
      ar: "أسطولنا متعدد الماركات",
      en: "Our multi-brand fleet",
    },
  };

  for (const [key, v] of Object.entries(content)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: {},
      create: { key, valueFr: v.fr, valueAr: v.ar ?? null, valueEn: v.en ?? null },
    });
  }
  console.log(`Site content keys ready: ${Object.keys(content).length}`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
