#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@class PencilGestureRecognizer;

/// Data collected from a single gesture recognizer callback,
/// including all coalesced touch samples.
@interface PencilTouchData : NSObject

@property (nonatomic, readonly) NSArray<UITouch *> *coalescedTouches;
@property (nonatomic, readonly) NSArray<UITouch *> *predictedTouches;
@property (nonatomic, readonly) UIView *referenceView;
@property (nonatomic, readonly) UITouchType touchType;

- (instancetype)initWithCoalescedTouches:(NSArray<UITouch *> *)coalesced
                       predictedTouches:(NSArray<UITouch *> *)predicted
                           referenceView:(UIView *)view
                               touchType:(UITouchType)touchType;

@end

/// Protocol for receiving structured pencil touch data with coalesced samples.
@protocol PencilGestureRecognizerDelegate <NSObject>

- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer
         touchBeganWith:(PencilTouchData *)data;
- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer
         touchMovedWith:(PencilTouchData *)data;
- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer
         touchEndedWith:(PencilTouchData *)data;
- (void)pencilRecognizer:(PencilGestureRecognizer *)recognizer
     touchCancelledWith:(PencilTouchData *)data;

@end

/// A gesture recognizer that recognizes Apple Pencil touches and,
/// when acceptsFingerInput is YES, also direct (finger) touches.
/// When finger input is disabled, finger touches are immediately
/// failed so they fall through to underlying gesture recognizers
/// (e.g. RNGH PanGestureHandler).
///
/// Coalesced touch data is forwarded via the pencilDelegate because
/// UIGestureRecognizer action selectors do not receive the UIEvent.
@interface PencilGestureRecognizer : UIGestureRecognizer

@property (nonatomic, weak, nullable) id<PencilGestureRecognizerDelegate> pencilDelegate;

/// When YES, finger (UITouchTypeDirect) touches are accepted in
/// addition to pencil touches. Default is NO (pencil only).
@property (nonatomic) BOOL acceptsFingerInput;

@end

NS_ASSUME_NONNULL_END
