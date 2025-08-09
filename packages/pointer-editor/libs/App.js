import React, { useState } from 'react';
import { Button } from '@mui/material';

import EditorModal from './components/EditorModal';

function App() {
  const [open, setOpen] = useState(false);
  const [blocks, setBlocks] = useState([]);

  return (
    <div style={{ padding: 40 }}>
      <Button variant='contained' onClick={() => setOpen(true)}>
        에디터 열기
      </Button>
      {open && (
        <EditorModal
          blocks={blocks}
          onClose={() => setOpen(false)}
          onSave={(data) => {
            setBlocks(data);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
