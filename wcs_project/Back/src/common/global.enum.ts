export enum Language {
    TH = "th",
    EN = "en"
}

export enum LabTestParamDataType {
    STRING = 'STRING',
    JSON = 'JSON',
    NUMBER = 'NUMBER',
    OBJECT = 'OBJECT',
    ARRAY = 'ARRAY',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
}

export enum Directories {
    register_image = "dirUploadRigisterImage",
    employee_image = "dirUploadEmployeeImage",
    outbound_tooling_image = "dirUploadOutboundToolingImage",
}

export enum Mode {
    AUTO = 'AUTO',
    MANUAL = 'MANUAL',
    MAINT = 'MAINT'
}

export enum Health {
    OK = 'OK',
    WARN = 'WARN',
    FAULT = 'FAULT'
}

export enum Connectivity {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    DEGRADED = 'DEGRADED'
}

export enum MrsLogAction {
    OPEN_AISLE = 'OPEN_AISLE',
    CLOSE_AISLE = 'CLOSE_AISLE',
    // MOVE = 'MOVE',
    // HOMING = 'HOMING',
    // CUSTOM = 'CUSTOM',
    JOIN_OPEN_SESSION = 'JOIN_OPEN_SESSION',           // ขอเข้าแถวใน session ที่เปิดค้างอยู่
    CONTINUE_IN_OPEN_SESSION = 'CONTINUE_IN_OPEN_SESSION' // ส่งไม้ต่อให้ task ถัดไปใน session เดิม
}

export enum LogResult {
    PENDING = 'PENDING',  //รอดำเนินการ
    IN_PROGRESS = 'IN_PROGRESS',    //กำลังดำเนินการ
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
    CANCELLED ='CANCELLED',
    DISCARDED = 'DISCARDED'
}

export enum RobotType {
    MRS = 'MRS',
    WRS = 'WRS'
}

export enum TargetScope {
    GLOBAL = 'GLOBAL',
    BY_DEVICE = 'BY_DEVICE',
    BY_AISLE = 'BY_AISLE'
}

export enum ControlSource {
    MANUAL = 'MANUAL',
    AUTO = 'AUTO'
}

export enum StatusTasks {
    NEW = 'NEW',
    ROUTING = 'ROUTING',
    EXECUTING = 'EXECUTING',
    WAIT_CONFIRM = 'WAIT_CONFIRM',
    CLOSING = 'CLOSING',
    DONE = 'DONE',
    FAILED = 'FAILED',
    CANCELLED ='CANCELLED',
    QUEUED = 'QUEUED', 
}
/*
ตอนสร้างงาน → NEW

ระหว่าง resolve SKU→aisle (ถ้าทำแยกเฟส) → ROUTING

หลังจอง MRS และยิงคำสั่ง OPEN แล้ว → EXECUTING [กำลัง “เปิดช่อง” อยู่ (สั่ง openAisle ไปแล้ว แต่ onOpenFinished ยังไม่มา)]

เปิดสำเร็จ รอผู้ใช้ → WAIT_CONFIRM [เปิดเสร็จแล้ว (ได้รับ onOpenFinished หรือเป็นเคส “ทำต่อในช่องเดิม” ที่เรา mark OPEN = SUCCESS แบบ synthetic) กำลังรอคนกดคอนเฟิร์มเพื่อปิด]

ยิงคำสั่ง CLOSE แล้ว → CLOSING [สั่งปิดแล้ว (ส่ง closeAisle) แต่ onCloseFinished ยังไม่มา]

ปิดสำเร็จ → DONE [(ได้ onCloseFinished)]

ผิดพลาด → FAILED, ยกเลิก → CANCELLED
*/

export enum AisleStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    BLOCKED = 'BLOCKED'
}

export enum TaskMrsAction {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
}

