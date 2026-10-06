const assert = require("node:assert/strict");
const vm = require("node:vm");
const React = require("react");
const dom = require("./helpers/mock-dom");
const { environment, moduleFrom, extract } =
  require("./test-account-boundaries.js").helpers;

const tick = () => new Promise((resolve) => setImmediate(resolve));
const link = (params) => `belugafit://reset-password#${params}`;
const credentials =
  "type=recovery&access_token=synthetic-access&refresh_token=synthetic-refresh";
const session = (id) => ({ user: { id, email: `${id}@example.invalid` } });
const { act } = React;

function testParser(parser) {
  const valid = parser(link(credentials));
  assert.equal(valid.status, "valid");
  assert.equal(valid.accessToken, "synthetic-access");
  assert.equal(
    parser(`belugafit://reset-password?${credentials}`).status,
    "valid",
  );
  for (const bad of [
    `belugafit://workouts#${credentials}`,
    `belugafit://reset-password/extra#${credentials}`,
    `otherapp://reset-password#${credentials}`,
    `belugafit-evil://reset-password#${credentials}`,
    `belugafit://workouts/1?${credentials}`,
    `belugafitGarbage#${credentials}`,
    link("type=recovery&refresh_token=synthetic-refresh"),
    link("type=recovery&access_token=synthetic-access"),
    link("access_token=synthetic-access&refresh_token=synthetic-refresh"),
    link(`${credentials}&refresh_token=duplicate`),
    `belugafit://reset-password?${credentials}#type=recovery`,
    `belugafit://reset-password?error=access_denied#${credentials}`,
    `belugafit://reset-password?${credentials}#extra=one`,
  ])
    assert.equal(parser(bad).status, "invalid", bad);
  assert.equal(
    parser(link("type=recovery&access_token=%ZZ&refresh_token=synthetic"))
      .status,
    "invalid",
  );
  assert.equal(
    parser(link("error=access_denied&error_code=otp_expired")).status,
    "expired",
  );
  assert.equal(
    parser("belugafit://reset-password?code=synthetic-code").status,
    "invalid",
  );
}

function recoveryFixture(utils, id = "A") {
  const e = environment();
  const a = e.auth(session(id));
  const ctx = a.ctx;
  const originalHandlers = ctx.exports.handlers;
  const calls = { imports: 0, updates: 0 };
  Object.assign(ctx, {
    URL,
    APP_SCHEME: "belugafit",
    parseRecoveryUrl: utils.parseRecoveryUrl,
    recoverySessionFailure: utils.recoverySessionFailure,
    RECOVERY_CLEANUP_MESSAGE: utils.RECOVERY_CLEANUP_MESSAGE,
    bindRecoveryOwner: originalHandlers.bindRecoveryOwner,
    cancelRecovery: originalHandlers.cancelRecovery,
    beginAccountTransition: originalHandlers.beginAccountTransition,
    applyAuthSession: originalHandlers.applyAuthSession,
    authRestorePromiseRef: { current: Promise.resolve() },
  });
  vm.runInNewContext(
    extract("src/contexts/AuthContext.tsx", [
      "applyRecoveryUrl",
      "updatePassword",
    ]),
    ctx,
  );
  const handlers = ctx.exports.handlers;
  ctx.exports.handlers = originalHandlers;
  ctx.supabase.auth.setSession = async () => {
    calls.imports++;
    ctx.sdkSession = session("B");
    void a.applyAuthSession(ctx.sdkSession); // SDK SIGNED_IN callback, mocked
    return { data: { session: ctx.sdkSession }, error: null };
  };
  ctx.supabase.auth.updateUser = async () => {
    calls.updates++;
    return { error: null };
  };
  return { e, a, ctx, handlers, calls };
}

