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
// import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends BridgeActivity {

  private static final String TAG = "MainActivity";

  /*
  // Declare the launcher for the notification permission request.
  private final ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
      new ActivityResultContracts.RequestPermission(),
      isGranted -> {
        if (isGranted) {
          // Permission is granted. You can retrieve the token now.
          getFCMToken();
        } else {
          // Explain to the user that notifications are important for the app.
          Log.w(TAG, "Notification permission not granted.");
        }
      }
  );
  */

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

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

    // Ask for notification permission
    // askNotificationPermission();
  }

  /*
  private void askNotificationPermission() {
    // This is only required for API level 33 (TIRAMISU) and above.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
        // Permission is already granted.
        getFCMToken();
      } else {
        // Directly ask for the permission.
        requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS);
      }
    }
  }

  private void getFCMToken() {
    FirebaseMessaging.getInstance().getToken()
        .addOnCompleteListener(task -> {
          if (!task.isSuccessful()) {
            Log.w(TAG, "Fetching FCM registration token failed", task.getException());
            return;
          }
          // Get new FCM registration token
          String token = task.getResult();
          Log.d(TAG, "FCM Token: " + token);
          // TODO: Send this token to your Supabase backend and associate it with the current user.
          sendTokenToSupabase(token);
        });
  }

  private void sendTokenToSupabase(String token) {
    // Here you would implement the logic to send the token to your Supabase database.
    // For example, using an HTTP client or a Supabase function call.
    Log.d(TAG, "(Placeholder) Sending token to server: " + token);
  }
  */
}
