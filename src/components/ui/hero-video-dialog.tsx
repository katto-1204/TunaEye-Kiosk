import { useEffect, useState, type ReactNode } from 'react'
import { Play, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'

interface HeroVideoDialogProps {
  trigger: ReactNode
  videoSrc: string
}

export function HeroVideoDialog({ trigger, videoSrc }: HeroVideoDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])

  return (
    <>
      <button type="button" className="hero-video-trigger" onClick={() => setOpen(true)}>
        {trigger}
      </button>
      {createPortal(<AnimatePresence>
        {open && (
          <motion.div
            className="hero-video-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="TunaEye demo video"
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="hero-video-dialog__panel"
              initial={{ scale: .85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: .85, opacity: 0 }}
              onClick={event => event.stopPropagation()}
            >
              <button type="button" className="hero-video-dialog__close" onClick={() => setOpen(false)} aria-label="Close demo video">
                <X aria-hidden="true" />
              </button>
              <iframe src={videoSrc} title="TunaEye demo video" allowFullScreen />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  )
}

export function DemoPlayIcon() {
  return <Play aria-hidden="true" fill="currentColor" />
}
