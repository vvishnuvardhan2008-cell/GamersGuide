// app/config/api.js

const BASE_URL = 'http://192.168.4.147:4000'; // your IP is correct

export async function getLibrary() {
  // no query param needed for the demo
  const res = await fetch(`${BASE_URL}/api/library/search`);

  if (!res.ok) {
    throw new Error('Failed to fetch library');
  }

  const json = await res.json();
  // backend returns { data: [...] }, so return the array:
  return json.data || [];
}
