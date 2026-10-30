import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { advertising, internalTestAdvertising, publicFlow, loadAndroidAds } from './runtime.android';
import type { AgeDeclaration } from './ageDeclaration';
import { TEST_BANNER_ID } from './controller';
import type { AdvertisingProps } from './AdvertisingUi';
import { publicFlowStatus } from './publicFlowStatus';

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

export function HomeBanner(props: AdvertisingProps) {
  if (publicFlow.enabled) return <PublicHomeBanner {...props} />;
  return internalTestAdvertising.enabled
    ? <InternalHomeTestBanner blocked={props.blocked} />
    : <ConsentHomeBanner blocked={props.blocked} />;
}

export function AdvertisingAgeDeclaration({ blocked, ownerUserId }: AdvertisingProps) {
  const { safe, current } = useSafeSurface(blocked);
  const state = useSyncExternalStore(publicFlow.subscribe, publicFlow.getSnapshot);
  if (!publicFlow.enabled || !ownerUserId || state.owner !== ownerUserId) return null;
  const choices: [AgeDeclaration, string][] = [
    ['adult', '18 or older'], ['under-18', 'Under 18'], ['prefer-not', 'Prefer not to answer'],
  ];
  return (
    <View style={styles.options}>
      <Text style={styles.link}>Advertising age declaration</Text>
      <Text style={styles.explanation}>
        This choice controls advertising only, not access to workout tracking.
        It is self-declaration, not identity verification. No date of birth is collected.
        You can review or change it in Settings.
      </Text>
      {choices.map(([value, label]) => (
        <TouchableOpacity key={value} accessibilityRole="button"
          accessibilityState={{ selected: state.loaded && state.declaration === value }}
          testID={`advertising-age-${value}`} style={styles.choice}
          disabled={!safe || state.saving}
          onPress={() => {
            if (current.current) void publicFlow.declare(ownerUserId, value);
          }}>
          <Text style={styles.link}>
            {state.loaded && state.declaration === value ? 'Selected: ' : ''}{label}
          </Text>
        </TouchableOpacity>
      ))}
      {!state.loaded && <Text>{state.saving ? 'Saving your choice…' : 'Advertising remains off until your choice is available.'}</Text>}
      {!!state.error && <Text accessibilityRole="alert">{state.error}</Text>}
    </View>
  );
}

function PublicHomeBanner(props: AdvertisingProps) {
  const { safe, current } = useSafeSurface(props.blocked);
  const state = useSyncExternalStore(publicFlow.subscribe, publicFlow.getSnapshot);
  const [width, setWidth] = useState(0);
  const owned = !!props.ownerUserId && state.owner === props.ownerUserId;
  useEffect(() => {
    let cancelled = false;
    if (safe && owned) void publicFlow.prepareHome(() => !cancelled && current.current);
    else publicFlow.suspend();
    return () => { cancelled = true; publicFlow.suspend(); };
  }, [safe, owned, state.trigger]);
  const status = publicFlowStatus(state, owned, safe, width);
  const visible = safe && state.ready && !state.error && width >= 320;
  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <Text testID="public-ad-test-status">{status.text}</Text>
      {owned && (!state.loaded || state.declaration !== 'adult')
        && <AdvertisingAgeDeclaration {...props} />}
      {!!state.error && <Text accessibilityRole="alert">{state.error}</Text>}
      {owned && state.loaded && state.declaration === 'adult' && !!state.error && <TouchableOpacity accessibilityRole="button"
        disabled={!safe || state.busy} onPress={publicFlow.retry}>
        <Text style={styles.link}>Retry advertising privacy check</Text>
      </TouchableOpacity>}
      {status.reserve && <View style={styles.slot}>
        <Text style={styles.label}>Advertisement</Text>
        <View style={styles.inventory}>
          {owned && visible && <PublicBannerCreative />}
        </View>
      </View>}
    </View>
  );
}

