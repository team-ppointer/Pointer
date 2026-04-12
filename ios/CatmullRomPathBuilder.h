#pragma once

#include <cmath>
#include <vector>

class SkPath;
class SkPathBuilder;

namespace PointerNativeDrawing {

struct Sample {
  double x;
  double y;
  double pressure;         // NAN if unavailable
  double tiltX;            // NAN if unavailable
  double tiltY;            // NAN if unavailable
  double velocity;         // NAN if unavailable
  double smoothedVelocity; // NAN if unavailable
  double timestamp;
};

struct Config {
  double minWidth = 0.9;
  double maxWidth = 3.6;
  double pressureGamma = 0.7;
  double pressureWeight = 0.8;
  double velocityWeight = 0.2;
  double velocitySmoothing = 0.18;
  double velocityThinningK = 0.22;
  double widthSmoothing = 0.32;
  double tiltSensitivity = 0.0;
};

struct BuildState {
  double lastSmoothedWidth = NAN;
  std::vector<double> _scratchX;
  std::vector<double> _scratchY;
};

class PathBuilder {
public:
  /// Centripetal Catmull-Rom through sample positions (fixed-width centerline).
  static SkPath buildSmoothPath(const std::vector<Sample> &samples);

  /// Filled variable-width stroke (full 10-step pipeline).
  static SkPath buildVariableWidthPath(const std::vector<Sample> &samples,
                                       const Config &config,
                                       BuildState *state = nullptr,
                                       bool taperStart = true,
                                       bool taperEnd = true);

  /// Resampled + smoothed centerline (for fixed-width strokes).
  static SkPath buildCenterlinePath(const std::vector<Sample> &samples,
                                    const Config &config,
                                    double targetSpacing = 3.0,
                                    double smoothingFactor = 0.3);

private:
  struct CP {
    double cp1x, cp1y, cp2x, cp2y;
  };

  static CP centripetalControlPoints(double p0x, double p0y, double p1x,
                                     double p1y, double p2x, double p2y,
                                     double p3x, double p3y);

  static Sample lerpSample(const Sample &a, const Sample &b, double t);

  static std::vector<Sample>
  resampleByArcLength(const std::vector<Sample> &samples,
                      double targetSpacing = 3.0);

  static void recomputeVelocities(std::vector<Sample> &samples, double alpha);

  static void smoothCenterline(std::vector<Sample> &samples, double factor,
                               BuildState *state = nullptr);

  static double resolveDynamicStrokeWidth(const Sample &sample,
                                          const Config &config,
                                          double prevSmoothedWidth = NAN);

  static void applyTaper(std::vector<double> &halfWidths, int taperCount = 4,
                          double minFraction = 0.15, bool start = true,
                          bool end = true);

  static void addRoundCap(SkPathBuilder &b, double cx, double cy, double tx,
                           double ty, double r);

  static void traceCatmullRomEdge(SkPathBuilder &b, const double *edgeX,
                                   const double *edgeY, size_t count);

  static void traceCatmullRomEdgeReversed(SkPathBuilder &b, const double *edgeX,
                                           const double *edgeY, size_t count);

  static constexpr double CENTRIPETAL_EPSILON = 1e-6;
  static constexpr double KAPPA = 0.5523;
};

} // namespace PointerNativeDrawing
