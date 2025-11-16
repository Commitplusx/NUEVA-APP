package estrella.app.shop;

import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onResume() {
    super.onResume();
    // Apply the same settings as MapPickerActivity for a consistent look and feel

    // Let the system handle the window insets, so the app starts below the status bar
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

    // Set the status bar to be white with dark icons, matching the map plugin's style
    getWindow().setStatusBarColor(Color.WHITE);
    WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    if (controller != null) {
      controller.setAppearanceLightStatusBars(true);
    }
  }
}
