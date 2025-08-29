// gateways/mrs.gateway.mock.ts
// gateway = ชั้นคั่นกลางระหว่าง service ของคุณกับ “อุปกรณ์/ระบบภายนอก” (เช่น MRS controller) → ทำให้ service ไม่ต้องรู้ว่าไปคุยกันด้วย HTTP/MQTT/OPC ฯลฯ
import { MrsGateway, OpenCloseAck } from './mrs.gateway';

type Callbacks = {
    onOpenFinished(payload: { task_mrs_id: string; duration_ms?: number }): void;
    onCloseFinished(payload: { task_mrs_id: string; duration_ms?: number }): void;
};

// → รับคำสั่ง → ตอบรับ (ACK) ทันที → ตั้งเวลาแล้ว “โยนอีเวนต์กลับ”
export class MockMrsGateway implements MrsGateway {
    constructor(private cb: Callbacks) {}

    async openAisle({ task_mrs_id }: { mrs_id:number; aisle_id:number; task_mrs_id:string }): Promise<OpenCloseAck> {
        setTimeout(() => this.cb.onOpenFinished({ task_mrs_id, duration_ms: 1200 }), 300);
        return {
            ok: true, status: 'accepted', task_mrs_id,
            controller_job_id: `mock-${task_mrs_id}`, received_at: new Date().toISOString()
        };
    }

    async closeAisle({ task_mrs_id }: { mrs_id:number; aisle_id:number; task_mrs_id:string }): Promise<OpenCloseAck> {
        setTimeout(() => this.cb.onCloseFinished({ task_mrs_id, duration_ms: 1400 }), 300);
        return {
            ok: true, status: 'accepted', task_mrs_id,
            controller_job_id: `mock-${task_mrs_id}`, received_at: new Date().toISOString()
        };
    }
    
    // ให้รับพารามิเตอร์ (ไม่ใช้ก็ได้) เพื่อให้ตรง interface ใหม่
    async isAisleSensorClear(_aisle_id?: number): Promise<boolean> { 
        return true; 
    }
}
