"use client";
import { useState } from "react";
import { Label } from "./Label";
import { Button } from "./Button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./Select";

export interface Option {
    value: string;
    label: string;
}

export const OptionList = ({
    options,
    selected,
    setSelected,
    menuLabel
}: {
    options: Option[];
    selected: Option;
    setSelected: (option: Option) => void;
    menuLabel: string;
}) => {


    return (
        <Select value={selected.value} onValueChange={(value) => setSelected(options.find(el => el.value === value) ?? { value: "", label: "" })}>
            <SelectTrigger>
                <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent className="border border-accent">
                <SelectGroup>
                    <SelectLabel>{menuLabel}</SelectLabel>
                    {options.map((option, index) => (
                        <SelectItem key={index} value={option.value}>
                            <div className="flex flex-row gap-1 items-center">
                                <span>{option.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )

};


export const OptionGroupOrCustom = ({ value, label, options, onOptionSelect, customLabel, customChild }: { value: string, label: string, options: Option[], onOptionSelect: (option: Option) => void; customLabel: string; customChild: React.ReactNode }) => {
    const [isCustom, setIsCustom] = useState(false);

    const handleChange = (value: string) => {
        const selectedOption = options.find((option) => option.value === value);
        if (selectedOption) {
            onOptionSelect(selectedOption);
            setIsCustom(false);
        }
    };

    const handleCustomChange = () => {
        onOptionSelect({ value: "100", label: "custom" });
        setIsCustom(true);
    };

    return (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <div className="flex flex-row gap-2">
                {options.map((option, idx) => (
                    <div className="flex items-center space-x-2" key={idx}>
                        <Button
                            variant={option.value === value && !isCustom ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleChange(option.value)}
                        >
                            {option.label}
                        </Button>
                    </div>
                ))}
                <div className="flex items-center space-x-2">
                    <Button
                        variant={isCustom ? "default" : "ghost"}
                        size="sm"
                        onClick={handleCustomChange}
                    >
                        {customLabel}
                    </Button>
                </div>
            </div>
            {isCustom && customChild}
        </div>
    )

}
