package __PACKAGE__;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Ключ расшифровки ассетов НЕ лежит в JS-бандле вообще.
 * Он зашит здесь, во фрагментах, собираемых и XOR-деобфусцируемых в нативном коде,
 * и отдаётся в JS только по запросу через Capacitor bridge (не кэшируется в JS-переменной
 * дольше, чем на время самой расшифровки).
 *
 * Чтобы достать ключ, атакующему мало прочитать обфусцированный JS — нужно ещё
 * декомпилировать/дизассемблировать этот класс (apktool/jadx) и собрать ключ из частей.
 * Это не "невзламываемо" (ничто не является), но поднимает порог входа на порядок.
 */
@CapacitorPlugin(name = "AssetKey")
public class AssetKeyPlugin extends Plugin {

    // Части ключа (hex) и XOR-маска подставляются build-скриптом (scripts/configure-android.js)
    // из переменной окружения ASSET_KEY во время CI-сборки. В репозитории их нет.
    private static final String[] PARTS = { __KEY_PARTS__ };
    private static final int XOR_BYTE = __XOR_BYTE__;

    @PluginMethod
    public void getKey(PluginCall call) {
        StringBuilder hex = new StringBuilder();
        for (String part : PARTS) {
            for (int i = 0; i < part.length(); i += 2) {
                int b = Integer.parseInt(part.substring(i, i + 2), 16) ^ XOR_BYTE;
                hex.append(String.format("%02x", b));
            }
        }
        JSObject ret = new JSObject();
        ret.put("key", hex.toString());
        call.resolve(ret);
    }
}
