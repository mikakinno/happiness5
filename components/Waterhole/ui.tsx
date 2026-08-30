import { C } from "./palette";

export function Drop({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <path d="M10 2 C 6 8 4 10.5 4 13 a 6 6 0 0 0 12 0 C 16 10.5 14 8 10 2 Z" fill={C.water} />
    </svg>
  );
}

export function Stat({
  label, value, unit, bar, note,
}: {
  label: string;
  value: number | string;
  unit: string;
  bar: number;
  note?: string;
}) {
  return (
    <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: C.line }}>
      <div className="text-xs" style={{ color: C.inkSoft }}>{label}</div>
      <div className="maru mt-0.5"><span className="text-2xl font-bold">{value}</span><span className="text-xs ml-1" style={{ color: C.inkSoft }}>{unit}</span></div>
      <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: C.line }}>
        <div className="h-full rounded-full" style={{ width: `${bar * 100}%`, background: C.water }} />
      </div>
      {note && <div className="text-[10px] mt-1.5 leading-tight" style={{ color: C.inkSoft }}>{note}</div>}
    </div>
  );
}

export function Toggle<T extends string>({
  label, value, set, opts,
}: {
  label: string;
  value: T;
  set: (v: T) => void;
  opts: [T, string][];
}) {
  return (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: C.line }}>
        {opts.map(([v, l]) => (
          <button key={v} onClick={() => set(v)} className="px-2.5 py-1"
            style={{ background: value === v ? C.water : C.paper, color: value === v ? "#fff" : C.inkSoft }}>{l}</button>
        ))}
      </div>
    </div>
  );
}
