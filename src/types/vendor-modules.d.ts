declare module "d3-geo" {
  type GeoProjection = {
    translate(value: [number, number]): GeoProjection;
    scale(value: number): GeoProjection;
  };

  export function geoAlbersUsa(): GeoProjection;
  export function geoPath(projection?: GeoProjection): (feature?: unknown) => string | null;
}

declare module "topojson-client" {
  export function feature(topology: unknown, object: unknown): unknown;
}

declare module "us-atlas/states-10m.json" {
  const value: unknown;
  export default value;
}
