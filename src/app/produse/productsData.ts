export interface Product {
  id: number;
  img: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  country: string;
  countryCode: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew: boolean;
  attributes: string[];
}

export const PRODUCTS: Product[] = [
  { id: 1,  img: "/img/p1.jpg",  name: "KitKat Original 4 Fingers", description: "Ciocolată cu lapte și cremă de wafer crunch.", brand: "Nestlé", category: "Ciocolată", country: "Europa", countryCode: "EU", price: 29, originalPrice: 35, rating: 4.8, reviews: 312, inStock: true,  isNew: false, attributes: [] },
  { id: 2,  img: "/img/p2.jpg",  name: "Snickers XL Bar", description: "Caramel, arahide și nougat învelit în ciocolată.", brand: "Mars", category: "Ciocolată", country: "SUA", countryCode: "US", price: 35, rating: 4.6, reviews: 198, inStock: true,  isNew: false, attributes: [] },
  { id: 3,  img: "/img/p3.jpg",  name: "Kinder Bueno White", description: "Cremă de alune în napolitane finos, glazură albă.", brand: "Ferrero", category: "Ciocolată", country: "Europa", countryCode: "EU", price: 42, originalPrice: 50, rating: 4.9, reviews: 451, inStock: true,  isNew: true,  attributes: [] },
  { id: 4,  img: "/img/p4.jpg",  name: "Haribo Goldbären 200g", description: "Urșuleți de gumă cu 5 arome fructate.", brand: "Haribo", category: "Gumă & Jeleuri", country: "Europa", countryCode: "EU", price: 38, rating: 4.7, reviews: 267, inStock: true,  isNew: false, attributes: ["Fără gluten"] },
  { id: 5,  img: "/img/p5.jpg",  name: "Oreo Classic Family Pack", description: "Biscuiți cu cremă de vanilie, pachet mare.", brand: "Oreo", category: "Biscuiți", country: "SUA", countryCode: "US", price: 25, originalPrice: 32, rating: 4.5, reviews: 389, inStock: true,  isNew: false, attributes: ["Vegan"] },
  { id: 6,  img: "/img/p6.jpg",  name: "Pringles Original 165g", description: "Chipsuri crocante originale din cartofi selectați.", brand: "Pringles", category: "Snacks & Chips", country: "SUA", countryCode: "US", price: 55, rating: 4.4, reviews: 156, inStock: true,  isNew: false, attributes: [] },
  { id: 7,  img: "/img/p7.jpg",  name: "Coca-Cola Zero 330ml", description: "Gustul original Coca-Cola fără zahăr.", brand: "Coca-Cola", category: "Băuturi", country: "SUA", countryCode: "US", price: 22, rating: 4.6, reviews: 520, inStock: true,  isNew: false, attributes: ["Fără zahăr"] },
  { id: 8,  img: "/img/p8.jpg",  name: "Fanta Mango Tropical", description: "Băutură carbogazoasă cu aromă de mango exotic.", brand: "Coca-Cola", category: "Băuturi", country: "Japonia", countryCode: "JP", price: 22, originalPrice: 28, rating: 4.3, reviews: 89,  inStock: true,  isNew: true,  attributes: [] },
  { id: 9,  img: "/img/p9.jpg",  name: "Monster Energy Green 500ml", description: "Băutură energizantă cu aromă clasică.", brand: "Monster", category: "Băuturi", country: "SUA", countryCode: "US", price: 65, rating: 4.2, reviews: 203, inStock: false, isNew: false, attributes: [] },
  { id: 10, img: "/img/p10.jpg", name: "Twix White Chocolate", description: "Caramel și biscuite învelite în ciocolată albă.", brand: "Mars", category: "Ciocolată", country: "Europa", countryCode: "EU", price: 32, rating: 4.5, reviews: 134, inStock: true,  isNew: true,  attributes: [] },
  { id: 11, img: "/img/p11.jpg", name: "M&M's Peanut Mega Bag", description: "Arahide învelite în ciocolată și glazură colorată.", brand: "Mars", category: "Ciocolată", country: "SUA", countryCode: "US", price: 45, originalPrice: 58, rating: 4.7, reviews: 278, inStock: true,  isNew: false, attributes: [] },
  { id: 12, img: "/img/p12.jpg", name: "Ferrero Rocher 16pcs", description: "Praline premium din alune și ciocolată fină.", brand: "Ferrero", category: "Ciocolată", country: "Europa", countryCode: "EU", price: 89, rating: 4.9, reviews: 567, inStock: true,  isNew: false, attributes: [] },
];

export const CATEGORIES = ["Ciocolată", "Snacks & Chips", "Băuturi", "Gumă & Jeleuri", "Biscuiți"];
export const BRANDS     = ["Nestlé", "Mars", "Ferrero", "Haribo", "Oreo", "Pringles", "Coca-Cola", "Monster"];
export const COUNTRIES  = ["SUA", "Europa", "Japonia", "Coreea", "China"];
export const ATTRIBUTES = ["Fără gluten", "Vegan", "Fără zahăr"];
