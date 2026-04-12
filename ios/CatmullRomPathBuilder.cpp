#include "CatmullRomPathBuilder.h"

#include <algorithm>
#include <cmath>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"
#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"
#include "include/core/SkRect.h"
#pragma clang diagnostic pop

namespace PointerNativeDrawing {

// ---------------------------------------------------------------------------
// centripetalControlPoints
// ---------------------------------------------------------------------------

PathBuilder::CP PathBuilder::centripetalControlPoints(double p0x, double p0y,
                                                      double p1x, double p1y,
                                                      double p2x, double p2y,
                                                      double p3x, double p3y) {
  double d01 =
      std::sqrt(std::sqrt((p1x - p0x) * (p1x - p0x) + (p1y - p0y) * (p1y - p0y)));
  double d12 =
      std::sqrt(std::sqrt((p2x - p1x) * (p2x - p1x) + (p2y - p1y) * (p2y - p1y)));
  double d23 =
      std::sqrt(std::sqrt((p3x - p2x) * (p3x - p2x) + (p3y - p2y) * (p3y - p2y)));

  if (d01 < CENTRIPETAL_EPSILON || d12 < CENTRIPETAL_EPSILON ||
      d23 < CENTRIPETAL_EPSILON) {
    return {p1x + (p2x - p0x) / 6.0, p1y + (p2y - p0y) / 6.0,
            p2x - (p3x - p1x) / 6.0, p2y - (p3y - p1y) / 6.0};
  }

  double d01_d12 = d01 + d12;
  double d12_d23 = d12 + d23;

  double v1x =
      (p1x - p0x) / d01 - (p2x - p0x) / d01_d12 + (p2x - p1x) / d12;
  double v1y =
      (p1y - p0y) / d01 - (p2y - p0y) / d01_d12 + (p2y - p1y) / d12;
  double v2x =
      (p2x - p1x) / d12 - (p3x - p1x) / d12_d23 + (p3x - p2x) / d23;
  double v2y =
      (p2y - p1y) / d12 - (p3y - p1y) / d12_d23 + (p3y - p2y) / d23;

  double scale = d12 / 3.0;
  return {p1x + v1x * scale, p1y + v1y * scale, p2x - v2x * scale,
          p2y - v2y * scale};
}

// ---------------------------------------------------------------------------
// lerpSample
// ---------------------------------------------------------------------------

Sample PathBuilder::lerpSample(const Sample &a, const Sample &b, double t) {
  auto lerpOpt = [](double va, double vb, double lt) -> double {
    if (std::isnan(va) || std::isnan(vb))
      return NAN;
    return va + (vb - va) * lt;
  };
  return {a.x + (b.x - a.x) * t,
          a.y + (b.y - a.y) * t,
          lerpOpt(a.pressure, b.pressure, t),
          lerpOpt(a.tiltX, b.tiltX, t),
          lerpOpt(a.tiltY, b.tiltY, t),
          lerpOpt(a.velocity, b.velocity, t),
          lerpOpt(a.smoothedVelocity, b.smoothedVelocity, t),
          a.timestamp + (b.timestamp - a.timestamp) * t};
}

// ---------------------------------------------------------------------------
// resampleByArcLength
// ---------------------------------------------------------------------------

std::vector<Sample>
PathBuilder::resampleByArcLength(const std::vector<Sample> &samples,
                                 double targetSpacing) {
  if (samples.size() <= 1)
    return samples;

  size_t n = samples.size();
  std::vector<double> cumLen(n, 0.0);
  for (size_t i = 1; i < n; i++) {
    double dx = samples[i].x - samples[i - 1].x;
    double dy = samples[i].y - samples[i - 1].y;
    cumLen[i] = cumLen[i - 1] + std::hypot(dx, dy);
  }

  double totalLen = cumLen[n - 1];
  if (totalLen < targetSpacing)
    return samples;

  std::vector<Sample> result;
  result.reserve(static_cast<size_t>(totalLen / targetSpacing) + 2);
  result.push_back(samples[0]);

  double nextDist = targetSpacing;
  size_t segIdx = 0;

  while (nextDist < totalLen) {
    while (segIdx < n - 2 && cumLen[segIdx + 1] < nextDist) {
      segIdx++;
    }

    double segStart = cumLen[segIdx];
    double segEnd = cumLen[segIdx + 1];
    double segLen = segEnd - segStart;
    double t = segLen > 0 ? (nextDist - segStart) / segLen : 0.0;

    result.push_back(lerpSample(samples[segIdx], samples[segIdx + 1], t));
    nextDist += targetSpacing;
  }

  result.push_back(samples[n - 1]);
  return result;
}

// ---------------------------------------------------------------------------
// recomputeVelocities
// ---------------------------------------------------------------------------

void PathBuilder::recomputeVelocities(std::vector<Sample> &samples,
                                      double alpha) {
  if (samples.empty())
    return;

  samples[0].velocity = 0.0;
  samples[0].smoothedVelocity = 0.0;

  double prevRaw = 0.0;
  double prevSmoothed = 0.0;

  for (size_t i = 1; i < samples.size(); i++) {
    double dx = samples[i].x - samples[i - 1].x;
    double dy = samples[i].y - samples[i - 1].y;
    double dt = samples[i].timestamp - samples[i - 1].timestamp;

    double raw = dt > 0 ? std::hypot(dx, dy) / dt : prevRaw;
    double smoothed = alpha * raw + (1.0 - alpha) * prevSmoothed;

    samples[i].velocity = raw;
    samples[i].smoothedVelocity = smoothed;

    prevRaw = raw;
    prevSmoothed = smoothed;
  }
}

// ---------------------------------------------------------------------------
// smoothCenterline
// ---------------------------------------------------------------------------

void PathBuilder::smoothCenterline(std::vector<Sample> &samples,
                                   double factor, BuildState *state) {
  size_t n = samples.size();
  if (n < 3)
    return;

  // Reuse scratch buffers from BuildState when available.
  // NOTE: When called from JSI, BuildState is reconstructed per-call so
  // pooling does not persist across frames. This is intentional — the ~1.6KB
  // allocation is negligible in C++ compared to JS GC pressure. The pooling
  // still helps when called in a loop within a single native invocation
  // (e.g. buildCenterlinePath). If profiling shows overhead, consider a
  // thread_local or JSI HostObject for persistent state.
  std::vector<double> localX, localY;
  std::vector<double> &origX = state ? state->_scratchX : localX;
  std::vector<double> &origY = state ? state->_scratchY : localY;
  origX.resize(n);
  origY.resize(n);

  for (size_t i = 0; i < n; i++) {
    origX[i] = samples[i].x;
    origY[i] = samples[i].y;
  }

  constexpr double cosThreshold = 0.5; // cos(60deg)

  for (size_t i = 1; i < n - 1; i++) {
    double ax = origX[i] - origX[i - 1];
    double ay = origY[i] - origY[i - 1];
    double bx = origX[i + 1] - origX[i];
    double by = origY[i + 1] - origY[i];
    double magA = std::hypot(ax, ay);
    double magB = std::hypot(bx, by);

    if (magA > 1e-8 && magB > 1e-8) {
      double cosAngle = (ax * bx + ay * by) / (magA * magB);
      if (cosAngle < cosThreshold)
        continue; // sharp turn — skip
    }

    double avgX = 0.25 * origX[i - 1] + 0.5 * origX[i] + 0.25 * origX[i + 1];
    double avgY = 0.25 * origY[i - 1] + 0.5 * origY[i] + 0.25 * origY[i + 1];

    samples[i].x = origX[i] + factor * (avgX - origX[i]);
    samples[i].y = origY[i] + factor * (avgY - origY[i]);
  }
}

// ---------------------------------------------------------------------------
// resolveDynamicStrokeWidth
// ---------------------------------------------------------------------------

double PathBuilder::resolveDynamicStrokeWidth(const Sample &sample,
                                              const Config &config,
                                              double prevSmoothedWidth) {
  double range = config.maxWidth - config.minWidth;

  // 1. Pressure: gamma power curve
  double pressureFactor = 1.0;
  if (!std::isnan(sample.pressure) && sample.pressure > 0) {
    pressureFactor = std::pow(sample.pressure, config.pressureGamma);
  }

  // 2. Velocity: hyperbolic thinning
  double velocityFactor = 1.0;
  double v = !std::isnan(sample.smoothedVelocity) ? sample.smoothedVelocity
             : (!std::isnan(sample.velocity) ? sample.velocity
                                             : NAN);
  if (!std::isnan(v) && v > 0) {
    velocityFactor = 1.0 / (1.0 + config.velocityThinningK * v);
  }

  // 3. Weighted combination
  double totalWeight = config.pressureWeight + config.velocityWeight;
  double combined =
      totalWeight > 0
          ? (pressureFactor * config.pressureWeight +
             velocityFactor * config.velocityWeight) /
                totalWeight
          : 1.0;

  double rawWidth =
      config.minWidth + range * std::max(0.0, std::min(1.0, combined));

  // 4. Tilt magnification
  if (config.tiltSensitivity > 0 && !std::isnan(sample.tiltX) &&
      !std::isnan(sample.tiltY)) {
    double tiltMag = std::hypot(sample.tiltX, sample.tiltY);
    rawWidth *= 1.0 + config.tiltSensitivity * tiltMag;
    rawWidth = std::min(rawWidth, config.maxWidth * 1.5);
  }

  // 5. Width EMA smoothing
  if (!std::isnan(prevSmoothedWidth)) {
    return config.widthSmoothing * rawWidth +
           (1.0 - config.widthSmoothing) * prevSmoothedWidth;
  }
  return rawWidth;
}

// ---------------------------------------------------------------------------
// applyTaper
// ---------------------------------------------------------------------------

static double smoothstep(double t) {
  double c = std::max(0.0, std::min(1.0, t));
  return c * c * (3.0 - 2.0 * c);
}

void PathBuilder::applyTaper(std::vector<double> &halfWidths, int taperCount,
                              double minFraction, bool start, bool end) {
  int n = static_cast<int>(halfWidths.size());

  if (start) {
    int startN = std::min(taperCount, n / 2);
    for (int i = 0; i < startN; i++) {
      double t = static_cast<double>(i + 1) / (startN + 1);
      halfWidths[i] *= minFraction + (1.0 - minFraction) * smoothstep(t);
    }
  }

  if (end) {
    int endN = std::min(taperCount, n / 2);
    for (int i = 0; i < endN; i++) {
      int idx = n - 1 - i;
      double t = static_cast<double>(i + 1) / (endN + 1);
      halfWidths[idx] *= minFraction + (1.0 - minFraction) * smoothstep(t);
    }
  }
}

// ---------------------------------------------------------------------------
// addRoundCap
// ---------------------------------------------------------------------------

void PathBuilder::addRoundCap(SkPathBuilder &path, double cx, double cy,
                               double tx, double ty, double r) {
  double nx = ty;
  double ny = -tx;
  double k = KAPPA * r;

  double tipX = cx + tx * r;
  double tipY = cy + ty * r;

  // Quarter 1: from (center + n*r) -> tip
  path.cubicTo(cx + nx * r + tx * k, cy + ny * r + ty * k, tipX + nx * k,
               tipY + ny * k, tipX, tipY);

  // Quarter 2: tip -> (center - n*r)
  path.cubicTo(tipX - nx * k, tipY - ny * k, cx - nx * r + tx * k,
               cy - ny * r + ty * k, cx - nx * r, cy - ny * r);
}

// ---------------------------------------------------------------------------
// traceCatmullRomEdge
// ---------------------------------------------------------------------------

void PathBuilder::traceCatmullRomEdge(SkPathBuilder &path, const double *edgeX,
                                       const double *edgeY, size_t count) {
  if (count < 2)
    return;

  if (count == 2) {
    path.lineTo(edgeX[1], edgeY[1]);
    return;
  }

  for (size_t i = 0; i < count - 1; i++) {
    double curX = edgeX[i], curY = edgeY[i];
    double nextX = edgeX[i + 1], nextY = edgeY[i + 1];

    double prevX, prevY;
    if (i > 0) {
      prevX = edgeX[i - 1];
      prevY = edgeY[i - 1];
    } else {
      prevX = 2 * curX - nextX;
      prevY = 2 * curY - nextY;
    }

    double nnX, nnY;
    if (i + 2 < count) {
      nnX = edgeX[i + 2];
      nnY = edgeY[i + 2];
    } else {
      nnX = 2 * nextX - curX;
      nnY = 2 * nextY - curY;
    }

    auto cp =
        centripetalControlPoints(prevX, prevY, curX, curY, nextX, nextY, nnX, nnY);
    path.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, nextX, nextY);
  }
}

