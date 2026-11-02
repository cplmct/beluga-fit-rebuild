package com.belugafit.advertising;

import android.preference.PreferenceManager;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/** App-owned, read-only test diagnostic. No fixture or mutation methods. */
public final class BelugaGdprApplicabilityModule extends ReactContextBaseJavaModule {
  public BelugaGdprApplicabilityModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "BelugaGdprApplicability";
  }

  @ReactMethod
  public void readGdprApplicability(Promise promise) {
    try {
      String result = GdprApplicabilityReader.read(() ->
          PreferenceManager.getDefaultSharedPreferences(
              getReactApplicationContext().getApplicationContext()).getAll());
      promise.resolve(result);
    } catch (GdprApplicabilityReader.ReadFailure ignored) {
      promise.reject("applicability-read-failed", "Applicability read failed.");
    }
  }
}
