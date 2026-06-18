export function latLngToTile(lat: number, lng: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y, z: zoom };
}

export function latLngToTileFloat(lat: number, lng: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** zoom;
  const x = ((lng + 180) / 360) * n;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y, z: zoom };
}

export function esriWorldImageryTileGrid(lat: number, lng: number, zoom = 12) {
  const center = latLngToTile(lat, lng, zoom);
  return [-1, 0, 1].flatMap((dy) =>
    [-1, 0, 1].map((dx) => ({
      id: `${center.z}-${center.x + dx}-${center.y + dy}`,
      url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${center.z}/${center.y + dy}/${center.x + dx}`,
    })),
  );
}

export function markerPositionInTileGrid(lat: number, lng: number, zoom = 12) {
  const center = latLngToTile(lat, lng, zoom);
  const point = latLngToTileFloat(lat, lng, zoom);
  const xPixels = (point.x - (center.x - 1)) * 256;
  const yPixels = (point.y - (center.y - 1)) * 256;
  return {
    left: `${(xPixels / 768) * 100}%`,
    top: `${(yPixels / 768) * 100}%`,
  };
}