// ---------------------------------------------------------------------------
// traceCatmullRomEdgeReversed
// ---------------------------------------------------------------------------

void PathBuilder::traceCatmullRomEdgeReversed(SkPathBuilder &path,
                                               const double *edgeX,
                                               const double *edgeY,
                                               size_t count) {
  if (count < 2)
    return;

  if (count == 2) {
    path.lineTo(edgeX[0], edgeY[0]);
    return;
  }

  int last = static_cast<int>(count) - 1;
  for (int i = last; i > 0; i--) {
    double curX = edgeX[i], curY = edgeY[i];
    double nextX = edgeX[i - 1], nextY = edgeY[i - 1];

    double prevX, prevY;
    if (i < last) {
      prevX = edgeX[i + 1];
      prevY = edgeY[i + 1];
    } else {
      prevX = 2 * curX - nextX;
      prevY = 2 * curY - nextY;
    }

    double nnX, nnY;
    if (i - 2 >= 0) {
      nnX = edgeX[i - 2];
      nnY = edgeY[i - 2];
    } else {
      nnX = 2 * nextX - curX;
      nnY = 2 * nextY - curY;
    }

    auto cp =
        centripetalControlPoints(prevX, prevY, curX, curY, nextX, nextY, nnX, nnY);
    path.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, nextX, nextY);
  }
}

