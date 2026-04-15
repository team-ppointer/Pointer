import React, {useCallback, useRef, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {DrawingCanvas} from 'pointer-native-drawing';
import type {
  DrawingCanvasRef,
  Stroke,
  ActiveTool,
} from 'pointer-native-drawing';

const COLORS = ['#1E1E21', '#E53935', '#1E88E5', '#43A047', '#8E24AA'];
const WIDTHS = [1, 3.9, 7.5];
const TOOLS: {key: ActiveTool; label: string}[] = [
  {key: 'pen', label: 'Pen'},
  {key: 'eraser', label: 'Eraser'},
  {key: 'textbox', label: 'Text'},
];

function App(): React.JSX.Element {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [strokeColor, setStrokeColor] = useState(COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [activeTool, setActiveTool] = useState<ActiveTool>('pen');
  const [strokeCount, setStrokeCount] = useState(0);
  const [enableZoomPan, setEnableZoomPan] = useState(false);
  const [undoState, setUndoState] = useState({canUndo: false, canRedo: false});

  const handleChange = useCallback((strokes: Stroke[]) => {
    setStrokeCount(strokes.length);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Drawing Example</Text>
        <Text style={styles.strokeCount}>{strokeCount} strokes</Text>
      </View>

      <View style={styles.canvasContainer}>
        <DrawingCanvas
          ref={canvasRef}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          activeTool={activeTool}
          enableZoomPan={enableZoomPan}
          onChange={handleChange}
          onUndoStateChange={setUndoState}
          stylusInput="auto"
          pencilOnly
        />
      </View>

      <View style={styles.toolbar}>
        {/* Tool selector */}
        <View style={styles.row}>
          <Text style={styles.label}>Tool</Text>
          <View style={styles.options}>
            {TOOLS.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.actionButton,
                  activeTool === t.key && styles.activeAction,
                ]}
                onPress={() => setActiveTool(t.key)}>
                <Text
                  style={[
                    styles.actionText,
                    activeTool === t.key && styles.activeActionText,
                  ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color selector */}
        <View style={styles.row}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.options}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  {backgroundColor: color},
                  strokeColor === color && styles.selected,
                ]}
                onPress={() => setStrokeColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Width selector */}
        <View style={styles.row}>
          <Text style={styles.label}>Width</Text>
          <View style={styles.options}>
            {WIDTHS.map(w => (
              <TouchableOpacity
                key={w}
                style={[
                  styles.widthButton,
                  strokeWidth === w && styles.selectedWidth,
                ]}
                onPress={() => setStrokeWidth(w)}>
                <View
                  style={[
                    styles.widthDot,
                    {
                      width: w * 3,
                      height: w * 3,
                      borderRadius: (w * 3) / 2,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.actionButton, !undoState.canUndo && styles.disabled]}
            disabled={!undoState.canUndo}
            onPress={() => canvasRef.current?.undo()}>
            <Text style={[styles.actionText, !undoState.canUndo && styles.disabledText]}>
              Undo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, !undoState.canRedo && styles.disabled]}
            disabled={!undoState.canRedo}
            onPress={() => canvasRef.current?.redo()}>
            <Text style={[styles.actionText, !undoState.canRedo && styles.disabledText]}>
              Redo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, enableZoomPan && styles.activeAction]}
            onPress={() => setEnableZoomPan(prev => !prev)}>
            <Text
              style={[
                styles.actionText,
                enableZoomPan && styles.activeActionText,
              ]}>
              Zoom
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => canvasRef.current?.clear()}>
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F5F5F5'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  title: {fontSize: 18, fontWeight: '700', color: '#1E1E21'},
  strokeCount: {fontSize: 14, color: '#888'},
  canvasContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {width: 48, fontSize: 12, color: '#888'},
  options: {flexDirection: 'row', gap: 8},
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {borderColor: '#007AFF', borderWidth: 3},
  widthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  selectedWidth: {backgroundColor: '#D0E8FF'},
  widthDot: {backgroundColor: '#1E1E21'},
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  activeAction: {backgroundColor: '#1E1E21'},
  actionText: {fontSize: 14, fontWeight: '600', color: '#333'},
  activeActionText: {color: '#FFF'},
  disabled: {opacity: 0.4},
  disabledText: {color: '#999'},
});

export default App;