function PublicBannerCreative() {
  const callbacks = useMemo(() => publicFlow.createBannerCallbacks(), []);
  useEffect(() => { callbacks.onLoadStart(); }, [callbacks]);
  const Banner = loadAndroidAds().BannerAd;
  return <Banner unitId={TEST_BANNER_ID} size={loadAndroidAds().BannerAdSize.BANNER}
    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    onAdLoaded={callbacks.onAdLoaded} onAdFailedToLoad={callbacks.onAdFailedToLoad} />;
}

function PublicPrivacyOptions({ blocked, ownerUserId }: AdvertisingProps) {
  const { safe, current } = useSafeSurface(blocked);
  const state = useSyncExternalStore(publicFlow.subscribe, publicFlow.getSnapshot);
  if (!ownerUserId || state.owner !== ownerUserId || !state.loaded
    || state.declaration !== 'adult' || !state.privacyRequired) return null;
  return (
    <View style={styles.options}>
      <TouchableOpacity accessibilityRole="button" testID="advertising-privacy-options"
        disabled={!safe || state.busy} onPress={() => {
          void publicFlow.showPrivacyOptions(() => current.current);
        }}>
        <Text style={styles.link}>Advertising privacy options</Text>
      </TouchableOpacity>
      {!!state.error && <Text accessibilityRole="alert">{state.error}</Text>}
    </View>
  );
}

function InternalHomeTestBanner({ blocked }: AdvertisingProps) {
  const { safe, current } = useSafeSurface(blocked);
  const state = useSyncExternalStore(internalTestAdvertising.subscribe, internalTestAdvertising.getSnapshot);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!safe) internalTestAdvertising.stop();
    return () => internalTestAdvertising.stop();
  }, [safe]);
  const visible = safe && state.active && state.ready && !state.error && width >= 320;
  const Banner = visible ? loadAndroidAds().BannerAd : null;
  return (
    <View style={styles.internal}>
      <Text style={styles.link}>Internal test ads — not production consent validation</Text>
      <Text style={styles.label}>
        Adult owner-operated emulator only. Start permits Google SDK/network activity and any
        required UMP form. Test IDs are not a privacy exemption.
      </Text>
      <TouchableOpacity accessibilityRole="button" testID="internal-test-ads-start"
        disabled={!safe || state.busy || state.active}
        onPress={() => { void internalTestAdvertising.start(() => current.current); }}>
        <Text style={styles.link}>{state.busy ? 'Waiting for native SDK…' : 'Start test-banner session'}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" testID="internal-test-ads-stop"
        onPress={internalTestAdvertising.stop}>
        <Text style={styles.link}>Stop test-banner session</Text>
      </TouchableOpacity>
      {state.privacyRequired && <TouchableOpacity accessibilityRole="button"
        testID="internal-test-ads-privacy" disabled={!safe || state.busy}
        onPress={() => { void internalTestAdvertising.showPrivacyOptions(() => current.current); }}>
        <Text style={styles.link}>Test session privacy options</Text>
      </TouchableOpacity>}
      {!!state.error && <Text accessibilityRole="alert">{state.error}</Text>}
      <View style={styles.slot} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        <Text style={styles.label}>Google sample banner — internal test</Text>
        <View style={styles.inventory}>
          {Banner && <Banner unitId={TEST_BANNER_ID}
            size={loadAndroidAds().BannerAdSize.BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdFailedToLoad={internalTestAdvertising.failBanner} />}
        </View>
      </View>
    </View>
  );
}

function ConsentHomeBanner({ blocked }: AdvertisingProps) {
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
  const visible = safe && ready && !failed && !state.error && !state.permissionBlock && width >= 320;
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

export function AdvertisingPrivacyOptions(props: AdvertisingProps) {
  return publicFlow.enabled ? <PublicPrivacyOptions {...props} />
    : <LegacyPrivacyOptions blocked={props.blocked} />;
}

function LegacyPrivacyOptions({ blocked }: AdvertisingProps) {
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
  internal: { marginTop: 32, padding: 16, gap: 16 },
  explanation: { marginVertical: 12, color: '#64748b', fontSize: 14 },
  choice: { paddingVertical: 12 },
  link: { color: '#2563eb', fontSize: 15 },
});
