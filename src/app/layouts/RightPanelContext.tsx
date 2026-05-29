import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

type RightPanelCtx = {
  content: ReactNode
  setContent: (c: ReactNode) => void
}

export const RightPanelContext = createContext<RightPanelCtx>({
  content: null,
  setContent: () => {},
})

export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<ReactNode>(null)
  const setContent = useCallback((c: ReactNode) => setContentState(c), [])

  return (
    <RightPanelContext.Provider value={{ content, setContent }}>
      {children}
    </RightPanelContext.Provider>
  )
}

export function useRightPanel() {
  return useContext(RightPanelContext).setContent
}
