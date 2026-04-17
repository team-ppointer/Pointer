#import "CatmullRomPathBuilderJSI.h"
#import "CatmullRomPathBuilder.h"
#import "NativeDrawingLivePathBridge.h"
#import "StylusInputView.h"

#import <ReactCommon/CallInvoker.h>

#include <memory>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkPath.h"
#include "RNSkManager.h"
#include "RNSkPlatformContext.h"

#import "SkiaManager.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>

namespace jsi = facebook::jsi;

// ---------------------------------------------------------------------------
// Float64Array → vector<Sample>
// ---------------------------------------------------------------------------

namespace {

constexpr size_t STRIDE = 8;

std::vector<PointerNativeDrawing::Sample>
parseSamples(jsi::Runtime &rt, const jsi::Value &arg) {
  if (!arg.isObject()) {
    throw jsi::JSError(rt, "PointerDrawingPathBuilder: expected Float64Array");
  }

  auto typedArray = arg.asObject(rt);

  auto bufferVal = typedArray.getProperty(rt, "buffer");
  if (!bufferVal.isObject()) {
    throw jsi::JSError(
        rt, "PointerDrawingPathBuilder: argument has no .buffer property");
  }

  auto arrayBuffer = bufferVal.asObject(rt).getArrayBuffer(rt);
  size_t byteOffset = static_cast<size_t>(
      typedArray.getProperty(rt, "byteOffset").asNumber());
  size_t length = static_cast<size_t>(
      typedArray.getProperty(rt, "length").asNumber());

  if (length % STRIDE != 0) {
    throw jsi::JSError(
        rt, "PointerDrawingPathBuilder: buffer length must be a multiple of " +
                std::to_string(STRIDE));
  }

  const double *data = reinterpret_cast<const double *>(
      arrayBuffer.data(rt) + byteOffset);
  size_t numSamples = length / STRIDE;

  std::vector<PointerNativeDrawing::Sample> samples(numSamples);
  for (size_t i = 0; i < numSamples; i++) {
    const double *p = data + i * STRIDE;
    samples[i] = {p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]};
  }
  return samples;
}

// ---------------------------------------------------------------------------
// JSI Object → Config
// ---------------------------------------------------------------------------

PointerNativeDrawing::Config parseConfig(jsi::Runtime &rt,
                                         const jsi::Value &val) {
  if (!val.isObject())
    return {};
  auto obj = val.asObject(rt);

  auto d = [&](const char *name, double def) -> double {
    auto prop = obj.getProperty(rt, name);
    return prop.isNumber() ? prop.asNumber() : def;
  };

  return {.minWidth = d("minWidth", 0.9),
          .maxWidth = d("maxWidth", 3.6),
          .pressureGamma = d("pressureGamma", 0.7),
          .pressureWeight = d("pressureWeight", 0.8),
          .velocityWeight = d("velocityWeight", 0.2),
          .velocitySmoothing = d("velocitySmoothing", 0.18),
          .velocityThinningK = d("velocityThinningK", 0.22),
          .widthSmoothing = d("widthSmoothing", 0.32),
          .tiltSensitivity = d("tiltSensitivity", 0.0)};
}

// ---------------------------------------------------------------------------
// JSI Object → BuildState
// ---------------------------------------------------------------------------

PointerNativeDrawing::BuildState parseState(jsi::Runtime &rt,
                                            const jsi::Value &val) {
  if (!val.isObject())
    return {};
  auto obj = val.asObject(rt);
  auto prop = obj.getProperty(rt, "lastSmoothedWidth");
  double lsw = prop.isNumber() ? prop.asNumber() : NAN;
  return {lsw};
}

// ---------------------------------------------------------------------------
// SkPath → JSI value via JsiSkPath
// ---------------------------------------------------------------------------

jsi::Value wrapSkPath(jsi::Runtime &rt,
                      std::shared_ptr<RNSkia::RNSkPlatformContext> ctx,
                      SkPath &&path) {
  return RNSkia::JsiSkPath::toValue(rt, ctx, std::move(path));
}

} // anonymous namespace

// ---------------------------------------------------------------------------
// installPathBuilder
// ---------------------------------------------------------------------------

namespace PointerNativeDrawing {

void installPathBuilder(
    jsi::Runtime &runtime,
    std::shared_ptr<RNSkia::RNSkPlatformContext> context) {

  // Capture context by value (shared_ptr copy) for lambda lifetime
  auto ctx = std::move(context);

  // __PointerNativeDrawing_buildSmoothPath(samplesBuffer) → SkPath
  auto buildSmooth = jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(runtime,
                                "__PointerNativeDrawing_buildSmoothPath"),
      1,
      [ctx](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
            const jsi::Value *args, size_t count) -> jsi::Value {
        try {
          if (count < 1 || !ctx)
            return jsi::Value::null();

          auto samples = parseSamples(rt, args[0]);
          auto path = PathBuilder::buildSmoothPath(samples);
          return wrapSkPath(rt, ctx, std::move(path));
        } catch (const jsi::JSError &) {
          throw;
        } catch (const std::exception &e) {
          throw jsi::JSError(
              rt, std::string("PointerDrawingPathBuilder: ") + e.what());
        } catch (...) {
          throw jsi::JSError(
              rt, "PointerDrawingPathBuilder: unknown native error");
        }
      });