async function testRecoveryState(utils) {
  let f = recoveryFixture(utils);
  await f.handlers.applyRecoveryUrl("https://preview.example.invalid/");
  await f.handlers.applyRecoveryUrl(
    "exp+beluga-fit://expo-development-client/?url=synthetic",
  );
  assert.equal(f.ctx.recoveryLinkState.status, "idle");
  assert.equal(f.calls.imports, 0);
  await f.handlers.applyRecoveryUrl(`otherapp://reset-password#${credentials}`);
  assert.equal(f.ctx.recoveryLinkState.status, "invalid");
  await f.handlers.applyRecoveryUrl(
    link("error=access_denied&error_code=otp_expired"),
  );
  assert.equal(f.ctx.recoveryLinkState.status, "expired");
  assert.match(f.ctx.recoveryLinkState.message, /Request another reset link/);
  assert.equal(f.calls.imports, 0);
  f.ctx.exports.handlers.requestAnotherResetLink();
  assert.equal(f.ctx.recoveryRequestMode, true);
  assert.equal(f.ctx.recoveryLinkState.status, "idle");
  f.ctx.exports.handlers.cancelRecovery();
  assert.equal(f.ctx.recoveryRequestMode, false);
  await f.handlers.applyRecoveryUrl(
    "belugafit://reset-password?code=synthetic-code",
  );
  assert.equal(f.ctx.recoveryLinkState.status, "invalid");
  assert.match(f.ctx.recoveryLinkState.message, /not supported/);
  await f.handlers.applyRecoveryUrl(
    link("type=recovery&access_token=%ZZ&refresh_token=synthetic"),
  );
  assert.equal(f.ctx.recoveryLinkState.status, "invalid");
  assert.equal(f.calls.imports, 0);
  f.ctx.supabase.auth.setSession = async () => {
    f.calls.imports++;
    return {
      data: { session: null },
      error: { code: "otp_expired", message: "synthetic-secret" },
    };
  };
  await f.handlers.applyRecoveryUrl(link(credentials));
  assert.equal(f.ctx.recoveryLinkState.status, "expired");
  assert.ok(!f.ctx.recoveryLinkState.message.includes("synthetic-secret"));
  f.ctx.supabase.auth.setSession = async () => {
    throw new Error("synthetic-secret");
  };
  await f.handlers.applyRecoveryUrl(link(credentials));
  assert.equal(f.ctx.recoveryLinkState.status, "failed");
  assert.ok(!f.ctx.recoveryLinkState.message.includes("synthetic-secret"));
  assert.notEqual(f.ctx.recoveryLinkState.status, "processing");

  f = recoveryFixture(utils);
  await f.handlers.applyRecoveryUrl(link(credentials));
  assert.equal(f.ctx.recoveryOwnerId, "B");
  assert.equal(f.ctx.user.id, "B");
  assert.equal(f.ctx.recoveryLinkState.status, "ready");
  await f.a.applyAuthSession(session("B")); // same-owner token refresh
  assert.equal(f.ctx.recoveryOwnerId, "B");
  assert.equal(
    (await f.handlers.updatePassword("synthetic-new-password")).error,
    null,
  );
  assert.equal(f.ctx.recoveryOwnerId, null);
  assert.equal(f.ctx.user.id, "B"); // success does not restore A
  await f.handlers.applyRecoveryUrl(link(credentials));
  assert.equal(f.ctx.recoveryOwnerId, "B");
  await f.a.applyAuthSession(session("C")); // unrelated ordinary sign-in
  assert.equal(f.ctx.recoveryOwnerId, null);
  assert.equal(f.ctx.recoveryLinkState.status, "idle");
  assert.equal(f.ctx.user.id, "C");
  await assert.rejects(f.e.storage.loadWorkoutSession("A"), /account changed/);

  f = recoveryFixture(utils);
  f.ctx.supabase.auth.setSession = async () => {
    f.ctx.sdkSession = session("C");
    await f.a.applyAuthSession(f.ctx.sdkSession);
    return { data: { session: session("B") }, error: null }; // stale import
  };
  await f.handlers.applyRecoveryUrl(link(credentials));
  assert.equal(f.ctx.recoveryOwnerId, null);
  assert.equal(f.ctx.user.id, "C");
  assert.equal(f.ctx.recoveryLinkState.status, "failed");

  f = recoveryFixture(utils);
  await f.e.cleanup.beginAccountCleanup({ ownerUserId: "A", kind: "sign-out" });
  f.ctx.pendingCleanupRef.current = { ownerUserId: "A", kind: "sign-out" };
  await f.handlers.applyRecoveryUrl(link(credentials));
  assert.equal(f.ctx.recoveryLinkState.status, "failed");
  assert.match(f.ctx.recoveryLinkState.message, /cleanup/);
  assert.equal(f.calls.imports, 0);
  const blocked = await f.handlers.updatePassword("synthetic-new-password");
  assert.match(blocked.error.message, /cleanup/);
  assert.equal(f.calls.updates, 0);
  // Retry for A may be pending while B is active. B's password still belongs to B.
  f.ctx.sdkSession = session("B");
  await f.a.applyAuthSession(f.ctx.sdkSession);
  assert.equal(
    (await f.handlers.updatePassword("synthetic-new-password")).error,
    null,
  );
  assert.equal(f.calls.updates, 1);
  assert.equal(f.ctx.user.id, "B");
  assert.equal(
    (await f.e.cleanup.readPendingAccountCleanup()).ownerUserId,
    "A",
  );
}

