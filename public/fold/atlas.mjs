// THE FOLD — presentation-only palette for a third-party vector map.
// The external map provider supplies all geographical features, text and attribution.
// This module never fetches, stores or infers device locations.
export const SAMPLE_CENTER=Object.freeze([-122.338,47.610]); // Seattle example, NEVER a claimed user location.
export const BASE_STYLE='https://tiles.openfreemap.org/styles/bright';
export const ATLAS=Object.freeze({
 paper:'#e7dfc7', meadow:'#c7d7b8', forest:'#9ebca5', park:'#a8c9aa',
 water:'#8cbfc6', waterEdge:'#6f9ea5', building:'#c8b89f',
 road:'#f8f0da', roadMajor:'#d8ad88', roadEdge:'#ab9c82', rail:'#b18d72',
 boundary:'#aa9884', ink:'#3d5c53', halo:'#faf2dc'
});
export function validMapPoint(lng,lat){
 if(typeof lng!=='number'||typeof lat!=='number'||!Number.isFinite(lng)||!Number.isFinite(lat))return null;
 if(lng < -180||lng > 180||lat < -85.051129||lat > 85.051129)return null;
 return [lng,lat];
}
// MapLibre paints are chosen conservatively by both geometry type and layer name.
// Unrecognized layers keep the upstream provider's styles rather than being hidden.
export function atlasPaintFor(layer){
 if(!layer||typeof layer.id!=='string'||typeof layer.type!=='string')return [];
 const id=layer.id.toLowerCase();
 if(layer.type==='background')return [['background-color',ATLAS.paper]];
 if(layer.type==='fill'){
  if(/water|lake|ocean|river/.test(id))return [['fill-color',ATLAS.water]];
  if(/forest|wood|tree/.test(id))return [['fill-color',ATLAS.forest]];
  if(/park|grass|meadow|nature|scrub|pitch|garden/.test(id))return [['fill-color',ATLAS.park]];
  if(/building/.test(id))return [['fill-color',ATLAS.building]];
  if(/landcover|landuse|residential|land/.test(id))return [['fill-color',ATLAS.meadow]];
 }
 if(layer.type==='line'){
  if(/water|river|stream|canal/.test(id))return [['line-color',ATLAS.waterEdge]];
  if(/rail/.test(id))return [['line-color',ATLAS.rail]];
  if(/boundary|border/.test(id))return [['line-color',ATLAS.boundary]];
  if(/road|highway|street|motorway|trunk|primary|secondary|path|pedestrian|bridge|tunnel/.test(id)){
   const color=/casing|outline/.test(id)?ATLAS.roadEdge:/motorway|trunk|primary|major/.test(id)?ATLAS.roadMajor:ATLAS.road;
   return [['line-color',color]];
  }
 }
 if(layer.type==='symbol'&&/label|place|name|road|city|town|country|village|housenumber|poi|park|water/.test(id)){
  return [['text-color',ATLAS.ink],['text-halo-color',ATLAS.halo],['text-halo-width',1.25]];
 }
 return [];
}
export function applyFoldAtlas(map){
 if(!map||typeof map.getStyle!=='function'||typeof map.setPaintProperty!=='function')return {layers:0,painted:0};
 const layers=map.getStyle()?.layers;
 if(!Array.isArray(layers))return {layers:0,painted:0};
 let painted=0;
 for(const layer of layers){
  for(const [property,value] of atlasPaintFor(layer)){
   try{map.setPaintProperty(layer.id,property,value);painted++;}
   catch{/* Provider styles may change; leave unsupported layers untouched. */}
  }
 }
 return {layers:layers.length,painted};
}
