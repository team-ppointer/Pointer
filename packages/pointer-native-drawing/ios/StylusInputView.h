#import <React/RCTViewComponentView.h>
#import "CatmullRomPathBuilder.h"

NS_ASSUME_NONNULL_BEGIN

@interface StylusInputView : RCTViewComponentView

/// Active view instance for JSI config sync.
+ (nullable StylusInputView *)activeView;

/// Update path building config from JS.
- (void)setPathConfig:(const PointerNativeDrawing::Config &)config
        targetSpacing:(double)spacing
      smoothingFactor:(double)factor
        strokeWidth:(double)width;

@end

NS_ASSUME_NONNULL_END
