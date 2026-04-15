#pragma once

#include <memory>

#include "RNSkPlatformContext.h"

namespace facebook {
namespace jsi {
class Runtime;
}
} // namespace facebook

namespace PointerNativeDrawing {

/// Install __PointerNativeDrawing_build* global JSI functions on the runtime.
/// @param context  Skia platform context obtained from SkiaManager.
void installPathBuilder(
    facebook::jsi::Runtime &runtime,
    std::shared_ptr<RNSkia::RNSkPlatformContext> context);

} // namespace PointerNativeDrawing