// ---------------------------------------------------------------------------
// buildSmoothPath
// ---------------------------------------------------------------------------

SkPath PathBuilder::buildSmoothPath(const std::vector<Sample> &samples) {
  SkPathBuilder b;
  if (samples.empty())
    return b.detach();

  if (!std::isfinite(samples[0].x) || !std::isfinite(samples[0].y))
    return b.detach();

  b.moveTo(samples[0].x, samples[0].y);

  if (samples.size() == 1)
    return b.detach();

  if (samples.size() < 3) {
    if (std::isfinite(samples[1].x) && std::isfinite(samples[1].y))
      b.lineTo(samples[1].x, samples[1].y);
    return b.detach();
  }

  for (size_t i = 0; i < samples.size() - 1; i++) {
    double curX = samples[i].x, curY = samples[i].y;
    double nextX = samples[i + 1].x, nextY = samples[i + 1].y;

    double prevX, prevY;
    if (i > 0) {
      prevX = samples[i - 1].x;
      prevY = samples[i - 1].y;
    } else {
      prevX = 2 * curX - nextX;
      prevY = 2 * curY - nextY;
    }

    double nnX, nnY;
    if (i + 2 < samples.size()) {
      nnX = samples[i + 2].x;
      nnY = samples[i + 2].y;
    } else {
      nnX = 2 * nextX - curX;
      nnY = 2 * nextY - curY;
    }

    if (!std::isfinite(prevX) || !std::isfinite(prevY) ||
        !std::isfinite(curX) || !std::isfinite(curY) ||
        !std::isfinite(nextX) || !std::isfinite(nextY) ||
        !std::isfinite(nnX) || !std::isfinite(nnY))
      continue;

    auto cp =
        centripetalControlPoints(prevX, prevY, curX, curY, nextX, nextY, nnX, nnY);
    b.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, nextX, nextY);
  }

  return b.detach();
}

