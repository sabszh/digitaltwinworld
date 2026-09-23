const countryCodeByName: Record<string, string> = {
  argentina: "AR",
  australien: "AU",
  australia: "AU",
  brasilien: "BR",
  brazil: "BR",
  canada: "CA",
  chile: "CL",
  danmark: "DK",
  denmark: "DK",
  estland: "EE",
  estonia: "EE",
  finland: "FI",
  frankrig: "FR",
  france: "FR",
  "forenede arabiske emirater": "AE",
  "de forenede arabiske emirater": "AE",
  "united arab emirates": "AE",
  ghana: "GH",
  holland: "NL",
  indien: "IN",
  india: "IN",
  indonesia: "ID",
  indonesien: "ID",
  italien: "IT",
  italy: "IT",
  japan: "JP",
  kenya: "KE",
  marokko: "MA",
  morocco: "MA",
  mexico: "MX",
  nederlandene: "NL",
  netherlands: "NL",
  "new zealand": "NZ",
  poland: "PL",
  polen: "PL",
  portugal: "PT",
  rwanda: "RW",
  singapore: "SG",
  spanien: "ES",
  spain: "ES",
  sverige: "SE",
  sweden: "SE",
  sydafrika: "ZA",
  "south africa": "ZA",
  sydkorea: "KR",
  "south korea": "KR",
  tyskland: "DE",
  germany: "DE",
  usa: "US",
  "united states": "US",
};

function flagFromCode(code: string) {
  return String.fromCodePoint(
    ...code.split("").map((character) => 0x1f1e6 + character.charCodeAt(0) - 65),
  );
}

export function countryFlag(country: string, region?: string) {
  const possibleCode = region?.trim().toLocaleUpperCase() ?? "";
  const code = /^[A-Z]{2}$/.test(possibleCode)
    ? possibleCode
    : countryCodeByName[country.trim().toLocaleLowerCase()];
  return code ? flagFromCode(code) : "🌍";
}
