import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { advertising, loadAndroidAds } from './runtime.android';
import { TEST_BANNER_ID } from './controller';
import type { AdvertisingProps } from './AdvertisingUi';

function useSafeSurface(blocked: boolean) {
  const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => sub.remove();
  }, []);
  const safe = focused && active && !blocked;
  const current = useRef(false);
  current.current = safe;
  useEffect(() => () => { current.current = false; }, []);
  return { safe, current };
}

export function HomeBanner({ blocked }: AdvertisingProps) {
  const { safe, current } = useSafeSurface(blocked);
  const state = useSyncExternalStore(advertising.subscribe, advertising.getSnapshot);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setFailed(false);
    if (safe && advertising.enabled) {
      void advertising.prepareHome(() => !cancelled && current.current).then(allowed => {
        if (!cancelled && current.current) setReady(allowed);
      });
    }
    return () => { cancelled = true; };
  }, [safe]);

  if (!advertising.enabled) return null;
  const visible = safe && ready && !failed && !state.error && !state.privacyRequired && width >= 320;
  const Banner = visible ? loadAndroidAds().BannerAd : null;
  return (
    <View style={styles.slot} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <Text style={styles.label}>Advertisement</Text>
      <View style={styles.inventory}>
        {Banner && <Banner
          unitId={TEST_BANNER_ID}
          size={loadAndroidAds().BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdFailedToLoad={() => { setFailed(true); setReady(false); }}
        />}
      </View>
    </View>
  );
}

export function AdvertisingPrivacyOptions({ blocked }: AdvertisingProps) {
  const { safe, current } = useSafeSurface(blocked);
  const state = useSyncExternalStore(advertising.subscribe, advertising.getSnapshot);
  const [busy, setBusy] = useState(false);
  if (!advertising.enabled || !state.privacyRequired) return null;
  return (
    <View style={styles.options}>
      <TouchableOpacity
        accessibilityRole="button"
        disabled={!safe || busy}
        onPress={async () => {
          if (!current.current || busy) return;
          setBusy(true);
          try { await advertising.showPrivacyOptions(() => current.current); }
          finally { setBusy(false); }
        }}
      >
        <Text style={styles.link}>{busy ? 'Opening privacy options…' : 'Advertising privacy options'}</Text>
      </TouchableOpacity>
      {!!state.error && <Text accessibilityRole="alert">{state.error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  // Fixed 50dp creative; no collapsible/adaptive height changes. At least 32dp
  // separates this non-interactive wrapper from the Body card and navigation.
  slot: { marginTop: 32, marginBottom: 32, height: 86, alignItems: 'center' },
  label: { fontSize: 11, color: '#64748b', marginBottom: 8 },
  inventory: { height: 50, alignItems: 'center', justifyContent: 'center' },
  options: { padding: 16 },
  link: { color: '#2563eb', fontSize: 15 },
});
