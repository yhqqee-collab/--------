"use client";

import {
  Beef,
  Bell,
  ChevronDown,
  Coffee,
  Drumstick,
  House,
  Moon,
  ReceiptText,
  Pizza,
  Sandwich,
  Search,
  ShoppingCart,
  Soup,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AppShell } from "@/components/phone/app-shell";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  DELIVERY_LABEL,
  ORDER_STEPS,
  STORES,
  won,
  type CategoryId,
} from "./baemin-data";
import {
  CartView,
  cartCount,
  MINT,
  OrderStatusView,
  StoreView,
  type Cart,
} from "./baemin-store";
import {
  OrderDetailView,
  OrderHistoryList,
  type DeliveryOrder,
} from "./baemin-orders";

const CATEGORY_ICONS: Record<CategoryId, typeof Drumstick> = {
  chicken: Drumstick,
  bunsik: Soup,
  burger: Sandwich,
  chinese: UtensilsCrossed,
  cafe: Coffee,
  meat: Beef,
  pizza: Pizza,
  night: Moon,
};

type View = "home" | "store" | "cart" | "order";

export function BaeminApp({ open }: { open: boolean }) {
  const [view, setView] = useState<View>("home");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [cartStoreId, setCartStoreId] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [orderStep, setOrderStep] = useState(0);
  const [tab, setTab] = useState<"home" | "orders">("home");
  const [pastOrder, setPastOrder] = useState<DeliveryOrder | null>(null);

  const store = STORES.find((item) => item.id === storeId) ?? null;
  const cartStore = STORES.find((item) => item.id === cartStoreId) ?? null;
  const normalized = query.trim().toLowerCase();
  const stores = STORES.filter(
    (item) =>
      (!category || item.category === category) &&
      (!normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.menu.some((menu) => menu.name.toLowerCase().includes(normalized))),
  );

  function changeQty(targetStoreId: string, itemId: string, qty: number) {
    setCart((prev) => {
      const base = cartStoreId === targetStoreId ? prev : {};
      const next = { ...base, [itemId]: Math.max(0, Math.min(qty, 20)) };
      if (next[itemId] === 0) delete next[itemId];
      return next;
    });
    setCartStoreId(targetStoreId);
  }

  return (
    <AppShell open={open} label="배달의민족" className="bg-white text-[#222]">
      <div className="relative flex min-h-0 flex-1 flex-col">
        {tab === "orders" ? (
          <OrderHistoryList onSelect={setPastOrder} />
        ) : (
          <>
            <header
              className="shrink-0 px-4 pb-3 pt-[54px] text-white"
              style={{ backgroundColor: MINT }}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex min-h-11 items-center gap-1 text-[18px] font-extrabold"
                >
                  {DELIVERY_LABEL}
                  <ChevronDown aria-hidden className="size-5" />
                </button>
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="알림"
                    className="flex size-11 items-center justify-center"
                  >
                    <Bell className="size-6" />
                  </button>
                  <button
                    type="button"
                    aria-label={`장바구니 ${cartCount(cart)}개`}
                    onClick={() =>
                      cartStore && cartCount(cart) > 0 && setView("cart")
                    }
                    className="relative flex size-11 items-center justify-center"
                  >
                    <ShoppingCart className="size-6" />
                    {cartCount(cart) > 0 && (
                      <span
                        className="absolute right-1 top-1 flex size-[18px] items-center justify-center rounded-full bg-white text-[11px] font-bold"
                        style={{ color: MINT }}
                      >
                        {cartCount(cart)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <label className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-[#222]">
                <Search
                  aria-hidden
                  className="size-5"
                  style={{ color: MINT }}
                />
                <span className="sr-only">가게 또는 메뉴 검색</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="찾는 맛집 이름이 뭐예요?"
                  enterKeyHint="search"
                  className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#999]"
                />
              </label>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
              <section
                aria-label="카테고리"
                className="grid grid-cols-4 gap-y-3 px-3 py-4"
              >
                {CATEGORIES.map(({ id, label }) => {
                  const Icon = CATEGORY_ICONS[id];
                  const active = category === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategory(active ? null : id)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span
                        className={cn(
                          "flex size-14 items-center justify-center rounded-2xl",
                          active ? "text-white" : "bg-[#F3F6F6] text-[#333]",
                        )}
                        style={active ? { backgroundColor: MINT } : undefined}
                      >
                        <Icon aria-hidden className="size-7" />
                      </span>
                      <span
                        className={cn("text-[12px]", active && "font-bold")}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </section>

              <div className="mx-4 flex items-center gap-3 rounded-2xl bg-[#1E2A39] px-4 py-3.5 text-white">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src="/images/icons/baemin.png"
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <div>
                  <p className="text-[15px] font-bold">
                    시험기간 야식 쿠폰 3,000원
                  </p>
                  <p className="text-[12px] text-white/70">
                    소원대 주변 가게에서 사용 가능
                  </p>
                </div>
              </div>

              <h2 className="px-4 pb-1 pt-6 text-[18px] font-extrabold">
                {category
                  ? CATEGORIES.find((item) => item.id === category)?.label
                  : "우리 동네 인기 맛집"}
              </h2>
              {stores.length === 0 ? (
                <p className="px-4 py-10 text-center text-[14px] text-[#888]">
                  검색 결과가 없어요
                </p>
              ) : (
                <ul>
                  {stores.map((item) => {
                    const Icon = CATEGORY_ICONS[item.category];
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setStoreId(item.id);
                            setView("store");
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-black/5"
                        >
                          <span
                            className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-[#E6F8F7]"
                            style={{ color: MINT }}
                          >
                            <Icon aria-hidden className="size-8" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[16px] font-bold">
                              {item.name}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-[13px]">
                              <Star
                                aria-hidden
                                className="size-3.5 fill-[#FFC300] text-[#FFC300]"
                              />
                              <span className="font-bold">{item.rating}</span>
                              <span className="text-[#888]">{`(${item.reviews.toLocaleString("ko-KR")})`}</span>
                              <span className="text-[#888]">{` · ${item.minutes[0]}~${item.minutes[1]}분`}</span>
                            </span>
                            <span className="mt-0.5 block truncate text-[13px] text-[#888]">
                              {`배달팁 ${won(item.deliveryFee)} · ${item.tagline}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}

        <nav
          aria-label="배달의민족 메뉴"
          className="flex shrink-0 border-t border-[#EEE] bg-white pb-[22px]"
        >
          {(
            [
              { id: "home", label: "홈", Icon: House },
              { id: "orders", label: "주문내역", Icon: ReceiptText },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setTab(id)}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px]",
                  active ? "font-bold text-[#222]" : "text-[#999]",
                )}
              >
                <Icon
                  aria-hidden
                  className="size-6"
                  style={active ? { color: MINT } : undefined}
                />
                {label}
              </button>
            );
          })}
        </nav>

        {pastOrder && (
          <OrderDetailView
            order={pastOrder}
            onBack={() => setPastOrder(null)}
          />
        )}

        {view !== "home" && store && (
          <StoreView
            store={store}
            cart={cartStoreId === store.id ? cart : {}}
            onBack={() => setView("home")}
            onChange={(itemId, qty) => changeQty(store.id, itemId, qty)}
            onOpenCart={() => setView("cart")}
          />
        )}
        {(view === "cart" || view === "order") && cartStore && (
          <CartView
            store={cartStore}
            cart={cart}
            onBack={() => setView(store ? "store" : "home")}
            onChange={(itemId, qty) => changeQty(cartStore.id, itemId, qty)}
            onOrder={() => {
              setOrderStep(0);
              setView("order");
            }}
          />
        )}
        {view === "order" && cartStore && (
          <OrderStatusView
            store={cartStore}
            step={orderStep}
            onAdvance={() =>
              setOrderStep((step) => Math.min(step + 1, ORDER_STEPS.length - 1))
            }
            onClose={() => {
              setCart({});
              setCartStoreId(null);
              setView("home");
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
