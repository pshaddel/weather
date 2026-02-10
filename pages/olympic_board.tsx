import type { ReactElement } from "react";
import Image from "next/image";
import type { GetServerSideProps } from "next";
import { parse } from "node-html-parser";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const redbullAthlethes = ["Hazim 'Zeem' Ahmad",
"Rhys McClenaghan",
"Tomoki Nojiri",
"Ana 'ANa' Dumbravă",
"Elquaria",
"Melita Abraham",
"Antonia Abraham",
"Luc Ackermann",
"Pedro Acosta",
"Eva Adamczyková",
"Andrea Adamo",
"Courage Adams",
"Terry Adams",
"Red Bull Blanix Aerobatic Team",
"Ludwig Ahgren",
"Emma Aicher",
"Luke Aikins",
"Dania Akeel",
"Nasser Al Attiyah",
"Mosaad Al Dossary",
"Yahya Al Ghassani",
"Ahmed 'AAMEGHESSIB' Al Meghessib",
"Amar 'Amar'  Al Naimi",
"Mansour Al Safran",
"Abdulla Al Tamimi",
"Almoiez Ali",
"Romain Allemand",
"David Alonso",
"Luc Alphand",
"Bora Altıntaş",
"Ehab Amin",
"Igor Amorelli",
"Timmy 'iiTzTimmy' An",
"Adel 'Big Bird' Anouche",
"Sorato Anraku",
"Madars Apse",
"Wael Arakji",
"Kyohei Arata",
"Sofia 'SofiKimmy' Aravena",
"Tony Arbolino",
"Albert Arenas",
"Kaylea Arnett",
"Ege 'Ar7' Arseven",
"César Arévalo",
"Yndiara Asp",
"Chamari Atapattu",
"Gee Atherton",
"Rachel Atherton",
"Courtney Atkinson",
"Jesse Augustinus",
"Henrique Avancini",
"Olivia Babcock",
"Rokas Baciuška",
"Zoe Bäckstedt",
"Natascha Badmann",
"Hande Baladın",
"Mohammed Balooshi",
"Davide Baraldi",
"Andrzej Bargiel",
"Mutaz Barshim",
"Enea Bastianini",
"Felix Baumgartner",
"Raimund Baumschlager",
"Madeleine Bayon",
"Emir Ali 'Alfajer' Beder",
"Chris Bednar",
"Kenny Belaey",
"Kevin Benavides",
"Luciano Benavides",
"Tyler Bereman",
"Hannah Bergemann",
"Andreas Bergmark",
"Zita Bernatsky",
"Anders Berntsen Mol",
"Matteo Berrettini",
"Oriane Bertone",
"Aldana Bertran",
"Péter Besenyei",
"Tarik Biberović",
"Archie Biggin",
"Finn Bilous",
"Brad Binder",
"Jess Blewitt",
"Kristian Blummenfelt",
"Stefan Bojic",
"Billy Bolt",
"Parks Bonifay",
"Rémi Bonnet",
"Teresa Bonvalot",
"Alexandre 'gAuLeS' Borba Chiqueta",
"Annika Bornebusch",
"Gavin Bottger",
"Liam Brearley",
"Dewald Brevis",
"Mike Brewer",
"Tom Bridge",
"Erin Brooks",
"Bobby Brown",
"Carson Brown",
"Lore Bruggeman",
"Loïc Bruni",
"Nicolai Budkov Kjær",
"Sébastien Buemi",
"Letícia Bufoni",
"Dušan Bulut",
"Mohamad Burbayea",
"Harriet  Burbidge-Smith",
"Carlos Burle",
"Morgan 'Angry Ginge' Burtwistle",
"Kehu Butler",
"Daniel Bækkegård",
"Fabian Bösch",
"Santosh C.S",
"Pedro Caldas",
"Greg Callaghan",
"Felipe Camargo",
"Giuliano Cameroni",
"Edgar Canet",
"David 'TheGrefg' Cánovas Martínez",
"Jake Canter",
"Melanie 'meL' Capone",
"Brian Capper",
"Alice Capsey",
"Andrew Carlson",
"Angelo Caro",
"Álvaro Carpe",
"Victor Carrera",
"Jeannail 'Cuddle_Core' Carter",
"Deyna Castellanos",
"Queralt Castellet",
"Molly Caudery",
"Oscar 'Mixwell' Cañellas",
"Maxime Chabloz",
"Kirby Chambliss",
"Somkiat  Chantra",
"Mia Chapman",
"Lucy Charles-Barclay",
"Jules Charraud",
"Dominique Charrier",
"Gabriel Chaves",
"Lucas 'Chumbo' Chianca",
"João Vitor Chianca",
"Masaya 'aMSa' Chikamoto",
"Emily Chinnock",
"Amy Chmelecki",
"Nelli Chukanivska",
"Will Claye",
"Sacha Coenen",
"Lucas Coenen",
"Griffin Colapinto",
"Kevin Coleman",
"Beatrice Colli",
"CJ Collins",
"Rome Collyer",
"Aaron Colton",
"Lara Colturi",
"Deury Corniel",
"Dario Costa",
"Andrew Cotton",
"David Coulthard",
"Kate Courtney",
"Laura Coviella",
"Alfie Cox",
"Shauna Coxsey",
"James Crawford",
"Bruno Crivilin",
"Brock Crouch",
"Cannon Cummins",
"Łukasz Czepiela",
"Ahmad Daham",
"Miles Daisher",
"Angel Daleman",
"Matthias Dandois Delaigue",
"Markéta Davidová",
"Patrick Davidson",
"Aimee 'Aimsey' Davies",
"Kübra Dağlı",
"Giniel De Villiers",
"Jon DeVore",
"Jake Dearden",
"Ryan Decenzo",
"Valentin Delluc",
"Felix Denayer",
"Memphis Depay",
"Cyril Despres",
"Daniel Dhers",
"Dominic Di Tommaso",
"Sasha DiGiulian",
"Sandro Dias",
"Margielyn Didal",
"Berke Dikişcioğlu",
"Noa Diorgina",
"Luka Đukić",
"Phillip ‘ImperialHal’ Dosen",
"Denisa Dragomir",
"Patricia Druwen",
"Nikita Ducarroz",
"Cédric Dumont",
"Björn Dunkerbeck",
"Liam Dunkerbeck",
"Ronan Dunne",
"Armand Duplantis",
"Justine Dupont",
"Orlando Duque",
"Aaron Durogati",
"AJ Dybantsa",
"Jordan Díaz",
"Jarvis Earle",
"Jagger Eaton",
"Markus Eder",
"Laila Edwards",
"Kade Edwards",
"Simon Ehammer",
"Angela Eiter",
"Mattias Ekström",
"Hisham El Khateeb",
"Yehia El-Deraa",
"Diego Elias",
"Stephan Embacher",
"Meagan Ethell",
"Eero Ettala",
"Tom Evans",
"Liam Everts",
"Šime Fantela",
"Andy Farrington",
"Lisa Faulkner",
"Erik Fedko",
"Broc Feeney",
"Abdo Feghali",
"Ben Ferguson",
"Dario 'Moonryde' Ferracci",
"Tiago Ferreira",
"Italo Ferreira",
"Lucas Fink",
"Leonardo Fioravanti",
"Aaron Fitzgerald",
"Arthur Fiu",
"Filip Flisar",
"Nathan Florence",
"Mac Forehand",
"Stella Forsyth",
"Amber Forte",
"Martin 'MrSavage' Foss Andersen",
"Adrien Fourmaux",
"Jessica Fox",
"Jamie Foy",
"Gabriela 'Gabs' Freindorfer",
"Anatol Friedl",
"Frédéric Fugen",
"Mari Fukada",
"Martin Fuksa",
"MiLaysia Fulwiley",
"Marco Fürst",
"Will Gadd",
"Alejandro Galán",
"Anna Gandler",
"Josep Garcia",
"Germán 'GermanGarmendia' Garmendia",
"Janja Garnbret",
"Arnaud 'Séan' Garnier",
"Anna Gasser",
"Mete Gazoz",
"Vinzenz Geiger",
"Thomas Genon",
"Felix Georgii",
"Arūnas Gibieža",
"Paula Gilabert",
"Alberto Gines López",
"Leon Glatzer",
"Stefan Glowacz",
"Rafael Goberna",
"Hana Goda",
"Szymon Godziek",
"Dawid Godziek",
"Sofia Goggia",
"Nouran Gohar",
"Didier Goirand",
"Andreas Goldberger",
"Jackson  Goldstone",
"Viki Gomez",
"Izzi Gomez",
"Carlota Gonzáles Pereiro",
"Natxo González",
"Beatriz González",
"Piotr 'Grabo' Grabowski",
"Paddy Graham",
"Tina Graudiņa",
"Mathilde Gremaud",
"Jakub Grigar",
"Senad Grosic",
"Natalia Grossman",
"Selina Grotian",
"Brian Grubb",
"Eileen Gu",
"Gonçalo Guerreiro",
"Adrian Guggemos",
"Paul Guschlbauer",
"Valentino Guseli",
"Felipe Gustavo",
"Mitch Guthrie Jr.",
"Cristina Gutiérrez",
"Aaron Gwin",
"Dominik Gührs",
"Kıvanç Gür",
"Ayhancan Güven",
"Maxim Habanec",
"Isack Hadjar",
"Roman Hagara",
"Ahmed 'Halawa' Halawa",
"Eli Hanneman",
"Kevin Hansen",
"Timmy Hansen",
"Dylan Harper",
"Trystan Hart",
"Ali 'SypherPK' Hassan",
"Lisa  Hauser",
"Kio Hayakawa",
"Jérémie Heitz",
"Jonatan Hellvig",
"Gracey Hemstreet",
"Hunter Henderson",
"Morgane Herculano",
"Jeffrey Herlings",
"Dominik Hernler",
"Benjamin Herrera",
"Aidan Heslop",
"Hannah Hidalgo",
"Frederik 'Noway4u' Hinteregger",
"Marcel Hirscher",
"Max Hitzig",
"Lalremsiami Hmarzote",
"Chu Ting Timothy Ho",
"Victor Hoffer",
"Bruno Hoffmann",
"Nicolas Hojac",
"Daniel Holgado",
"Yuto Horigome",
"Laura Horváth",
"Elias Hountondji",
"Corentin 'Gotaga' Houssein",
"Žiga Lin Hočevar",
"Vavřinec Hradilek",
"Jakub Hroneš",
"Tzu-Peng Huang",
"David ‘GrandPOOBear’ Hunt",
"Sam Hurley",
"Jamie Huser",
"Chance Hymas",
"Valentina Höll",
"Larissa Iapichino",
"Rhiannan Iffland",
"Kanoa Igarashi",
"Finn Iles",
"Kristjan  Ilves",
"Natalia  Iocsak",
"Birk Irving",
"Hamza Ismail",
"Ayumu Iwasa",
"Yuri Izu",
"Kyle 'Mongraal' Jackson",
"Emil Johansson",
"Maya Joint",
"Matt Jones",
"Kai Jones",
"Shaker Jweihan",
"Rahul KL",
"Kamel 'Kameto' Kebir",
"Sebastian Keep",
"Malene Kejlstrup Sørensen",
"Maya Kelly",
"Sierra  Kerr",
"Rashid Khan Arman",
"Petra Klingler",
"Konstanze Klosterhalfen",
"Hilary Knight",
"Ryōyū Kobayashi",
"Siya Kolisi",
"Dimitris Kolliakos",
"Johan Kristoffersson",
"Simona Kuchyňková",
"Maja Kuczyńska",
"Kriss Kyle",
"Philip Köster",
"Mike LaBelle",
"Johannes Lamparter",
"Dougie Lampkin",
"Martín Landaluce",
"Dominik Landertinger",
"Santiago Lange",
"Hailey Langland",
"Simone Leathead",
"Corbin Leaverton",
"Juan Lebrón Chincoa",
"Ester Ledecká",
"Tess Ledeux",
"Chaeun Lee",
"Tsz Kwan Li",
"Leevy 'Oil King' Lin",
"Michaela 'mimi' Lintrup",
"Zrinka Ljutić",
"Horacio Llorens",
"Sébastien Loeb",
"Francisco 'Chaleco' López",
"Danny MacAskill",
"Sean MacCormac",
"Brook Macdonald",
"Fernanda Maciel",
"Robbie Maddison",
"Emma Maltais",
"Adam Malysz",
"Arch Manning",
"Max Manow",
"Valentina Margaglio",
"Caroline Marks",
"Adrian Mattern",
"Chris 'Lethal Shooter' Matthews",
"Txema Mazet-Brown",
"Alessandro Mazzara",
"Payson McElveen",
"Ayeisha McFerran",
"Bryce Menzies",
"Jakub Menšík",
"Sebastian \"Rewinside\" Meyer",
"Benny Milam",
"Clemens Millauer",
"Max Moffatt",
"Diogo Moreira",
"Pablo Moreno",
"Thomas Morgenstern",
"Olivia Moultrie",
"Kirsty Muir",
"Catie Munnings"
];

