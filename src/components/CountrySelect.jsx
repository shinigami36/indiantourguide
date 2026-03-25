import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './CountrySelect.css';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belgium', 'Brazil',
  'Bulgaria', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia',
  'Czech Republic', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany',
  'Ghana', 'Greece', 'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kuwait', 'Lebanon', 'Malaysia', 'Maldives', 'Mexico', 'Morocco',
  'Myanmar', 'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
  'Oman', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan',
  'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uzbekistan', 'Vietnam',
];

const CountrySelect = ({ value, onChange, id, name }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? COUNTRIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES;

  // Close on outside click — restore displayed value
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (country) => {
    onChange({ target: { name, value: country } });
    setQuery('');
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (!e.target.value) onChange({ target: { name, value: '' } });
  };

  const handleFocus = () => {
    setQuery('');
    setOpen(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    onChange({ target: { name, value: '' } });
    setOpen(true);
    inputRef.current?.focus();
  };

  // What shows in the input when closed
  const displayValue = open ? query : (value || query);

  return (
    <div className={`cs-wrapper${open ? ' cs-open' : ''}`} ref={containerRef}>
      <div className="cs-input-row">
        <svg className="cs-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="cs-input"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={t('common.countrySearchPlaceholder', { defaultValue: 'Search or select country...' })}
          autoComplete="off"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {value && !open && (
          <button type="button" className="cs-clear" onClick={handleClear} aria-label={t('common.clear', { defaultValue: 'Clear' })}>✕</button>
        )}
        <svg className={`cs-chevron${open ? ' up' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {open && (
        <ul className="cs-list" role="listbox">
          {filtered.length > 0 ? filtered.map(country => (
            <li
              key={country}
              role="option"
              aria-selected={value === country}
              className={`cs-option${value === country ? ' cs-selected' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(country); }}
            >
              {country}
            </li>
          )) : (
            <li className="cs-empty">{t('common.noCountriesFound', { defaultValue: 'No countries found' })}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CountrySelect;
