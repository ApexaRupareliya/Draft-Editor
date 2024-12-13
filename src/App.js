import React, { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const styelMap = {
  RED: {
    color: "red",
  },
};

const App = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  // Load saved content from localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  // Save content to localStorage
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContent));
    alert("Content saved!");
  };

  // Handle custom input formatting
  const handleBeforeInput = (chars) => {
    const selection = editorState.getSelection();
    const currentBlock = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());
    const blockText = currentBlock.getText();

    console.log({ selection, currentBlock, blockText, chars });

    if (selection.getAnchorOffset() >= 0) {
      let newEditorState;

      if (chars === " " && blockText === "#") {
        newEditorState = RichUtils.toggleBlockType(
          removeTriggerCharacter(editorState),
          "header-one"
        );
      } else if (chars === " " && blockText === "*") {
        newEditorState = RichUtils.toggleInlineStyle(
          removeTriggerCharacter(editorState),
          "BOLD"
        );
      } else if (chars === " " && blockText === "**") {
        newEditorState = RichUtils.toggleInlineStyle(
          removeTriggerCharacter(editorState),
          "RED"
        );
      } else if (chars === " " && blockText === "***") {
        newEditorState = RichUtils.toggleInlineStyle(
          removeTriggerCharacter(editorState),
          "UNDERLINE"
        );
      }

      if (newEditorState) {
        setEditorState(newEditorState);
        return "handled";
      }
    }
    return "not-handled";
  };

  // Helper: Remove trigger characters (#, *, , ***)
  const removeTriggerCharacter = (editorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());

    const newContentState = Modifier.replaceText(
      contentState,
      selection.merge({
        anchorOffset: 0,
        focusOffset: currentBlock.getLength(),
      }),
      ""
    );
    return EditorState.push(editorState, newContentState, "remove-range");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Demo Editor By Apexa Bhanderi</h2>
        <button onClick={saveContent} style={{ marginBottom: "10px" }}>
          Save
        </button>
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          minHeight: "200px",
          padding: "10px",
          cursor: "text",
        }}
        onClick={() => document.querySelector(".DraftEditor-root").focus()}
      >
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styelMap}
        />
      </div>
    </div>
  );
};

export default App;