// ---------------------------------------------------------------------------
// buildVariableWidthPath — full 10-step pipeline
// ---------------------------------------------------------------------------

SkPath PathBuilder::buildVariableWidthPath(const std::vector<Sample> &samples,
                                           const Config &config,
                                           BuildState *state,
                                           bool taperStart, bool taperEnd) {
  SkPathBuilder b;
  if (samples.empty())
    return b.detach();

  // Single-point: dot
  if (samples.size() == 1) {
    double w = resolveDynamicStrokeWidth(samples[0], config);
    double r = std::max(w / 2.0, 0.5);
    b.addOval(SkRect::MakeXYWH(samples[0].x - r, samples[0].y - r, r * 2, r * 2));
    return b.detach();
  }

  // Two-point: quad
  if (samples.size() == 2) {
    double w0 = resolveDynamicStrokeWidth(samples[0], config) / 2.0;
    double w1 = resolveDynamicStrokeWidth(samples[1], config) / 2.0;
    double dx = samples[1].x - samples[0].x;
    double dy = samples[1].y - samples[0].y;
    double len = std::hypot(dx, dy);
    if (len == 0)
      len = 1;
    double nx = -dy / len;
    double ny = dx / len;

    b.moveTo(samples[0].x + nx * w0, samples[0].y + ny * w0);
    b.lineTo(samples[1].x + nx * w1, samples[1].y + ny * w1);
    b.lineTo(samples[1].x - nx * w1, samples[1].y - ny * w1);
    b.lineTo(samples[0].x - nx * w0, samples[0].y - ny * w0);
    b.close();
    return b.detach();
  }

  // --- Step 1: Arc-length resample ---
  auto resampled = resampleByArcLength(samples);

  // --- Step 2: Recompute velocities ---
  recomputeVelocities(resampled, config.velocitySmoothing);

  // --- Step 3: Smooth centerline ---
  smoothCenterline(resampled, 0.3, state);

  // --- Step 4: Compute half-widths with EMA ---
  size_t n = resampled.size();
  std::vector<double> halfWidths(n);
  double prevSmoothedWidth = state ? state->lastSmoothedWidth : NAN;

  for (size_t i = 0; i < n; i++) {
    double w = resolveDynamicStrokeWidth(resampled[i], config, prevSmoothedWidth);
    prevSmoothedWidth = w;
    halfWidths[i] = w / 2.0;
  }

  if (state) {
    state->lastSmoothedWidth = prevSmoothedWidth;
  }

  // --- Step 5: Taper ---
  applyTaper(halfWidths, 4, 0.15, taperStart, taperEnd);

  // --- Step 6+7: Compute normals & offset to edges ---
  std::vector<double> leftX(n), leftY(n), rightX(n), rightY(n);
  double lastNx = 0, lastNy = 1;

  for (size_t i = 0; i < n; i++) {
    const auto &s = resampled[i];
    double prevSx = i > 0 ? resampled[i - 1].x : s.x;
    double prevSy = i > 0 ? resampled[i - 1].y : s.y;
    double nextSx = i < n - 1 ? resampled[i + 1].x : s.x;
    double nextSy = i < n - 1 ? resampled[i + 1].y : s.y;

    double ddx = nextSx - prevSx;
    double ddy = nextSy - prevSy;
    double len = std::hypot(ddx, ddy);

    double nx, ny;
    if (len < 1e-8) {
      nx = lastNx;
      ny = lastNy;
    } else {
      nx = -ddy / len;
      ny = ddx / len;
      lastNx = nx;
      lastNy = ny;
    }

    double hw = halfWidths[i];
    leftX[i] = s.x + nx * hw;
    leftY[i] = s.y + ny * hw;
    rightX[i] = s.x - nx * hw;
    rightY[i] = s.y - ny * hw;
  }

  // --- Step 8: Trace left edge forward ---
  b.moveTo(leftX[0], leftY[0]);
  traceCatmullRomEdge(b, leftX.data(), leftY.data(), n);

  // --- Step 9a: End cap ---
  {
    double dx = resampled[n - 1].x - resampled[n - 2].x;
    double dy = resampled[n - 1].y - resampled[n - 2].y;
    double len = std::hypot(dx, dy);
    double etx = len < 1e-8 ? 1.0 : dx / len;
    double ety = len < 1e-8 ? 0.0 : dy / len;
    addRoundCap(b, resampled[n - 1].x, resampled[n - 1].y, etx, ety,
                halfWidths[n - 1]);
  }

  // --- Trace right edge backward ---
  traceCatmullRomEdgeReversed(b, rightX.data(), rightY.data(), n);

  // --- Step 9b: Start cap ---
  {
    double dx = resampled[1].x - resampled[0].x;
    double dy = resampled[1].y - resampled[0].y;
    double len = std::hypot(dx, dy);
    // Flip direction for start cap
    double stx = len < 1e-8 ? 1.0 : -dx / len;
    double sty = len < 1e-8 ? 0.0 : -dy / len;
    addRoundCap(b, resampled[0].x, resampled[0].y, stx, sty, halfWidths[0]);
  }

  // --- Step 10: Close ---
  b.close();

  return b.detach();
}

