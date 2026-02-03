import toastStyles from './Toast.module.css'

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null

  const { message, type = 'info', onUndo } = toast

  return (
    <div className={toastStyles.toastContainer}>
      <div className={`${toastStyles.toast} ${toastStyles[type]}`}>
        <span className={toastStyles.message}>{message}</span>
        {onUndo && (
          <button className={toastStyles.undoBtn} onClick={onUndo}>
            Undo
          </button>
        )}
        <button className={toastStyles.dismissBtn} onClick={onDismiss}>
          &#x2715;
        </button>
      </div>
    </div>
  )
}
