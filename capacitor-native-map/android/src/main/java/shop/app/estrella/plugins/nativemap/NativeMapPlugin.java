package shop.app.estrella.plugins.nativemap;

import android.content.Intent;
import android.util.Log;

import androidx.activity.result.ActivityResult;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "NativeMap")
public class NativeMapPlugin extends Plugin {

    private String mapboxAccessToken;

    @Override
    public void load() {
        super.load();
        try {
            // Intentar leer el token de strings.xml
            int resourceId = getContext().getResources().getIdentifier("mapbox_access_token", "string", getContext().getPackageName());
            if (resourceId != 0) {
                mapboxAccessToken = getContext().getString(resourceId);
            } else {
                // Fallback hardcoded si no se encuentra el recurso
                mapboxAccessToken = "pk.eyJ1IjoiZGVpZmYiLCJhIjoiY21pODc2ZGcwMDh2bTJscHpucWc1MDIybSJ9.rTZ1DZKFsbw-IH-t-wDlCA";
            }
        } catch (Exception e) {
            Log.e("NativeMapPlugin", "Error loading Mapbox token: " + e.getMessage());
            mapboxAccessToken = "pk.eyJ1IjoiZGVpZmYiLCJhIjoiY21pODc2ZGcwMDh2bTJscHpucWc1MDIybSJ9.rTZ1DZKFsbw-IH-t-wDlCA";
        }
    }

    @PluginMethod
    public void pickLocation(PluginCall call) {
        Intent intent = new Intent(getContext(), MapPickerActivity.class);
        JSObject initialPosition = call.getObject("initialPosition");
        if (initialPosition != null) {
            try {
                double lat = getLatitude(initialPosition);
                double lng = getLongitude(initialPosition);
                intent.putExtra("initial_latitude", lat);
                intent.putExtra("initial_longitude", lng);
            } catch (JSONException e) {
                call.reject("Invalid initialPosition format.", e);
                return;
            }
        }
        startActivityForResult(call, intent, "pickLocationResult");
    }

    @ActivityCallback
    private void pickLocationResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }
        if (result.getResultCode() == android.app.Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data != null) {
                double latitude = data.getDoubleExtra("latitude", 0);
                double longitude = data.getDoubleExtra("longitude", 0);
                String address = data.getStringExtra("address");

                JSObject resultData = new JSObject();
                resultData.put("latitude", latitude);
                resultData.put("longitude", longitude);
                resultData.put("address", address);

                call.resolve(resultData);
            } else {
                call.reject("Activity returned OK but no data was provided.");
            }
        } else {
            call.reject("pickLocation canceled.");
        }
    }

    @PluginMethod
    public void calculateRoute(PluginCall call) {
        JSObject origin = call.getObject("origin");
        JSObject destination = call.getObject("destination");

        if (origin == null || destination == null) {
            call.reject("Origin and destination are required.");
            return;
        }

        try {
            double originLat = getLatitude(origin);
            double originLng = getLongitude(origin);
            double destLat = getLatitude(destination);
            double destLng = getLongitude(destination);

            // Mapbox Directions API
            // Format: https://api.mapbox.com/directions/v5/mapbox/driving/{coordinates}
            // coordinates: {longitude},{latitude};{longitude},{latitude}
            String coordinates = originLng + "," + originLat + ";" + destLng + "," + destLat;
            String url = "https://api.mapbox.com/directions/v5/mapbox/driving/" + coordinates
                    + "?geometries=geojson&overview=full&access_token=" + mapboxAccessToken;

            RequestQueue requestQueue = Volley.newRequestQueue(getContext());

            JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                    response -> {
                        try {
                            JSONArray routes = response.getJSONArray("routes");
                            if (routes.length() > 0) {
                                JSONObject route = routes.getJSONObject(0);
                                
                                // Mapbox devuelve la distancia en metros
                                double distanceInMeters = route.getDouble("distance");
                                
                                // Geometría de la ruta (GeoJSON)
                                JSONObject geometry = route.getJSONObject("geometry");

                                JSObject result = new JSObject();
                                result.put("distance", distanceInMeters / 1000.0); // Convertir a km
                                result.put("geometry", geometry);
                                call.resolve(result);
                            } else {
                                call.reject("No routes found.");
                            }
                        } catch (JSONException e) {
                            call.reject("Error parsing Mapbox response.", e);
                        }
                    },
                    error -> {
                        call.reject("Error fetching directions from Mapbox.", error);
                    }
            );

            requestQueue.add(jsonObjectRequest);

        } catch (JSONException e) {
            call.reject("Invalid origin/destination format.", e);
        }
    }

    @PluginMethod
    public void showRouteOnMap(PluginCall call) {
        // Dummy implementation for now - Mapbox implementation pending if needed
        // Normally this would open another native activity to show navigation
        call.resolve();
    }

    private double getLatitude(JSObject obj) throws JSONException {
        if (obj.has("latitude")) {
            return obj.getDouble("latitude");
        } else if (obj.has("lat")) {
            return obj.getDouble("lat");
        }
        throw new JSONException("JSObject does not contain a latitude or lat value.");
    }

    private double getLongitude(JSObject obj) throws JSONException {
        if (obj.has("longitude")) {
            return obj.getDouble("longitude");
        } else if (obj.has("lng")) {
            return obj.getDouble("lng");
        }
        throw new JSONException("JSObject does not contain a longitude or lng value.");
    }
}
