package estrella.app.shop;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // This handles the back gesture to show a confirmation dialog before exiting the app.
    OnBackPressedCallback callback = new OnBackPressedCallback(true /* enabled by default */) {
        @Override
        public void handleOnBackPressed() {
            // First, check if the web view can go back.
            if (bridge.getWebView().canGoBack()) {
                bridge.getWebView().goBack();
            } else {
                // If not, show the exit confirmation dialog.
                new AlertDialog.Builder(MainActivity.this, R.style.CustomAlertDialog)
                    .setTitle("Confirmar Salida")
                    .setMessage("¿Estás seguro de que deseas salir de la aplicación?")
                    .setPositiveButton("Salir", (dialog, which) -> finish()) // Exit the app
                    .setNegativeButton("Cancelar", null) // Do nothing
                    .show();
            }
        }
    };
    getOnBackPressedDispatcher().addCallback(this, callback);
  }

}
