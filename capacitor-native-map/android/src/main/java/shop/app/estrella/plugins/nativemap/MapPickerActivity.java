package shop.app.estrella.plugins.nativemap;

import android.animation.ObjectAnimator;
import android.app.Activity;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.text.Html;
import android.text.Spanned;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.mapbox.geojson.Point;
import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.MapView;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.Style;
import com.mapbox.maps.plugin.animation.CameraAnimationsUtils;
import com.mapbox.maps.plugin.gestures.GesturesUtils;
import com.mapbox.maps.plugin.gestures.OnMoveListener;
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin;
import com.mapbox.maps.plugin.locationcomponent.LocationComponentUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MapPickerActivity extends AppCompatActivity {

    private static final String TAG = "MapPickerActivity";
    private MapView mapView;
    private MapboxMap mapboxMap;
    private TextView addressText;
    private ImageView centerPin;
    private RequestQueue requestQueue;
    // Token público de Mapbox (debería venir de strings.xml o gradle, pero lo pondremos aquí por simplicidad o leeremos de recursos)
    private String mapboxAccessToken;

    private String fullAddress = "";
    private Point initialPosition;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Obtener token de recursos (asegúrate de que esté en strings.xml de la app principal)
        try {
            mapboxAccessToken = getString(getResources().getIdentifier("mapbox_access_token", "string", getPackageName()));
        } catch (Exception e) {
            // Fallback si no se encuentra, usando el token que nos diste
            mapboxAccessToken = "pk.eyJ1IjoiZGVpZmYiLCJhIjoiY21pODc2ZGcwMDh2bTJscHpucWc1MDIybSJ9.rTZ1DZKFsbw-IH-t-wDlCA";
        }

        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        setContentView(R.layout.activity_map_picker);

        requestQueue = Volley.newRequestQueue(this);

        // Obtener posición inicial del Intent
        double lat = getIntent().getDoubleExtra("initial_latitude", 16.2519);
        double lng = getIntent().getDoubleExtra("initial_longitude", -92.1383);
        initialPosition = Point.fromLngLat(lng, lat);

        // Configurar Toolbar y UI
        setupUI();

        // Inicializar Mapbox MapView programáticamente
        FrameLayout container = findViewById(R.id.map_picker_container);
        mapView = new MapView(this);
        container.addView(mapView);
        
        mapboxMap = mapView.getMapboxMap();
        
        // Cargar estilo
        mapboxMap.loadStyleUri(Style.MAPBOX_STREETS, style -> {
            // Configurar cámara inicial
            CameraOptions initialCameraOptions = new CameraOptions.Builder()
                    .center(initialPosition)
                    .zoom(15.0)
                    .build();
            mapboxMap.setCamera(initialCameraOptions);

            // Activar Pulsing Puck (Ubicación del usuario)
            LocationComponentPlugin locationComponent = LocationComponentUtils.getLocationComponent(mapView);
            locationComponent.setEnabled(true);
            locationComponent.setPulsingEnabled(true);
            locationComponent.setPulsingColor(Color.parseColor("#4A90E2"));
            locationComponent.setPulsingMaxRadius(20.0f);
            
            // Configurar listeners de movimiento
            setupGestures();
        });

        addressText = findViewById(R.id.address_text);
        centerPin = findViewById(R.id.center_pin);
        FloatingActionButton btnConfirm = findViewById(R.id.fab_confirm_location);
        
        // Estilo del botón
        btnConfirm.setBackgroundTintList(ColorStateList.valueOf(Color.parseColor("#2E3192")));
        btnConfirm.setOnClickListener(view -> confirmLocation());
        
        // Back gesture
        OnBackPressedCallback callback = new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                new AlertDialog.Builder(MapPickerActivity.this) // Usar tema por defecto
                    .setTitle("Confirmar Salida")
                    .setMessage("¿Estás seguro de que deseas salir del mapa?")
                    .setPositiveButton("Salir", (dialog, which) -> finish())
                    .setNegativeButton("Cancelar", null)
                    .show();
            }
        };
        getOnBackPressedDispatcher().addCallback(this, callback);
    }

    private void setupUI() {
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
    }

    private void setupGestures() {
        GesturesUtils.getGestures(mapView).addOnMoveListener(new OnMoveListener() {
            @Override
            public void onMoveBegin(@NonNull com.mapbox.android.gestures.MoveGestureDetector detector) {
                animatePin(true);
                addressText.setVisibility(View.VISIBLE);
                setAddressText("Moviendo mapa...");
                findViewById(R.id.fab_confirm_location).setEnabled(false);
            }

            @Override
            public boolean onMove(@NonNull com.mapbox.android.gestures.MoveGestureDetector detector) {
                return false;
            }

            @Override
            public void onMoveEnd(@NonNull com.mapbox.android.gestures.MoveGestureDetector detector) {
                animatePin(false);
                Point center = mapboxMap.getCameraState().getCenter();
                updateLocation(center);
            }
        });
    }

    private void animatePin(boolean moving) {
        float translationY = moving ? -40f : 0f;
        ObjectAnimator animator = ObjectAnimator.ofFloat(centerPin, "translationY", translationY);
        animator.setDuration(200);
        animator.start();
    }

    private void updateLocation(Point center) {
        reverseGeocodeWithMapbox(center);
    }
    
    private void reverseGeocodeWithMapbox(Point point) {
        // Usar API de Mapbox para geocodificación inversa
        String url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                + point.longitude() + "," + point.latitude()
                + ".json?access_token=" + mapboxAccessToken; // Usar token de instancia

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                response -> {
                    FloatingActionButton btnConfirm = findViewById(R.id.fab_confirm_location);
                    try {
                        JSONArray features = response.getJSONArray("features");
                        if (features.length() > 0) {
                            JSONObject firstFeature = features.getJSONObject(0);
                            fullAddress = firstFeature.getString("place_name");
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
                        runOnUiThread(() -> setAddressText(fullAddress));
                    }
                },
                error -> {
                    Log.e(TAG, "Volley error", error);
                    fullAddress = "Error de red";
                    runOnUiThread(() -> setAddressText(fullAddress));
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
        Point center = mapboxMap.getCameraState().getCenter();
        Intent resultIntent = new Intent();
        resultIntent.putExtra("latitude", center.latitude());
        resultIntent.putExtra("longitude", center.longitude());
        resultIntent.putExtra("address", fullAddress);
        setResult(Activity.RESULT_OK, resultIntent);
        finish();
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
    protected void onStart() {
        super.onStart();
        mapView.onStart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        mapView.onStop();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mapView.onDestroy();
    }
}
