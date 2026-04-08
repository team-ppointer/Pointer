package com.pointernativedrawing;

import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

/**
 * Android stub for StylusInputView.
 * Returns a transparent no-op View so the Android build does not break.
 * Native stylus support (MotionEvent.getHistorical*) is a follow-up.
 */
@ReactModule(name = StylusInputViewManager.NAME)
public class StylusInputViewManager extends SimpleViewManager<View> {
  static final String NAME = "StylusInputView";

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @NonNull
  @Override
  protected View createViewInstance(@NonNull ThemedReactContext context) {
    View view = new View(context);
    view.setBackgroundColor(android.graphics.Color.TRANSPARENT);
    return view;
  }
}
