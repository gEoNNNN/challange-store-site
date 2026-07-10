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
  { id: 1,  name: "Rife", initials: "RF", avatarColor: "#01934A", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Challenge Store", text: "Foarte bun magazinul, asortimentul este mare si calitatea ii buna, iubim Alex Coliban", helpful: 0, photos: [] },
  { id: 2,  name: "Gheorghe Hioara", initials: "GH", avatarColor: "#FF8A3D", rating: 5, date: "2026-06-27", dateLabel: "acum 2 săptămâni", verified: true, product: "Challenge Store", text: "Magazinul Challenge Store impresionează printr-un asortiment deosebit de bogat de bomboane exotice, aduse din diferite colțuri ale lumii. Fiecare produs oferă arome unice și combinații surprinzătoare, greu de găsit în magazinele obișnuite.", helpful: 0, photos: [] },
  { id: 3,  name: "Nicu Koliban", initials: "NK", avatarColor: "#FF6FAF", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Challenge Store", text: "Magazinul meu preferat, asortiment mare de produse, alegere buna pentru cadouri daca vrei sa bucuri pe cineva cu dulciuri deosebite. Recomand.", helpful: 4, photos: [] },
  { id: 4,  name: "Ksenia Tuhari", initials: "KT", avatarColor: "#2B2B2B", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Matcha", text: "Matcha, foarte gustoasă, corect gătită și de calitate foarte bună!", helpful: 3, photos: [] },
  { id: 5,  name: "Ana-Maria Gutuleac", initials: "AG", avatarColor: "#01934A", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Challenge Store", text: "Dulciuri foarte gustoase, prețuri bune si o varietate mare de produse", helpful: 3, photos: [] },
  { id: 6,  name: "Millena Ciornii", initials: "MC", avatarColor: "#FF8A3D", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Challenge Store", text: "Cele mai bune dulciuri din tot Chișinăul", helpful: 3, photos: [] },
  { id: 7,  name: "Gloria B", initials: "GB", avatarColor: "#FF6FAF", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Cafea & Matcha", text: "Recomand!!!! Cafea și matcha foarte gustoasă și gama de dulciuri foarte mare!", helpful: 3, photos: [] },
  { id: 8,  name: "TxT Luca", initials: "TL", avatarColor: "#2B2B2B", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Challenge Store", text: "Cea mai bună calitate", helpful: 3, photos: [] },
  { id: 9,  name: "Coliban Alexandru", initials: "CA", avatarColor: "#01934A", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Cafea & Matcha", text: "Am rămas plăcut impresionat, am gustat cafeaua cât și matcha foarte gustos iar din produse am rămas impresionat cu așa varietate mare de produse", helpful: 4, photos: [] },
  { id: 10, name: "Victor Dahnovici", initials: "VD", avatarColor: "#FF8A3D", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Challenge Store", text: "Super sunt fericit ca am ajuns la acest magazin", helpful: 3, photos: [] },
  { id: 11, name: "Alex Ungureanu", initials: "AU", avatarColor: "#FF6FAF", rating: 5, date: "2026-06-20", dateLabel: "acum 3 săptămâni", verified: true, product: "Challenge Store", text: "Magazin super, sunt multe dulciuri etc. Prețurile sunt foarte bune!!! Recomand la toți!!", helpful: 0, photos: [] },
  { id: 12, name: "Анна Мариморович", initials: "AM", avatarColor: "#2B2B2B", rating: 5, date: "2026-02-15", dateLabel: "acum 5 luni", verified: true, product: "Challenge Store", text: "Magazin excelent. O gamă largă de produse delicioase pe care nu le veți găsi în altă parte. Vânzători foarte amabili și politicoși. M-au ajutat să aleg varianta potrivită. Mulțumesc foarte mult!", helpful: 0, photos: [] },
  { id: 13, name: "Robert", initials: "RT", avatarColor: "#01934A", rating: 5, date: "2026-02-15", dateLabel: "acum 5 luni", verified: true, product: "Ceai Arizona", text: "Selecție excelentă de ceai Arizona din SUA", helpful: 1, photos: [] },
  { id: 14, name: "Andrei Rusu", initials: "AR", avatarColor: "#FF8A3D", rating: 5, date: "2026-01-20", dateLabel: "acum 6 luni", verified: true, product: "Challenge Store", text: "Dulciuri foarte gustoase", helpful: 2, photos: [] },
  { id: 15, name: "Victoria Gusarenco-Barscaia", initials: "VG", avatarColor: "#FF6FAF", rating: 5, date: "2026-01-20", dateLabel: "acum 6 luni", verified: true, product: "Challenge Store", text: "", helpful: 2, photos: [] },
  { id: 16, name: "Carolina Pavliutschii", initials: "CP", avatarColor: "#2B2B2B", rating: 5, date: "2026-07-05", dateLabel: "acum 4 zile", verified: true, product: "Challenge Store", text: "Unele dintre chestii sunt complet nostalgice pentru mine, fiindcă am fost în SUA la 16 ani. Îmi lipsesc gustările, cerealele și dulciurile lor. Recomand cu căldură magazinul, m-am distrat de minune și abia aștept să mănânc toate gustările", helpful: 1, photos: [] },
];

export const PRODUCTS_LIST = Array.from(new Set(REVIEWS.map((r) => r.product))).sort();
