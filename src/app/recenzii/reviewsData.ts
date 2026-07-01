export interface Review {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  date: string;      // ISO for sorting
  dateLabel: string; // display
  verified: boolean;
  product: string;
  text: string;
  helpful: number;
  photos: string[];
}

export const REVIEWS: Review[] = [
  { id: 1,  name: "Andreea Munteanu", initials: "AM", avatarColor: "#01934A", rating: 5, date: "2026-06-18", dateLabel: "18 iunie 2026", verified: true,  product: "KitKat Original", text: "Singurul loc din Moldova de unde îmi iau snacks-urile japoneze preferate. Comanda a ajuns impecabil ambalată și foarte rapid. Recomand cu toată încrederea!", helpful: 34, photos: ["/img/p1.jpg", "/img/p3.jpg"] },
  { id: 2,  name: "Victor Cebotari", initials: "VC", avatarColor: "#FF8A3D", rating: 5, date: "2026-06-15", dateLabel: "15 iunie 2026", verified: true,  product: "Ferrero Rocher 16pcs", text: "Am descoperit branduri pe care le știam doar din călătorii. Calitate reală, produse 100% originale și livrare rapidă de fiecare dată.", helpful: 28, photos: [] },
  { id: 3,  name: "Diana Popescu", initials: "DP", avatarColor: "#FF6FAF", rating: 4, date: "2026-06-12", dateLabel: "12 iunie 2026", verified: true,  product: "Oreo Family Pack", text: "Echipa e super atentă. Am avut o întrebare despre o comandă și mi-au răspuns în câteva minute. Singurul minus a fost că un produs era aproape de termen.", helpful: 19, photos: ["/img/p5.jpg"] },
  { id: 4,  name: "Mihai Rusu", initials: "MR", avatarColor: "#2B2B2B", rating: 5, date: "2026-06-10", dateLabel: "10 iunie 2026", verified: true,  product: "Pringles Original", text: "Prețuri corecte și o selecție pe care nu o găsești în alte magazine. Am comandat de 4 ori și de fiecare dată totul a fost perfect.", helpful: 41, photos: [] },
  { id: 5,  name: "Elena Ciobanu", initials: "EC", avatarColor: "#01934A", rating: 5, date: "2026-06-05", dateLabel: "5 iunie 2026", verified: false, product: "Kinder Bueno White", text: "Gusturi exact ca în străinătate! Ambalajul de protecție a fost excelent, nimic deteriorat. Voi reveni cu siguranță.", helpful: 12, photos: ["/img/p3.jpg"] },
  { id: 6,  name: "Alexandru Vârtosu", initials: "AV", avatarColor: "#FF8A3D", rating: 3, date: "2026-05-28", dateLabel: "28 mai 2026", verified: true,  product: "Monster Energy", text: "Produsele sunt bune, dar livrarea a durat puțin mai mult decât mă așteptam. În rest, totul ok.", helpful: 7, photos: [] },
  { id: 7,  name: "Cristina Lungu", initials: "CL", avatarColor: "#FF6FAF", rating: 5, date: "2026-05-22", dateLabel: "22 mai 2026", verified: true,  product: "Snickers XL", text: "Comandă perfectă! Totul proaspăt, original și livrat la timp. Atenția la detalii se vede în fiecare colet.", helpful: 23, photos: ["/img/p2.jpg", "/img/p11.jpg"] },
  { id: 8,  name: "Sergiu Bivol", initials: "SB", avatarColor: "#2B2B2B", rating: 4, date: "2026-05-18", dateLabel: "18 mai 2026", verified: true,  product: "M&M's Peanut", text: "Foarte mulțumit de calitate și de comunicare. Aș aprecia mai multe opțiuni de plată, dar per total experiență foarte bună.", helpful: 15, photos: [] },
  { id: 9,  name: "Natalia Țurcanu", initials: "NȚ", avatarColor: "#01934A", rating: 5, date: "2026-05-10", dateLabel: "10 mai 2026", verified: true,  product: "Twix White", text: "Cel mai bun magazin pentru dulciuri internaționale din Moldova. Mereu găsesc ceva nou de încercat. Felicitări echipei!", helpful: 37, photos: ["/img/p10.jpg"] },
  { id: 10, name: "Ion Gangan", initials: "IG", avatarColor: "#FF8A3D", rating: 5, date: "2026-05-02", dateLabel: "2 mai 2026", verified: false, product: "Coca-Cola Zero", text: "Comandat pentru o petrecere și a fost un succes total. Produse exotice pe care invitații nu le mai văzuseră. Super!", helpful: 9, photos: [] },
  { id: 11, name: "Maria Stratan", initials: "MS", avatarColor: "#FF6FAF", rating: 4, date: "2026-04-25", dateLabel: "25 aprilie 2026", verified: true,  product: "Haribo Goldbären", text: "Produse autentice și proaspete. Livrarea ar putea fi puțin mai ieftină, dar calitatea merită fiecare ban.", helpful: 11, photos: ["/img/p4.jpg"] },
  { id: 12, name: "Pavel Donică", initials: "PD", avatarColor: "#2B2B2B", rating: 5, date: "2026-04-15", dateLabel: "15 aprilie 2026", verified: true,  product: "Fanta Mango", text: "Băuturi pe care le-am gustat doar în Asia, acum livrate la ușa mea. Servicii impecabile și produse originale.", helpful: 26, photos: [] },
  { id: 13, name: "Olga Rotaru", initials: "OR", avatarColor: "#01934A", rating: 2, date: "2026-04-08", dateLabel: "8 aprilie 2026", verified: true,  product: "Pringles Original", text: "O cutie a ajuns ușor turtită. Echipa a rezolvat rapid și mi-a oferit reducere la următoarea comandă, deci apreciez suportul.", helpful: 5, photos: [] },
  { id: 14, name: "Radu Cojocaru", initials: "RC", avatarColor: "#FF8A3D", rating: 5, date: "2026-03-30", dateLabel: "30 martie 2026", verified: true,  product: "Ferrero Rocher 16pcs", text: "Cadou perfect! Ambalaj elegant, produs original și livrare la timp pentru aniversare. Mulțumesc mult!", helpful: 31, photos: ["/img/p12.jpg"] },
  { id: 15, name: "Veronica Frunză", initials: "VF", avatarColor: "#FF6FAF", rating: 5, date: "2026-03-20", dateLabel: "20 martie 2026", verified: false, product: "Kinder Bueno White", text: "Experiență de cumpărare foarte plăcută. Site ușor de folosit, produse de calitate și suport prompt. Recomand!", helpful: 14, photos: [] },
];

export const PRODUCTS_LIST = Array.from(new Set(REVIEWS.map((r) => r.product))).sort();
