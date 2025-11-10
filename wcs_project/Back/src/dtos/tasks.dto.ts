// tasks.dto.ts
export type CreateTaskItem = {
  waiting_id?: string;
  stock_item: string;
  plan_qty?: string;
  priority?: number;
  type: string;
  store_type: 'T1' | 'T1M';   // ✅ เพิ่มฟิลด์คลัง
  from_location: string;
};

export type CreateTaskBatchDto = {
  items: CreateTaskItem[];      // อาร์เรย์เสมอ (แม้มี 1 รายการ)
};

export type CreateT1MTaskDto = Omit<CreateTaskItem, 'store_type'>;

