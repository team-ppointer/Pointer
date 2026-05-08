#import "PencilGestureRecognizer.h"
#import <UIKit/UIGestureRecognizerSubclass.h>

@implementation PencilTouchData

- (instancetype)initWithCoalescedTouches:(NSArray<UITouch *> *)coalesced
                       predictedTouches:(NSArray<UITouch *> *)predicted
                           referenceView:(UIView *)view
                               touchType:(UITouchType)touchType
{
  if (self = [super init]) {
    _coalescedTouches = [coalesced copy];
    _predictedTouches = [predicted copy];
    _referenceView = view;
    _touchType = touchType;
  }
  return self;
}

@end

@implementation PencilGestureRecognizer {
  UITouch *_trackedTouch;
  UITouchType _trackedTouchType;
  PencilTouchData *_pendingBeganData; // deferred began for finger input
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (_trackedTouch != nil) {
    // Already tracking a touch — handle additional fingers
    if (self.acceptsFingerInput) {
      if (_pendingBeganData) {
        // Drawing never actually started — silently fail so RNGH zoom/pan takes over
        _pendingBeganData = nil;
        _trackedTouch = nil;
        self.state = UIGestureRecognizerStateFailed;
        return;
      }
      // Drawing already started — cancel it
      PencilTouchData *data = [[PencilTouchData alloc]
          initWithCoalescedTouches:@[_trackedTouch]
                 predictedTouches:@[]
                    referenceView:self.view
                        touchType:_trackedTouchType];
      [self.pencilDelegate pencilRecognizer:self touchCancelledWith:data];
      self.state = UIGestureRecognizerStateCancelled;
      _trackedTouch = nil;
      return;
    }
    // Pencil-only mode: ignore extra touches (existing behavior)
    for (UITouch *touch in touches) {
      [self ignoreTouch:touch forEvent:event];
    }
    return;
  }

  for (UITouch *touch in touches) {
    BOOL isAccepted = (touch.type == UITouchTypePencil) ||
                      (self.acceptsFingerInput && touch.type == UITouchTypeDirect);
    if (isAccepted) {
      _trackedTouch = touch;
      _trackedTouchType = touch.type;

      NSArray<UITouch *> *coalesced = [event coalescedTouchesForTouch:touch] ?: @[touch];
      NSArray<UITouch *> *predicted = [event predictedTouchesForTouch:touch] ?: @[];
      PencilTouchData *data = [[PencilTouchData alloc] initWithCoalescedTouches:coalesced
                                                               predictedTouches:predicted
                                                                  referenceView:self.view
                                                                      touchType:_trackedTouchType];

      if (touch.type == UITouchTypeDirect) {
        // Finger: defer Began until first touchesMoved — gives time for
        // a 2nd finger to arrive (zoom/pan intent) before committing to draw.
        // Stay in Possible so we can transition to Failed if 2nd finger arrives.
        _pendingBeganData = data;
        return;
      }

      // Pencil: immediate began (always drawing intent)
      self.state = UIGestureRecognizerStateBegan;
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
      // Flush deferred began before emitting moved
      if (_pendingBeganData) {
        self.state = UIGestureRecognizerStateBegan;
        [self.pencilDelegate pencilRecognizer:self touchBeganWith:_pendingBeganData];
        _pendingBeganData = nil;
      } else {
        self.state = UIGestureRecognizerStateChanged;
      }

      NSArray<UITouch *> *coalesced = [event coalescedTouchesForTouch:touch] ?: @[touch];
      NSArray<UITouch *> *predicted = [event predictedTouchesForTouch:touch] ?: @[];
      PencilTouchData *data = [[PencilTouchData alloc] initWithCoalescedTouches:coalesced
                                                               predictedTouches:predicted
                                                                  referenceView:self.view
                                                                      touchType:_trackedTouchType];
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
      // Flush deferred began if finger was tapped without moving
      if (_pendingBeganData) {
        self.state = UIGestureRecognizerStateBegan;
        [self.pencilDelegate pencilRecognizer:self touchBeganWith:_pendingBeganData];
        _pendingBeganData = nil;
      }

      NSArray<UITouch *> *coalesced = [event coalescedTouchesForTouch:touch] ?: @[touch];
      NSArray<UITouch *> *predicted = [event predictedTouchesForTouch:touch] ?: @[];
      PencilTouchData *data = [[PencilTouchData alloc] initWithCoalescedTouches:coalesced
                                                               predictedTouches:predicted
                                                                  referenceView:self.view
                                                                      touchType:_trackedTouchType];
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
                                                                  referenceView:self.view
                                                                      touchType:_trackedTouchType];
      [self.pencilDelegate pencilRecognizer:self touchCancelledWith:data];

      self.state = UIGestureRecognizerStateCancelled;
      _trackedTouch = nil;
      return;
    }
  }
}

// Allow RNGH gesture recognizers to run simultaneously — the native
// recognizer must not block 2-finger zoom/pan on the parent view.
- (BOOL)canPreventGestureRecognizer:(UIGestureRecognizer *)preventedGestureRecognizer
{
  return NO;
}

- (BOOL)canBePreventedByGestureRecognizer:(UIGestureRecognizer *)preventingGestureRecognizer
{
  return NO;
}

- (void)reset
{
  [super reset];
  _trackedTouch = nil;
  _trackedTouchType = UITouchTypeDirect;
  _pendingBeganData = nil;
}

@end
