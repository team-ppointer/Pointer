import { DummyItem } from '../components/ScrapItemGrid';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// 랜덤 제목 생성
const randomTitle = () => '이름' + randomInt(1, 1000);

// SCRAP 아이템 랜덤 생성
const createRandomScrap = (): DummyItem => ({
  id: randomInt(1000, 9999).toString(),
  type: 'SCRAP',
  title: randomTitle() + '스크랩',
  timestamp: 202511000000 - randomInt(0, 100000),
});

// FOLDER 안에 SCRAP 몇 개 넣기
const createRandomFolder = (id: string, title?: string): DummyItem => {
  const count = randomInt(2, 5); // 2~5개
  const contents = Array.from({ length: count }, () => createRandomScrap());

  return {
    id,
    type: 'FOLDER',
    title: title ?? randomTitle() + '폴더',
    amount: contents.length,
    timestamp: 202510000000 - randomInt(0, 100000),
    contents,
  };
};

// 데이터 생성
export const folderDummy: DummyItem[] = [
  // REVIEW 폴더 고정
  {
    id: 'REVIEW',
    type: 'FOLDER',
    title: '오답노트',
    amount: 3,
    timestamp: 202410191130,
    contents: Array.from({ length: 3 }, () => createRandomScrap()),
  },
  // 랜덤 FOLDER/SCRAP 12개
  ...Array.from({ length: 12 }, (_, i) => {
    const id = (i + 1).toString();
    if (Math.random() < 0.63) {
      // FOLDER
      return createRandomFolder(id);
    } else {
      // SCRAP
      return createRandomScrap();
    }
  }),
];
