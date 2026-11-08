import { CornerDownRight, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PostComment } from './post-data'

function CommentItem({ comment, reply = false }: { comment: PostComment; reply?: boolean }) {
  return (
    <div className={cn('flex gap-2', reply && 'rounded-[10px] bg-[#F5F5F7] px-3 py-2.5')}>
      {reply && <CornerDownRight className="mt-[3px] size-[14px] shrink-0 text-black/30" aria-hidden />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-[13px] font-semibold', comment.isWriter ? 'text-[#0A84FF]' : 'text-black')}>
            {comment.author}
            {comment.isWriter && <span className="ml-1 font-medium">(글쓴이)</span>}
          </p>
          {comment.likes !== undefined && (
            <span className="flex items-center gap-[3px] text-[11.5px] font-medium text-[#E5484D]">
              <ThumbsUp className="size-[11px]" strokeWidth={2.5} aria-hidden />
              <span className="sr-only">추천</span>
              {comment.likes}
            </span>
          )}
        </div>
        <p className="mt-1 text-pretty text-[14px] leading-[1.5] text-black/85">{comment.text}</p>
        <p className="mt-1 text-[11px] text-black/35">{comment.time}</p>
      </div>
    </div>
  )
}

export function CommentList({ comments }: { comments: PostComment[] }) {
  const total = comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0)

  return (
    <section aria-labelledby="comments-heading" className="border-t-[8px] border-[#F2F2F7] px-4 pb-6 pt-4">
      <h3 id="comments-heading" className="text-[14px] font-bold text-black">
        댓글 <span className="text-[#0A84FF]">{total}</span>
      </h3>
      <ul className="mt-1 divide-y divide-black/[0.06]">
        {comments.map((comment) => (
          <li key={comment.id} className="py-3.5">
            <CommentItem comment={comment} />
            {comment.replies && (
              <ul className="mt-2.5 space-y-2">
                {comment.replies.map((r) => (
                  <li key={r.id}>
                    <CommentItem comment={r} reply />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
