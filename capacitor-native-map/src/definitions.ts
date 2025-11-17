export interface MapPoint {
  latitude: number;
  longitude: number;
}

export interface PickLocationOptions {
  /**
   * Optional. The initial position to center the map on.
   */
  initialPosition?: MapPoint;
}

export interface PickLocationResult {
  /**
   * The latitude of the selected location.
   */
  latitude: number;
  /**
   * The longitude of the selected location.
   */
  longitude: number;
  /**
   * The formatted address of the selected location.
   */
  address: string;
}

export interface NativeMap {
  /**
   * Opens a native map screen to let the user pick a location.
   *
   * @since 1.0.0
   */
  pickLocation(options?: PickLocationOptions): Promise<PickLocationResult>;

  /**
   * Calculates a route between two points and returns distance and polyline.
   *
   * @since 1.1.0
   */
  calculateRoute(options: {
    origin: MapPoint;
    destination: MapPoint;
  }): Promise<{ distance: number; polyline: string }>;

  /**
   * Opens the native map and draws the specified route.
   *
   * @since 1.1.0
   */
  showRouteOnMap(options: {
    origin: MapPoint;
    destination: MapPoint;
    polyline: string;
  }): Promise<void>;
}
