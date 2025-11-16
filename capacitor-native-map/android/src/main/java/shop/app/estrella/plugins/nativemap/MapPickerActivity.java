package shop.app.estrella.plugins.nativemap;

import android.animation.ObjectAnimator;
import android.app.Activity;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Color;
import android.location.Address;
import android.location.Geocoder;
import android.os.Build;
import android.os.Bundle;
import android.text.Html;
import android.text.Spanned;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MapStyleOptions;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

public class MapPickerActivity extends AppCompatActivity implements OnMapReadyCallback {

    private static final String TAG = "MapPickerActivity";
    private GoogleMap mMap;
    private Geocoder geocoder;
    private TextView addressText;
    private ImageView centerPin;

    private String fullAddress = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Let the system handle the window insets
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        setContentView(R.layout.activity_map_picker);

        Window window = getWindow();
        window.setStatusBarColor(Color.WHITE);

        // Ensure status bar icons are always dark (for the white background)
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
        geocoder = new Geocoder(this, Locale.getDefault());

        SupportMapFragment mapFragment = SupportMapFragment.newInstance();
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.map_picker_container, mapFragment)
                .commit();
        mapFragment.getMapAsync(this);

        FloatingActionButton btnConfirm = findViewById(R.id.fab_confirm_location);
        btnConfirm.setOnClickListener(view -> confirmLocation());
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle arrow click here
        if (item.getItemId() == android.R.id.home) {
            finish(); // close this activity and return to preview activity (if there is any)
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        try {
            boolean success = googleMap.setMapStyle(
                MapStyleOptions.loadRawResourceStyle(this, R.raw.map_style));
            if (!success) {
                Log.e(TAG, "Style parsing failed.");
            }
        } catch (Resources.NotFoundException e) {
            Log.e(TAG, "Can't find style. Error: ", e);
        }

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
        new Thread(() -> {
            try {
                List<Address> addresses = geocoder.getFromLocation(latLng.latitude, latLng.longitude, 1);
                if (addresses != null && !addresses.isEmpty()) {
                    Address address = addresses.get(0);
                    fullAddress = address.getAddressLine(0);
                    String street = address.getThoroughfare() != null ? address.getThoroughfare() : "";
                    String number = address.getSubThoroughfare() != null ? address.getSubThoroughfare() : "";
                    final String displayAddress = street + " " + number;
                    runOnUiThread(() -> setAddressText(displayAddress.trim()));
                } else {
                    fullAddress = "Dirección no encontrada";
                    runOnUiThread(() -> setAddressText(fullAddress));
                }
            } catch (IOException e) {
                Log.e(TAG, "Geocoding failed", e);
                fullAddress = "Error al obtener dirección";
                runOnUiThread(() -> setAddressText(fullAddress));
            }
        }).start();
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
