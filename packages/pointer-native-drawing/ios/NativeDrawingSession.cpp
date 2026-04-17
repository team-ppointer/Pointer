#include "NativeDrawingSession.h"

#include <cmath>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"
#include "include/core/SkPath.h"
#pragma clang diagnostic pop

namespace PointerNativeDrawing {

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

NativeDrawingSession::~NativeDrawingSession() { disposeFrozenPrefix(); }

void NativeDrawingSession::startStroke(double x, double y, double pressure,
                                       double tiltX, double tiltY,
                                       double timestamp) {
  discard();
  active_ = true;

  points_.push_back({x, y});

  Sample s;
  s.x = x;
  s.y = y;
  s.pressure = pressure;
  s.tiltX = tiltX;
  s.tiltY = tiltY;
  s.velocity = 0;
  s.smoothedVelocity = 0;
  s.timestamp = timestamp;
  samples_.push_back(s);

  sessionMaxY_ = y;
}

void NativeDrawingSession::addPoint(double x, double y, double pressure,
                                    double tiltX, double tiltY,
                                    double timestamp, double maxGap) {
  if (!active_) return;

  appendPointWithInterpolation(x, y, maxGap);
  samples_.push_back(buildSample(x, y, pressure, tiltX, tiltY, timestamp));

  if (y > sessionMaxY_) sessionMaxY_ = y;
}

void NativeDrawingSession::discard() {
  active_ = false;
  points_.clear();
  samples_.clear();
  disposeFrozenPrefix();
  freezeCursor_ = 0;
  frameCounter_ = 0;
  sessionMaxY_ = 0;
}

// ---------------------------------------------------------------------------
// buildLivePath — frozen prefix + fresh tail
// ---------------------------------------------------------------------------

SkPath NativeDrawingSession::buildLivePath(const Config &config,
                                           double targetSpacing,
                                           double smoothingFactor) {
  if (samples_.size() < 2) {
    SkPath empty;
    if (!samples_.empty()) {
      empty.moveTo(static_cast<float>(samples_[0].x),
                   static_cast<float>(samples_[0].y));
    }
    return empty;
  }

  frameCounter_++;

  const size_t sampleCount = samples_.size();
  const size_t minForFreeze =
      static_cast<size_t>(TAIL_SIZE + TAIL_OVERLAP);

  // --- Maybe freeze prefix ---
  if (frameCounter_ % FREEZE_INTERVAL == 0 && sampleCount > minForFreeze) {
    size_t freezeEnd = sampleCount - TAIL_SIZE;
    std::vector<Sample> prefixSamples(samples_.begin(),
                                      samples_.begin() +
                                          static_cast<ptrdiff_t>(freezeEnd));

    disposeFrozenPrefix();
    frozenPrefixPath_ = new SkPath(
        PathBuilder::buildCenterlinePath(prefixSamples, config, targetSpacing,
                                         smoothingFactor));
    freezeCursor_ = freezeEnd;
  }

  // --- Build path ---
  if (frozenPrefixPath_ && freezeCursor_ > 0) {
    // Tail: from (freezeCursor_ - TAIL_OVERLAP) to end
    size_t tailStart = freezeCursor_ > static_cast<size_t>(TAIL_OVERLAP)
                           ? freezeCursor_ - TAIL_OVERLAP
                           : 0;
    std::vector<Sample> tailSamples(
        samples_.begin() + static_cast<ptrdiff_t>(tailStart), samples_.end());

    SkPath tailPath = PathBuilder::buildCenterlinePath(
        tailSamples, config, targetSpacing, smoothingFactor);

    SkPath combined;
    combined.addPath(*frozenPrefixPath_);
    combined.addPath(tailPath);
    return combined;
  }

  // No frozen prefix — build entire path
  return PathBuilder::buildCenterlinePath(samples_, config, targetSpacing,
                                          smoothingFactor);
}

// ---------------------------------------------------------------------------
// appendPointWithInterpolation — port of strokeUtils.ts
// ---------------------------------------------------------------------------

void NativeDrawingSession::appendPointWithInterpolation(double x, double y,
                                                        double maxGap) {
  if (points_.empty()) {
    points_.push_back({x, y});
    return;
  }

  const auto &last = points_.back();
  const double dx = x - last.x;
  const double dy = y - last.y;
  const double distance = std::hypot(dx, dy);

  if (!std::isfinite(distance) || distance == 0.0) {
    return;
  }

  if (distance <= maxGap) {
    points_.push_back({x, y});
    return;
  }

  const int steps = static_cast<int>(std::ceil(distance / maxGap));
  for (int i = 1; i < steps; i++) {
    const double ratio = static_cast<double>(i) / steps;
    points_.push_back({last.x + dx * ratio, last.y + dy * ratio});
  }
  points_.push_back({x, y});
}

// ---------------------------------------------------------------------------
// buildSample — port of writingFeel.ts computeVelocity
// ---------------------------------------------------------------------------

Sample NativeDrawingSession::buildSample(double x, double y, double pressure,
                                         double tiltX, double tiltY,
                                         double timestamp) {
  Sample s;
  s.x = x;
  s.y = y;
  s.pressure = pressure;
  s.tiltX = tiltX;
  s.tiltY = tiltY;
  s.timestamp = timestamp;

  if (samples_.empty()) {
    s.velocity = 0;
    s.smoothedVelocity = 0;
    return s;
  }

  const Sample &prev = samples_.back();
  const double dt = timestamp - prev.timestamp;

  if (dt <= 0) {
    s.velocity = prev.velocity;
    s.smoothedVelocity = prev.smoothedVelocity;
    return s;
  }

  const double dist = std::hypot(x - prev.x, y - prev.y);
  s.velocity = dist / dt;

  const double prevSmoothed =
      std::isnan(prev.smoothedVelocity) ? 0.0 : prev.smoothedVelocity;
  s.smoothedVelocity =
      VELOCITY_SMOOTHING_ALPHA * s.velocity +
      (1.0 - VELOCITY_SMOOTHING_ALPHA) * prevSmoothed;

  return s;
}

// ---------------------------------------------------------------------------
// Frozen prefix disposal
// ---------------------------------------------------------------------------

void NativeDrawingSession::disposeFrozenPrefix() {
  if (frozenPrefixPath_) {
    delete frozenPrefixPath_;
    frozenPrefixPath_ = nullptr;
  }
}

} // namespace PointerNativeDrawing
