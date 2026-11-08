'use client'

import { Bike, Check, ChevronLeft, Minus, Plus, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DELIVERY_ADDRESS, DELIVERY_LABEL, ORDER_STEPS, won, type Store } from './baemin-data'

export const MINT = '#2AC1BC'

export type Cart = Record<string, number>

export function cartTotal(store: Store, cart: Cart) {
  return store.menu.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0)
}

export function cartCount(cart: Cart) {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0)
}

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex shrink-0 items-center gap-1 border-b border-[#EEE] bg-white px-2 pb-2 pt-[52px]">
      <button
        type="button"
        aria-label="뒤로"
        onClick={onBack}
        className="flex size-11 items-center justify-center rounded-full active:bg-black/5"
      >
        <ChevronLeft className="size-6" />
      </button>
      <h2 className="truncate text-[17px] font-bold">{title}</h2>
    </header>
  )
}

function Stepper({ qty, onChange, label }: { qty: number; onChange: (qty: number) => void; label: string }) {
  if (qty === 0) {
    return (
      <button
        type="button"
        aria-label={`${label} 담기`}
        onClick={() => onChange(1)}
        className="flex size-9 items-center justify-center rounded-full border border-[#DDD] bg-white text-[#333] active:bg-[#F5F5F5]"
      >
        <Plus className="size-4" />
      </button>
    )
  }
  return (
    <div className="flex h-9 items-center rounded-full border border-[#DDD] bg-white">
      <button type="button" aria-label={`${label} 빼기`} onClick={() => onChange(qty - 1)} className="flex size-9 items-center justify-center">
        <Minus className="size-4" />
      </button>
      <span className="min-w-5 text-center text-[14px] font-bold" aria-live="polite">
        {qty}
      </span>
      <button type="button" aria-label={`${label} 더하기`} onClick={() => onChange(qty + 1)} className="flex size-9 items-center justify-center">
        <Plus className="size-4" />
      </button>
    </div>
  )
}

type StoreViewProps = {
  store: Store
  cart: Cart
  onBack: () => void
  onChange: (itemId: string, qty: number) => void
  onOpenCart: () => void
}

