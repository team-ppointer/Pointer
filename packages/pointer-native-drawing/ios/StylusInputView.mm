#import "StylusInputView.h"
#import "PencilGestureRecognizer.h"
#import "NativeDrawingSession.h"
#import "NativeDrawingLivePathBridge.h"

#import <React/RCTFabricComponentsPlugins.h>
#import <react/renderer/components/PointerNativeDrawingSpec/ComponentDescriptors.h>
#import <react/renderer/components/PointerNativeDrawingSpec/EventEmitters.h>
#import <react/renderer/components/PointerNativeDrawingSpec/Props.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"
#include "include/core/SkPath.h"
#pragma clang diagnostic pop

#include <cmath>

using namespace facebook::react;
using namespace PointerNativeDrawing;

// ---------------------------------------------------------------------------
// Tilt conversion helpers (mirrors nativeStylusAdapter.tsx unpackTouches)
// ---------------------------------------------------------------------------

static inline void altAzToTiltXY(double altitude, double azimuth,
                                  double &outTiltX, double &outTiltY) {
  if (altitude >= M_PI_2) {
    // Pencil is perpendicular — no tilt
    outTiltX = 0;
    outTiltY = 0;
    return;
  }
  if (altitude <= 0) {
    outTiltX = std::atan2(std::cos(azimuth), 0.0);
    outTiltY = std::atan2(std::sin(azimuth), 0.0);
    return;
  }
  double tanAlt = std::tan(altitude);
  outTiltX = std::atan2(std::cos(azimuth), tanAlt);
  outTiltY = std::atan2(std::sin(azimuth), tanAlt);
}

// ---------------------------------------------------------------------------
// maxPointGap resolution (mirrors strokeUtils.ts resolveMaxPointGap)
// ---------------------------------------------------------------------------

static constexpr double MIN_RENDERABLE_STROKE_WIDTH = 1.2;
static constexpr double DEFAULT_MAX_POINT_GAP = 0.95;

static inline double resolveMaxPointGap(double activeWidth) {
  double w = std::max(MIN_RENDERABLE_STROKE_WIDTH, activeWidth);
  if (w <= 1.4) return 0.5;
  if (w <= 2.2) return 0.72;
  return DEFAULT_MAX_POINT_GAP;
}

// ---------------------------------------------------------------------------
// StylusInputView
// ---------------------------------------------------------------------------

@interface StylusInputView () <PencilGestureRecognizerDelegate>
@end

// Static weak reference for JSI config sync (typically one active view)
static __weak StylusInputView *sActiveView = nil;

@implementation StylusInputView {
  PencilGestureRecognizer *_pencilRecognizer;

  // --- Native drawing session (Phase 3) ---
  std::unique_ptr<NativeDrawingSession> _session;
  Config _pathConfig;
  double _targetSpacing;
  double _smoothingFactor;
  double _activeStrokeWidth;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<StylusInputViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const StylusInputViewProps &>(*props);
  _pencilRecognizer.acceptsFingerInput = newProps.acceptFingerInput;
  [super updateProps:props oldProps:oldProps];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    self.userInteractionEnabled = YES;
    self.backgroundColor = [UIColor clearColor];

    _pencilRecognizer = [[PencilGestureRecognizer alloc] initWithTarget:nil action:nil];
    _pencilRecognizer.pencilDelegate = self;
    _pencilRecognizer.cancelsTouchesInView = NO;
    _pencilRecognizer.delaysTouchesBegan = NO;
    [self addGestureRecognizer:_pencilRecognizer];

    _session = std::make_unique<NativeDrawingSession>();
    _pathConfig = Config{}; // default config
    _targetSpacing = 3.0;
    _smoothingFactor = 0.3;
    _activeStrokeWidth = 1.8;
    sActiveView = self;
  }
  return self;
}

- (void)dealloc
{
  if (sActiveView == self) sActiveView = nil;
}

+ (nullable StylusInputView *)activeView
{
  return sActiveView;
}

#pragma mark - Path config (callable from JS via JSI)

- (void)setPathConfig:(const Config &)config
        targetSpacing:(double)spacing
      smoothingFactor:(double)factor
        strokeWidth:(double)width
{
  _pathConfig = config;
  _targetSpacing = spacing;
  _smoothingFactor = factor;
  _activeStrokeWidth = width;
}

#pragma mark - PencilGestureRecognizerDelegate

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer touchBeganWith:(PencilTouchData *)data
{
  [self _handleNativeSessionBegan:data];
  [self _emitPhase:0 withData:data];
}

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer touchMovedWith:(PencilTouchData *)data
{
  [self _handleNativeSessionMoved:data];
  [self _emitPhase:1 withData:data];
}

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer touchEndedWith:(PencilTouchData *)data
{
  [self _handleNativeSessionEnded];
  [self _emitPhase:2 withData:data];
}

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer touchCancelledWith:(PencilTouchData *)data
{
  [self _handleNativeSessionEnded];
  [self _emitPhase:3 withData:data];
}

#pragma mark - Native session handling (Phase 3)

