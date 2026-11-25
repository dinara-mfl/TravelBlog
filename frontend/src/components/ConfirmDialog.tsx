import {useLanguage} from '../i18n/useLanguage'

type ConfirmDialogProps = {
    title: string
    message: string
    confirmLabel: string
    onConfirm: () => void
    onCancel: () => void
}

// Modal question before a destructive action, e.g. deleting an entry
export default function ConfirmDialog({title, message, confirmLabel, onConfirm, onCancel}: Readonly<ConfirmDialogProps>) {
    const {t} = useLanguage()
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                className="w-full max-w-md rounded-card bg-surface p-8 shadow-card"
            >
                <h2 id="confirm-dialog-title" className="text-xl font-bold tracking-tight">
                    {title}
                </h2>
                <p id="confirm-dialog-message" className="mt-2 text-ink-soft">
                    {message}
                </p>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        autoFocus
                        className="min-h-11 cursor-pointer rounded-full border border-line-strong bg-surface px-5 text-[15px] font-semibold text-ink-soft hover:bg-page"
                    >
                        {t.common.cancel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="min-h-11 cursor-pointer rounded-full bg-red-600 px-5 text-[15px] font-semibold text-white hover:bg-red-700"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
