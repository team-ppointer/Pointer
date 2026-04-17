#pragma once

#include <functional>
#include <memory>

class SkPath;

namespace PointerNativeDrawing {

/// Thread-safe singleton bridge for passing the native-built live SkPath
/// from StylusInputView (UI thread) to JS (via CallInvoker or JSI getter).
class LivePathBridge {
public:
  // --- Mutex-based path storage (Phase 3C fallback) ---

  /// Store a new live path (called from UI thread on each touch moved).
  static void set(SkPath path);

  /// Copy the latest live path into `out`. Returns false if no path is available.
  static bool get(SkPath &out);

  /// Clear the stored path (called on stroke end / cancel).
  static void clear();

  // --- CallInvoker push path (Phase 3D) ---

  using PushCallback = std::function<void(std::shared_ptr<SkPath>)>;

  /// Register a callback that pushes SkPath to JS via CallInvoker.
  /// Called once during JSI install.
  static void setPushCallback(PushCallback cb);

  /// Clear the push callback.
  static void clearPushCallback();

  /// Push path to JS via CallInvoker if registered, otherwise fall back to set().
  static void pushOrSet(SkPath path);
};

} // namespace PointerNativeDrawing
