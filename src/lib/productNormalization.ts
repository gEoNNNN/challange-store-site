const CYRILLIC_HOMOGLYPHS: Record<string, string> = {
  А: "A", В: "B", С: "C", Е: "E", Н: "H", І: "I", К: "K", М: "M", О: "O", Р: "P", Т: "T", Х: "X", У: "Y",
  а: "a", с: "c", е: "e", і: "i", о: "o", р: "p", х: "x", у: "y", Ь: "b", ь: "b",
};

const BRAND_RULES = [
  [/^candy\s+(?:pop\s+)?m\s*&\s*m(?:['’]s)?\b/i, "Candy Pop"],
  [/^candy\s+(?:pop\s+)?twix\b/i, "Candy Pop"],
  [/^candy\s+can\b/i, "Candy Can"],
  [/^jelly\s+bean\s+factory\b/i, "The Jelly Bean Factory"],
  [/^mega\s+gummies\b/i, "Mega Gummies"],
  [/^pop\s+rocks\b/i, "Pop Rocks"],
  [/^sour\s+candy\s+paradise\b/i, "Sour Candy Paradise"],
  [/^sweet\s*16\b/i, "Sweet16"],
  [/^the\s+jelly\s+bean\s+factory\b/i, "The Jelly Bean Factory"],
  [/^big\s+league\s+chew\b/i, "Big League Chew"],
  [/^brain\s+blasterz\b/i, "Brain Blasterz"],
  [/^bubble\s+yum\b/i, "Bubble Yum"],
  [/^candy\s+pop\b/i, "Candy Pop"],
  [/^charleston\s+chew\b/i, "Charleston Chew"],
  [/^chupa\s+chups\b/i, "Chupa Chups"],
  [/^coca[\s-]+cola\b/i, "Coca-Cola"],
  [/^day['’]?s\s+soda\b/i, "Day's"],
  [/^din\s+don\b/i, "Din Don"],
  [/^dr\s+sour\b/i, "Dr Sour"],
  [/^goetze['’]?s\b/i, "Goetze's"],
  [/^hata(?:kosen)?\s+ramune\b/i, "HATA"],
  [/^hot\s+tamales\b/i, "Hot Tamales"],
  [/^ice\s+breakers\b/i, "Ice Breakers"],
  [/^international\s+delight\b/i, "International Delight"],
  [/^jelly\s+belly\b/i, "Jelly Belly"],
  [/^jolly\s+rancher\b/i, "Jolly Rancher"],
  [/^juicy\s+drop\b/i, "Juicy Drop"],
  [/^kit\s*kat\b/i, "KitKat"],
  [/^kool[\s-]+aid\b/i, "Kool-Aid"],
  [/^laffy\s+taffy\b/i, "Laffy Taffy"],
  [/^like\s+home\b/i, "Like Home"],
  [/^madam\s+hong\b/i, "Madam Hong"],
  [/^mike\s*(?:&|and)\s*ike\b/i, "Mike & Ike"],
  [/^mogu\s+mogu\b/i, "Mogu Mogu"],
  [/^now\s*(?:&|and)\s*later\b/i, "Now & Later"],
  [/^rip\s+rolls?\b/i, "Rip Rolls"],
  [/^sour\s+patch\s+kids\b/i, "Sour Patch Kids"],
  [/^sour\s+punch\b/i, "Sour Punch"],
  [/^toxic\s+waste\b/i, "Toxic Waste"],
  [/^van\s+holten['’]?s\b/i, "Van Holten's"],
  [/^zed\s+candy\b/i, "Zed Candy"],
  [/^7up\b/i, "7UP"],
  [/^a\s*&\s*w\b/i, "A&W"],
  [/^aero\b/i, "Aero"],
  [/^aftershocks?\b/i, "Aftershock"],
  [/^airheads\b/i, "Airheads"],
  [/^amos\b/i, "Amos"],
  [/^arizz?ona\b/i, "AriZona"],
  [/^baileys\b/i, "Baileys"],
  [/^barnetts\b/i, "Barnetts"],
  [/^batman\b/i, "Batman"],
  [/^bazooka\b/i, "Bazooka"],
  [/^bebeto\b/i, "Bebeto"],
  [/^bonds\b/i, "Bonds"],
  [/^bouncibles\b/i, "Bouncibles"],
  [/^bubs\b/i, "Bubs"],
  [/^buchanan['’]?s\b/i, "Buchanan's"],
  [/^bundaberg\b/i, "Bundaberg"],
  [/^butterfinger\b/i, "Butterfinger"],
  [/^cadbury(?:['’]s)?\b/i, "Cadbury"],
  [/^calypso\b/i, "Calypso"],
  [/^cheetos\b/i, "Cheetos"],
  [/^cheez[\s-]*it\b/i, "Cheez-It"],
  [/^chewits\b/i, "Chewits"],
  [/^chookiz\b/i, "Chookiz"],
  [/^doritos\b/i, "Doritos"],
  [/^fanta\b/i, "Fanta"],
  [/^goldfish\b/i, "Goldfish"],
  [/^haribo\b/i, "Haribo"],
  [/^hershey['’]?s\b/i, "Hershey's"],
  [/^hi[\s-]*chew\b/i, "Hi-Chew"],
  [/^jones\b/i, "Jones"],
  [/^krom\b/i, "KROM"],
  [/^lays?\b/i, "Lay's"],
  [/^marukawa\b/i, "Marukawa"],
  [/^mentos\b/i, "Mentos"],
  [/^monster\b/i, "Monster"],
  [/^mr\.?\s*beast\b/i, "MrBeast"],
  [/^nerds\b/i, "Nerds"],
  [/^oreo\b/i, "Oreo"],
  [/^pepsi\b/i, "Pepsi"],
  [/^pringles\b/i, "Pringles"],
  [/^prime\b/i, "PRIME"],
  [/^reese['’]?s\b/i, "Reese's"],
  [/^samyang\b/i, "Samyang"],
  [/^skittles\b/i, "Skittles"],
  [/^snickers\b/i, "Snickers"],
  [/^sweet16\b/i, "Sweet16"],
  [/^takis\b/i, "Takis"],
  [/^tango\b/i, "Tango"],
  [/^toast['’]?em\b/i, "Toast'em"],
  [/^tootsie\b/i, "Tootsie"],
  [/^trident\b/i, "Trident"],
  [/^twix\b/i, "Twix"],
  [/^vimto\b/i, "Vimto"],
  [/^warheads\b/i, "Warheads"],
] as const;

export function decodeProductText(value: string) {
  let result = value;
  for (let i = 0; i < 3; i++) {
    const decoded = result
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&(?:apos|#39);/gi, "'")
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
    if (decoded === result) break;
    result = decoded;
  }
  return [...result].map((char) => CYRILLIC_HOMOGLYPHS[char] ?? char).join("");
}

function removePackaging(value: string) {
  return value
    .replace(/\([^)]*(?:\d+(?:[.,]\d+)?\s*(?:mg|g|kg|ml|cl|l|oz)\b|\d+\s*[x×х]|[x×х]\s*\d+)[^)]*\)/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:mg|kg|ml|cl|oz)\b/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*g\b/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*l\b/gi, " ")
    .replace(/\b\d+\s*(?:x|×|х)\s*\d*\b/gi, " ")
    .replace(/\b\d+\s*(?:pack|pk|ct|buc)\.?\b/gi, " ")
    .replace(/\b\d+\s*p\b/gi, " ")
    .replace(/\b(?:master\s+carton|multipack|case|inner)\b/gi, " ");
}

function matchingBrandRule(value: string) {
  return BRAND_RULES.find(([pattern]) => pattern.test(value));
}

export function normalizeProductName(sourceName: string) {
  let name = decodeProductText(sourceName)
    .replace(/\S*�\S*/g, " ");
  name = removePackaging(name)
    .replace(/\(\s*\)/g, " ")
    .replace(/\s*[-–—]+\s*$/g, "")
    .replace(/\s+([,.)])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
  const rule = matchingBrandRule(name);
  if (rule) name = name.replace(rule[0], rule[1]);
  return name;
}

export function inferProductBrand(sourceName: string, suppliedBrand?: string | null) {
  const cleanName = normalizeProductName(sourceName);
  const fromName = matchingBrandRule(cleanName);
  if (fromName) return fromName[1];

  const cleanBrand = suppliedBrand ? decodeProductText(suppliedBrand).trim() : "";
  if (cleanBrand && !/^generic$/i.test(cleanBrand)) {
    const fromSupplied = matchingBrandRule(cleanBrand);
    return fromSupplied?.[1] ?? cleanBrand;
  }

  const firstToken = cleanName.match(/^[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’&.+-]*/)?.[0];
  if (!firstToken || firstToken.length < 2) return "Altele";
  if (/^[A-Z0-9&.+-]+$/.test(firstToken) && firstToken.length <= 7) return firstToken;
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase();
}