// ---------------------------------------------------------------------------
// buildCenterlinePath — resample + smooth + Catmull-Rom centerline
// ---------------------------------------------------------------------------

SkPath PathBuilder::buildCenterlinePath(const std::vector<Sample> &samples,
                                        const Config &config,
                                        double targetSpacing,
                                        double smoothingFactor) {
  SkPathBuilder b;
  if (samples.empty())
    return b.detach();

  if (samples.size() == 1) {
    b.moveTo(samples[0].x, samples[0].y);
    return b.detach();
  }

  auto resampled = resampleByArcLength(samples, targetSpacing);
  smoothCenterline(resampled, smoothingFactor);

  b.moveTo(resampled[0].x, resampled[0].y);

  if (resampled.size() == 2) {
    b.lineTo(resampled[1].x, resampled[1].y);
    return b.detach();
  }

  for (size_t i = 0; i < resampled.size() - 1; i++) {
    double curX = resampled[i].x, curY = resampled[i].y;
    double nextX = resampled[i + 1].x, nextY = resampled[i + 1].y;

    double prevX, prevY;
    if (i > 0) {
      prevX = resampled[i - 1].x;
      prevY = resampled[i - 1].y;
    } else {
      prevX = 2 * curX - nextX;
      prevY = 2 * curY - nextY;
    }

    double nnX, nnY;
    if (i + 2 < resampled.size()) {
      nnX = resampled[i + 2].x;
      nnY = resampled[i + 2].y;
    } else {
      nnX = 2 * nextX - curX;
      nnY = 2 * nextY - curY;
    }

    auto cp =
        centripetalControlPoints(prevX, prevY, curX, curY, nextX, nextY, nnX, nnY);
    b.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, nextX, nextY);
  }

  return b.detach();
}

} // namespace PointerNativeDrawing
