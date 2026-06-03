export type TimeAgoType =
  | '방금 전'
  | `${number}초 전`
  | `${number}분 전`
  | `${number}시간 전`
  | `${number}일 전`;

export const toTimeAgo = (date: Date): TimeAgoType => {
  const timeTerm: number = (Date.now() - date.getTime()) / 1000;
  if (timeTerm < 5) return '방금 전';
  if (timeTerm < 60) return `${Math.floor(timeTerm)}초 전`;
  if (timeTerm < 60 * 60) return `${Math.floor(timeTerm / 60)}분 전`;
  if (timeTerm < 60 * 60 * 24)
    return `${Math.floor(timeTerm / (60 * 60))}시간 전`;
  return `${Math.floor(timeTerm / (60 * 60 * 24))}일 전`;
};

export type DateFormatObject = {
  ISOFormat: string;
  timeAgo: TimeAgoType;
};