export function StoreView({ store, cart, onBack, onChange, onOpenCart }: StoreViewProps) {
  const count = cartCount(cart)
  const total = cartTotal(store, cart)
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-white">
      <TopBar title={store.name} onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-28">
        <section className="border-b-8 border-[#F5F5F5] px-5 py-5 text-center">
          <h3 className="text-[22px] font-extrabold">{store.name}</h3>
          <p className="mt-1 flex items-center justify-center gap-1 text-[14px]">
            <Star aria-hidden className="size-4 fill-[#FFC300] text-[#FFC300]" />
            <span className="font-bold">{store.rating}</span>
            <span className="text-[#888]">{`리뷰 ${store.reviews.toLocaleString('ko-KR')}`}</span>
          </p>
          <dl className="mx-auto mt-4 grid max-w-[280px] grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-left text-[13px]">
            <dt className="text-[#888]">최소주문</dt>
            <dd>{won(store.minOrder)}</dd>
            <dt className="text-[#888]">배달시간</dt>
            <dd>{`${store.minutes[0]}~${store.minutes[1]}분`}</dd>
            <dt className="text-[#888]">배달팁</dt>
            <dd>{won(store.deliveryFee)}</dd>
          </dl>
        </section>
        <h4 className="px-5 pb-1 pt-5 text-[17px] font-bold">메뉴</h4>
        <ul>
          {store.menu.map((item) => (
            <li key={item.id} className="flex items-center gap-3 border-b border-[#F2F2F2] px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[16px] font-bold">
                  {item.name}
                  {item.popular && (
                    <span className="rounded bg-[#E6F8F7] px-1.5 py-0.5 text-[11px] font-bold text-[#169E99]">인기</span>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] text-[#888]">{item.description}</p>
                <p className="mt-1 text-[15px] font-semibold">{won(item.price)}</p>
              </div>
              <Stepper label={item.name} qty={cart[item.id] ?? 0} onChange={(qty) => onChange(item.id, qty)} />
            </li>
          ))}
        </ul>
      </div>
      {count > 0 && (
        <div className="absolute inset-x-0 bottom-0 bg-white px-4 pb-[30px] pt-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={onOpenCart}
            className="flex h-[52px] w-full items-center justify-between rounded-xl px-4 text-[16px] font-bold text-white active:opacity-90"
            style={{ backgroundColor: MINT }}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-white text-[13px]" style={{ color: MINT }}>
              {count}
            </span>
            장바구니 보기
            <span>{won(total)}</span>
          </button>
        </div>
      )}
    </div>
  )
}

type CartViewProps = {
  store: Store
  cart: Cart
  onBack: () => void
  onChange: (itemId: string, qty: number) => void
  onOrder: () => void
}

export function CartView({ store, cart, onBack, onChange, onOrder }: CartViewProps) {
  const subtotal = cartTotal(store, cart)
  const canOrder = subtotal >= store.minOrder
  const items = store.menu.filter((item) => (cart[item.id] ?? 0) > 0)
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#F5F5F5]">
      <TopBar title="장바구니" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-32">
        <section className="bg-white px-5 py-4">
          <p className="text-[13px] text-[#888]">배달 주소</p>
          <p className="mt-0.5 text-[15px] font-bold">{`${DELIVERY_LABEL} · ${DELIVERY_ADDRESS}`}</p>
        </section>
        <section className="mt-2 bg-white px-5 py-4">
          <h3 className="text-[16px] font-bold">{store.name}</h3>
          <ul className="mt-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 border-b border-[#F2F2F2] py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{item.name}</p>
                  <p className="text-[14px] text-[#555]">{won(item.price * (cart[item.id] ?? 0))}</p>
                </div>
                <Stepper label={item.name} qty={cart[item.id] ?? 0} onChange={(qty) => onChange(item.id, qty)} />
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-2 space-y-1.5 bg-white px-5 py-4 text-[14px]">
          <p className="flex justify-between">
            <span className="text-[#666]">주문금액</span>
            <span>{won(subtotal)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-[#666]">배달팁</span>
            <span>{won(store.deliveryFee)}</span>
          </p>
          <p className="flex justify-between border-t border-[#EEE] pt-2 text-[16px] font-bold">
            <span>결제예정금액</span>
            <span>{won(subtotal + store.deliveryFee)}</span>
          </p>
        </section>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-white px-4 pb-[30px] pt-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        {!canOrder && (
          <p className="mb-2 text-center text-[13px] text-[#E8484D]">{`최소주문금액까지 ${won(store.minOrder - subtotal)} 남았어요`}</p>
        )}
        <button
          type="button"
          disabled={!canOrder}
          onClick={onOrder}
          className="h-[52px] w-full rounded-xl text-[16px] font-bold text-white disabled:bg-[#CCC]"
          style={canOrder ? { backgroundColor: MINT } : undefined}
        >
          {`${won(subtotal + store.deliveryFee)} 배달 주문하기`}
        </button>
      </div>
    </div>
  )
}

export function OrderStatusView({ store, step, onAdvance, onClose }: { store: Store; step: number; onAdvance: () => void; onClose: () => void }) {
  const done = step >= ORDER_STEPS.length - 1
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white">
      <TopBar title="주문 현황" onBack={onClose} />
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pt-8">
        <span className="flex size-20 items-center justify-center rounded-full" style={{ backgroundColor: '#E6F8F7', color: MINT }}>
          {done ? <Check className="size-10" strokeWidth={3} /> : <Bike className="size-10" />}
        </span>
        <h3 className="mt-4 text-[22px] font-extrabold">{done ? '배달이 완료되었어요' : ORDER_STEPS[step]}</h3>
        <p className="mt-1 text-[14px] text-[#888]">
          {done ? '맛있게 드세요!' : `${store.name} · 예상 ${store.minutes[0]}~${store.minutes[1]}분`}
        </p>
        <ol className="mt-8 w-full max-w-[300px]">
          {ORDER_STEPS.map((label, index) => (
            <li key={label} className="flex items-center gap-3 py-2">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-[12px] font-bold',
                  index <= step ? 'text-white' : 'bg-[#EEE] text-[#AAA]',
                )}
                style={index <= step ? { backgroundColor: MINT } : undefined}
              >
                {index < step ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span className={cn('text-[15px]', index <= step ? 'font-bold text-[#222]' : 'text-[#AAA]')}>{label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[13px] text-[#888]">{`배달 주소: ${DELIVERY_ADDRESS}`}</p>
      </div>
      <div className="px-4 pb-[30px] pt-3">
        <button
          type="button"
          onClick={done ? onClose : onAdvance}
          className="h-[52px] w-full rounded-xl text-[16px] font-bold text-white"
          style={{ backgroundColor: MINT }}
        >
          {done ? '확인' : '배달 현황 새로고침'}
        </button>
      </div>
    </div>
  )
}