async function testScreens(utils) {
  dom.install();
  // An unresolved assertion must fail rather than letting Node exit silently.
  const watchdog = setTimeout(() => {
    console.error("Password recovery screen test timed out");
    process.exitCode = 1;
  }, 12000);
  const { createRoot } = require("react-dom/client");
  const jsx = require("react/jsx-runtime");
  const captured = {};
  const host = (tag) => (props) => {
    if (props.testID) captured[props.testID] = props;
    return React.createElement(
      tag,
      {
        "data-testid": props.testID,
        "data-disabled": String(!!props.disabled),
      },
      props.children,
    );
  };
  const native = {
    View: host("div"),
    Text: host("span"),
    TextInput: host("input"),
    TouchableOpacity: host("button"),
    ScrollView: host("div"),
    KeyboardAvoidingView: host("div"),
    SafeAreaView: host("div"),
    ActivityIndicator: host("span"),
    Platform: { OS: "web" },
    StyleSheet: { create: (styles) => styles },
  };
  let value;
  const dependencies = {
    react: React,
    "react/jsx-runtime": jsx,
    "react-native": native,
    "../contexts/AuthContext": { useAuth: () => value },
    "../utils/passwordRecovery": utils,
  };
  const { ForgotPasswordScreen } = moduleFrom(
    "src/components/ForgotPasswordScreen.tsx",
    dependencies,
  );
  const { ChangePasswordScreen } = moduleFrom(
    "src/components/ChangePasswordScreen.tsx",
    dependencies,
  );
  const { ResetPasswordScreen } = moduleFrom(
    "src/components/ResetPasswordScreen.tsx",
    dependencies,
  );
  const { RecoveryLinkScreen } = moduleFrom(
    "src/components/RecoveryLinkScreen.tsx",
    dependencies,
  );
  const container = document.createElement("div");
  const root = createRoot(container);
  const render = async (component) => {
    await act(async () => {
      root.render(React.createElement(component));
    });
  };
  let rejectRequest;
  value = {
    resetPassword: () =>
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
  };
  try {
    await render(ForgotPasswordScreen);
    await act(async () => {
      captured["reset-request-email"].onChangeText("synthetic@example.invalid");
    });
    let request;
    await act(async () => {
      request = captured["reset-request-button"].onPress();
      await tick();
    });
    assert.equal(captured["reset-request-button"].disabled, true);
    await act(async () => {
      rejectRequest(new Error("synthetic-secret"));
      await request;
    });
    await tick();
    assert.equal(captured["reset-request-button"].disabled, false);
    assert.match(container.textContent, /Couldn’t request a reset link/);
    assert.ok(!container.textContent.includes("synthetic-secret"));
    value.resetPassword = async () => ({
      error: { message: "Mock SDK reset error" },
    });
    await render(ForgotPasswordScreen); // refresh the hook's captured action
    await act(async () => {
      await captured["reset-request-button"].onPress();
    });
    assert.match(container.textContent, /Mock SDK reset error/);
    value.resetPassword = async () => ({ error: { message: "{}" } });
    await render(ForgotPasswordScreen);
    await act(async () => {
      await captured["reset-request-button"].onPress();
    });
    assert.match(container.textContent, /Couldn’t request a reset link/);
    assert.ok(!container.textContent.includes("{}"));

    for (const component of [ChangePasswordScreen, ResetPasswordScreen]) {
      let rejectUpdate;
      value = {
        updatePassword: () =>
          new Promise((_, reject) => {
            rejectUpdate = reject;
          }),
        cancelRecovery() {},
      };
      await render(component);
      await act(async () => {
        captured["password-recovery-new"].onChangeText("synthetic-password");
        captured["password-recovery-confirm"].onChangeText(
          "synthetic-password",
        );
      });
      let pending;
      await act(async () => {
        pending = captured["password-update-button"].onPress();
        await tick();
      });
      assert.equal(captured["password-update-button"].disabled, true);
      await act(async () => {
        rejectUpdate(new Error("synthetic-secret"));
        await pending;
      });
      await tick();
      assert.equal(captured["password-update-button"].disabled, false);
      assert.match(container.textContent, /Couldn’t update your password/);
      assert.ok(!container.textContent.includes("synthetic-secret"));
      value.updatePassword = async () => ({
        error: { message: "Mock SDK password error" },
      });
      await render(component);
      await act(async () => {
        await captured["password-update-button"].onPress();
      });
      assert.match(container.textContent, /Mock SDK password error/);
      value.updatePassword = async () => ({ error: { message: {} } });
      await render(component);
      await act(async () => {
        await captured["password-update-button"].onPress();
      });
      assert.match(container.textContent, /Couldn’t update your password/);
    }
    let requested = 0;
    let cancelled = 0;
    value = {
      recoveryLinkState: {
        status: "expired",
        message: utils.recoverySessionFailure({ code: "otp_expired" }).message,
      },
      requestAnotherResetLink: () => {
        requested++;
      },
      cancelRecovery: () => {
        cancelled++;
      },
    };
    await render(RecoveryLinkScreen);
    assert.match(container.textContent, /expired/i);
    assert.ok(captured["request-another-reset-link"]);
    await act(async () => {
      captured["request-another-reset-link"].onPress();
      captured["recovery-link-cancel"].onPress();
    });
    assert.equal(requested, 1);
    assert.equal(cancelled, 1);
  } finally {
    clearTimeout(watchdog);
    await act(async () => {
      root.unmount();
    });
    dom.restore();
  }
}

async function run() {
  const utils = moduleFrom(
    "src/utils/passwordRecovery.ts",
    {},
    { URL, URLSearchParams },
  );
  testParser(utils.parseRecoveryUrl);
  console.log("Password recovery parser: PASS");
  await testRecoveryState(utils);
  console.log("Password recovery transitions: PASS");
  await testScreens(utils);
  console.log(
    "Password recovery: PASS — strict URL cases, visible callback errors, owner transitions, pending cleanup, A/B isolation and mounted thrown/returned form errors. Auth calls were mocked.",
  );
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
