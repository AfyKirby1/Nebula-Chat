import { EventEmitter } from 'events';

// Singleton data store to be shared across "clients"
class MemoryStore {
    streams: Map<string, Array<[string, string[]]>> = new Map();
    pubsub: EventEmitter = new EventEmitter();

    static instance = new MemoryStore();
}

export class MemoryRedis extends EventEmitter {
    private store = MemoryStore.instance;

    constructor() {
        super();
    }

    async xrange(key: string, start: string, end: string) {
        const stream = this.store.streams.get(key) || [];
        return stream;
    }

    async xadd(key: string, id: string, field: string, value: string) {
        if (!this.store.streams.has(key)) {
            this.store.streams.set(key, []);
        }
        const stream = this.store.streams.get(key)!;
        const entryId = id === '*' ? `${Date.now()}-${stream.length}` : id;
        // Format matches ioredis: [id, [field, value, ...]]
        // But the code expects [id, [field, value]] flattened? 
        // Let's check route.ts: const [id, fields] of history
        // fields is array like ['data', '{"type":"..."}']
        const entry: [string, string[]] = [entryId, [field, value]];
        stream.push(entry);
        return entryId;
    }

    async publish(channel: string, message: string) {
        this.store.pubsub.emit(channel, message);
        return 1;
    }

    async subscribe(channel: string) {
        this.store.pubsub.on(channel, (message) => {
            this.emit('message', channel, message);
        });
        return 1;
    }

    duplicate() {
        return new MemoryRedis();
    }

    async expire(key: string, seconds: number) {
        // No-op for memory store, or implement cleanup if needed
        return 1;
    }

    async quit() {
        this.removeAllListeners();
        return 'OK';
    }
}
