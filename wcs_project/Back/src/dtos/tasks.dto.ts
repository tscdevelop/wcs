// tasks.dto.ts
export type CreateTaskItem = {
  sku: string;
  qty?: string;
  priority?: number; // 1–9 (ตรวจช่วงที่ runtime)
};

export type CreateTaskBatchDto = {
  order_id?: string;            // optional: ถ้า client ไม่ส่งมา ระบบจะตั้งจาก task ตัวแรก
  items: CreateTaskItem[];      // อาร์เรย์เสมอ (แม้มี 1 รายการ)
};

export type CreateT1MTaskDto = CreateTaskItem & {
  order_id?: string;            // ส่งจาก orchestrator → T1M
};
