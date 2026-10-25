import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronDown, Edit3, List, Check } from "lucide-react";
import { BRAZILIAN_STATES, parseLocation, formatCityState } from "@/data/brazilLocations";

interface StateCitySelectProps {
  value: string;
  onChange: (fullLocation: string, details?: { uf: string; city: string }) => void;
  label?: string;
  stateLabel?: string;
  cityLabel?: string;
  helpText?: string;
  className?: string;
}

export function StateCitySelect({
  value,
  onChange,
  label = "Cidade e Estado onde você atende",
  stateLabel = "Estado (UF)",
  cityLabel = "Cidade",
  helpText,
  className = "",
}: StateCitySelectProps) {
  const parsed = parseLocation(value);

  const [selectedUf, setSelectedUf] = useState<string>(parsed.uf || "");
  const [selectedCity, setSelectedCity] = useState<string>(parsed.city || "");
  const [isManualCity, setIsManualCity] = useState<boolean>(parsed.isCustom);

  // Sync internal state when external value changes
  useEffect(() => {
    const next = parseLocation(value);
    if (next.uf) setSelectedUf(next.uf);
    if (!isManualCity) {
      if (next.city) setSelectedCity(next.city);
    } else {
      if (next.city && next.city.trim() !== selectedCity.trim()) {
        setSelectedCity(next.city);
      }
    }
    if (next.isCustom) setIsManualCity(true);
  }, [value, isManualCity, selectedCity]);

  const currentStateObj = BRAZILIAN_STATES.find((s) => s.uf === selectedUf);
  const cityList = currentStateObj?.cities || [];

  const handleStateChange = (newUf: string) => {
    setSelectedUf(newUf);
    setSelectedCity("");
    setIsManualCity(false);

    if (!newUf) {
      onChange("");
      return;
    }

    // If there's no city yet, trigger empty or keep UF in mind
    onChange("");
  };

  const handleCitySelectChange = (cityVal: string) => {
    if (cityVal === "__OUTRA_CIDADE__") {
      setIsManualCity(true);
      setSelectedCity("");
      return;
    }

    setSelectedCity(cityVal);
    const formatted = formatCityState(cityVal, selectedUf);
    onChange(formatted, { uf: selectedUf, city: cityVal });
  };

  const handleManualCityChange = (manualVal: string) => {
    setSelectedCity(manualVal);
    const formatted = selectedUf ? formatCityState(manualVal, selectedUf) : manualVal;
    onChange(formatted, { uf: selectedUf, city: manualVal });
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-semibold text-[#38584f]">
            <MapPin className="h-4 w-4 text-[#759021] shrink-0" />
            <span>{label}</span>
          </Label>
          {selectedUf && selectedCity && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f7dd] px-2.5 py-0.5 text-xs font-semibold text-[#566c0e] max-w-full truncate">
              <Check className="h-3 w-3 shrink-0" />
              <span className="truncate">{formatCityState(selectedCity, selectedUf)}</span>
            </span>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-12 w-full min-w-0">
        {/* ESTADO (UF) */}
        <div className="sm:col-span-4 min-w-0">
          <Label className="mb-1.5 block text-xs font-medium text-[#5c756d]">
            {stateLabel}
          </Label>
          <div className="relative w-full min-w-0">
            <select
              value={selectedUf}
              onChange={(e) => handleStateChange(e.target.value)}
              className="h-11 w-full min-w-0 appearance-none rounded-xl border border-[#dce5dc] bg-white px-3 py-2 pr-9 text-sm font-medium text-[#173a34] shadow-xs transition hover:border-[#b8cbb8] focus:border-[#173a34] focus:outline-hidden focus:ring-2 focus:ring-[#173a34]/15 truncate"
            >
              <option value="">Selecione o Estado...</option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={state.uf} value={state.uf}>
                  {state.uf} - {state.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#789088]" />
          </div>
        </div>

        {/* CIDADE */}
        <div className="sm:col-span-8 min-w-0">
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="block text-xs font-medium text-[#5c756d]">
              {cityLabel}
            </Label>
            {selectedUf && (
              <button
                type="button"
                onClick={() => {
                  setIsManualCity(!isManualCity);
                  setSelectedCity("");
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#557718] hover:underline shrink-0"
              >
                {isManualCity ? (
                  <>
                    <List className="h-3 w-3" />
                    Escolher da lista
                  </>
                ) : (
                  <>
                    <Edit3 className="h-3 w-3" />
                    Digitar manualmente
                  </>
                )}
              </button>
            )}
          </div>

          {!selectedUf ? (
            <div className="flex h-11 items-center rounded-xl border border-dashed border-[#dce5dc] bg-[#f7f9f5] px-3 text-xs text-[#82978f] w-full min-w-0 truncate">
              <span className="truncate">⬅️ Primeiro selecione o Estado (UF) para ver as cidades</span>
            </div>
          ) : isManualCity ? (
            <div className="relative w-full min-w-0">
              <Input
                type="text"
                value={selectedCity}
                onChange={(e) => handleManualCityChange(e.target.value)}
                placeholder={`Digite o nome da cidade em ${selectedUf}...`}
                className="h-11 w-full min-w-0 rounded-xl border-[#dce5dc] bg-white text-sm font-medium text-[#173a34] focus:border-[#173a34]"
                autoFocus
              />
            </div>
          ) : (
            <div className="relative w-full min-w-0">
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelectChange(e.target.value)}
                className="h-11 w-full min-w-0 appearance-none rounded-xl border border-[#dce5dc] bg-white px-3 py-2 pr-9 text-sm font-medium text-[#173a34] shadow-xs transition hover:border-[#b8cbb8] focus:border-[#173a34] focus:outline-hidden focus:ring-2 focus:ring-[#173a34]/15 truncate"
              >
                <option value="">Selecione sua cidade...</option>
                {cityList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value="__OUTRA_CIDADE__">
                  ➕ Outra cidade (Digitar manualmente)...
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#789088]" />
            </div>
          )}
        </div>
      </div>

      {helpText && (
        <p className="text-xs text-[#71867f]">{helpText}</p>
      )}
    </div>
  );
}
