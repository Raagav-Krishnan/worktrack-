interface NeoToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export default function NeoToggle({ checked, onChange, label }: NeoToggleProps) {
  return (
    <div className="flex items-center gap-3" onClick={() => onChange(!checked)}>
      <div className={`neo-toggle ${checked ? 'active' : ''}`}>
        <div className="neo-toggle-knob" />
      </div>
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
