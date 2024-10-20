import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/app/utils/shadcn"
import { Label } from "./Label"

const inputVariants = cva(
    "flex h-9 w-full bg-accent1 rounded-lg text-foreground border border-accent1 px-3 py-1 text-sm shadow-sm transition-colors max-w-sm items-center gap-1.5 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
    {
        variants: {
            variant: {
                default: "bg-accent1 border-none ",
                outline: "bg-accent2 focus-visible:ring-accent2 focus-visible:ring-1",
                error: "ring-error ring-1",
                success: "focus-visible:ring-success focus-visible:ring-1",
            }

        },
        defaultVariants: {
            variant: "default",
        }
    }
)

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
    asChild?: boolean
}


const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, size, type, ...props }, ref) => {
        return (
            <input
                className={cn(
                    inputVariants({ variant, className })
                )}
                type={type}

                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"


const FormInput = ({
    value,
    label,
    placeholder,
    onChange,
    error,
    inputType
}: {
    value: string;
    label: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: string[];
    inputType: string;
}) => {
    return (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <Input
                variant={error ? "error" : "outline"}
                type={inputType}
                autoComplete="off"
                onWheel={(e) => e.currentTarget.blur()}
                spellCheck="false"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
            {error && (
                <Label>
                    <p className="text-error max-w-sm break-words">{error.join(",")}</p>
                </Label>
            )}
        </div>
    )
}

export { Input, FormInput, inputVariants }