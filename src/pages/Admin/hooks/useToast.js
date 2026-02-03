import { useState, useCallback, useRef } from 'react'

export default function useToast(autoDismissMs = 5000) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const show = useCallback((message, type = 'info', onUndo = null) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type, onUndo })
    timerRef.current = setTimeout(() => {
      setToast(null)
      timerRef.current = null
    }, autoDismissMs)
  }, [autoDismissMs])

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
    timerRef.current = null
  }, [])

  return { toast, show, dismiss }
}
