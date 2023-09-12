type separateRet = Partial<{
  MultiPolygon: GeoJSON.FeatureCollection<GeoJSON.MultiPolygon>
  Polygon: GeoJSON.FeatureCollection<GeoJSON.Polygon>
  MultiLineString: GeoJSON.FeatureCollection<GeoJSON.MultiLineString>
  LineString: GeoJSON.FeatureCollection<GeoJSON.LineString>
  MultiPoint: GeoJSON.FeatureCollection<GeoJSON.MultiPoint>
  Point: GeoJSON.FeatureCollection<GeoJSON.Point>
  GeometryCollection: GeoJSON.FeatureCollection<GeoJSON.GeometryCollection>
}>
export function separateGeojson(
  geojson: GeoJSON.FeatureCollection | GeoJSON.Feature,
): separateRet {
  const ret: separateRet = {}
  if (geojson.type === 'FeatureCollection') {
    const { features, ...otherParams } = geojson
    function getCollection<T extends keyof typeof ret>(
      key: T,
    ): Required<separateRet>[T] {
      if (!ret[key]) {
        const collection = createFeatureCollection()
        Object.assign(collection, otherParams)
        // @ts-ignore
        ret[key] = collection
      }
      return ret[key]!
    }
    geojson.features.forEach((feature) => {
      switch (feature.geometry.type) {
        case 'MultiPolygon':
          getCollection('MultiPolygon').features.push(
            feature as GeoJSON.Feature<GeoJSON.MultiPolygon>,
          )
          break
        case 'Polygon':
          getCollection('Polygon').features.push(
            feature as GeoJSON.Feature<GeoJSON.Polygon>,
          )
          break
        case 'MultiLineString':
          getCollection('MultiLineString').features.push(
            feature as GeoJSON.Feature<GeoJSON.MultiLineString>,
          )
          break
        case 'LineString':
          getCollection('LineString').features.push(
            feature as GeoJSON.Feature<GeoJSON.LineString>,
          )
          break
        case 'MultiPoint':
          getCollection('MultiPoint').features.push(
            feature as GeoJSON.Feature<GeoJSON.MultiPoint>,
          )
          break
        case 'Point':
          getCollection('Point').features.push(
            feature as GeoJSON.Feature<GeoJSON.Point>,
          )
          break
        case 'GeometryCollection':
          getCollection('GeometryCollection').features.push(
            feature as GeoJSON.Feature<GeoJSON.GeometryCollection>,
          )
          break
        default:
          break
      }
    })
  } else if (geojson.type === 'Feature') {
    const collection = createFeatureCollection()
    switch (geojson.geometry.type) {
      case 'MultiPolygon':
        collection.features.push(geojson)
        ret.MultiPolygon =
          collection as GeoJSON.FeatureCollection<GeoJSON.MultiPolygon>
        break
      case 'Polygon':
        collection.features.push(geojson)
        ret.Polygon = collection as GeoJSON.FeatureCollection<GeoJSON.Polygon>
        break
      case 'MultiLineString':
        collection.features.push(geojson)
        ret.MultiLineString =
          collection as GeoJSON.FeatureCollection<GeoJSON.MultiLineString>
        break
      case 'LineString':
        collection.features.push(geojson)
        ret.LineString =
          collection as GeoJSON.FeatureCollection<GeoJSON.LineString>
        break
      case 'MultiPoint':
        collection.features.push(geojson)
        ret.MultiPoint =
          collection as GeoJSON.FeatureCollection<GeoJSON.MultiPoint>
        break
      case 'Point':
        collection.features.push(geojson)
        ret.Point = collection as GeoJSON.FeatureCollection<GeoJSON.Point>
        break
      case 'GeometryCollection':
        collection.features.push(geojson)
        ret.GeometryCollection =
          collection as GeoJSON.FeatureCollection<GeoJSON.GeometryCollection>
        break
      default:
        break
    }
  }
  return ret
}
function createFeatureCollection<
  T extends GeoJSON.Geometry | null = GeoJSON.Geometry,
