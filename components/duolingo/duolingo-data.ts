export interface DuolingoQuestion {
  id: number
  /** 화면에 제시될 영어 원문 */
  english: string
  /** 화면에 제시될 한국어 뜻 */
  korean: string
  /** 영작 문제일 때: 정답 영어 단어 순서 */
  answerWordsEn: string[]
  /** 영작 문제일 때: 섞여 나오는 오답 영어 단어들 */
  distractorsEn: string[]
  /** 한역 문제일 때: 정답 한국어 어절 순서 */
  answerWordsKo: string[]
  /** 한역 문제일 때: 섞여 나오는 오답 한국어 어절들 */
  distractorsKo: string[]
  /** 하단에 살짝 뜨는 듀오링고 부엉이 한 줄 코멘트 (선택 사항) */
  owlTip?: string
}

export const DUOLINGO_QUESTIONS: DuolingoQuestion[] = [
  {
    id: 1,
    english: 'Sorry, my phone was on silent all evening.',
    korean: '미안해, 저녁 내내 내 휴대폰이 무음이었어.',
    answerWordsEn: ['Sorry,', 'my', 'phone', 'was', 'on', 'silent', 'all', 'evening.'],
    distractorsEn: ['loud', 'morning.', 'his', 'broken'],
    answerWordsKo: ['미안해,', '저녁 내내', '내 휴대폰이', '무음이었어.'],
    distractorsKo: ['아침 내내', '꺼져 있었어.', '고장 났어.'],
    owlTip: '연락이 안 될 때 가장 유용한 표현이에요! 🦉',
  },
  {
    id: 2,
    english: 'I stayed in bed all day because I had a cold.',
    korean: '감기에 걸려서 하루 종일 침대에 누워 있었어.',
    answerWordsEn: ['I', 'stayed', 'in', 'bed', 'all', 'day', 'because', 'I', 'had', 'a', 'cold.'],
    distractorsEn: ['went', 'out', 'party', 'fever.'],
    answerWordsKo: ['감기에 걸려서', '하루 종일', '침대에', '누워 있었어.'],
    distractorsKo: ['밖에', '나갔었어.', '도서관에', '배가 아파서'],
    owlTip: '갑작스러운 주말 약속을 취소할 때 자주 쓰이곤 하죠.',
  },
  {
    id: 3,
    english: 'Is this your hoodie, or did you borrow it from someone?',
    korean: '이거 네 후드티야, 아니면 누군가에게 빌린 거야?',
    answerWordsEn: ['Is', 'this', 'your', 'hoodie,', 'or', 'did', 'you', 'borrow', 'it', 'from', 'someone?'],
    distractorsEn: ['buy', 'shirt,', 'nobody?', 'steal'],
    answerWordsKo: ['이거', '네 후드티야,', '아니면', '누군가에게', '빌린 거야?'],
    distractorsKo: ['내 코트야,', '산 거야?', '버린 거야?'],
    owlTip: '옷 사이즈가 너무 클 때 상대방이 물어볼 수 있어요!',
  },
  {
    id: 4,
    english: "Let's keep this a secret from the others for now.",
    korean: '당분간 다른 사람들에게는 이걸 비밀로 하자.',
    answerWordsEn: ["Let's", 'keep', 'this', 'a', 'secret', 'from', 'the', 'others', 'for', 'now.'],
    distractorsEn: ['tell', 'truth', 'everyone', 'forever.'],
    answerWordsKo: ['당분간', '다른 사람들에게는', '이걸', '비밀로 하자.'],
    distractorsKo: ['모두에게', '자랑하자.', '사실대로 말하자.'],
    owlTip: '소문이 나면 곤란한 일이 있나요? 🤫',
  },
  {
    id: 5,
    english: 'She bought three boxes of the exact same size.',
    korean: '그녀는 정확히 똑같은 크기의 상자를 세 개 샀다.',
    answerWordsEn: ['She', 'bought', 'three', 'boxes', 'of', 'the', 'exact', 'same', 'size.'],
    distractorsEn: ['one', 'box', 'different', 'color.'],
    answerWordsKo: ['그녀는', '정확히', '똑같은 크기의', '상자를', '세 개', '샀다.'],
    distractorsKo: ['다른 모양의', '한 개', '만들었다.', '버렸다.'],
    owlTip: '선물을 여러 개 준비할 때는 헷갈리지 않게 조심하세요!',
  },
  {
    id: 6,
    english: 'It is not easy to remember every promise.',
    korean: '모든 약속을 기억하는 것은 쉽지 않다.',
    answerWordsEn: ['It', 'is', 'not', 'easy', 'to', 'remember', 'every', 'promise.'],
    distractorsEn: ['hard', 'forget', 'lie.', 'name.'],
    answerWordsKo: ['모든 약속을', '기억하는 것은', '쉽지 않다.'],
    distractorsKo: ['거짓말을', '잊는 것은', '아주 쉽다.'],
    owlTip: '약속이 너무 많다면 메모하는 습관을 길러보세요 📝',
  },
  {
    id: 7,
    english: 'Who were you talking to at the coffee shop yesterday?',
    korean: '어제 카페에서 누구랑 이야기하고 있었어?',
    answerWordsEn: ['Who', 'were', 'you', 'talking', 'to', 'at', 'the', 'coffee', 'shop', 'yesterday?'],
    distractorsEn: ['where', 'drinking', 'library', 'tomorrow?'],
    answerWordsKo: ['어제', '카페에서', '누구랑', '이야기하고', '있었어?'],
    distractorsKo: ['오늘', '도서관에서', '무엇을', '먹고 있었어?'],
    owlTip: '캠퍼스 근처에서는 언제 누가 볼지 모른답니다 👀',
  },
  {
    id: 8,
    english: 'Your coat smells like a different perfume today.',
    korean: '오늘 네 코트에서 평소와 다른 향수 냄새가 나.',
    answerWordsEn: ['Your', 'coat', 'smells', 'like', 'a', 'different', 'perfume', 'today.'],
    distractorsEn: ['looks', 'same', 'shampoo', 'yesterday.'],
    answerWordsKo: ['오늘', '네 코트에서', '평소와 다른', '향수 냄새가 나.'],
    distractorsKo: ['내 가방에서', '똑같은', '비누 냄새가 나.'],
    owlTip: '후각이 예민한 사람 앞에서는 조심해야 해요!',
  },
  {
    id: 9,
    english: 'A good memory is necessary if you want to tell a lie.',
    korean: '거짓말을 하려면 좋은 기억력이 필요하다.',
    answerWordsEn: ['A', 'good', 'memory', 'is', 'necessary', 'if', 'you', 'want', 'to', 'tell', 'a', 'lie.'],
    distractorsEn: ['bad', 'excuse', 'useless', 'truth.'],
    answerWordsKo: ['거짓말을', '하려면', '좋은 기억력이', '필요하다.'],
    distractorsKo: ['진실을', '말하려면', '빠른 눈치가', '중요하다.'],
    owlTip: '어제 한 말과 오늘 한 말이 다르면 큰일 나겠죠? 🦉',
  },
  {
    id: 10,
    english: 'Wait for me outside after the party ends.',
    korean: '파티가 끝난 뒤에 밖에서 날 기다려 줘.',
    answerWordsEn: ['Wait', 'for', 'me', 'outside', 'after', 'the', 'party', 'ends.'],
    distractorsEn: ['inside', 'before', 'starts.', 'leave'],
    answerWordsKo: ['파티가', '끝난 뒤에', '밖에서', '날', '기다려 줘.'],
    distractorsKo: ['시작하기 전에', '안에서', '먼저 가 있어.'],
    owlTip: '밖에서 기다리는 사람이 한 명뿐인지 먼저 확인하세요!',
  },
]