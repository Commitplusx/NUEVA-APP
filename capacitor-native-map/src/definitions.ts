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
}
