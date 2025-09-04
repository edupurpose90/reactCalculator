import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Operator = '+' | '-' | '×' | '÷' | '%'

function App() {
  const [display, setDisplay] = useState<string>('0')
  const [accumulator, setAccumulator] = useState<number | null>(null)
  const [pendingOperator, setPendingOperator] = useState<Operator | null>(null)
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false)

  const maxDigits = 12

  const formatNumber = (value: number): string => {
    if (!Number.isFinite(value)) return 'Error'
    const abs = Math.abs(value)
    if (abs !== 0 && (abs >= 10 ** maxDigits || abs < 10 ** -(maxDigits - 2))) {
      return value.toExponential(6)
    }
    const str = value.toString()
    if (str.includes('e')) return value.toExponential(6)
    const [intPart, fracPart] = str.split('.')
    const intWithSep = Number(intPart).toLocaleString('en-US')
    return fracPart ? `${intWithSep}.${fracPart}` : intWithSep
  }

  const parseDisplay = (): number => {
    const normalized = display.replace(/,/g, '')
    return Number(normalized)
  }

  const inputDigit = (digit: string) => {
    setDisplay((prev) => {
      if (justEvaluated) {
        setJustEvaluated(false)
        return digit
      }
      if (prev === '0') return digit
      if (prev.replace(/[,\.]/g, '').length >= maxDigits) return prev
      return prev + digit
    })
  }

  const inputDot = () => {
    setDisplay((prev) => {
      if (justEvaluated) {
        setJustEvaluated(false)
        return '0.'
      }
      return prev.includes('.') ? prev : prev + '.'
    })
  }

  const clearAll = () => {
    setDisplay('0')
    setAccumulator(null)
    setPendingOperator(null)
    setJustEvaluated(false)
  }

  const toggleSign = () => {
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : prev === '0' ? prev : '-' + prev))
  }

  const percent = () => {
    const value = parseDisplay()
    setDisplay(formatNumber(value / 100))
    setJustEvaluated(true)
  }

  const applyPending = (nextValue: number): number | 'Error' => {
    if (accumulator === null || !pendingOperator) return nextValue
    switch (pendingOperator) {
      case '+':
        return accumulator + nextValue
      case '-':
        return accumulator - nextValue
      case '×':
        return accumulator * nextValue
      case '÷':
        return nextValue === 0 ? 'Error' : accumulator / nextValue
      case '%':
        return accumulator % nextValue
    }
  }

  const chooseOperator = (op: Operator) => {
    const current = parseDisplay()
    if (accumulator === null || justEvaluated) {
      setAccumulator(current)
    } else if (pendingOperator) {
      const result = applyPending(current)
      if (result === 'Error') {
        setDisplay('Error')
        setAccumulator(null)
        setPendingOperator(null)
        setJustEvaluated(true)
        return
      }
      setAccumulator(result)
      setDisplay(formatNumber(result))
    }
    setPendingOperator(op)
    setJustEvaluated(false)
    setDisplay('0')
  }

  const equals = () => {
    const current = parseDisplay()
    const result = applyPending(current)
    if (result === 'Error') {
      setDisplay('Error')
      setAccumulator(null)
      setPendingOperator(null)
      setJustEvaluated(true)
      return
    }
    if (result !== undefined) {
      setDisplay(formatNumber(result))
      setAccumulator(result)
      setPendingOperator(null)
      setJustEvaluated(true)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key
    if (/^[0-9]$/.test(key)) {
      inputDigit(key)
      return
    }
    if (key === '.') {
      inputDot()
      return
    }
    if (key === 'Escape') {
      clearAll()
      return
    }
    if (key === 'Enter' || key === '=') {
      equals()
      return
    }
    if (key === '+' || key === '-') {
      chooseOperator(key as Operator)
      return
    }
    if (key === '*' || key === 'x') {
      chooseOperator('×')
      return
    }
    if (key === '/') {
      chooseOperator('÷')
      return
    }
    if (key === '%') {
      percent()
      return
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e)
    window.addEventListener('keydown', handler as any)
    return () => window.removeEventListener('keydown', handler as any)
  })

  const buttons: Array<{ label: string; onClick: () => void; className?: string }> = useMemo(
    () => [
      // Change the label name c to clear 
      // xxxxxxxx
      // zzzzzzzz 
      // yyyyyy
      // jj
      // jj ++
      //kk
      // kk ++
      // ll 
      // ll ++
      // ii
      // ii ++
      // adem berk aksoy
      { label: 'Clear', onClick: clearAll, className: 'btn-func' },
      { label: '±', onClick: toggleSign, className: 'btn-func' },
      { label: '%', onClick: percent, className: 'btn-func' },
      { label: '÷', onClick: () => chooseOperator('÷'), className: 'btn-op' },
      { label: '7', onClick: () => inputDigit('7') },
      { label: '8', onClick: () => inputDigit('8') },
      { label: '9', onClick: () => inputDigit('9') },
      { label: '×', onClick: () => chooseOperator('×'), className: 'btn-op' },
      { label: '4', onClick: () => inputDigit('4') },
      { label: '5', onClick: () => inputDigit('5') },
      { label: '6', onClick: () => inputDigit('6') },
      { label: '-', onClick: () => chooseOperator('-'), className: 'btn-op' },
      { label: '1', onClick: () => inputDigit('1') },
      { label: '2', onClick: () => inputDigit('2') },
      { label: '3', onClick: () => inputDigit('3') },
      { label: '+', onClick: () => chooseOperator('+'), className: 'btn-op' },
      { label: '0', onClick: () => inputDigit('0'), className: 'btn-zero' },
      { label: '.', onClick: inputDot },
      { label: '=', onClick: equals, className: 'btn-op' },
    ],
    [display, accumulator, pendingOperator, justEvaluated],
  )

  return (
    <div className="calculator">
      <div className="display" data-testid="display">{display}</div>
      <div className="keypad">
        {buttons.map((b) => (
          <button
            key={b.label}
            className={`btn ${b.className ?? ''}`}
            onClick={b.onClick}
            aria-label={`key-${b.label}`}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
