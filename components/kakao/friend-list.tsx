import { CHARACTERS, GROUP_MEMBERS, OWNER_AVATAR } from '@/lib/template-config'
import { Avatar } from './avatar'
import type { Chat } from './chat-data'

type Friend = { name: string; status?: string; avatar?: string }

const FRIENDS: Friend[] = [
  { name: CHARACTERS.a.name, avatar: CHARACTERS.a.avatar },
  { name: CHARACTERS.b.name, avatar: CHARACTERS.b.avatar },
  { name: CHARACTERS.c.name, avatar: CHARACTERS.c.avatar },
  { name: GROUP_MEMBERS.daeyoung.name, avatar: GROUP_MEMBERS.daeyoung.avatar },
  { name: GROUP_MEMBERS.ryo.name, avatar: GROUP_MEMBERS.ryo.avatar },
  { name: GROUP_MEMBERS.sakuya.name, avatar: GROUP_MEMBERS.sakuya.avatar },
  { name: '엄마', avatar: '/images/kakao/mom.png', status: '우리 딸 화이팅' },
  { name: '아빠', status: '건강이 최고' },
  { name: '동기 수진이' },
].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

type FriendListProps = { chats: Chat[]; owner: string }

export function FriendList({ owner }: FriendListProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-3 [scrollbar-width:none]">
      <div className="flex items-center gap-3 px-5 py-3">
        <Avatar src={OWNER_AVATAR} name={owner} size={58} />
        <span className="text-[16px] font-semibold tracking-[-0.01em]">{owner}</span>
      </div>
      <div className="mx-5 border-t border-black/[0.06]" />
      <h2 className="px-5 pb-1 pt-3 text-[12px] text-[#8A8A8A]">친구 {FRIENDS.length}</h2>
      <ul>
        {FRIENDS.map((friend) => (
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
