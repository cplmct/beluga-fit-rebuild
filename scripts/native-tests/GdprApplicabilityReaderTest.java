package com.belugafit.advertising;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/** Standalone JVM fixture harness only; never copied into an Android application. */
public final class GdprApplicabilityReaderTest {
  private static void expect(String expected, Map<String, ?> snapshot) throws Exception {
    int[] reads = {0};
    String actual = GdprApplicabilityReader.read(() -> {
      reads[0]++;
      return snapshot;
    });
    if (!expected.equals(actual) || reads[0] != 1) throw new AssertionError(expected);
  }

  public static void main(String[] args) throws Exception {
    expect("missing", Collections.emptyMap());
    for (Object value : new Object[] {Integer.valueOf(0), Integer.valueOf(1),
        Integer.valueOf(-1), Integer.valueOf(2), "0", "1", Boolean.FALSE,
        Boolean.TRUE, Long.valueOf(0), Float.valueOf(1), null}) {
      Map<String, Object> snapshot = new HashMap<>();
      snapshot.put("IABTCF_gdprApplies", value);
      snapshot.put("unrelated", "must-not-be-returned");
      String expected = value instanceof Integer && ((Integer) value) == 0 ? "not-applicable"
          : value instanceof Integer && ((Integer) value) == 1 ? "applicable" : "invalid";
      expect(expected, snapshot);
    }
    int[] reads = {0};
    try {
      GdprApplicabilityReader.read(() -> {
        reads[0]++;
        throw new SecurityException("sensitive-fixture-value");
      });
      throw new AssertionError("Expected sanitized read failure");
    } catch (GdprApplicabilityReader.ReadFailure failure) {
      if (reads[0] != 1 || !"applicability-read-failed".equals(failure.getMessage())
          || failure.getCause() != null) throw new AssertionError("Unsafe failure");
    }
    System.out.println("PASS: Java snapshot fixtures; not Android module/registration validation.");
  }
}