  runtime.global().setProperty(
      runtime, "__PointerNativeDrawing_buildSmoothPath",
      std::move(buildSmooth));

  // __PointerNativeDrawing_buildVariableWidthPath(buf, config, stateIn?,
  //   taperStart?, taperEnd?) → { path, lastSmoothedWidth }
  auto buildVW = jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(
          runtime, "__PointerNativeDrawing_buildVariableWidthPath"),
      5,
      [ctx](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
            const jsi::Value *args, size_t count) -> jsi::Value {
        try {
          if (count < 2 || !ctx)
            return jsi::Value::null();

          auto samples = parseSamples(rt, args[0]);
          auto config = parseConfig(rt, args[1]);

          BuildState state;
          if (count >= 3)
            state = parseState(rt, args[2]);

          bool taperStart =
              count >= 4 && args[3].isBool() ? args[3].getBool() : true;
          bool taperEnd =
              count >= 5 && args[4].isBool() ? args[4].getBool() : true;

          auto path = PathBuilder::buildVariableWidthPath(
              samples, config, &state, taperStart, taperEnd);

          auto result = jsi::Object(rt);
          result.setProperty(rt, "path", wrapSkPath(rt, ctx, std::move(path)));
          result.setProperty(rt, "lastSmoothedWidth",
                             jsi::Value(state.lastSmoothedWidth));
          return result;
        } catch (const jsi::JSError &) {
          throw;
        } catch (const std::exception &e) {
          throw jsi::JSError(
              rt, std::string("PointerDrawingPathBuilder: ") + e.what());
        } catch (...) {
          throw jsi::JSError(
              rt, "PointerDrawingPathBuilder: unknown native error");
        }
      });

  runtime.global().setProperty(
      runtime, "__PointerNativeDrawing_buildVariableWidthPath",
      std::move(buildVW));

  // __PointerNativeDrawing_buildCenterlinePath(buf, config, targetSpacing?, smoothingFactor?) → SkPath
  auto buildCL = jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(
          runtime, "__PointerNativeDrawing_buildCenterlinePath"),
      4,
      [ctx](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
            const jsi::Value *args, size_t count) -> jsi::Value {
        try {
          if (count < 2 || !ctx)
            return jsi::Value::null();

          auto samples = parseSamples(rt, args[0]);
          auto config = parseConfig(rt, args[1]);
          double targetSpacing =
              count >= 3 && args[2].isNumber() ? args[2].asNumber() : 3.0;
          double smoothingFactor =
              count >= 4 && args[3].isNumber() ? args[3].asNumber() : 0.3;

          auto path = PathBuilder::buildCenterlinePath(samples, config, targetSpacing, smoothingFactor);
          return wrapSkPath(rt, ctx, std::move(path));
        } catch (const jsi::JSError &) {
          throw;
        } catch (const std::exception &e) {
          throw jsi::JSError(
              rt, std::string("PointerDrawingPathBuilder: ") + e.what());
        } catch (...) {
          throw jsi::JSError(
              rt, "PointerDrawingPathBuilder: unknown native error");
        }
      });

  runtime.global().setProperty(
      runtime, "__PointerNativeDrawing_buildCenterlinePath",
      std::move(buildCL));

  // __PointerNativeDrawing_getNativeLivePath() → SkPath | null
  // Returns the latest live path built by the native drawing session (Phase 3).
  // If no native session is active, returns null and JS falls back to its own
  // path building pipeline.
  auto getNativeLive = jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(
          runtime, "__PointerNativeDrawing_getNativeLivePath"),
      0,
      [ctx](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
            const jsi::Value * /*args*/, size_t /*count*/) -> jsi::Value {
        try {
          if (!ctx) return jsi::Value::null();
          SkPath path;
          if (!LivePathBridge::get(path)) return jsi::Value::null();
          return wrapSkPath(rt, ctx, std::move(path));
        } catch (...) {
          return jsi::Value::null();
        }
      });

  runtime.global().setProperty(
      runtime, "__PointerNativeDrawing_getNativeLivePath",
      std::move(getNativeLive));

  // __PointerNativeDrawing_setSessionConfig(config, targetSpacing, smoothingFactor, strokeWidth)
  // Syncs JS drawing config to the native StylusInputView session.
  auto setConfig = jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(
          runtime, "__PointerNativeDrawing_setSessionConfig"),
      4,
      [](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
         const jsi::Value *args, size_t count) -> jsi::Value {
        if (count < 4) return jsi::Value::undefined();

        auto config = parseConfig(rt, args[0]);
        double spacing = args[1].isNumber() ? args[1].asNumber() : 3.0;
        double factor = args[2].isNumber() ? args[2].asNumber() : 0.3;
        double width = args[3].isNumber() ? args[3].asNumber() : 1.8;

        dispatch_async(dispatch_get_main_queue(), ^{
          StylusInputView *view = [StylusInputView activeView];
          if (view) {
            [view setPathConfig:config
                  targetSpacing:spacing
                smoothingFactor:factor
                    strokeWidth:width];
          }
        });

        return jsi::Value::undefined();
      });

  runtime.global().setProperty(
      runtime, "__PointerNativeDrawing_setSessionConfig",
      std::move(setConfig));
}

} // namespace PointerNativeDrawing

