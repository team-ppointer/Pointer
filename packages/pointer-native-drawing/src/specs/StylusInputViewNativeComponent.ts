import type { ViewProps } from "react-native";
import type {
  DirectEventHandler,
  Double,
  Int32,
} from "react-native/Libraries/Types/CodegenTypes";
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

type StylusTouchEvent = Readonly<{
  phase: Int32; // 0=began, 1=moved, 2=ended, 3=cancelled
  // Parallel arrays — one entry per coalesced touch sample.
  // Using parallel arrays to work around react-native#47113
  // (codegen nested-object-in-array bug).
  xs: Double[];
  ys: Double[];
  timestamps: Double[]; // ms since system boot (UITouch.timestamp * 1000)
  forces: Double[]; // 0..1 normalized
  altitudes: Double[]; // radians, 0=parallel π/2=perpendicular
  azimuths: Double[]; // radians, UIKit convention (0=right, increases CW)
  // Predicted touches — iOS-estimated future positions (1-2 samples ahead).
  // Used for rendering only, NOT committed to stroke model.
  predictedXs: Double[];
  predictedYs: Double[];
  predictedTimestamps: Double[];
  predictedForces: Double[];
  predictedAltitudes: Double[];
  predictedAzimuths: Double[];
}>;

export interface NativeProps extends ViewProps {
  onStylusTouch: DirectEventHandler<StylusTouchEvent>;
}

export default codegenNativeComponent<NativeProps>("StylusInputView");
