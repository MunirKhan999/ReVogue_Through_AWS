import React, { cloneElement, useState, useEffect, useRef } from "react";

type RadioGroupProps = {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">;

function findRadioGroupItems(children: React.ReactNode, value: string | undefined, internalValue: string, handleChange: (val: string) => void): React.ReactNode {
  return React.Children.map(children, (child: any) => {
    if (!child) return child;
    
    // If it's a RadioGroupItem, clone it with the proper props
    if (child.type && child.type.displayName === "RadioGroupItem") {
      return cloneElement(child, {
        checked: value !== undefined ? child.props.value === value : child.props.value === internalValue,
        onChange: () => handleChange(child.props.value),
      });
    }
    
    // If it has children, recursively process them
    if (child.props && child.props.children) {
      return cloneElement(child, {
        ...child.props,
        children: findRadioGroupItems(child.props.children, value, internalValue, handleChange),
      });
    }
    
    return child;
  });
}

export function RadioGroup({ children, value, onValueChange, ...props }: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  
  // Sync internal state with prop value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  const handleChange = (val: string) => {
    setInternalValue(val);
    onValueChange?.(val);
  };
  
  return (
    <div {...props}>
      {findRadioGroupItems(children, value, internalValue, handleChange)}
    </div>
  );
}
// Simple hash function to create deterministic IDs
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export function RadioGroupItem({ value, checked, onChange, children }: { value: string; checked?: boolean; onChange?: () => void; children?: React.ReactNode }) {
  // Use a deterministic ID based on the value to avoid hydration mismatches
  const inputId = React.useMemo(() => `radio-${value}-${hashString(value)}`, [value]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleLabelClick = () => {
    if (inputRef.current && onChange) {
      inputRef.current.checked = true;
      onChange();
    }
  };
  
  return (
    <label 
      htmlFor={inputId}
      className="flex items-center space-x-2 cursor-pointer group select-none w-full py-1"
      onClick={handleLabelClick}
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        <input 
          ref={inputRef}
          id={inputId}
          type="radio" 
          value={value} 
          checked={checked || false} 
          onChange={onChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 m-0"
        />
        <div 
          className={`w-4 h-4 rounded-full border-2 transition-all pointer-events-none ${
            checked 
              ? 'border-brand bg-brand' 
              : 'border-muted-foreground group-hover:border-brand/50'
          }`}
          aria-hidden="true"
        >
          {checked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          )}
        </div>
      </div>
      <span 
        className={`text-sm transition-colors flex-1 ${
          checked ? 'text-foreground font-medium' : 'text-muted-foreground'
        }`}
      >
        {children || value}
      </span>
    </label>
  );
}
RadioGroupItem.displayName = "RadioGroupItem";
