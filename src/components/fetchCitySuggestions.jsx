async function fetchCitySuggestions(query) {
  if (!query) return [];
  const username = "2amh20";
  const url = `https://secure.geonames.org/searchJSON?name=${encodeURIComponent(query)}&featureClass=P&maxRows=10&username=${username}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const seen = new Set();
    return data.geonames
      .map(city =>
        `${city.name}, ${city.adminName1 ? city.adminName1 + ', ' : ''}${city.countryName}`
      )
      .filter(cityCountry => {
        if (seen.has(cityCountry)) return false;
        seen.add(cityCountry);
        return true;
      });
  } catch {
    return [];
  }
}

export default fetchCitySuggestions;