export enum WrsAction {
    MOVE_TO_SOURCE = 'MOVE_TO_SOURCE',
    PICK = 'PICK',
    MOVE_TO_COUNTER = 'MOVE_TO_COUNTER',
    WAIT_USER_CONFIRM = 'WAIT_USER_CONFIRM',
    RETURN_TO_STORAGE = 'RETURN_TO_STORAGE',
    TO_CHARGER = 'TO_CHARGER',
    CHARGING = 'CHARGING',
    CUSTOM ='CUSTOM'
}

// ----- เพิ่มใหม่สำหรับ Task History / Timeline -----

// เหตุการณ์ระดับ "งาน" (semantic lifecycle)
export enum TaskEvent {
    TASK_CREATED = 'TASK_CREATED',
    TASK_ROUTING = 'TASK_ROUTING',
    TASK_EXECUTING = 'TASK_EXECUTING',
    TASK_WAIT_CONFIRM = 'TASK_WAIT_CONFIRM',
    QUEUED = 'QUEUED',
    USER_CONFIRM = 'USER_CONFIRM',
    USER_CONFIRM_BLOCKED = 'USER_CONFIRM_BLOCKED',
    TASK_CLOSING = 'TASK_CLOSING',
    TASK_DONE = 'TASK_DONE',
    TASK_FAILED = 'TASK_FAILED',
    TASK_CANCELLED = 'TASK_CANCELLED',
    CLOSE_ALREADY_SUCCESS = 'CLOSE_ALREADY_SUCCESS',
    CLOSE_SUCCESS = 'CLOSE_SUCCESS',
    SESSION_CLOSED = 'SESSION_CLOSED',
}

// เหตุผล/สาเหตุประกอบเหตุการณ์ (optional)
export enum TaskReason {
    BANK_BUSY = 'BANK_BUSY',            // ธนาคารเดียวกันมีช่องเปิดอยู่/ติดงานอื่น → ต้องเข้าคิว
    SENSOR_BLOCKED = 'SENSOR_BLOCKED',  // เซนเซอร์ยังมีสิ่งกีดขวาง
    PREEMPT = 'PREEMPT',                // ถูกแทรกโดยงาน priority สูงกว่าใน bank เดียวกัน (คนละ aisle)
    DUPLICATE = 'DUPLICATE',            // งานซ้ำซ้อน (ถ้าใช้)
    INVALID_STATE = 'INVALID_STATE',    // สถานะไม่ถูกต้องสำหรับแอ็กชันนั้น ๆ
    UNKNOWN = 'UNKNOWN',
    NO_DEVICE = 'NO_DEVICE',                
    JOIN_OPEN_SESSION = 'JOIN_OPEN_SESSION', 
    CONTINUE_IN_OPEN_SESSION = 'CONTINUE_IN_OPEN_SESSION', // ส่งไม้ต่อใน session เดิม
    NO_NEXT_SAME_AISLE = 'NO_NEXT_SAME_AISLE',     // ไม่มีงานคิวเดียวกันในช่องเดิม
    CLOSE_FINISHED_DUP = 'CLOSE_FINISHED_DUP',     // callback ปิดซ้ำ/idempotent
    CLOSE_FINISHED = 'CLOSE_FINISHED',
}

// ซับซิสเต็มที่ทำให้เกิดเหตุการณ์ (optional)
export enum TaskSubsystem {
    CORE = 'CORE',        // เลเยอร์ orchestrator/บริการหลัก
    MRS = 'MRS',          // ฝั่ง Mobile Rack System
    WRS = 'WRS',          // ฝั่งหุ่นยนต์ WRS (เผื่ออนาคต)
    GATEWAY = 'GATEWAY',  // เกตเวย์อุปกรณ์
}

// แหล่งที่มาของการทริกเกอร์เหตุการณ์ (optional)
export enum TaskSource {
    API = 'API',            // มาจาก REST API / Controller
    DISPATCHER = 'DISPATCHER', // ตัวจัดคิว/จองเครื่อง
    GATEWAY = 'GATEWAY',    // คอลแบ็กจากอุปกรณ์
    SYSTEM = 'SYSTEM',      // งานเบื้องหลัง/ระบบภายใน
    USER = 'USER',          // ผู้ใช้กดปุ่ม
}
