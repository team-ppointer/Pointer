#pragma once

#include "CatmullRomPathBuilder.h"
#include <vector>

// Forward-declare SkPath to avoid pulling in the full Skia header.
class SkPath;

namespace PointerNativeDrawing {

// ---------------------------------------------------------------------------
// NativeDrawingSession
//
// Accumulates touch samples on the UI thread and builds the live SkPath
// with frozen-prefix optimisation — mirroring the JS renderer logic
// (useSkiaDrawingRenderer.ts) in native C++.
//
// Thread safety: NOT thread-safe. All calls must happen on the main/UI thread
// (which is the case for UIGestureRecognizer callbacks).
// ---------------------------------------------------------------------------

class NativeDrawingSession {
public:
  NativeDrawingSession() = default;
  ~NativeDrawingSession();

  // --- Lifecycle ---

  /// Start a new stroke. Resets all state.
  void startStroke(double x, double y, double pressure,
                   double tiltX, double tiltY, double timestamp);

  /// Add a coalesced touch sample. Interpolates if gap > maxGap.
  void addPoint(double x, double y, double pressure,
                double tiltX, double tiltY, double timestamp,
                double maxGap);

  /// Build the live SkPath (frozen prefix + fresh tail) for the current frame.
  /// Returns an empty path if < 2 samples.
  SkPath buildLivePath(const Config &config, double targetSpacing = 3.0,
                       double smoothingFactor = 0.3);

  /// Discard the session (cancel or after finalize).
  void discard();

  // --- Accessors ---

  bool isActive() const { return active_; }
  size_t pointCount() const { return points_.size(); }
  size_t sampleCount() const { return samples_.size(); }
  double sessionMaxY() const { return sessionMaxY_; }

  const std::vector<Sample> &samples() const { return samples_; }

private:
  struct Point2D {
    double x, y;
  };

  bool active_ = false;
  std::vector<Point2D> points_;
  std::vector<Sample> samples_;
  double sessionMaxY_ = 0;

  // Frozen prefix optimisation (mirrors useSkiaDrawingRenderer.ts)
  SkPath *frozenPrefixPath_ = nullptr;
  size_t freezeCursor_ = 0;
  int frameCounter_ = 0;

  static constexpr int FREEZE_INTERVAL = 10;
  static constexpr int TAIL_SIZE = 30;
  static constexpr int TAIL_OVERLAP = 1;

  // Velocity EMA alpha (matches writingFeel.ts computeVelocity default)
  static constexpr double VELOCITY_SMOOTHING_ALPHA = 0.15;

  // --- Internal helpers ---

  /// Interpolate intermediate points when gap > maxGap (strokeUtils.ts port).
  void appendPointWithInterpolation(double x, double y, double maxGap);

  /// Compute velocity and build a Sample from raw touch data.
  Sample buildSample(double x, double y, double pressure,
                     double tiltX, double tiltY, double timestamp);

  /// Release the frozen prefix path if allocated.
  void disposeFrozenPrefix();
};

} // namespace PointerNativeDrawing
