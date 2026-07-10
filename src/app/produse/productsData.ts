import rawProducts from './products.json';

export interface Product {
  id: number;
  img: string;
  name: string;
  description: string;
  fullDescription?: string;
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

export const PRODUCTS: Product[] = rawProducts as unknown as Product[];

export const CATEGORIES = ["Acadele","Biscuiți","Bomboane","Băuturi","Ciocolată","Gumă & Jeleuri","Instant & Ramen","Snacks & Chips"];
export const BRANDS     = ["7UP","7Up","7up","A","A&W","AMOS","Aero","Aftershock","Aftershocks","Airheads","Alyan","American","Amos","AriZZona","AriZona","Arizona","BONDS","BOUNTY","BRIT","Babyruth","Baileys","Barnetts","Batman","Bazooka","Bebeto","Beemans","Big","Big League Chew","Birthday","Black","Blow","Blue","Bonds","Bottle","Boyer","Brain","Bubble Yum","Bubs","Buchanan's","Buncha","Bundaberg","Butterfinger","CADBURY","CANDY","CYCL","Cadbury","Cadbury's","Calypso","Candy","Caraboa","Caramello","Chandler's","Charleston","Charms","Cheerios","Cheetos","Cheez-It","Cherry","Chewbies","Chewits","Chip","Chips","Chocobubu","Cholula","Chookiz","Chunky","Chupa Chups","Cinnabon","Cinnamon","Coca","Coca-Cola","Coney's","Cookie","Cookies","Cow","Cox","Cracker","Cravers","Crazy","Crunch"];
export const COUNTRIES  = ["SUA","Europa","Japonia","China","Coreea"];
export const ATTRIBUTES = ["Fără gluten","Vegan","Fără zahăr"];
