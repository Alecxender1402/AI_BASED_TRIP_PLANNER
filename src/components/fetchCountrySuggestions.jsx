async function fetchCountrySuggestions(query) {
  if (!query) return [];
  const username = "2amh20";
  const url = `https://secure.geonames.org/countryInfoJSON?username=${username}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.geonames
      .map(country => country.countryName)
      .filter(name => name.toLowerCase().includes(query.toLowerCase()));
  } catch {
    return [];
  }
}
export default fetchCountrySuggestions;
