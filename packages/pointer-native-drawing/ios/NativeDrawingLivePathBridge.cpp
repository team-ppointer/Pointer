#include "NativeDrawingLivePathBridge.h"

#include <memory>
#include <mutex>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"
#include "include/core/SkPath.h"
#pragma clang diagnostic pop

namespace PointerNativeDrawing {

// --- Mutex-based storage (Phase 3C fallback) ---
static std::mutex sMutex;
static std::unique_ptr<SkPath> sPath;
static bool sHasPath = false;

// --- CallInvoker push (Phase 3D) ---
static std::mutex sPushMutex;
static LivePathBridge::PushCallback sPushCallback;

void LivePathBridge::set(SkPath path) {
  std::lock_guard<std::mutex> lock(sMutex);
  sPath = std::make_unique<SkPath>(std::move(path));
  sHasPath = true;
}

bool LivePathBridge::get(SkPath &out) {
  std::lock_guard<std::mutex> lock(sMutex);
  if (!sHasPath || !sPath) return false;
  out = *sPath;
  return true;
}

void LivePathBridge::clear() {
  std::lock_guard<std::mutex> lock(sMutex);
  sPath.reset();
  sHasPath = false;
}

void LivePathBridge::setPushCallback(PushCallback cb) {
  std::lock_guard<std::mutex> lock(sPushMutex);
  sPushCallback = std::move(cb);
}

void LivePathBridge::clearPushCallback() {
  std::lock_guard<std::mutex> lock(sPushMutex);
  sPushCallback = nullptr;
}

void LivePathBridge::pushOrSet(SkPath path) {
  PushCallback cb;
  {
    std::lock_guard<std::mutex> lock(sPushMutex);
    cb = sPushCallback;
  }

  if (cb) {
    // Phase 3D: push to JS via CallInvoker (bypass Fabric event)
    auto shared = std::make_shared<SkPath>(std::move(path));
    cb(shared);
    // Also update the mutex store for getNativeLivePath fallback
    {
      std::lock_guard<std::mutex> lock(sMutex);
      sPath = std::make_unique<SkPath>(*shared);
      sHasPath = true;
    }
  } else {
    // Phase 3C fallback: store for JSI getter
    set(std::move(path));
  }
}

} // namespace PointerNativeDrawing
