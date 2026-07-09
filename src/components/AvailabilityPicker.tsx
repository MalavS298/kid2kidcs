import { Clock } from "lucide-react";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const SLOTS = ["Morning (8–12)", "Afternoon (12–5)", "Evening (5–9)"];

export const ALL_SLOT_KEYS = DAYS.flatMap(d => SLOTS.map(s => `${d} ${s}`));

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  accent?: string; // tailwind color class e.g. "primary" or "orange"
};

const AvailabilityPicker = ({ value, onChange, accent = "primary" }: Props) => {
  const toggle = (key: string) => {
    onChange(value.includes(key) ? value.filter(k => k !== key) : [...value, key]);
  };

  const on = "bg-primary text-primary-foreground border-primary";
  const off = "bg-secondary/50 hover:bg-secondary border-transparent text-muted-foreground";

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>Select every slot that works for you (all times in your local time).</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th></th>
              {DAYS.map(d => <th key={d} className="font-medium text-muted-foreground pb-1">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map(slot => (
              <tr key={slot}>
                <td className="pr-2 text-muted-foreground text-right whitespace-nowrap">{slot}</td>
                {DAYS.map(d => {
                  const key = `${d} ${slot}`;
                  const selected = value.includes(key);
                  return (
                    <td key={key}>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className={`w-full h-9 rounded-md border transition-colors ${selected ? on : off}`}
                        aria-pressed={selected}
                      >
                        {selected ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{value.length} slot{value.length === 1 ? "" : "s"} selected</p>
    </div>
  );
};

export default AvailabilityPicker;
