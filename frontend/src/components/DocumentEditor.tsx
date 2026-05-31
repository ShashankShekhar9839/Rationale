type Props = {
  value: string;
  onChange: (value: string) => void;
};

const snippets = {
  heading: "## Heading\n",
  bullet: "- Point one\n- Point two\n",
  checklist: "- [ ] Action item\n- [ ] Follow-up\n",
  table:
    "| Option | Pros | Cons |\n| --- | --- | --- |\n| Option A |  |  |\n| Option B |  |  |\n",
  decision: "### Decision\n\n### Context\n\n### Options considered\n\n### Consequences\n",
};

export default function DocumentEditor({ value, onChange }: Props) {
  function insertSnippet(snippet: string) {
    const separator = value && !value.endsWith("\n") ? "\n\n" : "";
    onChange(`${value}${separator}${snippet}`);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-slate-200 bg-[#FBFCFE] p-2">
        <ToolButton onClick={() => insertSnippet(snippets.heading)}>Heading</ToolButton>
        <ToolButton onClick={() => insertSnippet(snippets.bullet)}>Bullets</ToolButton>
        <ToolButton onClick={() => insertSnippet(snippets.checklist)}>Checklist</ToolButton>
        <ToolButton onClick={() => insertSnippet(snippets.table)}>Table</ToolButton>
        <ToolButton onClick={() => insertSnippet(snippets.decision)}>Decision template</ToolButton>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing. Use the toolbar to add sections, tables, and checklists."
        className="min-h-[520px] resize-y border-0 px-8 py-7 font-sans text-base leading-8 shadow-none focus:ring-0"
      />
    </div>
  );
}

function ToolButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-[#339CFF] hover:bg-[#F7FBFF] hover:text-[#147AD6]"
    >
      {children}
    </button>
  );
}
