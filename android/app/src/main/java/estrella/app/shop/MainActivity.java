package estrella.app.shop;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

// Import the plugin class
import shop.app.estrella.plugins.nativemap.NativeMapPlugin;

public class MainActivity extends BridgeActivity {

  private static final String TAG = "MainActivity";

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Register the custom plugin
    registerPlugin(NativeMapPlugin.class);

    // --- MAPBOX INITIALIZATION ---
    // For Mapbox SDK v10+, initialization is handled automatically
    // by providing your access token in strings.xml.
    // The previous `Mapbox.getInstance(this)` is no longer needed.
    // -----------------------------

    // Handle back button press
    OnBackPressedCallback callback = new OnBackPressedCallback(true) {
        @Override
        public void handleOnBackPressed() {
            if (bridge.getWebView().canGoBack()) {
                bridge.getWebView().goBack();
            } else {
                new AlertDialog.Builder(MainActivity.this, R.style.CustomAlertDialog)
                    .setTitle("Confirmar Salida")
                    .setMessage("¿Estás seguro de que deseas salir de la aplicación?")
                    .setPositiveButton("Salir", (dialog, which) -> finish())
                    .setNegativeButton("Cancelar", null)
                    .show();
            }
        }
    };
    getOnBackPressedDispatcher().addCallback(this, callback);

  }

}
