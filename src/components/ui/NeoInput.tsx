interface NeoInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  step?: string;
}

export default function NeoInput({ label, type = 'text', value, onChange, placeholder, className = '', min, step }: NeoInputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className="neo-inset px-4 py-3 text-sm text-gray-700 w-full outline-none focus:ring-2 focus:ring-soft-indigo/30 transition-all"
      />
    </div>
  );
}
