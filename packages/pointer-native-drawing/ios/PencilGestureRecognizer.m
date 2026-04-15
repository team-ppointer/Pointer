#import "PencilGestureRecognizer.h"
#import <UIKit/UIGestureRecognizerSubclass.h>

@implementation PencilTouchData

- (instancetype)initWithCoalescedTouches:(NSArray<UITouch *> *)coalesced
                       predictedTouches:(NSArray<UITouch *> *)predicted
                           referenceView:(UIView *)view
{
  if (self = [super init]) {
    _coalescedTouches = [coalesced copy];
    _predictedTouches = [predicted copy];
    _referenceView = view;
  }
  return self;
}

@end

@implementation PencilGestureRecognizer {
  UITouch *_trackedTouch;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (_trackedTouch != nil) {
    for (UITouch *touch in touches) {
      [self ignoreTouch:touch forEvent:event];
    }
    return;
  }

  for (UITouch *touch in touches) {
    if (touch.type == UITouchTypePencil) {
      _trackedTouch = touch;
      self.state = UIGestureRecognizerStateBegan;

      NSArray<UITouch *> *coalesced = [event coalescedTouchesForTouch:touch] ?: @[touch];
      NSArray<UITouch *> *predicted = [event predictedTouchesForTouch:touch] ?: @[];
      PencilTouchData *data = [[PencilTouchData alloc] initWithCoalescedTouches:coalesced
                                                               predictedTouches:predicted
                                                                  referenceView:self.view];
      [self.pencilDelegate pencilRecognizer:self touchBeganWith:data];
      return;
    }
  }

  self.state = UIGestureRecognizerStateFailed;
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (_trackedTouch == nil) {
    return;
  }

  for (UITouch *touch in touches) {
    if (touch == _trackedTouch) {
      self.state = UIGestureRecognizerStateChanged;

      NSArray<UITouch *> *coalesced = [event coalescedTouchesForTouch:touch] ?: @[touch];
      NSArray<UITouch *> *predicted = [event predictedTouchesForTouch:touch] ?: @[];
      PencilTouchData *data = [[PencilTouchData alloc] initWithCoalescedTouches:coalesced
                                                               predictedTouches:predicted
                                                                  referenceView:self.view];
      [self.pencilDelegate pencilRecognizer:self touchMovedWith:data];
      return;
    }
  }
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (_trackedTouch == nil) {
    return;
  }

  for (UITouch *touch in touches) {
    if (touch == _trackedTouch) {
      NSArray<UITouch *> *coalesced = [event coalescedTouchesForTouch:touch] ?: @[touch];
      NSArray<UITouch *> *predicted = [event predictedTouchesForTouch:touch] ?: @[];
      PencilTouchData *data = [[PencilTouchData alloc] initWithCoalescedTouches:coalesced
                                                               predictedTouches:predicted
                                                                  referenceView:self.view];
      [self.pencilDelegate pencilRecognizer:self touchEndedWith:data];

      self.state = UIGestureRecognizerStateEnded;
      _trackedTouch = nil;
      return;
    }
  }
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (_trackedTouch == nil) {
    return;
  }

  for (UITouch *touch in touches) {
    if (touch == _trackedTouch) {
      NSArray<UITouch *> *coalesced = @[touch];
      PencilTouchData *data = [[PencilTouchData alloc] initWithCoalescedTouches:coalesced
                                                               predictedTouches:@[]
                                                                  referenceView:self.view];
      [self.pencilDelegate pencilRecognizer:self touchCancelledWith:data];

      self.state = UIGestureRecognizerStateCancelled;
      _trackedTouch = nil;
      return;
    }
  }
}

- (void)reset
{
  [super reset];
  _trackedTouch = nil;
}

@end
