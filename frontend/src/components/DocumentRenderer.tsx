type Props = {
  content: string;
};

export default function DocumentRenderer({ content }: Props) {
  const blocks = content.trim() ? content.split(/\n{2,}/) : [];

  if (blocks.length === 0) {
    return <p className="text-slate-500">No content added.</p>;
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

function renderBlock(block: string, index: number) {
  const lines = block.split("\n");

  if (lines.every((line) => line.trim().startsWith("|"))) {
    const rows = lines
      .filter((line) => !/^\|\s*-+/.test(line.trim()))
      .map((line) =>
        line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim()),
      );

    const [head, ...body] = rows;

    return (
      <div key={index} className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full border-collapse text-sm">
          {head && (
            <thead className="bg-slate-50">
              <tr>
                {head.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="border-b border-r border-slate-200 px-3 py-2 text-left font-bold text-slate-700 last:border-r-0"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-b border-r border-slate-200 px-3 py-2 last:border-r-0"
                  >
                    {cell || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.startsWith("### ")) {
    return (
      <h3 key={index} className="text-xl font-bold text-slate-950">
        {block.replace(/^###\s*/, "")}
      </h3>
    );
  }

  if (block.startsWith("## ")) {
    return (
      <h2 key={index} className="text-2xl font-bold text-slate-950">
        {block.replace(/^##\s*/, "")}
      </h2>
    );
  }

  if (lines.every((line) => line.trim().startsWith("- "))) {
    return (
      <ul key={index} className="list-disc space-y-2 pl-6 text-slate-700">
        {lines.map((line, lineIndex) => (
          <li key={lineIndex}>{line.replace(/^-\s*/, "")}</li>
        ))}
      </ul>
    );
  }

  return (
    <p key={index} className="whitespace-pre-wrap text-base leading-8 text-slate-700">
      {block}
    </p>
  );
}
