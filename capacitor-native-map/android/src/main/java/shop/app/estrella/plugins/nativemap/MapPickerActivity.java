package shop.app.estrella.plugins.nativemap;

import android.animation.ObjectAnimator;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.text.Html;
import android.text.Spanned;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.MapStyleOptions;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MapPickerActivity extends AppCompatActivity implements OnMapReadyCallback {

    private static final String TAG = "MapPickerActivity";
    private GoogleMap mMap;
    private TextView addressText;
    private ImageView centerPin;
    private RequestQueue requestQueue;
    private String apiKey;

    private String fullAddress = "";
    private LatLng origin, destination;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        setContentView(R.layout.activity_map_picker);

        // Initialize Volley RequestQueue
        requestQueue = Volley.newRequestQueue(this);

        // Get API Key from Manifest
        try {
            ApplicationInfo app = getApplicationContext().getPackageManager().getApplicationInfo(getApplicationContext().getPackageName(), PackageManager.GET_META_DATA);
            Bundle bundle = app.metaData;
            apiKey = bundle.getString("com.google.android.geo.API_KEY");
        } catch (PackageManager.NameNotFoundException e) {
            Log.e(TAG, "Failed to load meta-data, NameNotFound: " + e.getMessage());
        } catch (NullPointerException e) {
            Log.e(TAG, "Failed to load meta-data, NullPointer: " + e.getMessage());
        }

        Intent intent = getIntent();
        origin = intent.getParcelableExtra("origin");
        destination = intent.getParcelableExtra("destination");

        Window window = getWindow();
        window.setStatusBarColor(Color.WHITE);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(true);
        }

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
        }

        addressText = findViewById(R.id.address_text);
        centerPin = findViewById(R.id.center_pin);

        SupportMapFragment mapFragment = SupportMapFragment.newInstance();
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.map_picker_container, mapFragment)
                .commit();
        mapFragment.getMapAsync(this);

        FloatingActionButton btnConfirm = findViewById(R.id.fab_confirm_location);
        btnConfirm.setEnabled(false); // Disable initially

        if (origin != null || destination != null) {
            btnConfirm.setVisibility(View.GONE);
            centerPin.setVisibility(View.GONE);
            addressText.setVisibility(View.GONE);
        } else {
            btnConfirm.setOnClickListener(view -> confirmLocation());
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        try {
            googleMap.setMapStyle(
                MapStyleOptions.loadRawResourceStyle(this, R.raw.map_style));
        } catch (Resources.NotFoundException e) {
            Log.e(TAG, "Can't find style. Error: ", e);
        }

        if (origin != null && destination != null) {
            // Display mode (pins only)
            displayPointsAndFocusCamera();
        } else {
            // Picker mode
            setupPickerMode();
        }
    }

    private void displayPointsAndFocusCamera() {
        mMap.addMarker(new MarkerOptions().position(origin).title("Origin"));
        mMap.addMarker(new MarkerOptions().position(destination).title("Destination"));

        LatLngBounds.Builder builder = new LatLngBounds.Builder();
        builder.include(origin);
        builder.include(destination);
        LatLngBounds bounds = builder.build();

        int padding = 150; // offset from edges of the map in pixels
        mMap.animateCamera(CameraUpdateFactory.newLatLngBounds(bounds, padding));
    }

    private void setupPickerMode() {
        double initialLat = getIntent().getDoubleExtra("initial_latitude", 16.2519);
        double initialLng = getIntent().getDoubleExtra("initial_longitude", -92.1383);
        LatLng initialPosition = new LatLng(initialLat, initialLng);
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(initialPosition, 16f));

        mMap.setOnCameraMoveStartedListener(reason -> {
            if (reason == GoogleMap.OnCameraMoveStartedListener.REASON_GESTURE) {
                animatePin(true);
                addressText.setVisibility(View.VISIBLE);
                setAddressText("Moviendo mapa...");
            }
        });

        mMap.setOnCameraIdleListener(() -> {
            animatePin(false);
            LatLng center = mMap.getCameraPosition().target;
            updateLocation(center);
        });
    }

    private void animatePin(boolean moving) {
        float translationY = moving ? -40f : 0f;
        ObjectAnimator animator = ObjectAnimator.ofFloat(centerPin, "translationY", translationY);
        animator.setDuration(200);
        animator.start();
    }

    private void updateLocation(LatLng latLng) {
        reverseGeocodeWithGoogleApi(latLng);
    }
    
    private void reverseGeocodeWithGoogleApi(LatLng latLng) {
        String url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="
                + latLng.latitude + "," + latLng.longitude
                + "&key=" + apiKey;

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                response -> {
                    FloatingActionButton btnConfirm = findViewById(R.id.fab_confirm_location);
                    try {
                        JSONArray results = response.getJSONArray("results");
                        if (results.length() > 0) {
                            JSONObject firstResult = results.getJSONObject(0);
                            fullAddress = firstResult.getString("formatted_address");
                            runOnUiThread(() -> {
                                setAddressText(fullAddress);
                                btnConfirm.setEnabled(true);
                            });
                        } else {
                            fullAddress = "Dirección no encontrada";
                            runOnUiThread(() -> {
                                setAddressText(fullAddress);
                                btnConfirm.setEnabled(false);
                            });
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "JSON parsing error", e);
                        fullAddress = "Error al procesar dirección";
                        runOnUiThread(() -> {
                            setAddressText(fullAddress);
                            btnConfirm.setEnabled(false);
                        });
                    }
                },
                error -> {
                    FloatingActionButton btnConfirm = findViewById(R.id.fab_confirm_location);
                    Log.e(TAG, "Volley error", error);
                    fullAddress = "Error de red al obtener dirección";
                    runOnUiThread(() -> {
                        setAddressText(fullAddress);
                        btnConfirm.setEnabled(false);
                    });
                }
        );

        requestQueue.add(jsonObjectRequest);
    }

    private void setAddressText(String address) {
        String formattedText = "<font color='#AAAAAA'>Punto de entrega</font><br/><b>" + address + "</b>";
        addressText.setText(fromHtml(formattedText));
    }

    @SuppressWarnings("deprecation")
    private Spanned fromHtml(String html){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return Html.fromHtml(html, Html.FROM_HTML_MODE_LEGACY);
        } else {
            return Html.fromHtml(html);
        }
    }

    private void confirmLocation() {
        LatLng center = mMap.getCameraPosition().target;
        Intent resultIntent = new Intent();
        resultIntent.putExtra("latitude", center.latitude);
        resultIntent.putExtra("longitude", center.longitude);
        resultIntent.putExtra("address", fullAddress);
        setResult(Activity.RESULT_OK, resultIntent);
        finish();
    }
}
