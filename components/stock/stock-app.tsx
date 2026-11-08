'use client'

import { ChevronLeft, Search, Star } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'

type Stock = { code: string; name: string; price: number; prevClose: number; tick: number; seed: number }

const STOCKS: Stock[] = [
  { code: '034020', name: '두산에너빌리티', price: 72300, prevClose: 70100, tick: 100, seed: 3 },
  { code: '042660', name: '한화오션', price: 98700, prevClose: 100500, tick: 100, seed: 7 },
  { code: '069500', name: 'KODEX 200', price: 42150, prevClose: 41890, tick: 5, seed: 11 },
]

const INITIAL_CASH = 1_000_000
const UP = 'text-[#E8333A]'
const DOWN = 'text-[#1A62E8]'

const fmt = (n: number) => n.toLocaleString('ko-KR')

function pseudo(seed: number, i: number) {
  const x = Math.sin(seed * 97 + i * 13.37) * 10000
  return x - Math.floor(x)
}

function tone(value: number, base: number) {
  if (value > base) return UP
  if (value < base) return DOWN
  return 'text-[#222]'
}

function buildOrderBook(stock: Stock) {
  const asks = Array.from({ length: 5 }, (_, i) => ({
    price: stock.price + stock.tick * (5 - i),
    qty: Math.round(800 + pseudo(stock.seed, i) * 24000),
  }))
  const bids = Array.from({ length: 5 }, (_, i) => ({
    price: stock.price - stock.tick * i,
    qty: Math.round(800 + pseudo(stock.seed, i + 10) * 24000),
  }))
  return { asks, bids, max: Math.max(...asks.map((a) => a.qty), ...bids.map((b) => b.qty)) }
}

function buildChart(stock: Stock) {
  const points = 40
  const values: number[] = []
  let v = stock.prevClose
  for (let i = 0; i < points; i++) {
    const target = stock.prevClose + ((stock.price - stock.prevClose) * i) / (points - 1)
    v = target + (pseudo(stock.seed, i + 30) - 0.5) * stock.prevClose * 0.012
    values.push(i === points - 1 ? stock.price : v)
  }
  const min = Math.min(...values, stock.prevClose)
  const max = Math.max(...values, stock.prevClose)
  const y = (val: number) => 90 - ((val - min) / (max - min || 1)) * 80
  const line = values.map((val, i) => `${(i / (points - 1)) * 300},${y(val).toFixed(1)}`).join(' ')
  return { line, baseY: y(stock.prevClose) }
}