- (void)_handleNativeSessionBegan:(PencilTouchData *)data
{
  UIView *refView = data.referenceView;
  NSArray<UITouch *> *touches = data.coalescedTouches;
  if (touches.count == 0) return;

  UITouch *first = touches[0];
  CGPoint loc = [first preciseLocationInView:refView];
  double force = first.maximumPossibleForce > 0
    ? first.force / first.maximumPossibleForce : 0.0;
  double tiltX, tiltY;
  altAzToTiltXY(first.altitudeAngle, [first azimuthAngleInView:refView], tiltX, tiltY);

  _session->startStroke(loc.x, loc.y, force, tiltX, tiltY,
                        first.timestamp * 1000.0);

  // Feed remaining coalesced touches
  double maxGap = resolveMaxPointGap(_activeStrokeWidth);
  for (NSUInteger i = 1; i < touches.count; i++) {
    UITouch *t = touches[i];
    CGPoint p = [t preciseLocationInView:refView];
    double f = t.maximumPossibleForce > 0
      ? t.force / t.maximumPossibleForce : 0.0;
    double tx, ty;
    altAzToTiltXY(t.altitudeAngle, [t azimuthAngleInView:refView], tx, ty);
    _session->addPoint(p.x, p.y, f, tx, ty, t.timestamp * 1000.0, maxGap);
  }

  // Build initial live path and publish via static bridge
  LivePathBridge::pushOrSet(_session->buildLivePath(_pathConfig, _targetSpacing, _smoothingFactor));
}

- (void)_handleNativeSessionMoved:(PencilTouchData *)data
{
  if (!_session->isActive()) return;

  UIView *refView = data.referenceView;
  NSArray<UITouch *> *touches = data.coalescedTouches;
  if (touches.count == 0) return;

  double maxGap = resolveMaxPointGap(_activeStrokeWidth);
  for (NSUInteger i = 0; i < touches.count; i++) {
    UITouch *t = touches[i];
    CGPoint loc = [t preciseLocationInView:refView];
    double force = t.maximumPossibleForce > 0
      ? t.force / t.maximumPossibleForce : 0.0;
    double tiltX, tiltY;
    altAzToTiltXY(t.altitudeAngle, [t azimuthAngleInView:refView], tiltX, tiltY);
    _session->addPoint(loc.x, loc.y, force, tiltX, tiltY,
                       t.timestamp * 1000.0, maxGap);
  }

  // Build live path and publish via static bridge
  LivePathBridge::pushOrSet(_session->buildLivePath(_pathConfig, _targetSpacing, _smoothingFactor));
}

- (void)_handleNativeSessionEnded
{
  _session->discard();
  LivePathBridge::clear();
}

#pragma mark - Event emission (unchanged — still emits Fabric events for JS state sync)

- (void)_emitPhase:(int)phase withData:(PencilTouchData *)data
{
  auto eventEmitter = [self _stylusTouchEmitter];
  if (!eventEmitter) {
    return;
  }

  UIView *refView = data.referenceView;

  // --- Coalesced touches ---
  NSArray<UITouch *> *touches = data.coalescedTouches;
  NSUInteger count = touches.count;

  if (count == 0) {
    return;
  }

  std::vector<double> xs(count), ys(count), timestamps(count), forces(count), altitudes(count), azimuths(count);

  for (NSUInteger i = 0; i < count; i++) {
    UITouch *t = touches[i];
    CGPoint loc = [t preciseLocationInView:refView];
    xs[i] = loc.x;
    ys[i] = loc.y;
    // UITouch.timestamp is seconds since system boot (mach_absolute_time domain).
    // Convert to ms for JS consumption.
    timestamps[i] = t.timestamp * 1000.0;
    forces[i] = t.maximumPossibleForce > 0
      ? t.force / t.maximumPossibleForce
      : 0.0;
    altitudes[i] = t.altitudeAngle;
    azimuths[i] = [t azimuthAngleInView:refView];
  }

  // --- Predicted touches ---
  NSArray<UITouch *> *predicted = data.predictedTouches;
  NSUInteger pCount = predicted.count;

  std::vector<double> pxs(pCount), pys(pCount), pts(pCount), pforces(pCount), palts(pCount), pazs(pCount);

  for (NSUInteger i = 0; i < pCount; i++) {
    UITouch *t = predicted[i];
    CGPoint loc = [t preciseLocationInView:refView];
    pxs[i] = loc.x;
    pys[i] = loc.y;
    pts[i] = t.timestamp * 1000.0;
    pforces[i] = t.maximumPossibleForce > 0
      ? t.force / t.maximumPossibleForce
      : 0.0;
    palts[i] = t.altitudeAngle;
    pazs[i] = [t azimuthAngleInView:refView];
  }

  StylusInputViewEventEmitter::OnStylusTouch event;
  event.phase = phase;
  event.pointerType = (data.touchType == UITouchTypePencil) ? 1 : 0;
  event.xs = {xs.begin(), xs.end()};
  event.ys = {ys.begin(), ys.end()};
  event.timestamps = {timestamps.begin(), timestamps.end()};
  event.forces = {forces.begin(), forces.end()};
  event.altitudes = {altitudes.begin(), altitudes.end()};
  event.azimuths = {azimuths.begin(), azimuths.end()};
  event.predictedXs = {pxs.begin(), pxs.end()};
  event.predictedYs = {pys.begin(), pys.end()};
  event.predictedTimestamps = {pts.begin(), pts.end()};
  event.predictedForces = {pforces.begin(), pforces.end()};
  event.predictedAltitudes = {palts.begin(), palts.end()};
  event.predictedAzimuths = {pazs.begin(), pazs.end()};
  eventEmitter->onStylusTouch(event);
}

- (const StylusInputViewEventEmitter *)_stylusTouchEmitter
{
  if (!_eventEmitter) {
    return nullptr;
  }
  return static_cast<const StylusInputViewEventEmitter *>(_eventEmitter.get());
}

@end

Class<RCTComponentViewProtocol> StylusInputViewCls(void)
{
  return StylusInputView.class;
}
