package shop.app.estrella.plugins.nativemap;

import android.app.Activity;
import android.content.Intent;
import android.location.Address;
import android.location.Geocoder;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

public class MapPickerActivity extends AppCompatActivity implements OnMapReadyCallback, GoogleMap.OnMarkerDragListener {

    private static final String TAG = "MapPickerActivity";
    private GoogleMap mMap;
    private Geocoder geocoder;

    private double selectedLatitude;
    private double selectedLongitude;
    private String selectedAddress = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // The layout file that we created earlier
        setContentView(R.layout.activity_map_picker);

        // Initialize the Geocoder
        geocoder = new Geocoder(this, Locale.getDefault());

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }

        // Setup the confirm button
        FloatingActionButton fab = findViewById(R.id.fab_confirm_location);
        fab.setOnClickListener(view -> confirmLocation());
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        Log.d("MI_MAPA_DEBUG", "¡¡¡ onMapReady FUE LLAMADO !!!");
        mMap = googleMap;
        mMap.setOnMarkerDragListener(this);

        // Get initial position from the intent, or use a default
        double initialLat = getIntent().getDoubleExtra("initial_latitude", 16.2519); // Default to Comitán
        double initialLng = getIntent().getDoubleExtra("initial_longitude", -92.1383);
        LatLng initialPosition = new LatLng(initialLat, initialLng);

        // Add a draggable marker at the initial position
        mMap.addMarker(new MarkerOptions()
                .position(initialPosition)
                .title("Ubicación Seleccionada")
                .draggable(true));

        // Move camera to the initial position
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(initialPosition, 16f));

        // Perform an initial geocoding
        updateLocation(initialPosition);
    }

    private void updateLocation(LatLng latLng) {
        this.selectedLatitude = latLng.latitude;
        this.selectedLongitude = latLng.longitude;

        // Run geocoding in a background thread to avoid blocking the UI
        new Thread(() -> {
            try {
                List<Address> addresses = geocoder.getFromLocation(latLng.latitude, latLng.longitude, 1);
                if (addresses != null && !addresses.isEmpty()) {
                    Address address = addresses.get(0);
                    // Construct a readable address string
                    selectedAddress = address.getAddressLine(0);

                    // Update UI on the main thread
                    runOnUiThread(() -> Toast.makeText(MapPickerActivity.this, selectedAddress, Toast.LENGTH_SHORT).show());
                } else {
                    selectedAddress = "Dirección no encontrada";
                }
            } catch (IOException e) {
                Log.e(TAG, "Geocoding failed", e);
                selectedAddress = "Error al obtener dirección";
            }
        }).start();
    }

    private void confirmLocation() {
        Intent resultIntent = new Intent();
        resultIntent.putExtra("latitude", selectedLatitude);
        resultIntent.putExtra("longitude", selectedLongitude);
        resultIntent.putExtra("address", selectedAddress);
        setResult(Activity.RESULT_OK, resultIntent);
        finish(); // Close this activity and return to the app
    }

    // --- OnMarkerDragListener Methods ---
    @Override
    public void onMarkerDragStart(Marker marker) {
        // Method not used
    }

    @Override
    public void onMarkerDrag(Marker marker) {
        // Method not used
    }

    @Override
    public void onMarkerDragEnd(Marker marker) {
        updateLocation(marker.getPosition());
    }
}
