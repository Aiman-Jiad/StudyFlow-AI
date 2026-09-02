import { useCallback, useState } from 'react'
import { clearApiKey, getApiKey, hasApiKey, setApiKey } from '@/services/geminiService'

export function useApiKey() {
  const [connected, setConnected] = useState<boolean>(hasApiKey())
  const [key, setKeyState] = useState<string | null>(getApiKey())

  const save = useCallback((newKey: string) => {
    setApiKey(newKey)
    setKeyState(newKey)
    setConnected(true)
  }, [])

  const remove = useCallback(() => {
    clearApiKey()
    setKeyState(null)
    setConnected(false)
  }, [])

  return { connected, key, save, remove }
}
