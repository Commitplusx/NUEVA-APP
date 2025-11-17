package shop.app.estrella.plugins.nativemap;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
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

    private String apiKey;

    @Override
    public void load() {
        super.load();
        try {
            ApplicationInfo app = getContext().getApplicationContext().getPackageManager().getApplicationInfo(getContext().getPackageName(), PackageManager.GET_META_DATA);
            Bundle bundle = app.metaData;
            apiKey = bundle.getString("com.google.android.geo.API_KEY");
        } catch (PackageManager.NameNotFoundException e) {
            Log.e("NativeMapPlugin", "Failed to load meta-data, NameNotFound: " + e.getMessage());
        } catch (NullPointerException e) {
            Log.e("NativeMapPlugin", "Failed to load meta-data, NullPointer: " + e.getMessage());
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
        if (result.getResultCode() == Activity.RESULT_OK) {
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
            call.reject("Action canceled by user.");
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

            String url = "https://maps.googleapis.com/maps/api/directions/json?origin="
                    + originLat + "," + originLng
                    + "&destination=" + destLat + "," + destLng
                    + "&key=" + apiKey;

            RequestQueue requestQueue = Volley.newRequestQueue(getContext());

            JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                    response -> {
                        try {
                            JSONArray routes = response.getJSONArray("routes");
                            if (routes.length() > 0) {
                                JSONObject route = routes.getJSONObject(0);
                                JSONArray legs = route.getJSONArray("legs");
                                if (legs.length() > 0) {
                                    JSONObject leg = legs.getJSONObject(0);
                                    JSONObject distanceObj = leg.getJSONObject("distance");
                                    int distanceInMeters = distanceObj.getInt("value");

                                    JSONObject overviewPolyline = route.getJSONObject("overview_polyline");
                                    String polyline = overviewPolyline.getString("points");

                                    JSObject result = new JSObject();
                                    result.put("distance", distanceInMeters / 1000.0); // Convert to km
                                    result.put("polyline", polyline);
                                    call.resolve(result);
                                } else {
                                    call.reject("No legs found in route.");
                                }
                            } else {
                                call.reject("No routes found.");
                            }
                        } catch (JSONException e) {
                            call.reject("Error parsing directions response.", e);
                        }
                    },
                    error -> {
                        call.reject("Error fetching directions.", error);
                    }
            );

            requestQueue.add(jsonObjectRequest);

        } catch (JSONException e) {
            call.reject("Invalid origin/destination format.", e);
        }
    }

    @PluginMethod
    public void showRouteOnMap(PluginCall call) {
        // Dummy implementation to prevent crashes
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
