type EventMap = Record<string, any>
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

const MAX_LISTENER_COUNT = 100

class EventEmitter<T extends EventMap> {
    private listeners: {
        [K in keyof EventMap]: Set<(p: EventMap[K]) => void>
    } = {}

    public on<K extends EventKey<T>>(event: K, fn: EventReceiver<T[K]>): void {
        this.listeners[event] = this.listeners[event] || new Set()
        if (this.listeners[event].size >= MAX_LISTENER_COUNT) {
            throw new Error(`Maximum listener count exceeded for event type '${event}'`)
        }
        this.listeners[event].add(fn)
    }

    public off<K extends EventKey<T>>(event: K, fn: EventReceiver<T[K]>): boolean {
        return this.listeners[event]?.delete(fn)
    }

    protected emit<K extends EventKey<T>>(event: K, params: T[K]) {
        this.listeners[event]?.forEach(fn => fn(params))
    }
}
