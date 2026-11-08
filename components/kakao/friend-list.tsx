import { Avatar } from './avatar'
import type { Chat } from './chat-data'

type Friend = { name: string; status?: string; avatar?: string }

const OTHER_FRIENDS: Friend[] = [
  { name: '엄마', status: '우리 딸 화이팅' },
  { name: '아빠', status: '건강이 최고' },
  { name: '점장님', status: '카페 영업시간 오전 9:00~오후 20:00' },
  { name: '김대영', },
  { name: '박수진' },
  { name: '이윤아', status: '커피는 아아' },
  { name: '정민우' },
  { name: '사쿠야', status: '한국 생활 n년차' },
  { name: '료' },
]

type FriendListProps = { chats: Chat[]; owner: string }

export function FriendList({ chats, owner }: FriendListProps) {
  const me = { name: owner }
  const characters: Friend[] = chats
    .filter((chat) => !chat.self && !chat.members && chat.avatar)
    .map((chat) => ({ name: chat.name, avatar: chat.avatar }))
  const friends = [...characters, ...OTHER_FRIENDS].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  return (
    <div className="flex-1 overflow-y-auto pb-3 [scrollbar-width:none]">
      {me && (
        <div className="flex items-center gap-3 px-5 py-3">
          <Avatar name={me.name} size={58} />
          <span className="text-[16px] font-semibold tracking-[-0.01em]">{me.name}</span>
        </div>
      )}
      <div className="mx-5 border-t border-black/[0.06]" />
      <h2 className="px-5 pb-1 pt-3 text-[12px] text-[#8A8A8A]">친구 {friends.length}</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend.name} className="flex items-center gap-3 px-5 py-[7px]">
            <Avatar src={friend.avatar} name={friend.name} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium tracking-[-0.01em]">{friend.name}</span>
              {friend.status && (
                <span className="mt-[1px] block truncate text-[12px] text-[#8A8A8A]">{friend.status}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