export function StockApp({ open }: { open: boolean }) {
  const [selectedCode, setSelectedCode] = useState(STOCKS[0].code)
  const [cash, setCash] = useState(INITIAL_CASH)
  const [holdings, setHoldings] = useState<Record<string, number>>({})
  const [lastTrade, setLastTrade] = useState<string | null>(null)

  const stock = STOCKS.find((s) => s.code === selectedCode) ?? STOCKS[0]
  const diff = stock.price - stock.prevClose
  const rate = (diff / stock.prevClose) * 100
  const qty = holdings[stock.code] ?? 0
  const book = buildOrderBook(stock)
  const chart = buildChart(stock)
  const up = diff >= 0
  const canBuy = cash >= stock.price
  const canSell = qty > 0

  function buy() {
    if (!canBuy) return
    setCash((c) => c - stock.price)
    setHoldings((h) => ({ ...h, [stock.code]: (h[stock.code] ?? 0) + 1 }))
    setLastTrade(`${stock.name} 1주 매수 체결 · ${fmt(stock.price)}원`)
  }

  function sell() {
    if (!canSell) return
    setCash((c) => c + stock.price)
    setHoldings((h) => ({ ...h, [stock.code]: (h[stock.code] ?? 0) - 1 }))
    setLastTrade(`${stock.name} 1주 매도 체결 · ${fmt(stock.price)}원`)
  }

  return (
    <AppShell open={open} label="주식 거래" className="bg-[#F2F3F5] text-[#222]">
      <header className="shrink-0 bg-white px-3 pb-2 pt-[50px]">
        <div className="flex items-center justify-between">
          <ChevronLeft className="size-6 text-[#444]" aria-hidden />
          <span className="text-[13px] font-bold text-[#6B2BD9]">현재가</span>
          <div className="flex items-center gap-3 text-[#444]">
            <Star className="size-5" aria-hidden />
            <Search className="size-5" aria-hidden />
          </div>
        </div>

        <div className="mt-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="종목 선택">
          {STOCKS.map((s) => (
            <button
              key={s.code}
              type="button"
              role="tab"
              aria-selected={s.code === stock.code}
              onClick={() => setSelectedCode(s.code)}
              className={cn(
                'shrink-0 rounded-md border px-2.5 py-1 text-[11.5px] font-semibold',
                s.code === stock.code ? 'border-[#6B2BD9] bg-[#6B2BD9] text-white' : 'border-[#DDD] bg-white text-[#555]',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[14px] font-bold">
              {stock.name} <span className="text-[11px] font-normal text-[#888]">{stock.code}</span>
            </p>
            <p className={cn('text-[24px] font-extrabold leading-tight tabular-nums', up ? UP : DOWN)}>{fmt(stock.price)}</p>
          </div>
          <div className={cn('pb-1 text-right text-[12px] font-semibold tabular-nums', up ? UP : DOWN)}>
            <p>
              {up ? '▲' : '▼'} {fmt(Math.abs(diff))}
            </p>
            <p>
              {up ? '+' : ''}
              {rate.toFixed(2)}%
            </p>
          </div>
        </div>
      </header>

      <div className="grid shrink-0 grid-cols-3 gap-px border-y border-[#E3E4E8] bg-[#E3E4E8] text-[11px] tabular-nums">
        <div className="bg-white px-2 py-1.5">
          <p className="text-[#888]">예수금</p>
          <p className="font-bold">{fmt(cash)}원</p>
        </div>
        <div className="bg-white px-2 py-1.5">
          <p className="text-[#888]">보유 수량</p>
          <p className="font-bold">{fmt(qty)}주</p>
        </div>
        <div className="bg-white px-2 py-1.5">
          <p className="text-[#888]">평가금액</p>
          <p className="font-bold">{fmt(qty * stock.price)}원</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <section aria-label="주가 차트" className="mt-1.5 bg-white px-3 py-2">
          <div className="flex gap-3 text-[11px] font-semibold text-[#999]">
            <span className="text-[#222]">1일</span>
            <span>1주</span>
            <span>1개월</span>
            <span>1년</span>
          </div>
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="mt-1 h-[84px] w-full rounded bg-[#FAFAFB]" role="img" aria-label={`${stock.name} 당일 주가 추이`}>
            <line x1="0" x2="300" y1={chart.baseY} y2={chart.baseY} stroke="#C9CBD1" strokeDasharray="3 3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <polyline points={chart.line} fill="none" stroke={up ? '#E8333A' : '#1A62E8'} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
        </section>

        <section aria-label="호가" className="mt-1.5 bg-white text-[11.5px] tabular-nums">
          <div className="grid grid-cols-[1fr_1.1fr_1fr] border-b border-[#EEE] py-1 text-center text-[10.5px] text-[#999]">
            <span>매도잔량</span>
            <span>호가</span>
            <span>매수잔량</span>
          </div>
          {book.asks.map((row) => (
            <div key={`a${row.price}`} className="grid grid-cols-[1fr_1.1fr_1fr] border-b border-white bg-[#EEF4FF]">
              <span className="relative flex items-center justify-end px-1.5 py-[3px]">
                <span aria-hidden className="absolute inset-y-[3px] right-0 bg-[#C9DBFF]" style={{ width: `${(row.qty / book.max) * 100}%` }} />
                <span className="relative">{fmt(row.qty)}</span>
              </span>
              <span className={cn('flex items-center justify-between bg-white/70 px-1.5 font-semibold', tone(row.price, stock.prevClose))}>
                <span>{fmt(row.price)}</span>
                <span className="text-[9.5px] font-normal">{(((row.price - stock.prevClose) / stock.prevClose) * 100).toFixed(2)}%</span>
              </span>
              <span />
            </div>
          ))}
          {book.bids.map((row, i) => (
            <div key={`b${row.price}`} className="grid grid-cols-[1fr_1.1fr_1fr] border-b border-white bg-[#FFF0F0]">
              <span />
              <span
                className={cn(
                  'flex items-center justify-between bg-white/70 px-1.5 font-semibold',
                  tone(row.price, stock.prevClose),
                  i === 0 && 'outline outline-[1.5px] -outline-offset-[1.5px] outline-[#222]',
                )}
              >
                <span>{fmt(row.price)}</span>
                <span className="text-[9.5px] font-normal">{(((row.price - stock.prevClose) / stock.prevClose) * 100).toFixed(2)}%</span>
              </span>
              <span className="relative flex items-center px-1.5 py-[3px]">
                <span aria-hidden className="absolute inset-y-[3px] left-0 bg-[#FFCFCF]" style={{ width: `${(row.qty / book.max) * 100}%` }} />
                <span className="relative">{fmt(row.qty)}</span>
              </span>
            </div>
          ))}
          <div className="grid grid-cols-2 px-2 py-1.5 text-[10.5px] text-[#888]">
            <span>
              전일 <b className="font-semibold text-[#222]">{fmt(stock.prevClose)}</b>
            </span>
            <span className="text-right">
              거래량 <b className="font-semibold text-[#222]">{fmt(Math.round(pseudo(stock.seed, 99) * 4_000_000 + 900_000))}</b>
            </span>
          </div>
        </section>
      </main>

      <footer className="shrink-0 border-t border-[#E3E4E8] bg-white px-3 pb-8 pt-2">
        <p className="mb-1.5 h-4 truncate text-center text-[11px] font-medium text-[#6B2BD9]" aria-live="polite">
          {lastTrade ?? (canBuy ? '1주 단위 시장가 주문' : '예수금이 부족합니다')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={sell}
            disabled={!canSell}
            className="h-12 rounded-lg bg-[#1A62E8] text-[16px] font-bold text-white active:brightness-90 disabled:opacity-35"
          >
            매도
          </button>
          <button
            type="button"
            onClick={buy}
            disabled={!canBuy}
            className="h-12 rounded-lg bg-[#E8333A] text-[16px] font-bold text-white active:brightness-90 disabled:opacity-35"
          >
            매수
          </button>
        </div>
      </footer>
    </AppShell>
  )
}
