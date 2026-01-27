// gateways/mrs.gateway.mock.ts
// gateway = ชั้นคั่นกลางระหว่าง service ของคุณกับ “อุปกรณ์/ระบบภายนอก” (เช่น MRS controller) → ทำให้ service ไม่ต้องรู้ว่าไปคุยกันด้วย HTTP/MQTT/OPC ฯลฯ
import { MrsGateway, OpenCloseAck } from './mrs.gateway';

type Callbacks = {
    onOpenFinished(payload: { order_id: number; aisle_id: number, duration_ms?: number }): void;
    //onCloseFinished(payload: { order_id: number; duration_ms?: number }): void;
};

// → รับคำสั่ง → ตอบรับ (ACK) ทันที → ตั้งเวลาแล้ว “โยนอีเวนต์กลับ”
export class MockMrsGateway implements MrsGateway {
    constructor(private cb: Callbacks) {}

async openAisle({ order_id, aisle_id }: { mrs_id: number; aisle_id: number; order_id: number }): Promise<OpenCloseAck> {
    setTimeout(() => this.cb.onOpenFinished({ order_id, aisle_id, duration_ms: 1200 }), 300);
    return {
        ok: true,
        status: 'accepted',
        order_id,
        controller_job_id: `mock-${order_id}`,
        received_at: new Date().toISOString()
    };
}


    // async closeAisle({ order_id }: { mrs_id:string; aisle_id:string; order_id:string }): Promise<OpenCloseAck> {
    //     setTimeout(() => this.cb.onCloseFinished({ order_id, duration_ms: 1400 }), 300);
    //     return {
    //         ok: true, status: 'accepted', order_id,
    //         controller_job_id: `mock-${order_id}`, received_at: new Date().toISOString()
    //     };
    // }
    
}
