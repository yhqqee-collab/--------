'use client'

import { Heart, Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'

const CATEGORIES = ['투데이', '베스트', '아우터', '상의', '하의', '원피스', '신발', '가방', '액세서리']

type Product = {
  id: string
  image: string
  mall: string
  name: string
  price: number
  discount: number
  aspect: string
  tone: string
}

const PRODUCTS: Product[] = [
  { id: 'p1', image: '/images/ably/p1.png', mall: '모디무드', name: '루즈핏 크롭 니트 가디건 (5color)', price: 28900, discount: 32, aspect: 'aspect-[3/4]', tone: 'from-[#F9E4EA] to-[#F3C9D6]' },
  { id: 'p2', image: '/images/ably/p2.png', mall: '르플레인', name: '하이웨스트 와이드 데님 팬츠', price: 34800, discount: 15, aspect: 'aspect-[3/5]', tone: 'from-[#DCE6F2] to-[#B9CBE4]' },
  { id: 'p3', image: '/images/ably/p3.png', mall: '데일리쥬', name: '베이직 라운드 반팔 티셔츠', price: 12900, discount: 40, aspect: 'aspect-square', tone: 'from-[#F4F1EC] to-[#E5DED3]' },
  { id: 'p4', image: '/images/ably/p4.png', mall: '어반브릭', name: '오버핏 울 블렌드 하프 코트', price: 89000, discount: 22, aspect: 'aspect-[3/4]', tone: 'from-[#E9E1D8] to-[#CDBBA7]' },
  { id: 'p5', image: '/images/ably/p5.png', mall: '체리밤', name: '플라워 쉬폰 롱 원피스', price: 42500, discount: 18, aspect: 'aspect-[2/3]', tone: 'from-[#FBE7EF] to-[#F6CFE0]' },
  { id: 'p6', image: '/images/ably/p6.png', mall: '모노데이', name: '스퀘어 토 메리제인 로퍼', price: 39900, discount: 10, aspect: 'aspect-square', tone: 'from-[#E4E4E4] to-[#C8C8C8]' },
  { id: 'p7', image: '/images/ably/p7.png', mall: '소프트룸', name: '기모 후드 집업 (오버핏)', price: 31900, discount: 27, aspect: 'aspect-[3/4]', tone: 'from-[#E7EEE6] to-[#C9D9C7]' },
  { id: 'p8', image: '/images/ably/p8.png', mall: '히피스', name: '미니 숄더백 레더 크로스', price: 24900, discount: 35, aspect: 'aspect-[4/5]', tone: 'from-[#F1E3DA] to-[#E2C3AF]' },
  { id: 'p9', image: '/images/ably/p9.png', mall: '르플레인', name: '핀턱 와이드 슬랙스', price: 29800, discount: 12, aspect: 'aspect-[3/5]', tone: 'from-[#EEEAF5] to-[#D6CDE9]' },
  { id: 'p10', image: '/images/ably/p10.png', mall: '데일리쥬', name: '진주 포인트 드롭 귀걸이', price: 9900, discount: 50, aspect: 'aspect-square', tone: 'from-[#FDF3E7] to-[#F5DFC2]' },
]

const won = (n: number) => n.toLocaleString('ko-KR')

export function AblyApp({ open }: { open: boolean }) {
  const [activeTab, setActiveTab] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(() => new Set())

  const products = [...PRODUCTS.slice(activeTab % PRODUCTS.length), ...PRODUCTS.slice(0, activeTab % PRODUCTS.length)]

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <AppShell open={open} label="에이블리" className="bg-white text-[#111]">
      <header className="shrink-0 bg-white px-4 pt-[52px]">
        <div className="flex items-center justify-between">
          <span className="text-[24px] font-black tracking-tight">
            ably<span className="text-[#FF6B9A]">.</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="relative" aria-label={`찜 목록 ${liked.size}개`} role="img">
              <Heart className="size-6" strokeWidth={1.8} aria-hidden />
              <span className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#FF6B9A] px-1 text-[10px] font-bold leading-none text-white tabular-nums">
                {liked.size}
              </span>
            </span>
            <button type="button" aria-label="장바구니" className="relative active:scale-90">
              <ShoppingBag className="size-6" strokeWidth={1.8} aria-hidden />
            </button>
          </div>
        </div>

        <label className="mt-3 flex items-center gap-2 rounded-full bg-[#F4F4F5] px-4 py-2.5">
          <Search className="size-4 text-[#9A9A9F]" strokeWidth={2.2} aria-hidden />
          <span className="sr-only">상품 검색</span>
          <input
            type="search"
            placeholder="오늘 뭐 입지? 검색해보세요"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#9A9A9F]"
          />
        </label>

        <nav
          aria-label="카테고리"
          className="-mx-4 mt-2 flex gap-5 overflow-x-auto border-b border-[#EFEFEF] px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((category, index) => {
            const active = index === activeTab
            return (
              <button
                key={category}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setActiveTab(index)}
                className={cn(
                  'shrink-0 border-b-2 pb-2.5 pt-2 text-[14px] transition-colors',
                  active ? 'border-black font-bold text-black' : 'border-transparent font-medium text-[#A0A0A5]',
                )}
              >
                {category}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-3 mt-3 flex items-center justify-between rounded-2xl bg-[#FFF0F5] px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold text-[#FF6B9A]">{CATEGORIES[activeTab]} 특가</p>
            <p className="text-[14px] font-bold">오늘만 전 상품 무료배송</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#FF6B9A]">D-1</span>
        </div>

        <ul className="mt-3 columns-2 gap-2 px-3">
          {products.map((product) => {
            const isLiked = liked.has(product.id)
            return (
              <li key={product.id} className="mb-4 break-inside-avoid">
                <div className={cn('relative overflow-hidden rounded-xl bg-gradient-to-b', product.aspect, product.tone)}>
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <button
                    type="button"
                    aria-pressed={isLiked}
                    aria-label={isLiked ? `${product.name} 찜 해제` : `${product.name} 찜하기`}
                    onClick={() => toggleLike(product.id)}
                    className="absolute bottom-1.5 right-1.5 flex size-8 items-center justify-center active:scale-90"
                  >
                    <Heart
                      aria-hidden
                      strokeWidth={2}
                      className={cn(
                        'size-[22px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors',
                        isLiked ? 'fill-[#FF2D55] text-[#FF2D55]' : 'fill-black/10 text-white',
                      )}
                    />
                  </button>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-[#8A8A8F]">{product.mall}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug">{product.name}</p>
                <p className="mt-1 text-[14px] font-bold tabular-nums">
                  <span className="mr-1 text-[#FF6B9A]">{product.discount}%</span>
                  {won(product.price)}
                </p>
              </li>
            )
          })}
        </ul>
      </main>
    </AppShell>
  )
}
