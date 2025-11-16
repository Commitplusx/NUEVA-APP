package estrella.app.shop;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  private static final String TAG = "MainActivity";

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onResume() {
    super.onResume();
    // Post the action to the decor view's message queue to ensure it runs after
    // Capacitor's own status bar handling, providing a reliable override.
    getWindow().getDecorView().post(() -> {
      Log.d(TAG, "Executing delayed window configuration.");

      // Check the value before we change it
      boolean before = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView()) != null ?
              getWindow().getDecorView().getFitsSystemWindows() : false;
      Log.d(TAG, "fitsSystemWindows BEFORE change: " + before);

      // This is the command that forces the WebView to respect the status bar space.
      WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

      // Check the value AFTER we change it
      boolean after = getWindow().getDecorView().getFitsSystemWindows();
      Log.d(TAG, "fitsSystemWindows AFTER change: " + after);

      // Set a consistent style for the status bar
      Window window = getWindow();
      window.setStatusBarColor(Color.WHITE);
      WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, getWindow().getDecorView());
      if (controller != null) {
        controller.setAppearanceLightStatusBars(true);
        Log.d(TAG, "Status bar style set to light.");
      }
    });
  }
}
