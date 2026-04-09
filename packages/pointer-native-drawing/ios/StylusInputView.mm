#import "StylusInputView.h"
#import "PencilGestureRecognizer.h"

#import <React/RCTFabricComponentsPlugins.h>
#import <react/renderer/components/PointerNativeDrawingSpec/ComponentDescriptors.h>
#import <react/renderer/components/PointerNativeDrawingSpec/EventEmitters.h>
#import <react/renderer/components/PointerNativeDrawingSpec/Props.h>

using namespace facebook::react;

@interface StylusInputView () <PencilGestureRecognizerDelegate>
@end

@implementation StylusInputView {
  PencilGestureRecognizer *_pencilRecognizer;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<StylusInputViewComponentDescriptor>();
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
  }
  return self;
}

#pragma mark - PencilGestureRecognizerDelegate

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer touchBeganWith:(PencilTouchData *)data
{
  [self _emitPhase:0 withData:data];
}

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer touchMovedWith:(PencilTouchData *)data
{
  [self _emitPhase:1 withData:data];
}

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer touchEndedWith:(PencilTouchData *)data
{
  [self _emitPhase:2 withData:data];
}

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer touchCancelledWith:(PencilTouchData *)data
{
  [self _emitPhase:3 withData:data];
}

#pragma mark - Event emission

- (void)_emitPhase:(int)phase withData:(PencilTouchData *)data
{
  auto eventEmitter = [self _stylusTouchEmitter];
  if (!eventEmitter) {
    return;
  }

  NSArray<UITouch *> *touches = data.coalescedTouches;
  UIView *refView = data.referenceView;
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

  StylusInputViewEventEmitter::OnStylusTouch event;
  event.phase = phase;
  event.xs = {xs.begin(), xs.end()};
  event.ys = {ys.begin(), ys.end()};
  event.timestamps = {timestamps.begin(), timestamps.end()};
  event.forces = {forces.begin(), forces.end()};
  event.altitudes = {altitudes.begin(), altitudes.end()};
  event.azimuths = {azimuths.begin(), azimuths.end()};
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
