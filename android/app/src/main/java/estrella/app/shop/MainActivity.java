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
    // Register the custom plugin BEFORE calling super.onCreate
    registerPlugin(NativeMapPlugin.class);
    
    super.onCreate(savedInstanceState);

    // --- NOTIFICATION CHANNEL SETUP ---
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // Create the NotificationChannel
        String channelId = "custom_sound_channel";
        CharSequence name = "Notificaciones con Sonido";
        String description = "Canal para notificaciones importantes con sonido personalizado";
        int importance = android.app.NotificationManager.IMPORTANCE_HIGH;
        android.app.NotificationChannel channel = new android.app.NotificationChannel(channelId, name, importance);
        channel.setDescription(description);

        // Configure Audio Attributes
        android.media.AudioAttributes audioAttributes = new android.media.AudioAttributes.Builder()
            .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
            .build();

        // Set Custom Sound
        android.net.Uri soundUri = android.net.Uri.parse(android.content.ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/notification_sound");
        channel.setSound(soundUri, audioAttributes);

        // Register the channel with the system
        android.app.NotificationManager notificationManager = getSystemService(android.app.NotificationManager.class);
        notificationManager.createNotificationChannel(channel);
    }
    // ----------------------------------

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
