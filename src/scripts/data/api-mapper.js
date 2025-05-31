import Map from "../utils/maps";

export async function reportMapper(data) {
  // Tentukan latitude dan longitude dari 'data'
  // Prioritaskan data.location.latitude/longitude jika ada,
  // jika tidak, gunakan data.lat/data.lon
  const latitude = data.location?.latitude || data.lat;
  const longitude = data.location?.longitude || data.lon;

  // Tentukan nama lokasi.
  // Jika sudah ada placeName, gunakan itu.
  // Jika tidak, coba dapatkan dari Map berdasarkan koordinat.
  let placeName = data.location?.placeName || data.locationName;
  if (!placeName && latitude && longitude) {
    try {
      placeName = await Map.getPlaceNameByCoordinate(latitude, longitude);
    } catch (error) {
      console.warn("api-mapper: Gagal mendapatkan nama lokasi dari koordinat:", error);
      placeName = `Koordinat: ${latitude}, ${longitude}`; // Fallback jika gagal
    }
  } else if (!placeName) {
    placeName = "Lokasi tidak diketahui"; // Fallback jika tidak ada koordinat
  }

  return {
    ...data, // Sertakan semua properti asli dari objek data
    id: data.id, // Pastikan id tetap ada
    name: data.name || data.title, // Asumsi nama cerita bisa 'name' atau 'title'
    location: {
      latitude: latitude,
      longitude: longitude,
      placeName: placeName,
    },
    // Pastikan properti lain yang diharapkan oleh template ada, misalnya:
    // photoUrl: data.photoUrl,
    // createdAt: data.createdAt,
    // description: data.description,
    // reporter: data.reporter || { name: 'Anonim' }, // Contoh untuk reporter
  };
}