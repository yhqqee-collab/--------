import { Bookmark, Eye, MoreHorizontal, ThumbsUp } from 'lucide-react'
import { CommentList } from './comment-list'
import { COMMENTS, POST } from './post-data'

const fmt = (n: number) => n.toLocaleString('ko-KR')

function PostArticle() {
  return (
    <article className="px-4 pb-5 pt-3">
      <nav aria-label="게시판 경로" className="text-[12.5px] font-semibold text-[#0A84FF]">
        {POST.board} <span className="text-black/30">{'>'}</span> {POST.category}
      </nav>
      <h2 className="mt-2 text-balance text-[19px] font-bold leading-[1.35] tracking-tight text-black">{POST.title}</h2>

      <div className="mt-3 flex items-center gap-2.5 border-b border-black/[0.06] pb-3">
        <div className="flex size-[34px] items-center justify-center rounded-full bg-[#E5E5EA] text-[13px] font-bold text-black/40" aria-hidden>
          익
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-black">익명</p>
          <p className="flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-black/40">
            <span>{POST.date}</span>
            <span aria-hidden>|</span>
            <span className="flex items-center gap-[2px]">
              <Eye className="size-[11px]" aria-hidden />
              조회 {fmt(POST.views)}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-[14.5px] leading-[1.7] text-black/85">
        <p className="text-pretty">{POST.intro}</p>
        {POST.sections.map((s) => (
          <section key={s.heading}>
            <h3 className="font-bold text-black">{s.heading}</h3>
            <p className="mt-1 text-pretty">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2.5">
        <span className="flex items-center gap-1.5 rounded-full border border-[#E5484D]/30 px-4 py-[7px] text-[13px] font-semibold text-[#E5484D]">
          <ThumbsUp className="size-[14px]" strokeWidth={2.5} aria-hidden />
          추천 {fmt(POST.likes)}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-[7px] text-[13px] font-semibold text-black/60">
          <Bookmark className="size-[14px]" strokeWidth={2.5} aria-hidden />
          스크랩 {fmt(POST.scraps)}
        </span>
      </div>
    </article>
  )
}

export function PostPage() {
  return (
    <>
      <header className="flex items-center justify-between border-b border-black/[0.06] px-4 pb-2.5">
        <span className="text-[17px] font-extrabold tracking-tight text-black">
          익명<span className="text-[#0A84FF]">판</span>
        </span>
        <MoreHorizontal className="size-[20px] text-black/50" aria-label="메뉴" />
      </header>
      <PostArticle />
      <CommentList comments={COMMENTS} />
    </>
  )
}
