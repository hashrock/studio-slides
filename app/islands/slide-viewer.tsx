import { useState, useEffect, useRef } from 'hono/jsx'

interface SlideViewerProps {
  sections: string[]
}

export default function SlideViewer({ sections }: SlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToSlide = (index: number) => {
    if (index < 0 || index >= sections.length || index === currentIndex || isAnimating) return

    setIsAnimating(true)
    setPrevIndex(currentIndex)
    setCurrentIndex(index)

    // アニメーション完了後にprevIndexをクリア
    setTimeout(() => {
      setPrevIndex(null)
      setIsAnimating(false)
    }, 500)
  }

  const nextSlide = () => goToSlide(currentIndex + 1)
  const prevSlide = () => goToSlide(currentIndex - 1)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault()
          goToSlide(currentIndex + 1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          goToSlide(currentIndex - 1)
          break
        case 'Home':
          e.preventDefault()
          goToSlide(0)
          break
        case 'End':
          e.preventDefault()
          goToSlide(sections.length - 1)
          break
        case 'Escape':
          e.preventDefault()
          window.location.href = '/slides'
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, sections.length, isAnimating])

  const getSlideClass = (index: number) => {
    // 現在のスライド
    if (index === currentIndex) {
      return 'slide current'
    }
    // アニメーション中の前のスライド
    if (index === prevIndex) {
      // 次へ移動した場合は左へ、前へ移動した場合は右へ
      return currentIndex > prevIndex ? 'slide prev' : 'slide next'
    }
    // それ以外は非表示
    if (index < currentIndex) {
      return 'slide prev hidden'
    }
    return 'slide next hidden'
  }

  return (
    <>
      <div class="slide-container">
        {sections.map((section, index) => (
          <div
            key={index}
            class={getSlideClass(index)}
            dangerouslySetInnerHTML={{ __html: section }}
          />
        ))}
      </div>
      <div class="page-indicator">
        {currentIndex + 1} / {sections.length}
      </div>
      <div class="nav-buttons">
        <button
          class="nav-btn"
          onClick={prevSlide}
          disabled={currentIndex === 0 || isAnimating}
          aria-label="Previous"
        >
          ←
        </button>
        <button
          class="nav-btn"
          onClick={nextSlide}
          disabled={currentIndex === sections.length - 1 || isAnimating}
          aria-label="Next"
        >
          →
        </button>
      </div>
    </>
  )
}