export type MedalTableRow = {
  rank: number;
  country: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
};

export type AthleteMedalCount = {
  gold: number;
  silver: number;
  bronze: number;
};

export type AthleteMedalMap = Record<string, AthleteMedalCount>;

type OlympicBoardProps = {
  medalTable: MedalTableRow[];
};

export default function OlympicBoard({ medalTable }: OlympicBoardProps) {
  const cellSize = "px-6 py-6";

  return (
    <section className="relative z-50 w-screen min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover blur-sm scale-105"
        style={{ backgroundImage: "url('/winter_olympics.avif')" }}
      />
      <div className="absolute inset-0 bg-white/70" />

      <div className="relative p-10">
        <div className="flex justify-center pb-6">
          <Image
            src="/logo.png"
            alt="Red Bull Logo"
            width={300}
            height={90}
            priority
            style={{ padding: "20px" }}
          />
        </div>

        <h1 className="text-2xl font-bold text-center">Winter Olympics Medal Table</h1>

        <div className="overflow-x-auto text-xl mt-6">
          <table className="min-w-full table-auto p-2">
            <thead>
              <tr>
                <th className={`${cellSize} min-w-16 text-left`}>Rank</th>
                <th className={`${cellSize} text-left`}>Flag</th>
                <th className={`${cellSize} text-left`}>Country</th>
                <th className={`${cellSize} text-yellow-600`}>Gold</th>
                <th className={`${cellSize} text-gray-400`}>Silver</th>
                <th className={`${cellSize} text-amber-700`}>Bronze</th>
                <th className={`${cellSize} font-bold`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {medalTable.map((row) => (
                row.rank === -1 ? (
                  <tr key={`separator-${row.country}`}>
                    <td className={`border ${cellSize} text-center font-semibold`} colSpan={7}>...</td>
                  </tr>
                ) : (
                  <tr
                    key={`${row.country}-${row.rank}`}
                      className={
                        row.country === "Red Bull Athletes"
                          ? "ring-2 ring-yellow-500 bg-gradient-to-r from-yellow-100/70 via-white/60 to-yellow-100/70"
                          : undefined
                      }
                  >
                    <td className={`border ${cellSize} text-center`}>{row.rank}</td>
                    <td className={`border ${cellSize}`}>
                      {row.country === "Red Bull Athletes" ? (
                        <Image
                          src="/logo.png"
                          alt="Red Bull"
                          width={56}
                          height={56}
                          className="inline-block"
                        />
                      ) : (
                        (() => {
                          const flagSrc = getFlagSrc(row.country);
                          return flagSrc ? (
                            <Image
                              src={flagSrc}
                              alt={`${row.country} flag`}
                              width={28}
                              height={20}
                              className="inline-block"
                            />
                          ) : null;
                        })()
                      )}
                    </td>
                    <td className={`border ${cellSize} font-semibold`}>{row.country}</td>
                      <td className={`border-y ${cellSize} text-yellow-600 font-bold text-center`}>{row.gold}</td>
                      <td className={`border-y ${cellSize} text-gray-400 font-bold text-center`}>{row.silver}</td>
                      <td className={`border-y ${cellSize} text-amber-700 font-bold text-center`}>{row.bronze}</td>
                      <td className={`border ${cellSize} font-bold text-center`}>{row.total}</td>
                    </tr>
                  )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

OlympicBoard.getLayout = function getLayout(page: ReactElement) {
  return page;
};

const WINTER_OLYMPICS_URL = "https://en.wikipedia.org/wiki/2026_Winter_Olympics_medal_table";
const MEDAL_WINNERS_URL = "https://en.wikipedia.org/wiki/List_of_2026_Winter_Olympics_medal_winners";

export const getServerSideProps: GetServerSideProps<OlympicBoardProps> = async () => {
  try {
    const response = await fetch(WINTER_OLYMPICS_URL);
    const html = await response.text();
    const medalTable = extractMedalTableFromHtml(html);
    if (medalTable.length > 0) {
      const athleteMedalMap = await getAthleteMedalMap();
      // enrich medal table with athlete medal counts for redbull athletes
      const redbullAsCountryRow: MedalTableRow = {
        rank: 0,
        country: "Red Bull Athletes",
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0
      };
      for (const athlete of redbullAthlethes) {
        const medalCount = athleteMedalMap[athlete];
        if (medalCount) {
          redbullAsCountryRow.gold += medalCount.gold;
          redbullAsCountryRow.silver += medalCount.silver;
          redbullAsCountryRow.bronze += medalCount.bronze;
          redbullAsCountryRow.total += medalCount.gold + medalCount.silver + medalCount.bronze;
        }
      }
      if (redbullAsCountryRow.total > 0) {
        medalTable.push(redbullAsCountryRow);
      }

      // calculate the ranks based on the medal counts (gold > silver > bronze > total)
      medalTable.sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return b.total - a.total;
      });
      let currentRank = 1;
      for (let i = 0; i < medalTable.length; i++) {
        if (i > 0) {
          const prev = medalTable[i - 1];
          const curr = medalTable[i];
          if (curr.gold === prev.gold && curr.silver === prev.silver && curr.bronze === prev.bronze && curr.total === prev.total) {
            curr.rank = prev.rank; // same rank for ties
          } else {
            curr.rank = currentRank;
          }
        } else {          medalTable[i].rank = currentRank;
        }
        currentRank++;
      };

      // if redbull is not in top 10, use ... and red bull as the last one.- make the rank -1, and we handle it in the frontend
        if (redbullAsCountryRow.total > 0 && redbullAsCountryRow.rank > 10) {
          medalTable.splice(10, 0, {
            rank: -1,
            country: "...",
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0
          });
          medalTable.splice(11, 0, redbullAsCountryRow);
      };

      // slice to top 10


      medalTable.splice(10);
      return { props: { medalTable } };
    }
  } catch (error) {
    console.error("Failed to load medal table:", error);
  }

  return { props: { medalTable: getFallbackMedalTable() } };
};

function extractMedalTableFromHtml(html: string): MedalTableRow[] {
  const root = parse(html);
  const tables = root.querySelectorAll("table.wikitable.sortable");
  const targetTable = tables.find((table) =>
    table.querySelector("caption")?.text.toLowerCase().includes("2026 winter olympics medal table")
  );

  if (!targetTable) return [];

  const rows = targetTable.querySelectorAll("tbody tr");
  const medalRows: MedalTableRow[] = [];
  let currentRank: number | null = null;

  for (const row of rows) {
    if (row.classList.contains("sortbottom")) continue;

    const headerCell = row.querySelector("th");
    if (!headerCell) continue;

    const headerText = headerCell.text.replace(/\s+/g, " ").trim();
    if (headerText.toLowerCase().includes("totals")) continue;

    const countryAnchor = headerCell.querySelector("a");
    const country = (countryAnchor?.text ?? headerText).replace(/\*$/, "").trim();
    if (!country) continue;

    const dataCells = row.querySelectorAll("td");
    if (dataCells.length < 4) continue;

    let rank: number | null = currentRank;
    let offset = 0;

    if (dataCells.length >= 5) {
      rank = Number.parseInt(dataCells[0].text.trim(), 10);
      offset = 1;
      if (Number.isNaN(rank)) {
        rank = currentRank;
        offset = 0;
      }
    }

    if (rank === null) continue;
    currentRank = rank;

    const gold = Number.parseInt(dataCells[offset]?.text.trim(), 10) || 0;
    const silver = Number.parseInt(dataCells[offset + 1]?.text.trim(), 10) || 0;
    const bronze = Number.parseInt(dataCells[offset + 2]?.text.trim(), 10) || 0;
    const total = Number.parseInt(dataCells[offset + 3]?.text.trim(), 10) || gold + silver + bronze;

    medalRows.push({
      rank,
      country,
      gold,
      silver,
      bronze,
      total,
    });
  }

  return medalRows;
}

function getFallbackMedalTable(): MedalTableRow[] {
  return [
  ];
}

async function getAthleteMedalMap(): Promise<AthleteMedalMap> {
  const response = await fetch(MEDAL_WINNERS_URL);
  const html = await response.text();
  return extractAthleteMedalMapFromHtml(html);
}

function extractAthleteMedalMapFromHtml(html: string): AthleteMedalMap {
  const root = parse(html);
  const tables = root.querySelectorAll("table.wikitable.plainrowheaders");
  const athletes: AthleteMedalMap = {};

  for (const table of tables) {
    const rows = table.querySelectorAll("tbody tr");
    if (rows.length === 0) continue;

    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 3) continue;

      const medalCells = cells.slice(-3);
      const medalTypes: (keyof AthleteMedalCount)[] = ["gold", "silver", "bronze"];

      medalCells.forEach((cell, index) => {
        if (cell.classList.contains("table-na")) return;

        const links = cell.querySelectorAll("a");
        for (const link of links) {
          const name = link.text.replace(/\s+/g, " ").trim();
          if (!name || name.toLowerCase().includes("details")) continue;

          athletes[name] ??= { gold: 0, silver: 0, bronze: 0 };
          athletes[name][medalTypes[index]] += 1;
        }
      });
    }
  }

  return athletes;
}

const COUNTRY_CODE_OVERRIDES: Record<string, string> = {
  "United States": "US",
  "USA": "US",
  "Great Britain": "GB",
  "United Kingdom": "GB",
  "Russia": "RU",
  "ROC": "RU",
  "Czech Republic": "CZ",
  "Czechia": "CZ",
  "Korea": "KR",
  "South Korea": "KR",
  "North Korea": "KP",
  "Iran": "IR",
  "Hong Kong": "HK",
  "Chinese Taipei": "TW",
  "Vietnam": "VN",
  "Venezuela": "VE",
  "Syria": "SY",
  "Bolivia": "BO",
  "Tanzania": "TZ",
  "Moldova": "MD",
  "Laos": "LA",
  "Cape Verde": "CV",
  "Côte d’Ivoire": "CI",
  "Cote d'Ivoire": "CI",
  "Brunei": "BN",
  "Macau": "MO",
  "Ivory Coast": "CI",
  "Republic of Ireland": "IE",
  "Palestine": "PS",
  "Turkey": "TR",
  "Eswatini": "SZ",
  "Swaziland": "SZ",
  "Myanmar": "MM",
  "Macedonia": "MK",
  "North Macedonia": "MK",
  "Sao Tome and Principe": "ST",
  "São Tomé and Príncipe": "ST",
  "United Arab Emirates": "AE",
  "UAE": "AE",
  "Dominican Republic": "DO",
  "DR Congo": "CD",
  "Congo, Democratic Republic": "CD",
  "Republic of the Congo": "CG",
  "Congo": "CG",
  "Bahamas": "BS",
  "Gambia": "GM",
  "Micronesia": "FM",
  "Timor-Leste": "TL",
  "East Timor": "TL",
  "Kosovo": "XK",
};

function getFlagSrc(countryName: string): string | null {
  const override = COUNTRY_CODE_OVERRIDES[countryName];
  const code = override ?? countries.getAlpha2Code(countryName, "en");
  if (!code) return null;
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}
