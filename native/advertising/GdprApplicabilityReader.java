package com.belugafit.advertising;

import java.util.Map;

/** Reads one snapshot; never writes or exports raw preference values. */
public final class GdprApplicabilityReader {
  private static final String KEY = "IABTCF_gdprApplies";

  public interface SnapshotSource {
    Map<String, ?> snapshot();
  }

  public static final class ReadFailure extends Exception {
    public ReadFailure() {
      super("applicability-read-failed");
    }
  }

  public static String read(SnapshotSource source) throws ReadFailure {
    try {
      Map<String, ?> snapshot = source.snapshot();
      if (!snapshot.containsKey(KEY)) return "missing";
      Object value = snapshot.get(KEY);
      if (!(value instanceof Integer)) return "invalid";
      int integer = (Integer) value;
      if (integer == 0) return "not-applicable";
      if (integer == 1) return "applicable";
      return "invalid";
    } catch (RuntimeException ignored) {
      // Do not preserve exception text, cause or raw stored values.
      throw new ReadFailure();
    }
  }

  private GdprApplicabilityReader() {}
}
