import '../index.css';
import { PointerEditor, type TiptapPayload } from '../editor';

export const ProblemEditor = ({
  initialJSON,
  onChange,
  useContainerPortal = true,
  ocrApiCall = null,
}: {
  initialJSON?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onChange: (payload: TiptapPayload) => void;
  /** Whether to portal popups to the editor container instead of document.body */
  useContainerPortal?: boolean;
  ocrApiCall?: ((data: any) => Promise<any>) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}) => {
  return (
    <div className='pointer-editor-root h-full w-full overflow-hidden'>
      <PointerEditor
        initialJSON={initialJSON}
        onChange={onChange}
        useContainerPortal={useContainerPortal}
        ocrApiCall={ocrApiCall}
      />
    </div>
  );
};
