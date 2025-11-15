package shop.app.estrella.plugins.nativemap;

import com.getcapacitor.Logger;

public class NativeMap {

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }
}