// ===========================================================================
// ObjC module — triggers JSI install from JS via NativeModules
// ===========================================================================

@interface RCTBridge (PointerDrawingPrivate)
- (void *)runtime;
- (std::shared_ptr<facebook::react::CallInvoker>)jsCallInvoker;
@end

@interface PointerDrawingPathBuilderModule : NSObject <RCTBridgeModule>
@end

@implementation PointerDrawingPathBuilderModule

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(PointerDrawingPathBuilder)

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install) {
  // 1. Get JSI runtime + CallInvoker from bridge
  if (!_bridge || ![_bridge respondsToSelector:@selector(runtime)])
    return @(NO);

  void *runtimePtr = [_bridge runtime];
  if (!runtimePtr)
    return @(NO);

  std::shared_ptr<facebook::react::CallInvoker> callInvoker;
  if ([_bridge respondsToSelector:@selector(jsCallInvoker)]) {
    callInvoker = [_bridge jsCallInvoker];
  }

  // 2. Get Skia platform context (architecture-dependent)
  std::shared_ptr<RNSkia::RNSkManager> skManager;

#ifdef RCT_NEW_ARCH_ENABLED
  // Fabric: use static singleton (verified against react-native-skia 2.x)
  if ([[SkiaManager class] respondsToSelector:@selector(latestActiveSkManager)]) {
    skManager = [SkiaManager latestActiveSkManager];
  }
#else
  // Paper: get SkiaManager module from bridge
  SkiaManager *skiaModule = [_bridge moduleForClass:[SkiaManager class]];
  if (skiaModule) {
    skManager = [skiaModule skManager];
  }
#endif

  if (!skManager) {
    RCTLogWarn(
        @"PointerDrawingPathBuilder: SkiaManager not available, "
        @"native path builder disabled");
    return @(NO);
  }

  auto context = skManager->getPlatformContext();
  if (!context) {
    RCTLogWarn(
        @"PointerDrawingPathBuilder: Skia platform context is null");
    return @(NO);
  }

  // 3. Install JSI bindings
  auto &runtime = *static_cast<facebook::jsi::Runtime *>(runtimePtr);
  PointerNativeDrawing::installPathBuilder(runtime, context);

  // 4. Phase 3D: Install registerLivePathCallback + wire CallInvoker push
  //    JS calls registerLivePathCallback(fn) where fn = (path) => { sv.value = path }
  //    Native stores fn, and on each touch uses CallInvoker to call fn with the built path.
  if (callInvoker && context) {
    auto rtPtr = &runtime;
    auto ctxCapture = context;
    auto invoker = callInvoker;

    auto registerCb = jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(
            runtime, "__PointerNativeDrawing_registerLivePathCallback"),
        1,
        [rtPtr, ctxCapture, invoker](
            jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
            const jsi::Value *args, size_t count) -> jsi::Value {
          if (count < 1 || !args[0].isObject())
            return jsi::Value::undefined();

          // Store the JS callback as a shared_ptr so it's safe to capture in lambdas
          auto jsFn = std::make_shared<jsi::Function>(
              args[0].asObject(rt).asFunction(rt));

          // Register push callback on LivePathBridge
          PointerNativeDrawing::LivePathBridge::setPushCallback(
              [rtPtr, ctxCapture, invoker,
               jsFn](std::shared_ptr<SkPath> path) {
                invoker->invokeAsync(
                    [rtPtr, ctxCapture, jsFn, path]() {
                      try {
                        auto wrapped = RNSkia::JsiSkPath::toValue(
                            *rtPtr, ctxCapture, SkPath(*path));
                        jsFn->call(*rtPtr, std::move(wrapped));
                      } catch (...) {
                        // Swallow — path push is best-effort
                      }
                    });
              });

          return jsi::Value::undefined();
        });

    runtime.global().setProperty(
        runtime, "__PointerNativeDrawing_registerLivePathCallback",
        std::move(registerCb));
  }

  return @(YES);
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

@end
