package shop.app.estrella.plugins.nativemap;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeMap")
public class NativeMapPlugin extends Plugin {

    @PluginMethod
    public void pickLocation(PluginCall call) {
        Intent intent = new Intent(getContext(), MapPickerActivity.class);

        JSObject initialPosition = call.getObject("initialPosition");
        if (initialPosition != null && initialPosition.has("latitude") && initialPosition.has("longitude")) {
            intent.putExtra("initial_latitude", initialPosition.getDouble("latitude"));
            intent.putExtra("initial_longitude", initialPosition.getDouble("longitude"));
        }

        startActivityForResult(call, intent, "pickLocationResult");
    }

    @ActivityCallback
    private void pickLocationResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        if (result.getResultCode() == Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data != null) {
                double latitude = data.getDoubleExtra("latitude", 0);
                double longitude = data.getDoubleExtra("longitude", 0);
                String address = data.getStringExtra("address");

                JSObject resultData = new JSObject();
                resultData.put("latitude", latitude);
                resultData.put("longitude", longitude);
                resultData.put("address", address);

                call.resolve(resultData);
            } else {
                call.reject("Activity returned OK but no data was provided.");
            }
        } else {
            call.reject("Action canceled by user.");
        }
    }
}
