/**
 * Descrieri RO pentru produsele cu descriere lipsă (înlocuiesc fallback-ul la nume).
 * Fiecare regulă primește produsul { name, src, brand } și întoarce corpul descrierii;
 * „Ambalaj:” se adaugă automat din source_name la aplicare.
 */

function sizeOf(src) {
  const s = String(src || "");
  const multi = s.match(/(\d{1,2})\s*[xх×]\s*(\d+(?:[.,]\d+)?)\s*(ml|g|gr|kg|l)\b/i);
  const one = s.match(/(\d+(?:[.,]\d+)?)\s*(ml|g|gr|kg|l)\b/i);
  const unit = (u) => (u.toLowerCase() === "gr" ? "g" : u.toLowerCase());
  if (multi) return { text: `${multi[1]} × ${multi[2].replace(",", ".")} ${unit(multi[3])}`, single: false };
  if (one) return { text: `${one[1].replace(",", ".")} ${unit(one[2])}`, single: true };
  return null;
}

const t = (title, intro, feats = []) =>
  [title, intro, feats.filter(Boolean).map((f) => "• " + f).join("\n")].filter(Boolean).join("\n\n");

/** Numele din feed vin cu homoglife chirilice și greșeli OCR; le curățăm înainte de potrivire. */
const NAME_FIXES = [
  [/F\|avour/gi, "Flavour"], [/F[lаa]ч[oо]чr/gi, "Flavour"], [/Flaчoчr/gi, "Flavour"],
  [/Dri[пn]k/gi, "Drink"], [/Lemoande/gi, "Lemonade"], [/Т?[TТ]r[oо]p[iі]c[aа]l/gi, "Tropical"],
  [/Moпster Eпergy/gi, "Monster Energy"], [/Caпdy/gi, "Candy"], [/tl[аa]ч[oо]чr/gi, "flavour"],
  [/Рор/gi, "Pop"], [/Frult/gi, "Fruit"], [/Skitt!es|Sklttles/gi, "Skittles"], [/Lllipops/gi, "Lollipops"],
  [/Rll/gi, "Roll"], [/Orlginal/gi, "Original"], [/Cookle/gi, "Cookie"], [/iced cream/gi, "Ice Cream"],
  [/lced Tea/gi, "Iced Tea"], [/Porne10/gi, "Peach"], [/Bambo\b/gi, "Bamboo"],
  [/\s*\.\s*$/, ""], [/&#39;/g, "'"], [/&amp;/g, "&"],
];
const applyNameFixes = (value) => NAME_FIXES.reduce((acc, [re, to]) => acc.replace(re, to), String(value || ""));

const cleanName = (value) => {
  let out = applyNameFixes(value);
  // „... Flavour Chinese”, „... Canadian” etc. — coada de ambalaj nu face parte din aromă.
  for (let i = 0; i < 4; i++) {
    const next = out
      .replace(/\s+Flavours?\s*$/i, "")
      .replace(/\s+(Chinese|Chenese|Chlnese|Canadian|USA|Mexico|Malaysia|Japan|Korea|Korean|Brazilian|Australia)\s*$/i, "")
      .replace(/\s+Drinks?\s*$/i, "")
      .replace(/\s*\(?\s*\d+\s*[x×]\s*\d+\s*(?:g|gr|ml|kg|l)\b.*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (next === out) break;
    out = next;
  }
  return out;
};

/** Aromele din feed sunt în engleză; pentru textul românesc avem nevoie de forme firești. */
const RO_FLAVOUR = {
  banana: "banană", "green apple": "măr verde", "berry mix": "fructe de pădure",
  "passion fruit": "fructul pasiunii", peach: "piersică", pineapple: "ananas",
  raspberry: "zmeură", strawberry: "căpșuni", grape: "struguri", orange: "portocală",
  kiwi: "kiwi", lychee: "lychee", mango: "mango", watermelon: "pepene verde",
  cherry: "cireașă", cola: "cola", "sour apple": "măr acru", "blue raspberry": "zmeură albastră",
};
const RO_WORDS = {
  banana: "banană", chocolate: "ciocolată", cherry: "cireașă", grape: "struguri",
  melon: "pepene", peach: "piersică", passion: "fructul pasiunii", fruit: "fructe",
  punch: "punch", "sour": "acru", cream: "cremă", whipped: "cremos", coconut: "cocos",
  "half": "jumătate", "iced": "rece", tea: "ceai", lemon: "lămâie", strawberry: "căpșuni",
};
const roText = (value) =>
  String(value || "")
    .replace(/[A-Za-z]+/g, (w) => RO_WORDS[w.toLowerCase()] || w)
    .replace(/banană ciocolată/i, "banană și ciocolată")
    .replace(/dark cireașă/i, "cireașă neagră")
    .replace(/fructe punch/i, "fructe tropicale")
    .replace(/fructul pasiunii struguri/i, "fructul pasiunii și struguri")
    .replace(/hami pepene/i, "pepene galben (hami)");

const RO_COLOUR = {
  black: "negru", white: "alb", red: "roșu", blue: "albastru", green: "verde",
  purple: "violet", yellow: "galben", orange: "portocaliu", pink: "roz",
  "dark blue": "albastru închis", "sky blue": "albastru deschis",
  "dark green": "verde închis", "lime green": "verde lime",
};
const color = (value) => RO_COLOUR[String(value || "").trim().toLowerCase()] || String(value || "");

const ro = (flavour) => {
  const key = String(flavour || "").trim().toLowerCase();
  return RO_FLAVOUR[key] || String(flavour || "").trim();
};

const RULES = [
  // ── jucării ─────────────────────────────────────────────────────────────
  [/^Bouncibles (.+?) - (.+)$/i, (p, m) =>
    t(
      `Bouncibles ${m[1]} — jucărie de pluș care sare`,
      `Personaj moale și elastic din colecția Bouncibles: personajul ${m[2]}, care se aruncă, se prinde și se strânge fără să-și piardă forma. Colecția are 24 de personaje, fiecare cu personalitatea lui, iar textura plăcută la atingere le face potrivite atât pentru joacă, cât și pentru colecție.`,
      [
        `Personaj: ${m[1]} (${m[2]})`,
        "Material textil moale, cu umplutură elastică",
        "Testat conform standardelor de siguranță pentru jucării EN71 și ISO 8124",
        "Ideal pentru joacă în casă sau afară, cadou și colecție",
        "Se curăță local, cu o cârpă umedă",
      ]
    )],
  [/^KROM POP LOL (.+)$/i, (p, m) =>
    t(
      `KROM POP LOL ${m[1]} — kendama pentru începători și avansați`,
      "Kendama din lemn din gama POP LOL, cea mai accesibilă serie KROM și una dintre cele mai jucate jucării de îndemânare din lume. Cupele mai mari și forma tolerantă la prindere o fac potrivită pentru primii pași, dar și pentru trucuri avansate.",
      [
        `Model: POP LOL, culoarea ${color(m[1])}`,
        "Include bilă (tama), mâner (ken) și șnur textil",
        "Lemn de calitate, vopsit uniform, cu finisaj plăcut la atingere",
        "Joc de îndemânare, coordonare și concentrare, pentru toate vârstele",
      ]
    )],
  [/^KROM POP RUBBER (.+)$/i, (p, m) =>
    t(
      `KROM POP RUBBER ${m[1]} — kendama cu bilă cauciucată`,
      "Kendama din lemn din gama POP Rubber, varianta seriei POP cu bilă acoperită cu un strat cauciucat. Finisajul oferă aderență mai bună la prindere și control la trucuri, fiind alegerea potrivită pentru jucătorii care vor mai mult grip decât oferă lemnul clasic.",
      [
        `Model: POP Rubber, culoarea ${color(m[1])}`,
        "Bilă cu finisaj cauciucat, pentru aderență sporită",
        "Include mâner (ken) și șnur textil",
        "Potrivită pentru începători și jucători intermediari",
      ]
    )],
  [/^KROM NoIA (\d)$/i, (p, m) =>
    t(
      `KROM NoIA ${m[1]} — kendama premium KROM`,
      `Model NoIA ${m[1]}, cu formă echilibrată și finisaje atent lucrate, preferat de jucătorii cu experiență. Lemnul de calitate, vopseaua rezistentă la uzură și greutatea bine distribuită ajută la trucuri tehnice și la jocul lung.`,
      [
        `Model: NoIA ${m[1]}`,
        "Include bilă (tama), mâner (ken) și șnur",
        "Finisaj durabil, rezistent la uzură",
        "Recomandat jucătorilor intermediari și avansați",
      ]
    )],
  [/^KROM STROGO NEAPOLITAN (.+)$/i, (p, m) =>
    t(
      `KROM STROGO Neapolitan ${m[1]} — kendama cu design în trei straturi`,
      `Model STROGO, cu bila vopsită în stil napolitan: vanilla, ciocolată și căpșuni. Straturile clare de culoare ajută la urmărirea rotației bilei în timpul trucurilor și dau jocului un aspect ușor de recunoscut.`,
      [
        `Model: STROGO Neapolitan, varianta ${m[1].toLowerCase()}`,
        "Design în trei culori, cu straturi vizibile la rotire",
        "Include mâner (ken), bilă (tama) și șnur",
        "Kendama din lemn, pentru jucători intermediari și avansați",
      ]
    )],
  [/^SpyraBase\b/i, (p) =>
    t(
      `${p.name} — rezervor pliabil pentru blasterele Spyra`,
      "SpyraBase este rezervorul pliabil din echipamentul de bază al oricărui jucător Spyra: o rezervă de apă ușor de transportat, din material impermeabil rezistent, care se pliază compact după joc. Se umple la robinet și se folosește pentru reumplerea rapidă a blasterului în mijlocul bătăliei cu apă.",
      [
        `Culoare: ${p.name.split(" - ")[1] || "roșu"}`,
        "Se pliază și se transportă ușor",
        "Material impermeabil, rezistent",
        "Accesoriu compatibil cu blasterele Spyra",
      ]
    )],
  [/^Spyra/i, (p) =>
    t(
      `${p.name.replace(" - ", " (") + (p.name.includes(" - ") ? ")" : "")} — blaster cu apă electric`,
      "Blaster cu apă cu acționare electrică, din seria Spyra, gândit pentru bătălii cu apă în piscină, la mare sau în curte. Jet puternic și precis, rezervor de apă ușor de umplut și construcție din plastic rezistent, pentru joc fără întreruperi.",
      [
        `Model: ${p.name.split(" - ")[0]}`,
        p.name.includes(" - ") ? `Culoare: ${color(p.name.split(" - ")[1])}` : null,
        "Acționare electrică, jet puternic și precis",
        "Se folosește sub supraveghere; nu este potrivit copiilor mici",
      ]
    )],

  // ── băuturi ─────────────────────────────────────────────────────────────
  [/^Monster\b/i, (p) => {
    const variant = p.name
      .replace(/^Monster (?:Energy|Rehab|Reserve|Juiced?|Juice)\s*(?:Drink\s*)?/i, "")
      .replace(/\s*\(CAN\)/i, "")
      .trim();
    return t(
      `${p.name} — băutură energizantă`,
      "Băutură energizantă Monster, cu cofeină, taurină, L-carnitină și vitamine din grupul B. Gustul intens și efectul rapid o fac potrivită la muncă, la drum lung sau înainte de antrenament. Se servește rece, direct din doză.",
      [
        variant ? `Varianta: ${variant}` : null,
        "Conține cofeină — nu se recomandă copiilor, femeilor însărcinate sau persoanelor sensibile la cofeină",
        "Consum moderat, ca parte a unei diete echilibrate",
        "A se păstra la loc răcoros și uscat",
      ]
    );
  }],
  [/^Mountain Dew (.+?) ?[Bb]ottles?$/i, (p, m) =>
    t(
      `Mountain Dew ${m[1]} — băutură carbogazoasă`,
      `Băutură răcoritoare carbogazoasă Mountain Dew, varianta ${m[1]}, cu gust intens de citrice și cofeină. Se servește rece, simplă sau cu gheață.`,
      ["Brand: Mountain Dew (PepsiCo)", "Conține cofeină", "A se păstra la loc răcoros, ferit de soare"]
    )],
  [/^AriZona (.*?)(?: Can| Bottle)?$/i, (p, m) =>
    t(
      `AriZona ${m[1]} — băutură răcoritoare`,
      `Băutură din gama AriZona, cu gust ${m[1]}, într-un ambalaj generos, iconic pentru brand. Se servește rece; este la fel de bună simplă, cu gheață sau alături de o masă.`,
      ["Brand: AriZona Beverages (SUA)", "Se agită ușor înainte de consum", "A se păstra la loc răcoros"]
    )],
  [/^Bundaberg (.+?)(?: Flavour| Sparkling| Drink| Driпk| Flaчoчr)*\s*(?:Australia)?$/i, (p, m) =>
    t(
      `Bundaberg ${m[1].trim()} — băutură carbogazoasă australiană`,
      `Băutură răcoritoare dedicată, produsă de Bundaberg Brewed Drinks, compania de familie din Queensland, Australia, cunoscută pentru aromele intense și sticlele iconice. Varianta ${m[1].trim()} are un gust proaspăt și echilibrat, cu dulceață moderată și bule fine.`,
      ["Origine: Australia", "Se servește rece, simplă sau cu gheață", "Brand: Bundaberg Brewed Drinks"]
    )],
  [/^Fanta (.+?)$/i, (p, m) =>
    t(
      `Fanta ${m[1]} — băutură carbogazoasă cu aromă de fructe`,
      `Băutură răcoritoare carbogazoasă din gama Fanta, în ediția ${/Chinese|Chenese/i.test(p.raw || p.name) ? "asiatică" : /Malaysia/i.test(p.raw || p.name) ? "din Malaysia" : "internațională"}. Bulele fine și aroma intensă de ${roText(m[1]).toLowerCase()} o fac potrivită pentru orice moment al zilei, servită rece.`,
      ["Brand: Fanta (The Coca-Cola Company)", "Se servește rece, cu gheață", "A se păstra la loc răcoros, ferit de soare"]
    )],
  [/^Day['’]?s (.+)$/i, (p, m) =>
    t(
      `Day's ${m[1]} — băutură răcoritoare sud-africană`,
      `Băutură carbogazoasă din gama Day's, un brand sud-african foarte popular, cu gust ${m[1].toLowerCase()} și bule fine. Se servește rece, simplă sau cu gheață.`,
      ["Origine: Africa de Sud", "Se agită ușor înainte de consum", "A se păstra la loc răcoros"]
    )],
  [/^Sweet16 (.+)$/i, (p, m) =>
    t(
      `Sweet16 ${m[1].replace(/\s*\(Korea\)/i, "").replace(/ Ade/i, " Ade")} — băutură răcoritoare coreeană`,
      "Băutură din gama Sweet16, în plic practic de tip „pouch”, îndrăgită în Coreea. Varianta cu aromă de fructe este răcoritoare, ușor acidulată și fără zahăr adăugat, cu puține calorii — se servește rece, direct din plic sau cu gheață.",
      ["Origine: Coreea de Sud", "Fără zahăr adăugat", "Ambalaj tip plic, ușor de luat la drum", "Se servește rece, eventual cu gheață"]
    )],
  [/^Caffe Bene (.+)$/i, (p, m) =>
    t(
      `${p.name} — băutură răcoritoare coreeană`,
      `Băutură din gama Caffe Bene, celebrul lanț de cafenele din Coreea, ambalată într-un plic practic. Varianta ${m[1].replace(/lce‐Tea/i, "Ice Tea").trim()} este răcoritoare, dulce-acrișoară și bună servită rece, cu gheață sau chiar înghețată ca o băutură de tip slush.`,
      ["Origine: Coreea de Sud", "Ambalaj tip plic", "Se servește rece sau peste gheață"]
    )],
  [/^Calypso (.+?) Zero Sugar.*$/i, (p, m) =>
    t(
      `Calypso ${m[1]} — limonadă carbogazoasă fără zahăr`,
      `Limonadă premium din gama Calypso Zero Sugar, cu gust ${m[1].toLowerCase()} și bule fine, fără zahăr. Se servește rece, simplă sau cu gheață, ca alternativă răcoritoare la băuturile dulci.`,
      ["Brand: Calypso", "Fără zahăr", "Se servește rece, cu gheață"]
    )],
  [/^7up Cherry\b/i, () =>
    t(
      "7UP Cherry — băutură carbogazoasă cu aromă de cireașă",
      "Băutură răcoritoare cu bule fine, care combină gustul citric clasic al 7UP cu note dulci-acrișoare de cireașă. Se servește rece, simplă sau în cocktailuri, cu gheață și felii de lime.",
      ["Brand: 7UP", "Se servește rece", "A se păstra la loc răcoros, ferit de soare"]
    )],
  [/^Соса Cola|^Coca-Cola Cherry/i, (p) =>
    t(
      "Coca-Cola Cherry Float — băutură carbogazoasă cu aromă de cireașă și vanilie",
      "Băutură răcoritoare cu gustul clasic de Coca-Cola, completat de note de cireașă și vanilie, ca un float de înghețată. Se servește foarte rece, simplă sau cu gheață.",
      ["Brand: Coca-Cola", "Se servește rece", "A se păstra la loc răcoros"]
    )],
  [/^Dr Pepper Cream/i, (p) =>
    t(
      "Dr Pepper Cream & Coconut — băutură carbogazoasă",
      "Băutură carbogazoasă cu gustul clasic Dr Pepper, completat de note cremoase de nucă de cocos. Se servește rece, simplă sau cu gheață.",
      ["Origine: SUA", "Se servește rece", "A se păstra la loc răcoros"]
    )],
  [/^Dr Pepper Cherry Crush Zero Sugar/i, () =>
    t(
      "Dr Pepper Cherry Crush Zero Sugar — băutură carbogazoasă fără zahăr",
      "Varianta fără zahăr a gustului clasic Dr Pepper, cu un plus de cireașă. Bule fine, gust intens și zero zahăr; se servește foarte rece.",
      ["Fără zahăr", "Ambalaj PMP (price-marked pack)", "Se servește rece"]
    )],
  [/^RC Cola\b/i, () =>
    t(
      "RC Cola — băutură carbogazoasă clasică",
      "Cola clasică a brandului RC, cu gust echilibrat, mai puțin dulce decât alte cole, și bule fine. Se servește rece, simplă sau cu gheață.",
      ["Brand: RC Cola (Royal Crown)", "Se servește rece", "A se păstra la loc răcoros"]
    )],
  [/^Mirinda Strawberry/i, () =>
    t(
      "Mirinda Strawberry — băutură carbogazoasă cu aromă de căpșuni",
      "Băutură răcoritoare din gama Mirinda, cu aromă intensă de căpșuni și bule fine. Se servește rece, în doză slim, simplă sau cu gheață.",
      ["Brand: Mirinda (PepsiCo)", "Se servește rece", "A se păstra la loc răcoros"]
    )],
  [/^Redbull (.+)$/i, (p, m) =>
    t(
      `Red Bull ${m[1].replace(/\s*PM\s*El\.?75/i, "").trim()} — băutură energizantă`,
      "Băutură energizantă Red Bull, cu cofeină, taurină, vitamine din grupul B și zahăr. Gustul proaspăt și efectul rapid o fac potrivită la muncă, la drum sau înainte de antrenament. Se servește rece.",
      ["Brand: Red Bull", "Conține cofeină", "Consum moderat"]
    )],
  [/^Candy Can (.+?)(?: Candy| Can)?$/i, (p, m) =>
    t(
      `Candy Can ${m[1].trim()} — băutură carbogazoasă cu aromă de dulciuri`,
      `Băutură carbogazoasă din gama Candy Can, cu gust inspirat de dulciuri: ${m[1].trim().toLowerCase()}. O alternativă jucăușă la băuturile clasice, cu bule fine și aromă intensă, servită rece.`,
      ["Brand: Candy Can", "Fără zahăr (sortimentele Candy Can)", "Se servește rece"]
    )],
  [/^Popping Boba Drink (.+)$/i, (p, m) =>
    t(
      `Popping Boba Drink ${m[1]} — băutură cu perle de jeleu`,
      `Băutură răcoritoare cu aromă de ${m[1].toLowerCase()}, cu perle „popping boba” care se sparg în gură. Se servește rece, cu un pai gros, pentru o experiență de tip bubble tea.`,
      ["Conține perle de jeleu (popping boba)", "Se servește rece", "Se agită ușor înainte de consum"]
    )],
  [/^HATA (?:Soda )?(.+)$/i, (p, m) =>
    t(
      `HATA ${m[1].replace(/\s*\(Japan\)/i, "")} — băutură carbogazoasă japoneză`,
      "Băutură carbogazoasă japoneză din gama HATA (Hatakosen), cunoscută pentru sticla cu bilă care se apasă pentru a elibera bila de gaz. Gustul delicat și bulele fine o fac o experiență autentică de vară japoneză.",
      ["Origine: Japonia", "Brand: HATA (Hatakosen, din 1946)", "Se servește foarte rece"]
    )],
  [/^Old Jamaica Ginger Beer (.+)$/i, (p, m) =>
    t(
      `Old Jamaica Ginger Beer ${m[1]} — băutură carbogazoasă cu ghimbir`,
      `Băutură carbogazoasă cu extract autentic de ghimbir jamaican, ${m[1].toLowerCase() === "light" ? "în varianta light, cu mai puțin zahăr, dar cu aceeași iuțeală" : "cu gust puternic, picant și proaspăt"}. Se servește rece, simplă sau în cocktailuri.`,
      ["Origine: Marea Britanie", "Se servește foarte rece", "Se agită ușor înainte de consum"]
    )],
  [/^PATH Refillable/i, () =>
    t(
      "PATH Refillable Purified Water — sticlă reutilizabilă cu apă purificată",
      "Sticlă reutilizabilă din aluminiu, din colaborarea PATH cu Minions, livrată plină cu apă purificată. După consum, sticla se poate reumple oriunde — o alternativă practică la sticlele de plastic de unică folosință.",
      ["Colaborare: PATH × Minions", "Sticlă reutilizabilă din aluminiu", "Apă purificată, pH alcalin", "Se spală înainte de reumplere"]
    )],

  // ── snacks & chips ──────────────────────────────────────────────────────
  [/^Pringles (.+)$/i, (p, m) => {
    const flavour = m[1].replace(/Sour cream&Onion/i, "sour cream & onion").replace(/\s+Canadian$/i, "");
    return t(
      `Pringles ${flavour} — chipsuri crocante în tub`,
      `Chipsuri din piure de cartofi, cu forma clasică ce se stivuiește perfect în tub și textura crocantă care a făcut brandul celebru. Gustul ${flavour} este intens și bine echilibrat — o gustare potrivită acasă, la birou, la film sau la picnic.`,
      ["Brand: Pringles", "Tub sigilat, cu capac de reînchidere", "A se păstra ferit de umezeală și căldură"]
    );
  }],
  [/^Lay['’]?s Crispy French Fries Cup (.+)$/i, (p, m) =>
    t(
      `Lay's Crispy French Fries ${m[1]} — snack crocant din cartofi`,
      `Snack crocant din cartofi tăiați sub formă de pai, cu gust ${m[1].toLowerCase()}, servit într-un pahar practic. Ideal ca gustare rapidă, la birou sau la drum.`,
      ["Brand: Lay's", "Ambalaj tip pahar", "A se păstra ferit de umezeală"]
    )],
  [/^Lay['’]?s Stax (.+) Flavour/i, (p, m) =>
    t(
      `Lay's Stax ${m[1]} — chipsuri în tub`,
      `Chipsuri crocante din piure de cartofi, cu gust ${m[1].toLowerCase()}, ambalate în tub practic ce se poate reînchide. Perfecte pentru gustări rapide acasă sau la drum.`,
      ["Brand: Lay's Stax", "Tub cu capac de reînchidere", "A se păstra ferit de umezeală"]
    )],
  [/^Lay['’]?s (.+)$/i, (p, m) =>
    t(
      `Lay's ${m[1].replace(/[‐-]$/, "")} — chipsuri de cartofi`,
      `Chipsuri crocante de cartofi, cu gust ${m[1].replace(/[‐-]$/, "").toLowerCase()}, din gama Lay's. Ideale pentru o gustare rapidă, la film, la birou sau la picnic.`,
      ["Brand: Lay's", "A se păstra ferit de umezeală și căldură", "A se consuma imediat după deschidere"]
    )],
  [/^Takis (.+)$/i, (p, m) =>
    t(
      `Takis ${m[1].replace(/ USA| Mexico/, "")} — snack crocant picant`,
      `Snack crocant din porumb, rulat în formă de tub și condimentat puternic, în stilul autentic Takis. Varianta ${m[1].replace(/ USA| Mexico/, "")} este picantă și plină de gust — pentru cei care preferă snackurile îndrăznețe.`,
      ["Brand: Takis (Barcel)", `Origine: ${/Mexico/i.test(p.raw || p.name) ? "Mexic" : "SUA"}`, "Picant — a se consuma cu moderare"]
    )],
  [/^Dr Fire Crisps/i, () =>
    t(
      "Dr. Fire Crisps Afterburner — chipsuri extrem de picante",
      "Chipsuri crocante de cartofi, cu condimente extrem de picante și un gust care persistă. Varianta Afterburner este destinată iubitorilor de mâncare foarte iute; se servesc reci, direct din tub.",
      ["Nivel de iuțeală: extrem", "Ambalaj: tub de 80 g", "A se păstra ferit de umezeală"]
    )],
  [/^Hot Chip Chilli Stripz/i, () =>
    t(
      "Hot Chip Chilli Stripz Limed Habaneros — strips crocante picante",
      "Strips crocante din cartofi, condimentate cu ardei habanero și lime. Iuțeală medie, cu o notă proaspătă de lime care echilibrează gustul picant.",
      ["Nivel de iuțeală: mediu", "Ambalaj: 80 g", "A se păstra ferit de umezeală"]
    )],
  [/^HuligaN Pretzel/i, () =>
    t(
      "HuligaN Pretzel Crush Sriracha Chilli Sauce — snack crocant din covrigei",
      "Covrigei crocanți, zdrobiți și condimentați cu sos sriracha și chili. Gust picant, cu note de covrig proaspăt — o gustare îndrăzneață, gata de ronțăit.",
      ["Nivel de iuțeală: mediu-picant", "Ambalaj: 65 g", "A se păstra ferit de umezeală"]
    )],
  [/^Poppets Milk Choc/i, () =>
    t(
      "Poppets Milk Choc Coated Toffee Popcorn — popcorn cu ciocolată cu lapte",
      "Popcorn cu aromă de toffee, acoperit în ciocolată cu lapte. Combinația de popcorn crocant, caramel și ciocolată cremoasă face din acest snack o gustare indulgentă, perfectă la film.",
      ["Fără coloranți și arome artificiale", "Ambalaj: 100 g", "A se păstra la loc răcoros și uscat"]
    )],

  // ── bomboane & gumă ─────────────────────────────────────────────────────
  [/^Amos 4D Gummy Blocks/i, () =>
    t(
      "Amos 4D Gummy Blocks — bomboane gumate de construit",
      "Bomboane gumate colorate, sub formă de blocuri care se îmbină: se pot construi, stivui și apoi mânca. Sunt vegane și preparate cu suc de fructe, cu o textură moale și aromă fructată.",
      ["Vegan", "Cu suc de fructe", "Blocuri care se îmbina", "Ambalaj: 198 g"]
    )],
  [/^Amos Peelerz (?:Gummy )?(?!Mystery)(.+?)(?: Peg Bag)?$/i, (p, m) =>
    t(
      `Amos Peelerz ${m[1]} — jeleuri care se curăță`,
      `Jeleuri moi, în formă de fructe, cu un strat exterior care se poate „coji” exact ca un fruct adevărat. În interior, un jeleu moale și aromat de ${ro(m[1])} — două texturi într-o singură bomboană.`,
      ["Textură dublă: strat exterior peelabil, miez moale", "Aromă: " + m[1], "Brand: Amos (SUA)", "Ideal pentru copii și colecționari de dulciuri noi"]
    )],
  [/^Amos peelerz (.+?)(?: Реg Bag.*| Peg Bag.*)?$/i, (p, m) =>
    t(
      `Amos Peelerz ${m[1]} — jeleuri care se curăță`,
      `Jeleuri moi, în formă de fructe, cu un strat exterior care se poate „coji” ca un fruct adevărat, iar în interior un miez moale și aromat. Varianta ${m[1]} oferă o experiență de gust fructată și distractivă.`,
      ["Textură dublă, peelabilă", "Brand: Amos (SUA)", "Ideal pentru copii și cadouri"]
    )],
  [/^Amos Peelerz Mystery Cube/i, () =>
    t(
      "Amos Peelerz Mystery Cube — jeleu surpriză",
      "Jeleu în formă de cub, cu un strat exterior care se curăță și un miez cu aromă surpriză. Fiecare cub ascunde o aromă diferită, ceea ce face din el o gustare distractivă pentru copii și nu numai.",
      ["Aromă surpriză", "Textură peelabilă", "Brand: Amos"]
    )],
  [/^Airheads Xtremes Belts (.+)$/i, (p, m) =>
    t(
      `Airheads Xtremes Belts ${m[1]} — benzi gumate acre`,
      `Benzi gumate lungi și elastice, cu gust intens de ${m[1].toLowerCase()} și un înveliș acrișor. Se rup, se rulează și se savurează — o bomboană distractivă, preferată de copii.`,
      ["Textură gumoasă, acrișoară", "Aromă: " + m[1], "Brand: Airheads (Perfetti Van Melle)", "Ambalaj: 85 g"]
    )],
  [/^Aftershock Popping Candy (.+)$/i, (p, m) =>
    t(
      `Aftershock Popping Candy ${m[1]} — bomboane care pocnesc`,
      `Bomboane cu zahăr cristalizat care „pocnesc” și sfârâie pe limbă, cu aromă de ${m[1].toLowerCase()}. O senzație distractivă, pentru copii și adulți deopotrivă.`,
      ["Efect „popping” în gură", "Aromă: " + m[1], "Ambalaj: 8,5 g"]
    )],
  [/^Barnetts Mega Sour (.+)$/i, (p, m) =>
    t(
      `Barnetts Mega Sour ${m[1]} — bomboane extrem de acre`,
      `Bomboane tari cu un strat extrem de acru și miez dulce, cu aromă de ${m[1].toLowerCase()}. Provocarea „mega sour” a brandului Barnetts, pentru iubitorii de gusturi acide.`,
      ["Nivel de aciditate: foarte ridicat", "Aromă: " + m[1], "Brand: Barnetts"]
    )],
  [/^Bazooka Push/i, () =>
    t(
      "Bazooka Push Pop Dipperz — acadea cu praf acrișor",
      "Acadea cu aromă de gumă de mestecat, care se „împinge” din ambalaj și se combina cu praful acrișor din pachet. Format de joacă și gust, ușor de luat cu tine.",
      ["Acadea + praf acrișor", "Brand: Bazooka", "Ideal pentru copii"]
    )],
  [/^Blow Pop Inside Outs/i, () =>
    t(
      "Blow Pop Inside Outs — acadele umplute",
      "Acadele tari, cu miez gumos și aromă fructată, în formatul clasic Blow Pop. Stratul exterior se linge, iar în interior rămâne guma de mestecat — două dulciuri într-unul.",
      ["Acadea cu miez gumos", "Brand: Blow Pop (Charms)", "Ambalaj: 198 g"]
    )],
  [/^Blow Pops? (.+)$/i, (p, m) =>
    t(
      `Blow Pop ${m[1]} — acadea cu gumă în interior`,
      `Acadea tare cu aromă de ${m[1].toLowerCase()}, care ascunde un miez de gumă de mestecat. Se linge până ajungi la gumă, apoi se mestecă — distracție dublă.`,
      ["Acadea + gumă de mestecat", "Aromă: " + m[1], "Brand: Charms"]
    )],
  [/^Brain Licker Bits/i, () =>
    t(
      "Brain Licker Bits — bomboane lichide acre",
      "Picături de bomboană lichidă, dulce-acrișoare, din gama Brain Licker. Se suge direct din flaconul mic sau se folosesc pentru a acri deserturi — gust intens, pentru iubitorii de dulce-acrișor.",
      ["Bomboană lichidă", "Gust intens dulce-acrișor", "Brand: Brain Licker"]
    )],
  [/^Brain Licker Spray/i, () =>
    t(
      "Brain Licker Spray N Fizz — spray cu bomboană acrișoară",
      "Bomboană lichidă sub formă de spray, cu gust dulce-acrișor și efect ușor efervescent pe limbă. Se pulverizează direct în gură — distractiv și practic de luat cu tine.",
      ["Bomboană lichidă, spray", "Gust dulce-acrișor", "Ambalaj: 80 g"]
    )],
  [/^Lickedy Lips Spray/i, () =>
    t(
      "Lickedy Lips Spray — spray cu bomboană lichidă",
      "Bomboană lichidă în spray, cu aromă fructată și gust dulce-acrișor, în flacon roz, soră a celebrului Brain Licker. Se pulverizează direct pe limbă.",
      ["Bomboană lichidă, spray", "Arome fructate", "Ambalaj: 60 ml"]
    )],
  [/^Cry Baby Wax Sour/i, () =>
    t(
      "Cry Baby Wax Sour Mini Drinks — bomboane acre în sticluțe de ceară",
      "Sticluțe mici din ceară, umplute cu sirop de bomboană extrem de acru, cu arome de fructe. Se mușcă vârful sticluței și se bea lichidul acrișor — o bomboană nostalgică, distractivă.",
      ["Bomboană lichidă în sticluțe de ceară", "Gust foarte acru", "Arome: portocală, lămâie, cireașă, afine"]
    )],
  [/^Coneys Waffle(?: Cone)? (.+)$/i, (p, m) => {
    const map = { chocolate: "ciocolată", strawberry: "căpșuni", vanlla: "vanilie", vanilla: "vanilie" };
    const raw = m[1].replace(/\s*Cone\b/i, "").replace(/\s*Flavours?$/i, "").trim();
    const flavour = map[raw.toLowerCase()] || raw.toLowerCase();
    return t(
      `Coneys Waffle Cone ${raw} — miniconuri umplute`,
      `Miniconuri de vafă crocante, umplute cu cremă cu gust de ${flavour}. Un snack dulce, inspirat de înghețata în con, cu textură crocantă la exterior și umplutură cremoasă în interior.`,
      ["Con de vafă crocant + umplutură cremoasă", "Ambalaj: 12 × 63 g", "A se păstra la loc uscat"]
    );
  }],
  [/^Din Don Fruity/i, (p) =>
    t(
      `${p.name.replace(/&#39;/g, "'").replace(/&amp;/g, "&")} — jeleuri fructate`,
      "Jeleuri tari, în forme de fructe, cu arome intense și o textură care se mestecă îndelung. Varianta din gama Ju-C este celebră pe rețelele sociale pentru „challenge-urile” de gust; perfecte pentru împărțit cu prietenii.",
      ["Jeleuri tari, în forme de fructe", "Arome: căpșuni, măr acru, ananas, struguri, portocală", "Ambalaj: 360 g"]
    )],
  [/^Fruit Roll-Ups (.+)$/i, (p, m) =>
    t(
      `Fruit Roll-Ups ${m[1]} — folie de fructe`,
      `Foliuță subțire și elastică din piure de fructe, cu gust ${m[1].toLowerCase()}. Se desface din rolă, se rupe în bucăți și se mănâncă — un snack distractiv, ambalat individual.`,
      ["Snack din piure de fructe", "Ambalare individuală", "Brand: Fruit Roll-Ups (General Mills)"]
    )],
  [/^Fruit Gushers (.+)$/i, (p, m) =>
    t(
      `Fruit Gushers ${m[1]} — bomboane gumate cu miez lichid`,
      `Bomboane gumate cu miez lichid de fructe care „țâșnește” la prima mușcătură. Varianta ${m[1]} combină mai multe arome fructate, pentru o gustare jucăușă.`,
      ["Miez lichid de fructe", "Textură moale, gumoasă", "Brand: Fruit Gushers (General Mills)"]
    )],
  [/^Fluffy Stuff/i, () =>
    t(
      "Fluffy Stuff Cotton Tails — vată de zahăr",
      "Vată de zahăr pufoasă, ambalată în pungi rezistente la umezeală, ca să rămână proaspătă. Se topește în gură și are gustul clasic de bâlci — ideală pentru petreceri și cadouri.",
      ["Fără grăsimi, fără gluten", "Ambalaj rezistent la umezeală", "Ambalaj: 60 g"]
    )],
  [/^Fruit Flavour Bubble Gum/i, () =>
    t(
      "Fruit Flavour Bubble Gum — gumă de mestecat cu aromă de fructe",
      "Gumă de mestecat cu aromă fructată, moale și elastică, bună pentru baloane. În ambalaj practic, pentru acasă sau la școală.",
      ["Aromă de fructe", "Textură elastică", "Ambalaj: 18 × 40 g"]
    )],
  [/^Bubble Gum$/i, (p) =>
    t(
      "Bubble Gum — gumă de mestecat clasică",
      "Gumă de mestecat cu gustul clasic de bubble gum, moale și elastică, ideală pentru baloane. Se găsește în ambalaj practic, pentru acasă, birou sau petreceri.",
      ["Gust clasic de bubble gum", "Textură elastică, pentru baloane", "Ambalaj: " + (sizeOf(p.src)?.text || "bucăți individuale")]
    )],
  [/^Halloween Big Chewy Nerds/i, () =>
    t(
      "Halloween Big Chewy Nerds — bomboane gumate cu înveliș crocant",
      "Bomboane gumate mari, cu înveliș crocant de tip Nerds, în ediție de Halloween. Combinația de crocant și gumos, cu arome fructate intense, le face perfecte pentru cadouri și petreceri.",
      ["Înveliș crocant + miez gumos", "Ediție Halloween", "Arome fructate"]
    )],
  [/^Haribo MERRYMIX/i, () =>
    t(
      "Haribo MerryMix — jeleuri asortate",
      "Mix de jeleuri Haribo, cu forme și arome variate, pentru toate gusturile. Textura moale și aromele fructate fac din acest mix o gustare potrivită pentru toată familia.",
      ["Mix de forme și arome", "Brand: Haribo", "Fără coloranți artificiali"]
    )],
  [/^Hello Kitty Gummy/i, () =>
    t(
      "Hello Kitty Gummy Treats Fruit — jeleuri fructate",
      "Jeleuri moi, în forme inspirate de Hello Kitty, cu arome de fructe. Ambalajul vesel le face un cadou potrivit pentru copii și colecționari.",
      ["Arome de fructe", "Forme Hello Kitty", "Ambalaj: 140 g"]
    )],
  [/^Hershey['’]?s Hugs/i, () =>
    t(
      "Hershey's Hugs White Creme — bomboane din cremă albă",
      "Bomboane în formă de „îmbrățișare”, cu miez din cremă albă și înveliș de ciocolată cu lapte, presărate cu dungi. Gust cremos, echilibrat, pentru iubitorii de ciocolată albă.",
      ["Cremă albă + ciocolată cu lapte", "Ambalaj pentru împărțit", "Brand: Hershey's"]
    )],
  [/^Hershey['’]?s Kisses Birthday Cake/i, () =>
    t(
      "Hershey's Kisses Birthday Cake — bomboane cu aromă de tort aniversar",
      "Bomboane Hershey's Kisses cu aromă de tort aniversar și bucăți colorate de bomboane, învelite în ciocolată. Un cadou vesel pentru zile de naștere și sărbători.",
      ["Aromă de tort aniversar", "Ambalate individual", "Brand: Hershey's"]
    )],
  [/^Hershey['’]?s Kisses Special Dark/i, () =>
    t(
      "Hershey's Kisses Special Dark — bomboane din ciocolată neagră",
      "Bomboane Hershey's Kisses din ciocolată neagră, cu gust intens de cacao și textură fină. Ambalate individual, ideale pentru împărțit.",
      ["Ciocolată neagră", "Ambalate individual", "Brand: Hershey's"]
    )],
  [/^Hershey['’]?s Milk Chocolate Santas/i, () =>
    t(
      "Hershey's Milk Chocolate Santas — ciocolată cu lapte de Crăciun",
      "Bomboane din ciocolată cu lapte, în formă de Moș Crăciun, ambalate individual. Un cadou dulce pentru sărbătorile de iarnă.",
      ["Ciocolată cu lapte", "Formă de Moș Crăciun", "Brand: Hershey's"]
    )],
  [/^Hershey['’]?s Mounds/i, () =>
    t(
      "Hershey's Mounds — baton cu nucă de cocos și ciocolată neagră",
      "Baton cu umplutură moale de nucă de cocos, învelit în ciocolată neagră. Combinația tropicală, cu textură cremoasă și gust intens de cacao, este un clasic american.",
      ["Nucă de cocos + ciocolată neagră", "Fără gluten", "Brand: Hershey's"]
    )],
  [/^Hershey['’]?s Nuggets (.+)$/i, (p, m) => {
    const flavour = /toffee/i.test(m[1]) ? "toffee și migdale" : /almond/i.test(m[1]) ? "migdale" : m[1].toLowerCase();
    return t(
      `Hershey's Nuggets ${m[1]} — bomboane de ciocolată`,
      `Bomboane din ciocolată cu lapte, cu ${flavour}, învelite individual. Gust bogat, crocant și cremos — ideale pentru împărțit sau pentru masa de sărbători.`,
      ["Ciocolată cu lapte", "Ambalate individual", "Brand: Hershey's"]
    );
  }],
  [/^Hershey['’]?s (?:Bar )?Cookies/i, (p) =>
    t(
      "Hershey's Cookies 'n' Creme — tabletă de ciocolată albă cu biscuiți",
      "Tabletă din ciocolată albă, cu bucăți crocante de biscuiți cu cacao. Gust dulce și cremos, echilibrat de textura crocantă a biscuiților.",
      ["Ciocolată albă + biscuiți cu cacao", "Brand: Hershey's", "Ideală pentru deserturi și cadouri"]
    )],
  [/^Hershey['’]?s Milk Chocolate/i, () =>
    t(
      "Hershey's Milk Chocolate — tabletă de ciocolată cu lapte",
      "Ciocolată cu lapte clasică, cu gust cremos și note de caramel, în tabletă generoasă. Se rupe în pătrățele și se savurează simplă sau în deserturi.",
      ["Ciocolată cu lapte", "Brand: Hershey's", "A se păstra la loc răcoros"]
    )],
  [/^Reese['’]?s Big Cup Marshmallow/i, () =>
    t(
      "Reese's Big Cup Marshmallow — cupă cu unt de arahide și bezea",
      "Versiunea mare a cupelor Reese's, cu cremă de unt de arahide și un strat de bezea, totul învelit în ciocolată. Gust dulce, cremos, cu textură pufoasă.",
      ["Unt de arahide + bezea", "Înveliș de ciocolată", "Brand: Reese's"]
    )],
  [/^Reese['’]?s Oreo/i, () =>
    t(
      "Reese's Oreo Miniature Cups — minicups cu Oreo",
      "Mini cups Reese's cu cremă de unt de arahide și bucăți crocante de biscuiți Oreo, învelite în ciocolată. Gust de ciocolată, arahide și cacao într-o singură mușcătură.",
      ["Unt de arahide + Oreo", "Format mini", "Brand: Reese's"]
    )],
  [/^Reese['’]?s Peanut Butter Cups Snack/i, () =>
    t(
      "Reese's Peanut Butter Cups — cupă cu unt de arahide",
      "Cupa clasică Reese's: cremă fină de unt de arahide învelită în ciocolată cu lapte. Gustul dulce-sărat, echilibrat, care a făcut brandul celebru.",
      ["Unt de arahide + ciocolată cu lapte", "Ambalare individuală", "Brand: Reese's"]
    )],
  [/^Reese['’]?s /i, (p) =>
    t(
      `${p.name} — baton cu unt de arahide`,
      "Baton Reese's cu cremă de unt de arahide și bucăți crocante, învelit în ciocolată. Combinația dulce-sărată, cu textură cremoasă și crocantă, este semnătura brandului Reese's.",
      ["Unt de arahide + ciocolată", "Brand: Reese's", "Ambalare individuală"]
    )],
  [/^Cadbury Chocolate Selection Box/i, () =>
    t(
      "Cadbury Chocolate Selection Box — cutie asortată de ciocolată",
      "Cutie cu o selecție de ciocolată Cadbury: batoane și bomboane îndrăgite, ambalate pentru cadou. Conținutul include clasici Cadbury Dairy Milk și alte sortimente din gamă.",
      ["Cutie cadou", "Ciocolată cu lapte Cadbury", "Brand: Cadbury"]
    )],
  [/^Cadbury Dairy Milk Buttons/i, () =>
    t(
      "Cadbury Dairy Milk Buttons — bomboane de ciocolată în formă de buton",
      "Bomboane de ciocolată Cadbury Dairy Milk în formă de buton, care se topesc încet în gură. Gust cremos, clasic, în pachet practic pentru împărțit.",
      ["Ciocolată cu lapte", "Ambalaj multipack", "Brand: Cadbury"]
    )],
  [/^Cadbury Eclairs/i, () =>
    t(
      "Cadbury Eclairs — bomboane cu caramel și ciocolată",
      "Bomboane cu miez de caramel moale, acoperite cu ciocolată Cadbury. Se mestecă îndelung și au gust intens de caramel cu lapte — un clasic al brandului Cadbury.",
      ["Caramel + ciocolată", "Ambalaj carton", "Brand: Cadbury"]
    )],
  [/^Candy Can Pac-Man/i, () =>
    t(
      "Candy Can Pac-Man Orange — băutură carbogazoasă cu aromă de portocală",
      "Băutură carbogazoasă cu gust de portocală, în ediția Pac-Man. Bulele fine și aroma fructată o fac o alegere distractivă pentru fanii jocului.",
      ["Ediție Pac-Man", "Fără zahăr", "Se servește rece"]
    )],
  [/^Candy Can Toxic Waste (.+)$/i, (p, m) =>
    t(
      `Candy Can Toxic Waste ${m[1]} — băutură carbogazoasă acrișoară`,
      `Băutură carbogazoasă inspirată de bomboanele Toxic Waste, cu gust ${m[1].toLowerCase()} și o notă acrișoară. O experiență îndrăzneață, servită rece.`,
      ["Inspirată de bomboanele Toxic Waste", "Gust acrișor", "Fără zahăr"]
    )],
  [/^Candy Can Marshmallow/i, () =>
    t(
      "Candy Can Marshmallow — băutură carbogazoasă cu aromă de bezea",
      "Băutură carbogazoasă cu gust dulce de bezea, din gama Candy Can. Aromă intensă, bule fine și zero zahăr — o alternativă jucăușă la sucurile clasice.",
      ["Aromă de bezea", "Fără zahăr", "Se servește rece"]
    )],
  [/^Chupa|^Swizzels Mega Double/i, (p) =>
    t(
      `${p.name} — acadele asortate`,
      "Acadele asortate, cu arome fructate și ambalaj individual. Perfecte pentru copii, petreceri și candy bar-uri.",
      ["Arome asortate", "Ambalare individuală", "Brand: " + p.brand]
    )],
  [/^The Jelly Bean Factory (\d+)/i, (p, m) =>
    t(
      `The Jelly Bean Factory ${m[1]} de arome — jeleuri gourmet`,
      `Jeleuri fine, cu ${m[1]} de arome de fructe, produse cu sucuri naturale de fructe și fără coloranți artificiali. Textura moale și aromele intens aromate le fac un cadou apreciat.`,
      ["Fără coloranți artificiali", "Cu suc natural de fructe", "Potrivite pentru vegetarieni"]
    )],
  [/^Joku Gummy Lollipos/i, () =>
    t(
      "Joku Gummy Lollipos Grape & Mango — acadele gumate",
      "Acadele din jeleu moale, cu aromă de struguri și mango, pe băț comestibil. Textură moale, gust fructat intens și format distractiv.",
      ["Acadea din jeleu comestibilă", "Arome: struguri și mango", "Halal"]
    )],
  [/^Joku Gummy Peelable (.+)$/i, (p, m) =>
    t(
      `Joku Gummy Peelable ${m[1]} — jeleu care se curăță`,
      `Jeleu moale, cu un strat exterior care se poate „coji”, ca la un fruct adevărat, și un miez gumos, aromat de ${m[1].toLowerCase()}. O gustare interactivă, distractivă pentru copii.`,
      ["Textură dublă, peelabilă", "Aromă: " + m[1], "Halal"]
    )],
  [/^Juicy Drop Gummy Mystery Cube (.+)$/i, (p, m) =>
    t(
      `Juicy Drop Gummy Mystery Cube ${m[1]} — jeleu cu sos acrișor`,
      `Jeleu în formă de cub, cu aromă ${m[1].toLowerCase()} și un flacon de sos acrișor pentru a-l „intensifica”. Cubul poate fi mușcat simplu sau stropit cu sos — joc de gusturi dulce-acrișor.`,
      ["Jeleu + sos acrișor", "Aromă: " + m[1], "Brand: Juicy Drop"]
    )],
  [/^Juicy Drop Taffy/i, () =>
    t(
      "Juicy Drop Taffy — caramea cu sos acrișor",
      "Caramea moale și elastică, cu aromă fructată, servită împreună cu un tub de sos acrișor pentru a o face mai intensă. Se poate mânca simplă sau cu sos.",
      ["Caramea moale + sos acrișor", "Brand: Juicy Drop", "Ideală pentru copii"]
    )],
  [/^Kidsmania Big Dipper/i, () =>
    t(
      "Kidsmania Big Dipper Candy Ring — inel-acadea cu praf acrișor",
      "Inel-acadea cu praf acrișor de scufundat. Se linge acadeaua, se trece prin praful acrișor și se savurează — un dulce jucăuș, în trei arome fructate.",
      ["Inel-acadea + praf acrișor", "Arome: măr verde, căpșuni, zmeură albastră", "Ambalaj: 30 g"]
    )],
  [/^KitKat Churros/i, () =>
    t(
      "KitKat Churros — tabletă de ciocolată cu aromă de churros",
      "KitKat în ediția braziliană Churros: straturi de vafă crocantă acoperite în ciocolată, cu aromă de churros — prăjitură prăjită cu zahăr și scorțișoară. Un desert îndrăgit în Brazilia.",
      ["Origine: Brazilia", "Vafă crocantă + ciocolată", "Brand: KitKat (Nestlé)"]
    )],
  [/^KitKat Gold/i, () =>
    t(
      "KitKat Gold Salted Caramel — mini batoane cu caramel sărat",
      "Mini batoane KitKat cu vafă crocantă, acoperite în ciocolată albă cu caramel sărat. Gust dulce-sărat, fin, în pachet de 9 bucăți — ediție japoneză.",
      ["Origine: Japonia", "Ciocolată albă cu caramel sărat", "9 bucăți în pachet"]
    )],
  [/^KitKat Latte Macchiato/i, () =>
    t(
      "KitKat Latte Macchiato — tabletă cu aromă de cafea",
      "KitKat în ediția braziliană Latte Macchiato: vafă crocantă acoperită cu ciocolată cu aromă de cafea cu lapte. Gust echilibrat de espresso și lapte cald.",
      ["Origine: Brazilia", "Aromă de cafea cu lapte", "Brand: KitKat (Nestlé)"]
    )],
  [/^KitKat Mystery/i, () =>
    t(
      "KitKat Mystery — tabletă cu aromă surpriză",
      "KitKat în ediția braziliană Mystery: vafă crocantă cu ciocolată și o aromă surpriză, de ghicit la prima mușcătură. Distracție pentru fanii KitKat.",
      ["Origine: Brazilia", "Aromă surpriză", "Brand: KitKat (Nestlé)"]
    )],
  [/^Lotte Ghana Matcha/i, () =>
    t(
      "Lotte Ghana Matcha — ciocolată cu matcha din Uji",
      "Tabletă de ciocolată Lotte Ghana, cu matcha din regiunea Uji, Kyoto, combinat cu ciocolată albă cremoasă. Gust fin, cu dulceață de lapte și note ușor amărui de ceai verde.",
      ["Origine: Japonia", "Matcha Uji + ciocolată albă", "Brand: Lotte Ghana"]
    )],
  [/^Lotte Ghana Pink/i, () =>
    t(
      "Lotte Ghana Pink — ciocolată roz cremoasă",
      "Tabletă de ciocolată Lotte Ghana Pink, cu ciocolată cremoasă de culoare roz și aromă dulce de căpșuni cu lapte. Ediție japoneză, cu textură fină.",
      ["Origine: Japonia", "Aromă de căpșuni cu lapte", "Brand: Lotte Ghana"]
    )],
  [/^Lucky Charms Chocolate/i, () =>
    t(
      "Lucky Charms Chocolate — cereale cu ciocolată și marshmallows",
      "Cereale crocante din ovăz cu aromă de ciocolată, amestecate cu marshmallows colorate. Perfecte la micul dejun cu lapte sau ca gustare uscată.",
      ["Cereale + marshmallows", "Brand: Lucky Charms (General Mills)", "A se păstra într-un loc uscat"]
    )],
  [/^Mega Gummies (.+)$/i, (p, m) => {
    const shapes = {
      "American Popcorn": "popcorn american",
      "Drum on a Stick": "înghețată pe băț",
      "English Breakfast": "mic dejun englez",
      "German Pretzel": "covrig german",
      "Jelly Bear": "ursuleți de jeleu",
      "Swedish Candy Fish": "peștișori suedezi",
    };
    const shape = shapes[m[1]] || m[1].toLowerCase();
    return t(
      `Mega Gummies ${m[1]} — jeleuri XL`,
      `Jeleuri extra-mari, în forme de ${shape}, cu textură moale și aromă fructată intensă. O gustare jucăușă, cu forme surprinzătoare, produsă de Felko.`,
      ["Jeleuri XL, moi și gustoase", "Brand: Felko", "Halal", "Ambalaj: 120 g"]
    );
  }],
  [/^Mentos Duo (.+)/i, (p, m) =>
    t(
      `Mentos Duo ${m[1]} — bomboane cu două straturi`,
      `Bomboane Mentos cu două straturi: un înveliș crocant cu aromă de ${m[1].split("&")[0].trim()} și un miez moale cu aromă de ${m[1].split("&")[1]?.trim() || "soda"}. Combinația proaspătă și fructată, în pachet resigilabil.`,
      ["Origine: Japonia", "Două straturi, două arome", "Brand: Mentos"]
    )],
  [/^Mentos (.+?)(?: \(Japan\))?$/i, (p, m) =>
    t(
      `Mentos ${m[1]} — bomboane cu miez moale`,
      `Bomboane Mentos cu înveliș crocant și miez moale, cu aromă de ${m[1].toLowerCase()}. Ediția japoneză, cu gust proaspăt și intens, în pachet resigilabil.`,
      ["Origine: Japonia", "Înveliș crocant + miez moale", "Brand: Mentos"]
    )],
  [/^Mike ?(?:&|and) ?[Ii]ke (.+)$/i, (p, m) =>
    t(
      `Mike & Ike ${m[1]} — bomboane chewy`,
      `Bomboane chewy, cu textură moale și arome de fructe, din gama ${m[1]}. Mixul colorat și gustul dulce-acrișor le fac perfecte pentru împărțit.`,
      ["Textură chewy", "Arome asortate", "Brand: Mike & Ike (Just Born)", "Fără gluten"]
    )],
  [/^Nerds (?!Rope|Gummy Clusters)(.+?)(?: Treat Size)?$/i, (p, m) =>
    t(
      `Nerds ${m[1]} — bomboane crocante`,
      `Bomboane mici și crocante, cu aromă de ${ro(m[1])}, care se topesc încet pe limbă. Granulele colorate și gustul intens sunt semnătura brandului Nerds.`,
      ["Textură crocantă", "Aromă: " + m[1], "Brand: Nerds (Ferrara)"]
    )],
  [/^Nerds /i, (p) =>
    t(
      `${p.name} — bomboane cu înveliș crocant`,
      "Bomboane gumate sau benzi cu miez moale, acoperite cu bucăți crocante de Nerds. Combinația de texturi și arome intense de fructe este semnătura brandului Nerds.",
      ["Crocant + gumos", "Brand: Nerds (Ferrara)", "Ideal pentru gustări și deserturi"]
    )],
  [/^Peeps Marshmallow (Bunnies|Chicks) (.+)$/i, (p, m) =>
    t(
      `Peeps Marshmallow ${m[1]} ${m[2]} — bezea de marshmallow`,
      `Marshmallow pufos în formă de ${m[1].toLowerCase() === "bunnies" ? "iepuraș" : "puișor"}, cu gust ${m[2].toLowerCase()}. Ușor, dulce și moale, ideal pentru coșurile de Paște și deserturi.`,
      ["Marshmallow pufos", "Formă de " + (m[1].toLowerCase() === "bunnies" ? "iepuraș" : "puișor"), "Brand: Peeps"]
    )],
  [/^Pop Rocks (.+)$/i, (p, m) =>
    t(
      `Pop Rocks ${m[1]} — bomboane efervescente`,
      `Bomboane care sfârâie și pocnesc pe limbă, cu aromă surpriză de fructe. Senzația efervescentă și ambalajul colorat le fac o gustare distractivă pentru copii.`,
      ["Efect efervescent în gură", "Aromă surpriză", "Brand: Pop Rocks"]
    )],
  [/^Poppets /i, (p) =>
    t(
      `${p.name} — bomboane acoperite cu ciocolată`,
      "Bomboane cu miez crocant și gust de toffee, acoperite în ciocolată cu lapte. Formatul mic și ambalajul de buzunar le fac o gustare comodă.",
      ["Miez crocant de toffee", "Ciocolată cu lapte", "Brand: Poppets"]
    )],
  [/^Rocky Mountain Marshmallows/i, () =>
    t(
      "Rocky Mountain Mini Marshmallows — bezele mini",
      "Bezele mici și pufoase, cu aromă de vanilie, ideale în ciocolată caldă, în deserturi sau servite simplu. Textură aerată și gust delicat.",
      ["Aromă de vanilie", "Mărime mini", "Ambalaj: 150 g"]
    )],
  [/^Samyang Buldak Hot Chicken Ramen (.+?)$/i, (p, m) => {
    const flavour = m[1].replace(/\s+Flavour$/i, "").replace(/\s+Korea$/i, "");
    return t(
      `Samyang Buldak Hot Chicken Ramen ${flavour} — tăiței coreeni picanți`,
      `Tăiței instant coreeni din celebra serie Buldak („pui incendiar”), în varianta ${flavour}. Foarte picanți, cu sos intens și tăiței elastici — pentru iubitorii de mâncare iute.`,
      ["Bowl mare, gata în câteva minute", "Origine: Coreea de Sud", "Foarte picant", "Brand: Samyang"]
    );
  }],
  [/^Skittles (?:Candy (?:Bottle )?)?(.+?)(?: Flavour| Chinese| Chenese| Chlnese)?$/i, (p, m) => {
    const f = m[1].trim();
    const map = {
      "Floral Fruit": "arome florale și fructate",
      "Fruit Berry": "fructe de pădure",
      "Frult Berry": "fructe de pădure",
      "Lactic Acid": "note dulci-lactice, acrișoare",
      "Original": "aromele clasice Skittles",
      "Sour": "arome acre de fructe",
    };
    return t(
      `Skittles ${f} — bomboane fructate`,
      `Bomboane cu înveliș crocant și miez gumos, cu ${map[f] || "arome de " + f.toLowerCase()}. Fiecare bomboană are o aromă diferită, iar combinația colorată le face potrivite pentru împărțit oriunde.`,
      ["Înveliș crocant + miez gumos", "Arome asortate", "Brand: Skittles (Mars)"]
    );
  }],
  [/^Skittles Giants/i, () =>
    t(
      "Skittles Giants Gooey Fruits — bomboane fructate XXL",
      "Skittles în versiune gigant, cu miez mai mare și mai gumos, în arome de fructe. Aceeași coajă crocantă, dar cu o mușcătură generoasă.",
      ["Mărime gigant", "Miez gumos", "Brand: Skittles (Mars)"]
    )],
  [/^Skittles (?:and Friends|Lllipops|Skitt!es)/i, (p) =>
    t(
      `${p.name.replace(/Skitt!es/i, "Skittles").replace(/Lllipops/i, "Lollipops")} — dulciuri asortate`,
      "Selecție veselă de dulciuri și acadele cu arome fructate, într-un ambalaj de cadou. Perfectă pentru sărbători, cadouri și împărțit cu prietenii.",
      ["Mix de dulciuri fructate", "Ambalaj cadou", "Brand: Skittles (Mars)"]
    )],
  [/^Snickers Branco/i, () =>
    t(
      "Snickers Branco — baton cu ciocolată albă",
      "Varianta braziliană Snickers Branco: caramel, arahide și nougat, învelite în ciocolată albă. Gust dulce și cremos, cu textura clasică Snickers.",
      ["Origine: Brazilia", "Ciocolată albă", "Brand: Snickers (Mars)"]
    )],
  [/^Snickers Dark/i, () =>
    t(
      "Snickers Dark — baton cu ciocolată neagră",
      "Varianta braziliană Snickers Dark: arahide, caramel și nougat, învelite în ciocolată neagră. Gust intens de cacao, mai puțin dulce decât originalul.",
      ["Origine: Brazilia", "Ciocolată neagră", "Brand: Snickers (Mars)"]
    )],
  [/^Snickers Protein/i, () =>
    t(
      "Snickers Protein — baton proteic cu arahide și caramel",
      "Baton cu arahide, caramel și ciocolată, cu conținut crescut de proteine (aproximativ 20 g per baton). Gustul clasic Snickers, într-o variantă pentru sportivi și gustări proteice.",
      ["Bogat în proteine", "Arahide + caramel + ciocolată", "Brand: Snickers (Mars)"]
    )],
  [/^Sour Candy Paradise Neon Strips (.+)$/i, (p, m) =>
    t(
      `Sour Candy Paradise Neon Strips ${m[1]} — benzi gumate acre`,
      `Benzi gumate lungi, cu gust ${m[1].toLowerCase()} și un strat acrișor intens. Textură moale, chewy și culori neon — un dulce acrișor, vegan și halal.`,
      ["12 benzi în fiecare pungă", "Vegan și halal", "Ambalaj: 130 g"]
    )],
  [/^Sour Patch Kids (.+)$/i, (p, m) =>
    t(
      `Sour Patch Kids ${m[1]} — bomboane acre, apoi dulci`,
      `Bomboane gumate în formă de personaje, cu un strat acru la suprafață și miez dulce. Varianta ${m[1].toLowerCase()} oferă arome fructate intense, în stilul „acru, apoi dulce”.`,
      ["Acru la suprafață, dulce în interior", "Arome asortate", "Brand: Sour Patch Kids (Mondelez)"]
    )],
  [/^Sour Patch Kids$/i, () =>
    t(
      "Sour Patch Kids — bomboane acre, apoi dulci",
      "Bomboane gumate în formă de personaje, cu un strat exterior acru și miez dulce, fructat. Gustul contrastant le face unul dintre cele mai populare dulciuri acrișoare.",
      ["Acru la suprafață, dulce în interior", "Arome: lămâie, portocală, căpșuni, zmeură", "Brand: Sour Patch Kids (Mondelez)"]
    )],
  [/^Sour Punch (.+)$/i, (p, m) =>
    t(
      `Sour Punch ${m[1]} — bomboane acrișoare`,
      `Bomboane acrișoare din gama Sour Punch, cu aromă de ${m[1].toLowerCase()}. Gust intens, dulce-acru, cu textură moale și elastică — pentru fanii dulciurilor acrișoare.`,
      ["Gust acrișor intens", "Brand: Sour Punch", "Ideal pentru împărțit"]
    )],
  [/^Tic Tac Chewy/i, () =>
    t(
      "Tic Tac Chewy Sour Adventure — bomboane chewy acrișoare",
      "Bomboane mici,înglodite cu miez moale și înveliș acrișor, în arome de fructe. Formatul practic al cutiei Tic Tac le face ușor de luat oriunde.",
      ["Miez chewy + înveliș acrișor", "Ambalaj de buzunar", "Brand: Tic Tac (Ferrero)"]
    )],
  [/^Toxic Waste Slime Licker Spray/i, () =>
    t(
      "Toxic Waste Slime Licker Spray — spray cu bomboană extrem de acră",
      "Bomboană lichidă extrem de acră, sub formă de spray, cu arome de zmeură albastră și căpșuni. Provocarea „Toxic Waste” continuă — se pulverizează direct pe limbă.",
      ["Extrem de acru", "Spray lichid, 2 arome", "Brand: Toxic Waste"]
    )],
  [/^Van Holten['’]?s Puffed Snacks Pickle (.+)$/i, (p, m) =>
    t(
      `Van Holten's Puffed Snacks Pickle ${m[1]} — snack pufos cu murătură`,
      `Snack pufos și crocant, cu gust intens de murătură în oțet, varianta ${m[1]}. Gust acidulat, sărat, pentru cei care iubesc murăturile și snackurile îndrăznețe.`,
      ["Gust de murătură murată în oțet", "Textură pufoasă, crocantă", "Brand: Van Holten's"]
    )],
  [/^Van Holten['’]?s Pickle In-A Pouch Warheads/i, () =>
    t(
      "Van Holten's Pickle In-A Pouch Warheads — castravete murat acru",
      "Castravete întreg murat în oțet, ambalat într-o pungă practică, în colaborarea cu Warheads: un plus de aciditate și iuțeală. Gust autentic de murătură, gata de ronțăit.",
      ["Castravete întreg murat", "Colaborare Warheads", "Fără zahăr adăugat"]
    )],
  [/^Warheads Chewy Bunnies/i, () =>
    t(
      "Warheads Chewy Bunnies — bomboane gumate acre",
      "Bomboane gumate în formă de iepurași, cu un strat extrem de acru la suprafață și miez dulce, fructat. Gustul contrastant este semnătura brandului Warheads.",
      ["Acru la suprafață, dulce în interior", "Formă de iepuraș", "Brand: Warheads"]
    )],
  [/^Warheads Extreme Sour Chewy/i, () =>
    t(
      "Warheads Extreme Sour Chewy — caramele extrem de acre",
      "Caramele moi și elastice, cu un înveliș extrem de acru și miez dulce. Ediție specială în colaborare cu ZHC, pentru fanii gusturilor foarte acrișoare.",
      ["Extrem de acru", "Colaborare ZHC", "Textură chewy"]
    )],
  [/^Warheads Sour Clouds (.+)$/i, (p, m) =>
    t(
      `Warheads Sour Clouds ${m[1]} — bezele acre`,
      `Bezele pufoase cu aromă de ${m[1].toLowerCase()} și un strat acrișor. Ușoare, aerate și acrișoare — o combinație neobișnuită, semnată Warheads.`,
      ["Bezea pufoasă + strat acru", "Aromă: " + m[1], "Brand: Warheads"]
    )],
  [/^Warheads Sour Gum/i, () =>
    t(
      "Warheads Sour Gum — gumă de mestecat acrișoară",
      "Gumă de mestecat cu gust acru intens la început, care devine dulce pe măsură ce o mesteci. Pentru fanii senzațiilor acrișoare.",
      ["Acru la început, dulce apoi", "Textură elastică", "Brand: Warheads"]
    )],
  [/^Warheads Super Sour Bubble Gum Pops/i, () =>
    t(
      "Warheads Super Sour Bubble Gum Pops — acadele acre cu gumă",
      "Acadele tari, extrem de acre, cu miez de gumă de mestecat. Se linge stratul acru, apoi se mestecă guma — două experiențe într-un dulce.",
      ["Acadea acră + gumă de mestecat", "Arome asortate", "Brand: Warheads"]
    )],
  [/^Zed Candy Jawbreaker Balls (.+)$/i, (p, m) =>
    t(
      `Zed Candy Jawbreaker ${m[1]} — bomboane tari în straturi`,
      `Bomboană tare, formată din straturi concentrice de arome și culori, care se dizolvă treptat în gură. Gustul de ${m[1].toLowerCase()} se schimbă pe măsură ce bomboana scade.`,
      ["Straturi multiple de aromă", "Foarte tare — se suge, nu se mușcă", "Brand: Zed Candy"]
    )],
  [/^Zed Candy Sour Apple Jumbo/i, () =>
    t(
      "Zed Candy Sour Apple Jumbo Jawbreaker Pop — acadea uriașă cu gumă",
      "Acadea de dimensiuni mari, cu gust de măr acru și straturi succesive de culoare, cu miez de gumă de mestecat. Provocarea este să ajungi la gumă fără să o spargi.",
      ["Format jumbo", "Măr acru + gumă", "Brand: Zed Candy"]
    )],
  [/^Zed Candy /i, (p) =>
    t(
      `${p.name} — dulciuri acrișoare Zed`,
      "Dulciuri cu gust intens acrișor, din gama Zed Candy. Textură distractivă, arome fructate puternice și ambalaj vesel, pentru copii și adolescenți.",
      ["Gust acrișor intens", "Arome fructate", "Brand: Zed Candy"]
    )],
  [/^Van Holten/i, (p) =>
    t(
      `${p.name} — snack cu murătură`,
      "Snack cu gust intens de murătură, din gama Van Holten's. Gust acidulat și sărat, pentru iubitorii de arome îndrăznețe.",
      ["Gust de murătură", "Brand: Van Holten's", "Fără zahăr adăugat"]
    )],
  [/^PappiChewy/i, () =>
    t(
      "Pappi Chewy BallGu — gumă de mestecat în formă de minge",
      "Gumă de mestecat chewy, în formă de minge, cu arome de fructe. Ambalajul individual și forma distractivă o fac potrivită pentru copii și pentru candy bar-uri.",
      ["Arome de fructe", "Ambalare individuală", "Brand: Pappi"]
    )],
  [/^Vimto Candy Floss/i, () =>
    t(
      "Vimto Candy Floss — vată de zahăr cu gust Vimto",
      "Vată de zahăr pufoasă, cu gustul distinctiv Vimto — un mix de struguri, zmeură și coacăze negre. Se topește în gură, ca la bâlci.",
      ["Gust Vimto", "Textură pufoasă", "Brand: Vimto"]
    )],
  [/^Toast['’]?em (.+)$/i, (p, m) =>
    t(
      `Toast'em ${m[1]} — tartine pentru prăjit`,
      `Tartine din foietaj, cu umplutură de ${m[1].replace(/\.$/, "").toLowerCase()}, gata de pus în prăjitor. Crocante la exterior, calde și cremoase în interior — un mic dejun rapid.`,
      ["Se prăjesc în prăjitorul de pâine", "Umplutură generoasă", "Brand: Toast'em"]
    )],
  [/^Pop-Tarts Frosted (.+)$/i, (p, m) =>
    t(
      `Pop-Tarts Frosted ${m[1].replace(/\.$/, "")} — tartine cu umplutură`,
      `Tartine din foietaj, cu umplutură de ${m[1].replace(/\.$/, "").toLowerCase()} și glazură deasupra. Se mănâncă direct din ambalaj sau încălzite la prăjitor, pentru un mic dejun rapid și dulce.`,
      ["Umplutură + glazură", "Se pot încălzi în prăjitor", "Brand: Pop-Tarts (Kellanova)"]
    )],
  [/^Hostess Twinkies Candy Bar/i, () =>
    t(
      "Hostess Twinkies Candy Bar — baton de ciocolată cu cremă",
      "Baton de ciocolată cu umplutură cremoasă, inspirat de celebrul Twinkie. Gust dulce de ciocolată și vanilie, cu textură fină — un desert de buzunar.",
      ["Umplutură cremoasă", "Ciocolată cu lapte", "Brand: Hostess"]
    )],
  [/^Tabby (?:chocolate )?Chicken/i, () =>
    t(
      "Tabby Chicken Drumstick — ciocolată în formă de copan",
      "Baton de ciocolată cu lapte, modelat în forma unui copan de pui, cu umplutură cremoasă și un strat crocant. Un desert jucăuș, care arată ca o prăjitură și se mănâncă precum o ciocolată.",
      ["Ciocolată cu lapte", "Formă realistă de copan", "Ambalaj: 50 g"]
    )],
  [/^Spongebob Gummy Krabby Patties (.+)$/i, (p, m) =>
    t(
      `Spongebob Gummy Krabby Patties ${m[1]} — jeleuri în formă de burger`,
      `Jeleuri moi, în formă de Krabby Patty, cu aromă de ${m[1].toLowerCase()}. Inspirate de desenul SpongeBob, sunt o gustare distractivă pentru copii.`,
      ["Formă de Krabby Patty", "Aromă: " + m[1], "Brand: SpongeBob"]
    )],
  [/^Splash Dipper/i, () =>
    t(
      "Splash Dipper — acadea cu praf acrișor",
      "Acadele tari, cu arome de măr, zmeură albastră și căpșuni, servite cu praf acrișor pentru scufundat. Combinația dulce-acrișoară, într-un format distractiv.",
      ["Acadele + praf acrișor", "3 arome asortate", "Ambalaj: 45 g"]
    )],
  [/^Soda Pop Bottles Sour Candy Powder/i, () =>
    t(
      "Soda Pop Bottles Sour Candy Powder — praf acrișor cu aromă de soda",
      "Praf de bomboană acrișor, cu aromă de băuturi carbogazoase, ambalat în sticluțe mici. Se toarnă pe limbă sau se folosește pentru a acri dulciuri.",
      ["Praf acrișor, aromă de soda", "Sticluțe individuale", "Pentru copii peste 3 ani"]
    )],
  [/^Assorted Chilli Fruit/i, () =>
    t(
      "Assorted Chilli Fruit Flavour Gummies — jeleuri fructate cu chili",
      "Jeleuri moi cu arome de fructe, condimentate cu un strop de chili. Combinația dulce-picantă, în forme colorate, este foarte populară în Mexic și Asia.",
      ["Dulce + ușor picant", "Arome de fructe exotice", "Ambalaj: 164 g"]
    )],
  [/^Assorted Fruit Flavour Gummies/i, () =>
    t(
      "Assorted Fruit Flavour Gummies — jeleuri asortate",
      "Jeleuri moi, cu forme și arome asortate de fructe. Textură plăcută, gust fructat și culori vesele — o gustare potrivită pentru copii.",
      ["Arome asortate de fructe", "Textură moale", "Ambalaj: 164 g"]
    )],
  [/^Fruit Flavour Gummy Candy/i, () =>
    t(
      "Fruit Flavour Gummy Candy — jeleuri fructate",
      "Jeleuri moi, cu arome de fructe și forme colorate, ambalate generos pentru împărțit. Textură elastică, plăcută la mestecat.",
      ["Arome de fructe", "Textură moale", "Ambalaj: 198 g"]
    )],
  [/^Shades by Niko Tropic Blast/i, () =>
    t(
      "Shades by Niko Tropic Blast — jeleuri tropicale",
      "Jeleuri moi și acre, cu trei arome tropicale: ananas, mango și fructul pasiunii. Culori aprinse și gust intens, din gama lansată de creatorul Niko.",
      ["3 arome tropicale", "Textură chewy", "Brand: Shades by Niko"]
    )],
  [/^Super Shockers Raspberry Zing/i, () =>
    t(
      "Super Shockers Raspberry Zing — bomboane extrem de acre",
      "Bomboane tari, cu un gust extrem de acru de zmeură, care „electrizează” limba. Pentru cei care caută cea mai puternică senzație acrișoară.",
      ["Extrem de acru", "Aromă de zmeură", "Se suge, nu se mușcă"]
    )],
  [/^Ice Breakers Wintergreen/i, () =>
    t(
      "Ice Breakers Wintergreen Mints — bomboane mentolate",
      "Bomboane mici și intense, cu aromă de mentă verde (wintergreen), pentru respirație proaspătă. Cutie practică de buzunar.",
      ["Aromă de mentă verde", "Fără zahăr", "Brand: Ice Breakers (Hershey's)"]
    )],
  [/^Redvines Sugar Free Black Licorice/i, () =>
    t(
      "Red Vines Sugar Free Black Licorice Twists — jeleuri cu lichen",
      "Benzi chewy cu gust autentic de lichen negru, fără zahăr adăugat. Textură moale și elastică, gust intens — pentru iubitorii de lichen.",
      ["Fără zahăr", "Gust de lichen negru", "Brand: Red Vines"]
    )],
  [/^Keebler Chips Deluxe Minis/i, () =>
    t(
      "Keebler Chips Deluxe Minis Cookies with M&M's Minis — biscuiți mini",
      "Biscuiți mini cu bucăți de ciocolată și M&M's Minis, crocanți și gustoși. Formatul mic îi face perfecți pentru gustări rapide și pentru copii.",
      ["Biscuiți + M&M's Minis", "Format mini", "Brand: Keebler"]
    )],
  [/^Jack Link['’]?s Mr Beast/i, () =>
    t(
      "Jack Link's × MrBeast Beef Jerky Original — carne de vită uscată",
      "Carne de vită uscată și condimentată, cu gust original, din colaborarea Jack Link's cu MrBeast. Bogată în proteine (aproximativ 13 g per pungă), fără nitrați sau nitriți adăugați — un snack ideal la drum sau după antrenament.",
      ["100% carne de vită", "Bogată în proteine", "Fără nitrați/nitriți adăugați", "Brand: Jack Link's × MrBeast"]
    )],
  [/^Jelly Belly Energizing Sport Beans/i, () =>
    t(
      "Jelly Belly Energizing Sport Beans — jeleuri pentru sportivi",
      "Jeleuri cu carbohidrați, electroliți și vitamine, create pentru a susține efortul fizic. Se consumă înainte sau în timpul antrenamentului, pentru energie rapidă.",
      ["Carbohidrați + electroliți", "Vitamine B și C", "Arome asortate", "Brand: Jelly Belly"]
    )],
  [/^Pillsbury Funfetti Frosting (.+)$/i, (p, m) =>
    t(
      `Pillsbury Funfetti Frosting ${m[1]} — glazură pentru prăjituri`,
      `Glazură cremoasă pentru prăjituri și cupcakes, cu aromă de ${m[1].toLowerCase()} și bucăți colorate de bomboane. Se întinde ușor și se păstrează la temperatura camerei.`,
      ["Cu bucăți colorate", "Pentru prăjituri și cupcakes", "Brand: Pillsbury"]
    )],
  [/^Ritz Limited Edition Soccer/i, () =>
    t(
      "Ritz Limited Edition Soccer Shapes — biscuiți sărați în formă de minge",
      "Biscuiți sărați Ritz, în ediție limitată, cu forme de minge de fotbal. Crocanți, cu unt și sare, ideali pentru gustări, aperitive și sandvișuri mici.",
      ["Ediție limitată, formă de minge", "Biscuiți sărați", "Brand: Ritz"]
    )],
  [/^Coca-Cola|^Соса/i, (p) =>
    t(
      `${p.name} — băutură carbogazoasă`,
      "Băutură răcoritoare carbogazoasă cu gustul clasic de Coca-Cola, servită rece. Aromă echilibrată, cu note caramelizate și bule fine.",
      ["Brand: Coca-Cola", "Se servește rece", "A se păstra la loc răcoros"]
    )],
  [/^(7up|Fanta|Pepsi|Mirinda|Dr Pepper|RC Cola|Mountain Dew)/i, (p) =>
    t(
      `${p.name} — băutură răcoritoare carbogazoasă`,
      "Băutură răcoritoare carbogazoasă, servită rece, simplă sau cu gheață. Ambalaj practic, potrivit pentru acasă, birou sau drum.",
      ["Se servește rece", "A se păstra la loc răcoros, ferit de soare"]
    )],
  [/^Cadbury (.+Buttons.+|.+Selection Box\.?)$/i, (p, m) =>
    t(
      `${p.name.replace(/\.$/, "")} — cutie asortată de ciocolată`,
      "Cutie cu o selecție de ciocolată Cadbury: bomboane și batoane îndrăgite, ambalate pentru cadou. Conținutul include clasici Cadbury Dairy Milk și alte sortimente din gamă.",
      ["Cutie cadou", "Ciocolată cu lapte Cadbury", "Brand: Cadbury"]
    )],
  [/^Cadbury .*Little Robins/i, () =>
    t(
      "Cadbury Dairy Milk Christmas Little Robins — ciocolată de Crăciun",
      "Bomboane din ciocolată cu lapte, în formă de păsărele, în ediție de Crăciun. Ambalate individual, sunt un cadou dulce pentru sărbătorile de iarnă.",
      ["Ciocolată cu lapte", "Ediție de Crăciun", "Brand: Cadbury"]
    )],
  [/^Hershey['’]?s Kisses Milk Chocolate with Almonds/i, () =>
    t(
      "Hershey's Kisses Milk Chocolate with Almonds — bomboane cu migdale",
      "Bomboane Hershey's Kisses din ciocolată cu lapte, cu migdale crocante în interior. Ambalate individual, ideale pentru împărțit sau pentru cadouri.",
      ["Ciocolată cu lapte + migdale", "Ambalate individual", "Brand: Hershey's"]
    )],
  [/^Hershey['’]?s Sugar Free (.+)$/i, (p, m) =>
    t(
      `Hershey's Sugar Free ${m[1]} — ciocolată fără zahăr`,
      `Ciocolată Hershey's fără zahăr adăugat, ${m[1].toLowerCase().includes("caramel") ? "cu umplutură de caramel" : "în format mini"}. Gustul de ciocolată rămâne cremos, fără zahăr — o opțiune pentru cei care îl evită.`,
      ["Fără zahăr adăugat", "Cu îndulcitori", "Brand: Hershey's"]
    )],
  [/^KitKat (.+)$/i, (p, m) =>
    t(
      `KitKat ${m[1]} — vafă crocantă cu ciocolată`,
      `Batoane KitKat cu straturi de vafă crocantă, acoperite cu ciocolată cu aromă de ${ro(m[1]).toLowerCase()}. Se rup ușor în segmente și se savurează la cafea sau ca gustare dulce.`,
      ["Vafă crocantă + ciocolată", "Brand: KitKat (Nestlé)", "A se păstra la loc răcoros"]
    )],
  [/^(Hershey['’]?s|Cadbury|Reese['’]?s|Nerds|Snickers)/i, (p) =>
    t(
      `${p.name} — dulciuri din ciocolată`,
      "Produs de ciocolată din gama " + p.brand + ", cu gust intens și textură fină. Ideal ca gustare dulce sau cadou.",
      ["Se păstrează la loc răcoros și uscat", `Brand: ${p.brand}`]
    )],

  // ── completări ─────────────────────────────────────────────────────────
  [/^Oreo Mini Cook(?:ie|le) (.+?)$/i, (p, m) =>
    t(
      `Oreo Mini Cookie ${m[1]} — minibiscuiți cu cremă`,
      m[1].toLowerCase() === "original"
        ? "Minibiscuiți Oreo crocanți, cu cacao, umpluți cu crema clasică de vanilie. Formatul mic îi face perfecți pentru gustări rapide, deserturi sau pentru a fi împărțiți."
        : `Minibiscuiți Oreo crocanți, cu cacao, umpluți cu cremă cu aromă de ${m[1].toLowerCase()}. Formatul mic îi face perfecți pentru gustări rapide, deserturi sau pentru a fi împărțiți.`,
      ["Biscuiți cu cacao + cremă aromată", "Format mini", "Ediție asiatică", "Brand: Oreo"]
    )],
  [/^Oreo Mini Cocoa Crisp (.+?)(?: Flavour| Chinese)?$/i, (p, m) =>
    t(
      `Oreo Mini Cocoa Crisp ${m[1]} — minibiscuiți crocanți cu cacao`,
      `Minibiscuiți Oreo cu cacao și cremă cu aromă de ${m[1].toLowerCase()}, într-o textură deosebit de crocantă. Ideali pentru gustări sau pentru a fi savurați alături de cafea și lapte.`,
      ["Textură deosebit de crocantă", "Format mini", "Ediție asiatică", "Brand: Oreo"]
    )],
  [/^Oreo Cocoa Crisp Roll? (.+?)(?: Flavour| Chinese)?$/i, (p, m) =>
    t(
      `Oreo Cocoa Crisp Roll ${m[1]} — rulouri crocante cu cacao`,
      `Rulouri subțiri de vafă crocantă cu cacao, umplute cu cremă cu aromă de ${m[1].toLowerCase()}. Textură ușoară și crocantă, gust intens de cacao — o gustare rapidă, bună la cafea.`,
      ["Vafă crocantă + cremă", "Format rolă, ambalare individuală", "Ediție asiatică", "Brand: Oreo"]
    )],
  [/^Oreo Wafers (.+?)(?: Flavour| Chinese)?$/i, (p, m) =>
    t(
      `Oreo Wafers ${m[1]} — vafe cu cremă Oreo`,
      `Vafe crocante cu straturi de cremă Oreo, cu aromă de ${m[1].toLowerCase()}. Mai ușoare decât biscuiții clasici, dar cu același gust de cacao și vanilie.`,
      ["Vafe crocante + cremă", "Ediție asiatică", "Brand: Oreo"]
    )],
  [/^Oreo Grape and Peach/i, () =>
    t(
      "Oreo Grape & Peach — biscuiți cu cremă de struguri și piersici",
      "Biscuiți Oreo cu cacao, umpluți cu cremă dublă de struguri și piersici. Ediție asiatică cu arome fructate intense, într-o combinație neobișnuită și răcoroasă.",
      ["Cremă cu două arome: struguri și piersici", "Ediție asiatică", "Brand: Oreo"]
    )],
  [/^Oreo Ice Cream Matcha/i, () =>
    t(
      "Oreo Ice Cream Matcha — biscuiți cu cremă de înghețată matcha",
      "Biscuiți Oreo cu cacao, cu cremă cu aromă de înghețată de matcha. Gust fin de ceai verde, cu dulceață de lapte, în ediția asiatică.",
      ["Cremă cu aromă de matcha", "Ediție asiatică", "Brand: Oreo"]
    )],
  [/^Oreo /i, (p) =>
    t(
      `${p.name} — biscuiți Oreo`,
      "Biscuiți crocanți cu cacao și cremă dulce, în ediția asiatică Oreo. Gustul clasic, într-o variantă de colecție.",
      ["Biscuiți cu cacao + cremă", "Brand: Oreo", "Ediție asiatică"]
    )],
  [/^Dr Peeler Gummy (.+)$/i, (p, m) => {
    const raw = m[1].replace(/^Cand(?:y)?\s+/i, "").replace(/\s*(?:tl[аa]ч[oо]чr|Flavours?)$/i, "").trim();
    return t(
      `Dr Peeler Gummy Candy ${raw} — jeleu care se curăță`,
      `Jeleu moale, în formă de fruct, cu un strat exterior care se „coji” și un miez gumos, aromat de ${ro(raw)}. O gustare interactivă, distractivă pentru copii.`,
      ["Strat exterior peelabil", "Miez gumos, aromat", "Brand: Dr Peeler"]
    );
  }],
  [/^Glico (?:Cloudy )?Pocky (.+)$/i, (p, m) =>
    t(
      `Glico Pocky ${m[1]} — bețișoare de biscuit acoperite`,
      `Bețișoare subțiri de biscuit, acoperite cu ciocolată cu aromă de ${ro(m[1].replace(/Blueberry Milk/i, "afine cu lapte")).toLowerCase()}. Crocante, ușoare și perfect de ronțăit — un snack japonez celebru, produs de Glico.`,
      ["Biscuit crocant + glazură de ciocolată", "Brand: Glico Pocky", "Origine: Japonia"]
    )],
  [/^Hannah['’]?s Double Trouble/i, () =>
    t(
      "Hannah's Double Trouble Spray/Fizz — spray cu bomboană și praf efervescent",
      "Set de bomboană lichidă în spray, însoțită de praf efervescent. Se pulverizează în gură și se adaugă praful pentru o senzație acidulată, care „fâșâie” pe limbă.",
      ["Spray + praf efervescent", "Gust acrișor, fructat", "Ambalaj: 20 g"]
    )],
  [/^Hi-Chew (.+)$/i, (p, m) =>
    t(
      `Hi-Chew ${m[1].replace(/\s*Peg Bag\.?$/i, "")} — bomboane chewy japoneze`,
      `Bomboane moi și elastice, cu arome de fructe, care se mestecă îndelung fără să-și piardă gustul. Mixul dulce-acrișor, în stilul autentic Hi-Chew.`,
      ["Textură chewy, moale", "Arome de fructe", "Brand: Hi-Chew (Morinaga)"]
    )],
  [/^Mike and lke (.+)$/i, (p, m) =>
    t(
      `Mike and Ike ${m[1]} — bomboane chewy cu cireașe`,
      "Bomboane chewy cu aromă intensă de cireașe, în cutie practică de tip „changemaker”. Textură moale, gust dulce-acrișor, perfecte pentru împărțit.",
      ["Textură chewy", "Aromă de cireașe", "Brand: Mike & Ike (Just Born)"]
    )],
  // ── completări pentru produsele momentan fără stoc ──────────────────────
  [/^Amos Swedish Style Candy (.+)$/i, (p, m) => {
    const flavour = m[1]
      .replace(/Strawberry Deam/i, "căpșuni cu cremă")
      .replace(/Fizzy Peach/i, "piersică acrișoară")
      .replace(/Fizzy Strawberry/i, "căpșuni acrișoare");
    return t(
      `Amos Swedish Style Candy ${m[1].replace(/Deam/i, "Cream")} — bomboane suedeze`,
      `Bomboane moi, în stil suedez, cu textură chewy și aromă intensă de ${flavour}. Varianta „fizzy” are un înveliș acrișor care contrastează cu miezul dulce.`,
      ["Textură chewy, moale", "Brand: Amos (SUA)", "Ambalaj: 12 × 270 g"]
    );
  }],
  [/^Bomba Pink/i, () =>
    t(
      "Bomba Pink Energy Drink — băutură energizantă",
      "Băutură energizantă cu aromă fructată și cofeină, pentru un plus de energie la muncă sau la drum. Se servește rece.",
      ["Conține cofeină", "Se servește rece", "Consum moderat"]
    )],
  [/^Bounty Wafer Rolls/i, () =>
    t(
      "Bounty Wafer Rolls — rulouri de vafă cu cocos",
      "Rulouri subțiri de vafă, umplute cu cremă de nucă de cocos și acoperite cu ciocolată cu lapte. Gust tropical, textură crocantă — un desert de buzunar.",
      ["Cocos + ciocolată cu lapte", "Brand: Bounty (Mars)", "Ambalaj: 12 × 23,5 g"]
    )],
  [/^Canada Dry (.+)$/i, (p, m) =>
    t(
      `Canada Dry ${m[1].replace(/FrUit/i, "Fruit")} — băutură carbogazoasă cu ghimbir`,
      `Băutură răcoritoare carbogazoasă Canada Dry, cu gust ${m[1].replace(/FrUit/i, "Fruit").toLowerCase()} și note fine de ghimbir. Se servește rece, simplă sau în cocktailuri.`,
      ["Brand: Canada Dry", "Se servește rece", "A se păstra la loc răcoros"]
    )],
  [/^Cappucino mare/i, () =>
    t(
      "Cappuccino mare — băutură instant cu cafea",
      "Preparat instant pe bază de cafea, cu lapte și spumă, pentru un cappuccino rapid acasă sau la birou. Se prepară cu apă fierbinte și se servește imediat.",
      ["Preparat instant cu cafea", "Se prepară cu apă fierbinte", "A se păstra la loc uscat"]
    )],
  [/^Cheetos Canisters (.+)$/i, (p, m) =>
    t(
      `Cheetos Canisters ${m[1].replace(/[‐-]$/, "")} — snack crocant cu brânză`,
      `Snack crocant din porumb, cu glazură de brânză și gust picant, în format mini, ambalat într-un tub practic. Ideal pentru ronțăit acasă sau la drum.`,
      ["Brand: Cheetos (Frito-Lay)", "Tub cu capac", "A se păstra ferit de umezeală"]
    )],
  [/^Cheetos Mac n Cheese (.+)$/i, (p, m) =>
    t(
      `Cheetos Mac n Cheese ${m[1].replace(/\s*\d+\).*$/, "")} — macaroane instant cu brânză`,
      `Macaroane instant cu sos de brânză, cu gustul condimentat Cheetos. Se prepară în câteva minute, cu apă și lapte — un prânz rapid, consistent.`,
      ["Preparat instant", "Gust de brânză și condimente", "Brand: Cheetos"]
    )],
  [/^Cookie Dough Bites (.+)$/i, (p, m) =>
    t(
      `Cookie Dough Bites ${m[1]} — bucăți de aluat de biscuiți cu ciocolată`,
      "Bucăți mici de aluat de biscuiți, cu bucăți de ciocolată, gata de ronțăit. Gust de cookie proaspăt, fără coacere — un snack dulce și crocant.",
      ["Aluat de biscuiți + ciocolată", "Brand: Cookie Dough Bites", "A se păstra la loc răcoros"]
    )],
  [/^Encona Sauce (.+)$/i, (p, m) =>
    t(
      `Encona ${m[1]} — sos picant`,
      `Sos picant de inspirație caribiană, cu aromă de ${m[1].replace(/Medium/i, "").trim().toLowerCase()} și iuțeală medie. Potrivit pentru marinade, dip-uri și preparate pe grill.`,
      ["Nivel de iuțeală: mediu", "Brand: Encona", "Ambalaj: 285 ml"]
    )],
  [/^Fizz N Foam (.+)$/i, (p, m) =>
    t(
      `Fizz N Foam ${m[1]} — bomboane care spumegă`,
      "Praf de bomboană care spumegă și sfârâie în gură, cu gust intens de fructe. Se toarnă direct pe limbă sau se folosește la deserturi — o senzație distractivă.",
      ["Efect spumant/efervescent", "Aromă: " + m[1], "Ambalaj: 100 g"]
    )],
  [/^Goetze['’]?s Caramel Mini Cow Tales/i, () =>
    t(
      "Goetze's Caramel Mini Cow Tales — bomboane cu caramel și cremă",
      "Mini rulouri cu miez de cremă albă, învelite în caramel moale. Gust dulce de caramel cu lapte, textură chewy — un clasic american.",
      ["Caramel + cremă", "Brand: Goetze's", "Ambalate individual"]
    )],
  [/^Guinness Truffles/i, () =>
    t(
      "Guinness Truffles — trufe de ciocolată cu Guinness",
      "Trufe de ciocolată cu umplutură cremoasă, aromate cu berea stout Guinness. Gust intens de cacao cu note de malț prăjit — un cadou elegant pentru iubitorii de ciocolată neagră.",
      ["Ciocolată + aromă de Guinness", "Ambalate individual", "A se păstra la loc răcoros"]
    )],
  [/^Haribo Unicorn-i-licious/i, () =>
    t(
      "Haribo Unicorn-i-licious — jeleuri cu formă de unicorn",
      "Jeleuri moi, colorate, în formă de unicorni și curcubee, cu arome fructate. Textură plăcută și aspect vesel — o gustare îndrăgită de copii.",
      ["Forme de unicorn", "Arome fructate", "Brand: Haribo"]
    )],
  [/^Herr['’]?s Baked Cheese Curls (.+)$/i, (p, m) =>
    t(
      `Herr's Baked Cheese Curls ${m[1]} — snack crocant cu brânză`,
      `Snack pufos din porumb cu brânză, coapte în loc de prăjite, cu iuțeală de Carolina Reaper. Gust intens de brânză și ardei iute — pentru cei curajoși.`,
      ["Coapte, nu prăjite", "Extrem de picant (Carolina Reaper)", "Brand: Herr's"]
    )],
  [/^Hotz Suga Sours (.+)$/i, (p, m) =>
    t(
      `Hotz Suga Sours ${m[1]} — bomboane dulci-acre`,
      `Bomboane tari, cu înveliș acrișor de ${m[1].toLowerCase()} și miez dulce. Gustul contrastant „dulce-acru” le face o gustare îndrăgită.`,
      ["Strat acru + miez dulce", "Aromă: " + m[1], "Ambalaj: 100 g"]
    )],
  [/^Jelly Belly (?:Jelly Beans )?(\d+)(?: Flavours)?$/i, (p, m) =>
    t(
      `Jelly Belly — ${m[1]} de arome`,
      `Selecție de ${m[1]} de arome de jeleuri Jelly Belly, inclusiv clasici precum popcorn, cireașă sau marshmallow. Fiecare boabă are aroma ei, iar combinațiile sunt nelimitate.`,
      ["Fără coloranți artificiali", "Arome autentice", "Brand: Jelly Belly"]
    )],
  [/^Jelly Belly Sours/i, () =>
    t(
      "Jelly Belly Sours — jeleuri acrișoare",
      "Jeleuri Jelly Belly cu arome acrișoare de fructe, acoperite cu un strat acru. Gustul intens și textura moale le fac perfecte pentru iubitorii de dulce-acru.",
      ["Arome acrișoare", "Fără coloranți artificiali", "Brand: Jelly Belly"]
    )],
  [/^Jelly Belly Watermelon/i, () =>
    t(
      "Jelly Belly Watermelon Jelly Beans — jeleuri cu pepene verde",
      "Jeleuri cu aromă de pepene verde, cu coajă și miez dulce, în stilul autentic Jelly Belly. Mici, colorate și pline de gust.",
      ["Aromă de pepene verde", "Fără coloranți artificiali", "Brand: Jelly Belly"]
    )],
  [/^Juicy Mango Flavour Soft Jelly/i, () =>
    t(
      "Juicy Mango Soft Jelly — jeleu moale cu aromă de mango",
      "Jeleu moale și suculent, cu aromă intensă de mango. Textură plăcută, gust fructat — o gustare dulce, potrivită pentru copii.",
      ["Jeleu moale, suculent", "Aromă de mango", "Ambalare individuală"]
    )],
  [/^Kool-?Aid Gum/i, () =>
    t(
      "Kool-Aid Gum — gumă de mestecat cu aromă Kool-Aid",
      "Gumă de mestecat cu gustul băuturii Kool-Aid, moale și elastică. Arome fructate intense, în ambalaj practic.",
      ["Gust Kool-Aid", "Textură elastică, pentru baloane", "Brand: Kool-Aid"]
    )],
  [/^Kool-?Aid Soda (.+)$/i, (p, m) =>
    t(
      `Kool-Aid Soda ${m[1]} — băutură carbogazoasă`,
      `Băutură carbogazoasă cu gustul celebrului Kool-Aid, varianta ${m[1]}. Dulce-acrișoară și răcoritoare, se servește rece.`,
      ["Gust Kool-Aid", "Se servește rece", "A se păstra la loc răcoros"]
    )],
  [/^Laffy Taffy Rope (.+)$/i, (p, m) =>
    t(
      `Laffy Taffy Rope ${m[1]} — caramea elastică`,
      `Caramea moale și elastică, sub formă de frânghie, cu aromă de ${m[1].toLowerCase()}. Se rupă în bucăți și se mestecă îndelung — un clasic american.`,
      ["Textură chewy", "Aromă: " + m[1], "Brand: Laffy Taffy"]
    )],
  [/^Lotus Biscoff/i, () =>
    t(
      "Lotus Biscoff & Go! — pachețel cu biscuiți și cremă",
      "Pachețel practic cu biscuiți Lotus Biscoff și cremă de caramelizată pentru scufundat. Gust de caramel și scorțișoară — o gustare perfectă la drum.",
      ["Biscuiți + cremă Biscoff", "Ambalaj individual", "Brand: Lotus Biscoff"]
    )],
  [/^Maxons Stupidly Sour (.+)$/i, (p, m) =>
    t(
      `Maxons Stupidly Sour ${m[1]} — bomboane extrem de acre`,
      `Bomboane tari, cu un strat extrem de acru de ${ro(m[1])} și miez dulce. Pentru cei care iubesc provocările acrișoare.`,
      ["Extrem de acru", "Aromă: " + m[1], "Ambalaj: 75 g"]
    )],
  [/^Mini Airheads Bulk Bars/i, () =>
    t(
      "Mini Airheads Bulk Bars — batoane gumate asortate",
      "Batoane mini de bomboană gumoasă, cu arome asortate de fructe. Se rup, se rulează și se mestecă — ideale pentru candy bar-uri și petreceri.",
      ["Arome asortate", "Ambalare individuală", "Brand: Airheads (Perfetti Van Melle)"]
    )],
  [/^Noornz Freeze Dried Candy (.+)$/i, (p, m) =>
    t(
      `Noornz Freeze Dried Candy ${m[1]} — bomboane liofilizate`,
      `Bomboane liofilizate, crocante și ușoare, cu aromă intensă de ${m[1].toLowerCase()}. Textura aerată se topește în gură — o gustare neobișnuită și distractivă.`,
      ["Liofilizate, textură crocantă", "Aromă: " + m[1], "Brand: Noornz"]
    )],
  [/^Pocky (.+)$/i, (p, m) =>
    t(
      `Pocky ${m[1]} — bețișoare de biscuit acoperite`,
      `Bețișoare subțiri de biscuit, acoperite cu ciocolată cu aromă de ${m[1].toLowerCase()}. Crocante, ușoare și perfecte de ronțăit — un snack japonez celebru.`,
      ["Biscuit crocant + glazură", "Brand: Pocky (Glico)", "Origine: Japonia"]
    )],
  [/^Potions Cauldron Spellbound/i, () =>
    t(
      "Potions Cauldron Spellbound Butterscotch Beer — băutură cu aromă de caramel",
      "Băutură carbogazoasă inspirată de universul magic, cu aromă de butterscotch (caramel cu unt). Dulce, cremoasă și răcoritoare, se servește rece.",
      ["Aromă de butterscotch", "Fără alcool", "Brand: Potions Cauldron"]
    )],
  [/^Sprite (.+)$/i, (p, m) =>
    t(
      `Sprite ${m[1]} — băutură carbogazoasă cu citrice`,
      `Băutură răcoritoare cu aromă de lămâie și lime, din gama Sprite, varianta ${m[1]}. Bule fine și gust proaspăt, servită rece.`,
      ["Brand: Sprite (Coca-Cola)", "Se servește rece", "A se păstra la loc răcoros"]
    )],
  [/^Swiss Miss Cocoa (.+)$/i, (p, m) =>
    t(
      "Swiss Miss Cocoa with Lucky Charms Marshmallow — ciocolată caldă instant",
      "Praf instant pentru ciocolată caldă, cu bezele Lucky Charms. Se prepară cu apă sau lapte fierbinte și oferă o băutură cremoasă, cu marshmallows care se topesc.",
      ["Ciocolată caldă instant", "Cu marshmallows", "Brand: Swiss Miss"]
    )],
  [/^Tango Bon Bons (.+)$/i, (p, m) =>
    t(
      `Tango Bon Bons ${m[1]} — bomboane cu gust de Tango`,
      `Bomboane cu gust intens de ${ro(m[1]).toLowerCase()}, inspirate de băutura Tango. Gust fructat, acrișor, cu un miez moale.`,
      ["Gust Tango", "Aromă: " + m[1], "Ambalaj: 100 g"]
    )],
  [/^Toxic Waste Blue/i, () =>
    t(
      "Toxic Waste Blue — bomboane extrem de acre",
      "Bomboane tari, extrem de acre, cu un strat de zahăr acru care se transformă într-un miez dulce. Ediția albastră, în format mare, pentru împărțit.",
      ["Extrem de acru", "Brand: Toxic Waste", "A se păstra la loc uscat"]
    )],
  [/^Twix Wafer Rolls/i, () =>
    t(
      "Twix Wafer Rolls — rulouri de vafă cu caramel și ciocolată",
      "Rulouri subțiri de vafă, cu caramel și acoperite cu ciocolată cu lapte, inspirate de gustul Twix. Crocante, cu miez cremos — un desert de buzunar.",
      ["Caramel + ciocolată cu lapte", "Brand: Twix (Mars)", "Ambalaj: 12 × 22,5 g"]
    )],
  [/^Vidal Rolla Belta (.+)$/i, (p, m) =>
    t(
      `Vidal Rolla Belta ${m[1]} — bandă gumată`,
      `Bandă lungă de jeleu, cu aromă de ${m[1].toLowerCase()}, pe care o poți rula și desfășura. Textură moale, gust fructat intens — distractivă pentru copii.`,
      ["Bandă gumată lungă", "Aromă: " + m[1], "Brand: Vidal"]
    )],
  [/^Vidal Tongue Painter/i, () =>
    t(
      "Vidal Tongue Painter Lollies — acadele care colorează limba",
      "Acadele tari, cu arome acre de fructe, care colorează limba în culori aprinse. Formatul de 150 de bucăți le face ideale pentru petreceri și candy bar-uri.",
      ["Colorează limba", "Arome acrișoare", "Brand: Vidal"]
    )],
  [/^Warheads Super Sour Tongue Roller/i, () =>
    t(
      "Warheads Super Sour Tongue Roller — rulou cu bomboană acră",
      "Rulou cu praf de bomboană extrem de acru, care se aplică pe limbă cu un roller. Gust intens și senzație de acru care „înfioară” — pentru fanii provocărilor.",
      ["Praf extrem de acru", "Aplicator tip roller", "Brand: Warheads"]
    )],
  [/^Tea$/i, () =>
    t(
      "Tea — ceai",
      "Ceai, băutură caldă preparată prin infuzare. Se servește fierbinte, simplu sau cu lapte și zahăr, după preferință.",
      ["Se prepară prin infuzare", "A se păstra la loc uscat, ferit de umezeală"]
    )],
];
const EXTRA = {};

module.exports = { RULES, EXTRA, sizeOf, cleanName, applyNameFixes, RO_FLAVOUR };
