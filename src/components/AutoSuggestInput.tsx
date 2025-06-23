import React, { useState, useEffect, useRef } from "react";
import  fetchCitySuggestions from "./fetchCitySuggestions.jsx";
import  fetchCountrySuggestions from "./fetchCountrySuggestions.jsx";
interface AutoSuggestInputProps {
  type: "city" | "country";
  value: string;
  onChange: (val: string) => void;
}

const AutoSuggestInput: React.FC<AutoSuggestInputProps> = ({
  type,
  value,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [debouncedValue, setDebouncedValue] = useState(inputValue);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce input changes by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 250);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    let active = true;
    async function fetchSuggestions() {
      setLoading(true);
      let results: string[] = [];
      if (debouncedValue.trim().length >= 1) {
        if (type === "city") {
          results = await fetchCitySuggestions(debouncedValue.trim());
        } else if (type === "country") {
          results = await fetchCountrySuggestions(debouncedValue.trim());
        }
      }
      if (active) {
        setSuggestions(results);
        setLoading(false);
      }
    }
    fetchSuggestions();
    return () => {
      active = false;
    };
  }, [debouncedValue, type]);

  const handleSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
    onChange(suggestion);
    if (inputRef.current) inputRef.current.blur();
  };

  // Hide suggestions when input value matches exactly one suggestion
  useEffect(() => {
    if (
      suggestions.length === 1 &&
      suggestions[0].toLowerCase() === inputValue.toLowerCase()
    ) {
      setSuggestions([]);
    }
  }, [inputValue, suggestions]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={type === "city" ? "Type city name" : "Type country name"}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        className="w-full border rounded px-3 py-2"
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-2 top-2 text-xs text-gray-400">Loading...</div>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoSuggestInput;

