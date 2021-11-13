import { useCallback, useMemo, useState } from "react";

import { createEditor, Transforms, Editor, Text } from "slate";
import { withReact, Slate, Editable } from "slate-react";

// Define a React component renderer for our code blocks.
const CodeElement = ({ children, attributes }) => {
  return (
    <pre {...attributes}>
      <code>{children}</code>
    </pre>
  );
};

const DefaultElement = ({ children, attributes }) => {
  return <p {...attributes}>{children}</p>;
};

const RichTextEditor = ({ error, required = false }) => {
  const [editorValue, setEditorValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }]
    }
  ]);

  const onChange = (val) => setEditorValue(val);

  const editor = useMemo(() => withReact(createEditor()), []);

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const onKeyDown = (event) => {
    if (event.key === "&") {
      // Prevent the ampersand character from being inserted.
      event.preventDefault();
      // Execute the `insertText` method when the event occurs.
      editor.insertText("and");
    }

    switch (event.key) {
      // When "`" is pressed, keep our existing code block logic.
      case "`": {
        event.preventDefault();
        const [match] = Editor.nodes(editor, {
          match: (n) => n.type === "code"
        });
        Transforms.setNodes(
          editor,
          { type: match ? "paragraph" : "code" },
          { match: (n) => Editor.isBlock(editor, n) }
        );
        break;
      }
      // When "B" is pressed, bold the text in the selection.
      case "b": {
        event.preventDefault();
        Transforms.setNodes(
          editor,
          { bold: true },
          // Apply it to text nodes, and split the text node up if the
          // selection is overlapping only part of it.
          { match: (n) => Text.isText(n), split: true }
        );
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="flexColumn">
      <label className="smallText bold m-t-10 m-b-15 flexRow alignCenter">
        {required && <span className="danger m-r-5">*</span>}
        Description
      </label>
      <Slate editor={editor} value={editorValue} onChange={onChange}>
        <Editable renderElement={renderElement} onKeyDown={onKeyDown} />
      </Slate>
      {error && (
        <span theme="danger" className="extraSmallText">
          {error}
        </span>
      )}
    </div>
  );
};

export default RichTextEditor;
