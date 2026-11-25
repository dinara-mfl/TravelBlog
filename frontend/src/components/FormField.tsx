import type {InputHTMLAttributes, ReactNode} from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    // Usually a plain text; can also contain markup, e.g. a grey "(optional)"
    label: ReactNode
    error?: string
}

// Label with input, styled like the rest of the app; shows a field error below the input
export default function FormField({label, id, error, ...inputProps}: Readonly<FormFieldProps>) {
    const borderClass = error ? 'border-danger' : 'border-line-strong'

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-semibold text-ink-soft">
                {label}
            </label>
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`min-h-12 rounded-xl border ${borderClass} bg-surface px-4 text-[15px] text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent-soft`}
                {...inputProps}
            />
            {error && (
                <p id={`${id}-error`} className="text-sm text-danger">
                    {error}
                </p>
            )}
        </div>
    )
}