>(): GeoJSON.FeatureCollection<T> {
  return {
    type: 'FeatureCollection',
    features: [],
  }
}

/**geojson转坐标系 */
export function geojsonTranslate(
  geometry: GeoJSON.Geometry,
  transFn: (input: { lat: number; lng: number }) => {
    lat: number
    lng: number
  },
) {
  const iterator = eachPosition(geometry)
  for (const el of iterator) {
    const { lat, lng } = transFn({ lng: el[0], lat: el[1] })
    el[0] = lng
    el[1] = lat
  }
}
/**遍历geojson中的Position对象 */
export function* eachPosition(
  geometry: GeoJSON.Geometry,
): Generator<GeoJSON.Position, void, unknown> {
  let iterator: Generator<GeoJSON.Position, void, unknown>
  switch (geometry.type) {
    case 'Polygon':
      iterator = (function* () {
        for (let i = 0; i < geometry.coordinates.length; i++) {
          const element = geometry.coordinates[i]
          for (let j = 0; j < element.length; j++) {
            yield element[j]
          }
        }
      })()
      break
    case 'LineString':
      iterator = (function* () {
        for (let i = 0; i < geometry.coordinates.length; i++) {
          yield geometry.coordinates[i]
        }
      })()
      break
    case 'Point':
      iterator = (function* () {
        yield geometry.coordinates
      })()
      break
    case 'MultiPolygon':
      iterator = (function* () {
        for (let i = 0; i < geometry.coordinates.length; i++) {
          const element = geometry.coordinates[i]
          for (let j = 0; j < element.length; j++) {
            const el = element[j]
            for (let k = 0; k < el.length; k++) {
              yield el[k]
            }
          }
        }
      })()
      break
    case 'MultiLineString':
      iterator = (function* () {
        for (let i = 0; i < geometry.coordinates.length; i++) {
          const element = geometry.coordinates[i]
          for (let j = 0; j < element.length; j++) {
            yield element[j]
          }
        }
      })()
      break
    case 'MultiPoint':
      iterator = (function* () {
        for (let i = 0; i < geometry.coordinates.length; i++) {
          yield geometry.coordinates[i]
        }
      })()
      break
    case 'GeometryCollection':
      iterator = (function* () {
        for (let i = 0; i < geometry.geometries.length; i++) {
          const geom = geometry.geometries[i]
          const iter = eachPosition(geom)
          for (const el of iter) {
            yield el
          }
        }
      })()
      break
    default:
      throw new TypeError('未知的geojson类型')
  }
  for (const el of iterator) {
    yield el
  }
}
/**修改multi类型的feature到single，会改变原对象 */
export function multi2Single(
  feature: GeoJSON.MultiLineString,
): GeoJSON.LineString
export function multi2Single(feature: GeoJSON.MultiPoint): GeoJSON.Point
export function multi2Single(feature: GeoJSON.MultiPolygon): GeoJSON.Polygon
export function multi2Single<T extends GeoJSON.Geometry>(feature: T): T {
  switch (feature.type) {
    case 'MultiLineString':
      ;(feature as unknown as GeoJSON.LineString).type = 'LineString'
      ;(feature as unknown as GeoJSON.LineString).coordinates =
        feature.coordinates[0]
      break
    case 'MultiPoint':
      ;(feature as unknown as GeoJSON.Point).type = 'Point'
      ;(feature as unknown as GeoJSON.Point).coordinates =
        feature.coordinates[0]
      break
    case 'MultiPolygon':
      ;(feature as unknown as GeoJSON.Polygon).type = 'Polygon'
      ;(feature as unknown as GeoJSON.Polygon).coordinates =
        feature.coordinates[0]
      break
    default:
      return feature
  }
  return feature
}
