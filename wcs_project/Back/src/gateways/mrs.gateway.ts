import mqtt, { IClientOptions, MqttClient } from 'mqtt';

// ACK ของคำสั่งเปิด/ปิด
export type OpenCloseAck =
    | {
        ok: true;
        status: 'accepted' | 'queued';
        order_id: string;
        controller_job_id: string;
        received_at: string;
        }
    | {
        ok: false;
        code: string;
        message: string;
        retryable?: boolean;
        };

// สัญญา Gateway (interface)
export interface MrsGateway {
    openAisle(cmd: { mrs_id: string; aisle_id: string; order_id: string }): Promise<OpenCloseAck>;
    closeAisle?(cmd: { mrs_id: string; aisle_id: string; order_id: string }): Promise<OpenCloseAck>;
    isAisleSensorClear?(aisle_id?: string): Promise<boolean>;

    /** ✅ เพิ่มใหม่ (ใช้ใน SystemStartupService) */
    healthCheck?(): Promise<boolean>;
    disconnect?(): Promise<void>;
}

/**
 * Implement MrsGateway บน MQTT
 * - publish คำสั่งที่ mrs/{mrs_id}/cmd (QoS 1)
 * - subscribe ACK ที่ mrs/{mrs_id}/ack แล้ว match ด้วย order_id (correlation key)
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
        private cb?: {
        onOpenFinished?(p: { order_id: string; duration_ms?: number }): void;
        onCloseFinished?(p: { order_id: string; duration_ms?: number }): void;
        }
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

    /** ✅ เพิ่ม method healthCheck (mock) */
    async healthCheck(): Promise<boolean> {
        // ถ้ามี client เชื่อม broker อยู่ ถือว่า online
        return this.client.connected;
    }

    /** ✅ เพิ่ม method disconnect (ปลอดภัย) */
    async disconnect(): Promise<void> {
        return new Promise((resolve) => {
        if (!this.client.connected) return resolve();
        this.client.end(true, {}, () => {
            this.flushPendingOnDisconnect();
            resolve();
        });
        });
    }

    private handleEvent(msg: any) {
        if (msg?.type === 'OPEN_FINISHED')
        this.cb?.onOpenFinished?.({
            order_id: String(msg.order_id),
            duration_ms: msg.duration_ms,
        });
        if (msg?.type === 'CLOSE_FINISHED')
        this.cb?.onCloseFinished?.({
            order_id: String(msg.order_id),
            duration_ms: msg.duration_ms,
        });
    }

    private flushPendingOnDisconnect() {
        for (const [key, entry] of this.pending) {
        clearTimeout(entry.timer);
        entry.resolve({
            ok: false,
            code: 'MQTT_DISCONNECTED',
            message: 'Broker disconnected',
            retryable: true,
        });
        this.pending.delete(key);
        }
    }

    async openAisle(cmd: { mrs_id: string; aisle_id: string; order_id: string }): Promise<OpenCloseAck> {
        return this.sendCommand('OPEN_AISLE', cmd);
    }

    async closeAisle(cmd: { mrs_id: string; aisle_id: string; order_id: string }): Promise<OpenCloseAck> {
        return this.sendCommand('CLOSE_AISLE', cmd);
    }

    private sendCommand(
        type: 'OPEN_AISLE' | 'CLOSE_AISLE',
        cmd: { mrs_id: string; aisle_id: string; order_id: string }
    ): Promise<OpenCloseAck> {
        const key = String(cmd.order_id);
        const prefix = this.opts.topicPrefix ?? 'mrs';
        const topic = `${prefix}/${cmd.mrs_id}/cmd`;
        const payload = {
        type,
        aisle_id: cmd.aisle_id,
        order_id: key,
        ts: new Date().toISOString(),
        };

        const ackTimeout = this.opts.ackTimeoutMs ?? 10000;

        return new Promise<OpenCloseAck>((resolve) => {
        const timer = setTimeout(() => {
            this.pending.delete(key);
            resolve({
            ok: false,
            code: 'ACK_TIMEOUT',
            message: `No ACK for ${type} within ${ackTimeout} ms`,
            retryable: true,
            });
        }, ackTimeout);

        this.pending.set(key, { resolve, reject: resolve, timer });

        this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
        });
    }

    private handleAck(msg: any) {
        const key = String(msg?.order_id ?? '');
        if (!key || !this.pending.has(key)) return;

        const entry = this.pending.get(key)!;
        clearTimeout(entry.timer);
        this.pending.delete(key);

        let ack: OpenCloseAck;
        if (msg?.ok === true) {
        ack = {
            ok: true,
            status: (msg.status as 'accepted' | 'queued') ?? 'accepted',
            order_id: key,
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
