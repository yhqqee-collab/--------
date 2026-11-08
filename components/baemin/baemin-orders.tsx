'use client'

import { Beef, ChevronRight, Coffee, CupSoda, Drumstick, Fish, Flame, MapPin, Receipt, Salad, Soup } from 'lucide-react'
import { won } from './baemin-data'
import { MINT, TopBar } from './baemin-store'

export type DeliveryOrder = {
  id: string
  date: string
  storeName: string
  icon: typeof Soup
  items: { name: string; price: number }[]
  deliveryTip: number
  address: string
  requestMemo: string
}

export const DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: 'ord-8',
    date: '11월 3일 (화) 오후 6:20',
    storeName: '춘리마라탕 대학로점',
    icon: Soup,
    items: [
      { name: '마라탕 1인분 (소고기 추가)', price: 11000 },
      { name: '꿔바로우 미니', price: 6000 },
    ],
    deliveryTip: 2000,
    address: '정문 해솔원룸 401호',
    requestMemo: '문 앞에 두고 벨 눌러주세요',
  },
  {
    id: 'ord-7',
    date: '11월 1일 (일) 오후 8:10',
    storeName: '교촌치킨 대학로점',
    icon: Drumstick,
    items: [
      { name: '허니콤보 1마리', price: 23000 },
      { name: '국물맵떡 + 치즈볼 세트', price: 8500 },
    ],
    deliveryTip: 3000,
    address: '후문 다온빌라 302호',
    requestMemo: '비 오는데 조심히 와주세요!',
  },
  {
    id: 'ord-6',
    date: '10월 28일 (수) 오후 1:30',
    storeName: '슬로우캘리 정문점',
    icon: Salad,
    items: [
      { name: '클래식 연어 포케', price: 12500 },
      { name: '제로콜라 355ml', price: 2000 },
    ],
    deliveryTip: 1500,
    address: '정문 해솔원룸 401호',
    requestMemo: '일회용 수저 안 주셔도 돼요',
  },
  {
    id: 'ord-5',
    date: '10월 25일 (일) 오후 7:30',
    storeName: '공차 대학로점',
    icon: CupSoda,
    items: [
      { name: '타로 밀크티 + 펄 (L)', price: 5700 },
      { name: '딸기 쿠키 스무디', price: 5900 },
      { name: '플레인 크로플 2개', price: 6800 },
    ],
    deliveryTip: 2000,
    address: '후문 청솔원룸 204호',
    requestMemo: '문 앞에 놔주세요 감사합니다',
  },
  {
    id: 'ord-4',
    date: '10월 23일 (금) 오후 8:40',
    storeName: '바른생육회 대학로점',
    icon: Beef,
    items: [{ name: '1인 육회비빔밥 세트 + 소고기무국', price: 13500 }],
    deliveryTip: 2500,
    address: '정문 해솔원룸 401호',
    requestMemo: '문 앞에 두고 벨 눌러주세요',
  },
  {
    id: 'ord-3',
    date: '10월 21일 (수) 오후 2:40',
    storeName: '투썸플레이스 정문점',
    icon: Coffee,
    items: [
      { name: '아이스 아메리카노 (L)', price: 5000 },
      { name: '아이스 바닐라라떼 (L)', price: 5900 },
      { name: '스트로베리 초콜릿 생크림 조각케이크', price: 6700 },
    ],
    deliveryTip: 2000,
    address: '정문 SL 오피스텔 1204호',
    requestMemo: '포크 두 개 챙겨주세요',
  },
  {
    id: 'ord-2',
    date: '10월 18일 (일) 오후 7:45',
    storeName: '동대문엽기떡볶이 대학로점',
    icon: Flame,
    items: [
      { name: '엽기반반 (모짜렐라치즈 추가)', price: 17000 },
      { name: '주먹김밥', price: 2000 },
      { name: '쿨피스 930ml', price: 2000 },
    ],
    deliveryTip: 2500,
    address: '후문 다온빌라 302호',
    requestMemo: '단무지 많이 주세요!',
  },
  {
    id: 'ord-1',
    date: '10월 16일 (금) 오후 7:15',
    storeName: '스시히로 정문점',
    icon: Fish,
    items: [{ name: '모둠초밥 10p + 미니우동', price: 15000 }],
    deliveryTip: 2000,
    address: '정문 해솔원룸 401호',
    requestMemo: '와사비 조금만 더 챙겨주세요',
  },
]

