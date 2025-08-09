import React, { useState } from "react";
import EditorModal from "./components/EditorModal";
import { Button } from "@mui/material";

function App() {
  const [open, setOpen] = useState(false);
  const [blocks, setBlocks] = useState([]);

  return (
    <div style={{ padding: 40 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        에디터 열기
      </Button>
      {open && (
        <EditorModal
          blocks={blocks}
          onClose={() => setOpen(false)}
          onSave={(data) => {
            setBlocks(data);
            console.log("저장된 블록:", data);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
