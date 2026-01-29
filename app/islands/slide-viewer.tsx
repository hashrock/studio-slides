import { useState, useEffect } from 'hono/jsx'

interface SlideViewerProps {
  sections: string[]
}

export default function SlideViewer({ sections }: SlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToSlide = (index: number) => {
    if (index < 0 || index >= sections.length) return
    setCurrentIndex(index)
  }

  const nextSlide = () => goToSlide(currentIndex + 1)
  const prevSlide = () => goToSlide(currentIndex - 1)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault()
          setCurrentIndex(i => Math.min(i + 1, sections.length - 1))
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          setCurrentIndex(i => Math.max(i - 1, 0))
          break
        case 'Home':
          e.preventDefault()
          setCurrentIndex(0)
          break
        case 'End':
          e.preventDefault()
          setCurrentIndex(sections.length - 1)
          break
        case 'Escape':
          e.preventDefault()
          window.location.href = '/slides'
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sections.length])

  const getSlideClass = (index: number) => {
    if (index === currentIndex) return 'slide current'
    if (index < currentIndex) return 'slide prev hidden'
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
          disabled={currentIndex === 0}
          aria-label="Previous"
        >
          ←
        </button>
        <button
          class="nav-btn"
          onClick={nextSlide}
          disabled={currentIndex === sections.length - 1}
          aria-label="Next"
        >
          →
        </button>
      </div>
    </>
  )
}
