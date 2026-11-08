import Image from 'next/image'
import { Gift, Search, Shirt, Sparkles, Truck, UtensilsCrossed } from 'lucide-react'

const CATEGORIES = [
  { label: '선물하기', icon: Gift },
  { label: '패션', icon: Shirt },
  { label: '뷰티', icon: Sparkles },
  { label: '푸드', icon: UtensilsCrossed },
  { label: '톡딜', icon: Truck },
]

const PRODUCTS = [
  { name: '청키 니트 가디건 크림', brand: '데일리룩', price: 39800, discount: 32, image: '/images/shop/knit.png' },
  { name: '글로시 립 틴트 로즈', brand: '뮤즈뷰티', price: 14900, discount: 20, image: '/images/shop/lipstick.png' },
  { name: '딸기 생크림 케이크 기프티콘', brand: '스위트베이커리', price: 28000, image: '/images/shop/cake.png' },
  { name: '머스크 오 드 퍼퓸 50ml', brand: '르블랑', price: 68000, discount: 15, image: '/images/shop/perfume.png' },
]

export function ShoppingTab() {
  return (
    <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:none]">
      <div className="px-5 pb-3 pt-1">
        <div className="flex h-10 items-center gap-2 rounded-full bg-[#F2F2F2] px-4 text-[14px] text-[#A6A6A6]">
          <Search className="size-[17px]" strokeWidth={2} aria-hidden />
          <span>선물, 상품 검색</span>
        </div>
      </div>

      <div className="mx-5 rounded-2xl bg-[#FEE500] px-5 py-4">
        <p className="text-[12px] font-medium text-[#3C1E1E]/70">카카오톡 선물하기</p>
        <p className="mt-1 text-[17px] font-bold leading-snug text-[#3C1E1E]">
          마음을 전하는 가장 쉬운 방법
          <br />
          지금 친구에게 선물해보세요
        </p>
      </div>

      <ul className="flex justify-between px-5 pt-4">
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <li key={label} className="flex flex-col items-center gap-1.5">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#F5F5F5]">
              <Icon className="size-[22px] text-[#3C3C3C]" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="text-[11.5px] text-[#3C3C3C]">{label}</span>
          </li>
        ))}
      </ul>

      <h2 className="px-5 pb-2 pt-5 text-[16px] font-bold tracking-[-0.01em]">지금 많이 선물하는 상품</h2>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-4 px-5">
        {PRODUCTS.map((product) => {
          const sale = product.discount ? Math.round((product.price * (100 - product.discount)) / 100 / 100) * 100 : product.price
          return (
            <li key={product.name}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F5]">
                <Image src={product.image} alt={product.name} fill sizes="160px" className="object-cover" />
              </div>
              <p className="mt-2 text-[11.5px] text-[#8A8A8A]">{product.brand}</p>
              <p className="line-clamp-2 text-[13px] leading-snug text-[#191919]">{product.name}</p>
              <p className="mt-0.5 flex items-baseline gap-1 text-[14px] font-bold">
                {product.discount && <span className="text-[#FA5A3C]">{product.discount}%</span>}
                <span>{sale.toLocaleString()}원</span>
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
