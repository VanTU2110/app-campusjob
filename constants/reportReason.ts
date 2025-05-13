export type ReportReason =
  | 'fake_information'
  | 'scam_fraud'
  | 'inappropriate'
  | 'spam'
  | 'duplicate'
  | 'wrong_category'
  | 'offensive'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'fake_information', label: 'Thông tin giả' },
  { value: 'scam_fraud', label: 'Lừa đảo / gian lận' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'spam', label: 'Spam / quảng cáo' },
  { value: 'duplicate', label: 'Tin đăng trùng lặp' },
  { value: 'wrong_category', label: 'Sai ngành nghề' },
  { value: 'offensive', label: 'Nội dung xúc phạm' },
  { value: 'other', label: 'Khác' },
];
