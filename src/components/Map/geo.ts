import labels from './osm/map.labels.json';

/** География карты: OSM-область исторического центра Петербурга, спроецированная в единицы карты (W×H). */
export const MAP_GEO = labels.geo;
export const MAP_W = labels.geo.W;
export const MAP_H = labels.geo.H;
const lat0 = ((labels.geo.minlat + labels.geo.maxlat) / 2) * (Math.PI / 180);
const kx = MAP_W / ((labels.geo.maxlon - labels.geo.minlon) * Math.cos(lat0));

export type LatLon = [number, number];
/** Широта/долгота → единицы карты (0..W, 0..H). */
export const toMap = ([lat, lon]: LatLon): [number, number] => [(lon - MAP_GEO.minlon) * Math.cos(lat0) * kx, (MAP_GEO.maxlat - lat) * kx];
/** Метров в единице карты. */
export const METERS_PER_UNIT = (111320 * Math.cos(lat0)) / (Math.cos(lat0) * kx);

/** Ключевые точки прототипа. Театр — Большая Морская, 14 (рядом метро «Адмиралтейская»). */
export const GEO = {
  theatre: [59.93632, 30.31478] as LatLon,
};

export type Street = { name: string; rank: number; len: number; pts: number[][] };
export const STREETS = labels.streets as Street[];
export const WATERS = labels.waters as Array<{ name: string; x: number; y: number; area: number }>;
export const METRO = labels.metro as Array<{ name: string; x: number; y: number }>;
