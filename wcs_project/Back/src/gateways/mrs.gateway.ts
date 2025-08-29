// gateways/mrs.gateway.ts
// types = รูปร่างของข้อมูล (ระบุว่ามีฟิลด์อะไรบ้าง ชนิดไหน)

import mqtt, { IClientOptions, MqttClient } from 'mqtt';

// ACK ของคำสั่งเปิด/ปิด (ของเดิม)
export type OpenCloseAck =
  | {
      ok: true;
      status: 'accepted' | 'queued';
      task_mrs_id: string;
      controller_job_id: string;
      received_at: string;
    }
  | {
      ok: false;
      code: string;
      message: string;
      retryable?: boolean;
    };

// สัญญา Gateway (ของเดิม)
export interface MrsGateway {
    openAisle(cmd: { mrs_id: number; aisle_id: number; task_mrs_id: string }): Promise<OpenCloseAck>;
    closeAisle(cmd: { mrs_id: number; aisle_id: number; task_mrs_id: string }): Promise<OpenCloseAck>;
    isAisleSensorClear?(aisle_id?: number): Promise<boolean>;
}

/**
 * Implement MrsGateway บน MQTT
 * - publish คำสั่งที่ mrs/{mrs_id}/cmd (QoS 1)
 * - subscribe ACK ที่ mrs/{mrs_id}/ack แล้ว match ด้วย task_mrs_id (correlation key)
 * - รองรับ timeout -> คืน { ok:false, code:'ACK_TIMEOUT', ... }
 */
export class MqttMrsGateway implements MrsGateway {
    private client: MqttClient;
    private pending = new Map<
        string,
        { resolve: (a: OpenCloseAck) => void; reject: (e: any) => void; timer: NodeJS.Timeout }
    >();

    constructor(
        brokerUrl: string,
        clientOpts?: IClientOptions,
        private opts: { ackTimeoutMs?: number; topicPrefix?: string } = {},
        private cb?: { onOpenFinished?(p:{task_mrs_id:string;duration_ms?:number}):void; onCloseFinished?(p:{task_mrs_id:string;duration_ms?:number}):void }
    ) {
        this.client = mqtt.connect(brokerUrl, clientOpts);
        this.client.on('connect', () => {
        const prefix = this.opts.topicPrefix ?? 'mrs';
        this.client.subscribe([`${prefix}/+/ack`, `${prefix}/+/event`], { qos: 1 });
        });

        this.client.on('message', (topic, buffer) => {
        const msg = JSON.parse(buffer.toString());
        if (topic.endsWith('/ack')) this.handleAck(msg);
        if (topic.endsWith('/event')) this.handleEvent(msg);
        });

        this.client.on('close', () => this.flushPendingOnDisconnect());
    }
    private handleEvent(msg:any){
        // คาดรูปแบบจาก controller:
        // { type:'OPEN_FINISHED', task_mrs_id:'123', duration_ms:1200 } หรือ { type:'CLOSE_FINISHED', ... }
        if (msg?.type === 'OPEN_FINISHED') this.cb?.onOpenFinished?.({ task_mrs_id: String(msg.task_mrs_id), duration_ms: msg.duration_ms });
        if (msg?.type === 'CLOSE_FINISHED') this.cb?.onCloseFinished?.({ task_mrs_id: String(msg.task_mrs_id), duration_ms: msg.duration_ms });
    }

    private flushPendingOnDisconnect(){
        // กัน promise แขวนถ้า broker หลุด
        for (const [key, entry] of this.pending) {
        clearTimeout(entry.timer);
        entry.resolve({ ok:false, code:'MQTT_DISCONNECTED', message:'Broker disconnected', retryable:true });
        this.pending.delete(key);
        }
    }

    async openAisle(cmd: { mrs_id: number; aisle_id: number; task_mrs_id: string }): Promise<OpenCloseAck> {
        return this.sendCommand('OPEN_AISLE', cmd);
    }

    async closeAisle(cmd: { mrs_id: number; aisle_id: number; task_mrs_id: string }): Promise<OpenCloseAck> {
        return this.sendCommand('CLOSE_AISLE', cmd);
    }

    // ตัวช่วยส่งคำสั่ง + รอ ACK
    private sendCommand(
        type: 'OPEN_AISLE' | 'CLOSE_AISLE',
        cmd: { mrs_id: number; aisle_id: number; task_mrs_id: string }
    ): Promise<OpenCloseAck> {
        const key = String(cmd.task_mrs_id); // correlation key
        const prefix = this.opts.topicPrefix ?? 'mrs';
        const topic = `${prefix}/${cmd.mrs_id}/cmd`;
        const payload = {
        type,
        aisle_id: cmd.aisle_id,
        task_mrs_id: key,                      // ให้ device สะท้อนคืนมาใน ACK
        ts: new Date().toISOString(),
        };

        // ทำ promise ที่จะ resolve เมื่อได้ ACK (หรือ timeout)
        const ackTimeout = this.opts.ackTimeoutMs ?? 10000; // 10s
        return new Promise<OpenCloseAck>((resolve) => {
        const timer = setTimeout(() => {
            // timeout: ถ้ามี pending อยู่ให้ลบ แล้วคืน error
            this.pending.delete(key);
            resolve({
            ok: false,
            code: 'ACK_TIMEOUT',
            message: `No ACK for ${type} within ${ackTimeout} ms`,
            retryable: true,
            });
        }, ackTimeout);

        this.pending.set(key, { resolve, reject: resolve, timer });

        // publish คำสั่ง
        this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
        });
    }

    // รับ ACK จากอุปกรณ์แล้วแมปเป็น OpenCloseAck
    private handleAck(msg: any) {
        // คาดรูปแบบ ACK จาก device เช่น:
        // { task_mrs_id: "123", ok: true, status: "accepted", controller_job_id: "job-abc", ts: "..." }
        // หรือ { task_mrs_id: "123", ok: false, code: "BUSY", message: "device busy", retryable: true }

        const key = String(msg?.task_mrs_id ?? '');
        if (!key || !this.pending.has(key)) return;

        const entry = this.pending.get(key)!;
        clearTimeout(entry.timer);
        this.pending.delete(key);

        let ack: OpenCloseAck;
        if (msg?.ok === true) {
        ack = {
            ok: true,
            status: (msg.status as 'accepted' | 'queued') ?? 'accepted',
            task_mrs_id: key,
            controller_job_id: String(msg.controller_job_id ?? ''),
            received_at: String(msg.ts ?? new Date().toISOString()),
        };
        } else {
        ack = {
            ok: false,
            code: String(msg.code ?? 'UNKNOWN'),
            message: String(msg.message ?? 'Unknown error'),
            retryable: Boolean(msg.retryable),
        };
        }
        entry.resolve(ack); 
    }
}
