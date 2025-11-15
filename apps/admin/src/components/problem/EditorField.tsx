import { useCallback, useRef } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { ProblemEditor, type TiptapPayload } from '@team-ppointer/pointer-editor-v2';
import { getEmptyContentString, parseEditorContent, serializeEditorPayload } from '@utils';

interface EditorFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  onPayloadChange?: (payload: TiptapPayload) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ocrApiCall?: ((data: any) => Promise<any>) | null;
  useContainerPortal?: boolean;
}

interface EditorFieldContentProps {
  value?: string;
  onSerializedChange: (serialized: string, payload: TiptapPayload) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ocrApiCall?: ((data: any) => Promise<any>) | null;
  useContainerPortal?: boolean;
}

const EditorFieldContent = ({
  value,
  onSerializedChange,
  ocrApiCall,
  useContainerPortal,
}: EditorFieldContentProps) => {
  const initialJSONRef = useRef(parseEditorContent(value));

  const handleChange = useCallback(
    (payload: TiptapPayload) => {
      const serialized = serializeEditorPayload(payload);
      onSerializedChange(serialized, payload);
    },
    [onSerializedChange]
  );

  return (
    <ProblemEditor
      initialJSON={initialJSONRef.current}
      onChange={handleChange}
      ocrApiCall={ocrApiCall ?? null}
      useContainerPortal={useContainerPortal}
    />
  );
};

export const EditorField = <TFieldValues extends FieldValues>({
  control,
  name,
  onPayloadChange,
  ocrApiCall,
  useContainerPortal,
}: EditorFieldProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultValue={getEmptyContentString() as any}
      render={({ field: { value, onChange } }) => {
        const safeNotify = (serialized: string, payload: TiptapPayload) => {
          if (serialized === value) return;
          const schedule =
            typeof queueMicrotask === 'function'
              ? queueMicrotask
              : (fn: () => void) => {
                  Promise.resolve().then(fn);
                };
          schedule(() => {
            onChange(serialized);
            onPayloadChange?.(payload);
          });
        };

        return (
          <EditorFieldContent
            value={value}
            ocrApiCall={ocrApiCall}
            useContainerPortal={useContainerPortal}
            onSerializedChange={safeNotify}
          />
        );
      }}
    />
  );
};
