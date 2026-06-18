import { esriWorldImageryTileGrid, markerPositionInTileGrid } from "./geoTiles";

export type SatelliteImageProvider = "mapbox-static" | "google-static" | "arcgis-tiles";

export type SatelliteImageModel =
  | {
      provider: "mapbox-static";
      images: Array<{ id: string; url: string }>;
      markerStyle: { left: string; top: string };
      zoom: number;
      attribution: string;
      mode: "single";
    }
  | {
      provider: "google-static";
      images: Array<{ id: string; url: string }>;
      markerStyle: { left: string; top: string };
      zoom: number;
      attribution: string;
      mode: "single";
    }
  | {
      provider: "arcgis-tiles";
      images: Array<{ id: string; url: string }>;
      markerStyle: { left: string; top: string };
      zoom: number;
      attribution: string;
      mode: "grid";
    };

export function getSatelliteImageModel(input: {
  lat: number;
  lng: number;
  zoom: number;
  size: number;
}): SatelliteImageModel {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (mapboxToken) {
    const encodedLngLat = `${input.lng},${input.lat},${input.zoom},0`;
    const size = `${input.size}x${input.size}@2x`;
    const url = new URL(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${encodedLngLat}/${size}`);
    url.searchParams.set("access_token", mapboxToken);
    url.searchParams.set("attribution", "false");
    url.searchParams.set("logo", "false");

    return {
      provider: "mapbox-static",
      images: [{ id: "mapbox-satellite", url: url.toString() }],
      markerStyle: { left: "50%", top: "50%" },
      zoom: input.zoom,
      attribution: "Mapbox Satellite",
      mode: "single",
    };
  }

  if (googleKey) {
    const url = new URL("https://maps.googleapis.com/maps/api/staticmap");
    url.searchParams.set("center", `${input.lat},${input.lng}`);
    url.searchParams.set("zoom", String(input.zoom));
    url.searchParams.set("size", `${input.size}x${input.size}`);
    url.searchParams.set("scale", "2");
    url.searchParams.set("maptype", "satellite");
    url.searchParams.set("key", googleKey);

    return {
      provider: "google-static",
      images: [{ id: "google-satellite", url: url.toString() }],
      markerStyle: { left: "50%", top: "50%" },
      zoom: input.zoom,
      attribution: "Google Satellite",
      mode: "single",
    };
  }

  return {
    provider: "arcgis-tiles",
    images: esriWorldImageryTileGrid(input.lat, input.lng, input.zoom),
    markerStyle: markerPositionInTileGrid(input.lat, input.lng, input.zoom),
    zoom: input.zoom,
    attribution: "ArcGIS World Imagery",
    mode: "grid",
  };
}