function orderTotal(order: DeliveryOrder) {
  return order.items.reduce((sum, item) => sum + item.price, 0) + order.deliveryTip
}

export function OrderHistoryList({ onSelect }: { onSelect: (order: DeliveryOrder) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F5F5F5]">
      <header className="flex shrink-0 items-end justify-between bg-white px-4 pb-3 pt-[56px]">
        <h2 className="text-[22px] font-extrabold">주문내역</h2>
        <span className="rounded-full bg-[#F3F6F6] px-2.5 py-1 text-[12px] font-semibold text-[#666]">최근 1개월</span>
      </header>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 pb-6">
        {DELIVERY_ORDERS.map((order) => {
          const Icon = order.icon
          const summary = order.items.length > 1 ? `${order.items[0].name} 외 ${order.items.length - 1}개` : order.items[0].name
          return (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => onSelect(order)}
                className="w-full space-y-2.5 rounded-2xl bg-white p-4 text-left active:bg-black/5"
              >
                <span className="flex items-center justify-between text-[12px] text-[#999]">
                  <span>{order.date}</span>
                  <span className="flex items-center font-semibold" style={{ color: '#009F9A' }}>
                    배달완료
                    <ChevronRight aria-hidden className="size-4" />
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F7]" style={{ color: MINT }}>
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-extrabold">{order.storeName}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-[#666]">{`${summary} · ${won(orderTotal(order))}`}</span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function OrderDetailView({ order, onBack }: { order: DeliveryOrder; onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#F5F5F5]">
      <TopBar title="주문상세" onBack={onBack} />
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3 pb-8">
        <section className="space-y-1.5 rounded-2xl bg-white p-4">
          <span className="inline-block rounded bg-[#2AC1BC]/15 px-2 py-0.5 text-[11px] font-bold text-[#009F9A]">배달완료</span>
          <h3 className="text-[19px] font-extrabold">{order.storeName}</h3>
          <p className="text-[12px] text-[#999]">{`주문일시: ${order.date}`}</p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-4">
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-[12px] font-bold text-[#999]">
              <MapPin aria-hidden className="size-3.5" style={{ color: MINT }} />
              배달 주소
            </p>
            <p className="text-[15px] font-bold">{order.address}</p>
          </div>
          <div className="space-y-1 border-t border-[#F0F0F0] pt-3">
            <p className="text-[12px] font-bold text-[#999]">요청사항</p>
            <p className="rounded-lg bg-[#F7F7F7] p-2.5 text-[13px] text-[#444]">{`"${order.requestMemo}"`}</p>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-4">
          <p className="flex items-center gap-1 text-[12px] font-bold text-[#999]">
            <Receipt aria-hidden className="size-3.5" />
            주문 메뉴
          </p>
          <ul className="space-y-2 text-[14px]">
            {order.items.map((item) => (
              <li key={item.name} className="flex justify-between gap-3 font-medium">
                <span>{item.name}</span>
                <span className="shrink-0">{won(item.price)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-[#F0F0F0] pt-2 text-[13px] text-[#999]">
            <span>배달팁</span>
            <span>{won(order.deliveryTip)}</span>
          </div>
          <div className="flex justify-between border-t border-[#E5E5E5] pt-2 text-[16px] font-extrabold">
            <span>총 결제금액</span>
            <span className="text-[#009F9A]">{won(orderTotal(order))}</span>
          </div>
        </section>
      </div>
    </div>
  )
}
