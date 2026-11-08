'use client'

import { ArrowLeft, X } from 'lucide-react'
import { useState } from 'react'
import { HOME, routeKm, searchPlaces } from './map-utils'
import { PlaceIcon } from './place-icon'

type MapSearchProps = {
  placeholder: string
  excludeId?: string | null
  onClose: () => void
  onPick: (id: string) => void
}

export function MapSearch({ placeholder, excludeId, onClose, onPick }: MapSearchProps) {
  const [query, setQuery] = useState('')
  const results = searchPlaces(query).filter((place) => place.id !== excludeId)

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white">
      <div className="flex items-center gap-1 border-b border-[#E8EAED] px-2 pb-2 pt-[52px]">
        <button
          type="button"
          aria-label="검색 닫기"
          onClick={onClose}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#3C4043] active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <label htmlFor="map-search-input" className="sr-only">
          장소 검색
        </label>
        <input
          id="map-search-input"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229) return
            if (results[0]) onPick(results[0].id)
          }}
          enterKeyHint="search"
          autoComplete="off"
          placeholder={placeholder}
          className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-[#202124] outline-none placeholder:text-[#80868B]"
        />
        {query && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => setQuery('')}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#5F6368] active:bg-black/5"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="px-4 pb-1 pt-3 text-[13px] font-medium text-[#5F6368]">{query ? '검색 결과' : '추천 장소'}</p>
        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-[15px] text-[#5F6368]">{`'${query}'에 대한 검색 결과가 없습니다.`}</p>
        ) : (
          <ul>
            {results.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onPick(place.id)}
                  className="flex min-h-[60px] w-full items-center gap-3 px-4 py-2 text-left active:bg-black/5"
                >
                  <PlaceIcon kind={place.kind} className="size-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] text-[#202124]">{place.name}</span>
                    <span className="block truncate text-[13px] text-[#5F6368]">
                      {place.dong} · {place.address}
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] text-[#5F6368]">
                    {place.id === HOME.id ? '내 위치' : `${routeKm(HOME, place)}km`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
