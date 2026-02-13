import type { ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type BluetoothDevice = {
    name?: string | null;
    gatt?: BluetoothRemoteGATTServer | null;
    addEventListener: (
        type: "gattserverdisconnected",
        listener: (event: Event) => void
    ) => void;
};

type BluetoothRemoteGATTServer = {
    connected: boolean;
    connect: () => Promise<BluetoothRemoteGATTServer>;
    disconnect: () => void;
    getPrimaryService: (serviceUuid: string) => Promise<BluetoothRemoteGATTService>;
    getPrimaryServices: () => Promise<BluetoothRemoteGATTService[]>;
};

type BluetoothRemoteGATTService = {
    uuid: string;
    getCharacteristic: (characteristicUuid: string) => Promise<BluetoothRemoteGATTCharacteristic>;
};

type BluetoothRemoteGATTCharacteristic = {
    readValue: () => Promise<DataView>;
    writeValue: (value: BufferSource) => Promise<void>;
    startNotifications: () => Promise<void>;
    stopNotifications: () => Promise<void>;
    addEventListener: (
        type: "characteristicvaluechanged",
        listener: (event: Event) => void
    ) => void;
    value?: DataView;
};

declare global {
    interface Navigator {
        bluetooth?: {
            requestDevice: (options: {
                filters?: Array<{ services: string[] } | { name: string } | { namePrefix: string }>;
                optionalServices?: string[];
                acceptAllDevices?: boolean;
            }) => Promise<BluetoothDevice>;
        };
    }
}

// const PAGE_RELOAD_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
// const CACHE_REVALIDATE_TIME = 4 * 60; // 5 minutes in seconds

// export const getStaticProps = (async () => {
//     try {
//         const response = await fetch("https://n8n.dev.dcs.redbull.com/webhook/aa6746bd-5e8e-4a75-bbbd-fb150e758360", {
//             method: "POST",
//             headers: {
//                 "x-api-key": process.env.N8N_VIDERI_HEALTH_API_KEY || ""
//             }
//         });

//         if (!response.ok) {
//             throw new Error("Failed to fetch data from n8n webhook");
//         }

//         const data = await response.json();

//         return {
//             props: {
//                 data: data as HealthData,
//                 lastUpdated: new Date().toISOString()
//             },
//             revalidate: CACHE_REVALIDATE_TIME // ISR: regenerate page every 5 minutes
//         };
//     } catch (error) {
//         console.error("Failed to fetch health data:", error);

//         // Return fallback data in case of error
//         return {
//             props: {
//                 data: [{
//                     service_name: "Health Check Service",
//                     responseTime: 0,
//                     data: 0,
//                     healthy: false
//                 }] as HealthData,
//                 lastUpdated: new Date().toISOString(),
//                 error: "Failed to fetch health data"
//             },
//             revalidate: 60 // Try again in 1 minute if there was an error
//         };
//     }
// }) satisfies GetStaticProps<{ data: HealthData; error?: string }>;

// const StatusIndicator = ({ healthy }: { healthy: boolean }) => (
//     <div className="flex items-center justify-center">
//         <span className={`h-4 w-4 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
//     </div>
// );

type LogItem = {
    id: string;
    time: string;
    step: string;
    status: "pending" | "ok" | "error";
    message: string;
};

type StepKey =
    | "support"
    | "discover"
    | "connect"
    | "services"
    | "read"
    | "write"
    | "notify"
    | "disconnect";

type StepState = {
    key: StepKey;
    label: string;
    done: boolean;
    status: "idle" | "working" | "ok" | "error";
    detail?: string;
};

const DEFAULT_STEPS: StepState[] = [
    { key: "support", label: "Feature detection", done: false, status: "idle" },
    { key: "discover", label: "Discover device", done: false, status: "idle" },
    { key: "connect", label: "Connect", done: false, status: "idle" },
    { key: "services", label: "Discover services", done: false, status: "idle" },
    { key: "read", label: "Read characteristic", done: false, status: "idle" },
    { key: "write", label: "Write characteristic", done: false, status: "idle" },
    { key: "notify", label: "Notifications", done: false, status: "idle" },
    { key: "disconnect", label: "Disconnect", done: false, status: "idle" }
];

const DEFAULT_UUIDS = {
    service: "battery_service",
    readChar: "battery_level",
    writeChar: "0000ffe1-0000-1000-8000-00805f9b34fb",
    notifyChar: "battery_level"
};

export default function BluetoothPage() {
    const [steps, setSteps] = useState<StepState[]>(DEFAULT_STEPS);
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);
    const [isSecureContext, setIsSecureContext] = useState(false);
    const [hasBluetooth, setHasBluetooth] = useState(false);
    const [serviceUuid, setServiceUuid] = useState(DEFAULT_UUIDS.service);
    const [readCharUuid, setReadCharUuid] = useState(DEFAULT_UUIDS.readChar);
    const [writeCharUuid, setWriteCharUuid] = useState(DEFAULT_UUIDS.writeChar);
    const [notifyCharUuid, setNotifyCharUuid] = useState(DEFAULT_UUIDS.notifyChar);
    const [writePayload, setWritePayload] = useState("01");
    const [readValue, setReadValue] = useState<string>("");
    const [notifyValue, setNotifyValue] = useState<string>("");
    const [autoRun, setAutoRun] = useState(false);

    const deviceRef = useRef<BluetoothDevice | null>(null);
    const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
    const notifyCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

    useEffect(() => {
        setIsSecureContext(window.isSecureContext);
        setHasBluetooth(typeof navigator !== "undefined" && "bluetooth" in navigator);
    }, []);

    const supportInfo = useMemo(() => {
        return {
            hasBluetooth,
            secureContext: isSecureContext
        };
    }, [hasBluetooth, isSecureContext]);

    const updateStep = (key: StepKey, next: Partial<StepState>) => {
        setSteps((prev) =>
            prev.map((step) => (step.key === key ? { ...step, ...next } : step))
        );
    };

    const addLog = (entry: Omit<LogItem, "id" | "time">) => {
        const now = new Date();
        setLogs((prev) => [
            {
                id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
                time: now.toLocaleTimeString(),
                ...entry
            },
            ...prev
        ]);
    };

    const parseHexPayload = (hex: string) => {
        const cleaned = hex.replace(/\s+/g, "").toLowerCase();
        if (!/^[0-9a-f]*$/.test(cleaned) || cleaned.length % 2 !== 0) {
            throw new Error("Write payload must be even-length hex bytes");
        }
        const bytes = new Uint8Array(cleaned.length / 2);
        for (let i = 0; i < cleaned.length; i += 2) {
            bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
        }
        return bytes;
    };

    const handleError = (key: StepKey, err: unknown) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        updateStep(key, { status: "error", done: false, detail: message });
        addLog({ step: key, status: "error", message });
        setError(message);
    };

    const checkSupport = () => {
        setError(null);
        updateStep("support", { status: "working" });
        const { hasBluetooth, secureContext } = supportInfo;
        if (!secureContext) {
            const message = "Requires HTTPS or localhost (secure context)";
            updateStep("support", { status: "error", done: false, detail: message });
            addLog({ step: "support", status: "error", message });
            setError(message);
            return false;
        }
        if (!hasBluetooth) {
            const message = "Web Bluetooth not supported in this browser";
            updateStep("support", { status: "error", done: false, detail: message });
            addLog({ step: "support", status: "error", message });
            setError(message);
            return false;
        }
        updateStep("support", { status: "ok", done: true, detail: "Supported" });
        addLog({ step: "support", status: "ok", message: "Supported" });
        return true;
    };

    const discoverDevice = async () => {
        setError(null);
        updateStep("discover", { status: "working" });
        try {
            const device = await navigator.bluetooth?.requestDevice({
                acceptAllDevices: true,
                optionalServices: [serviceUuid]
            });
            if (!device) {
                throw new Error("Bluetooth device request failed");
            }
            deviceRef.current = device;
            setSelectedName(device.name || "Unnamed device");
            updateStep("discover", { status: "ok", done: true, detail: device.name || "Selected" });
            addLog({ step: "discover", status: "ok", message: `Selected ${device.name || "device"}` });
            device.addEventListener("gattserverdisconnected", () => {
                setIsConnected(false);
                addLog({ step: "disconnect", status: "ok", message: "Device disconnected" });
            });
            return device;
        } catch (err) {
            handleError("discover", err);
            throw err;
        }
    };

    const connectDevice = async () => {
        setError(null);
        updateStep("connect", { status: "working" });
        try {
            const device = deviceRef.current ?? (await discoverDevice());
            if (!device.gatt) {
                throw new Error("GATT not available on selected device");
            }
            const server = await device.gatt.connect();
            serverRef.current = server;
            setIsConnected(true);
            updateStep("connect", { status: "ok", done: true, detail: "Connected" });
            addLog({ step: "connect", status: "ok", message: "Connected" });
            return server;
        } catch (err) {
            handleError("connect", err);
            throw err;
        }
    };

    const discoverServices = async () => {
        setError(null);
        updateStep("services", { status: "working" });
        try {
            const server = serverRef.current ?? (await connectDevice());
            const services = await server.getPrimaryServices();
            const names = services.map((service: BluetoothRemoteGATTService) => service.uuid).slice(0, 5).join(", ");
            updateStep("services", {
                status: "ok",
                done: true,
                detail: services.length ? `${services.length} services` : "None"
            });
            addLog({
                step: "services",
                status: "ok",
                message: services.length ? `Found ${services.length} services (${names})` : "No services"
            });
            return services;
        } catch (err) {
            handleError("services", err);
            throw err;
        }
    };

    const readCharacteristic = async () => {
        setError(null);
        updateStep("read", { status: "working" });
        try {
            const server = serverRef.current ?? (await connectDevice());
            const service = await server.getPrimaryService(serviceUuid);
            const characteristic = await service.getCharacteristic(readCharUuid);
            const value = await characteristic.readValue();
            const bytes = Array.from(new Uint8Array(value.buffer));
            const formatted = bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
            setReadValue(formatted || "(empty)");
            updateStep("read", { status: "ok", done: true, detail: formatted || "empty" });
            addLog({ step: "read", status: "ok", message: `Read ${formatted || "empty"}` });
            return formatted;
        } catch (err) {
            handleError("read", err);
            throw err;
        }
    };

    const writeCharacteristic = async () => {
        setError(null);
        updateStep("write", { status: "working" });
        try {
            const server = serverRef.current ?? (await connectDevice());
            const service = await server.getPrimaryService(serviceUuid);
            const characteristic = await service.getCharacteristic(writeCharUuid);
            const payload = parseHexPayload(writePayload);
            await characteristic.writeValue(payload);
            updateStep("write", { status: "ok", done: true, detail: `Wrote ${payload.length} bytes` });
            addLog({ step: "write", status: "ok", message: `Wrote ${payload.length} bytes` });
        } catch (err) {
            handleError("write", err);
            throw err;
        }
    };

    const startNotifications = async () => {
        setError(null);
        updateStep("notify", { status: "working" });
        try {
            const server = serverRef.current ?? (await connectDevice());
            const service = await server.getPrimaryService(serviceUuid);
            const characteristic = await service.getCharacteristic(notifyCharUuid);
            notifyCharRef.current = characteristic;
            characteristic.addEventListener("characteristicvaluechanged", (event: Event) => {
                const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
                if (!target.value) return;
                const bytes = Array.from(new Uint8Array(target.value.buffer));
                const formatted = bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
                setNotifyValue(formatted || "(empty)");
                addLog({ step: "notify", status: "ok", message: `Notify ${formatted || "empty"}` });
            });
            await characteristic.startNotifications();
            updateStep("notify", { status: "ok", done: true, detail: "Notifications active" });
            addLog({ step: "notify", status: "ok", message: "Notifications started" });
        } catch (err) {
            handleError("notify", err);
            throw err;
        }
    };

    const disconnectDevice = async () => {
        setError(null);
        updateStep("disconnect", { status: "working" });
        try {
            if (notifyCharRef.current) {
                try {
                    await notifyCharRef.current.stopNotifications();
                } catch {
                    // ignore
                }
            }
            if (deviceRef.current?.gatt?.connected) {
                deviceRef.current.gatt.disconnect();
            }
            serverRef.current = null;
            setIsConnected(false);
            updateStep("disconnect", { status: "ok", done: true, detail: "Disconnected" });
            addLog({ step: "disconnect", status: "ok", message: "Disconnected" });
        } catch (err) {
            handleError("disconnect", err);
            throw err;
        }
    };

    const resetSession = () => {
        setSteps(DEFAULT_STEPS);
        setLogs([]);
        setError(null);
        setSelectedName("");
        setIsConnected(false);
        setReadValue("");
        setNotifyValue("");
        deviceRef.current = null;
        serverRef.current = null;
        notifyCharRef.current = null;
    };

    const runFullTest = async () => {
        setAutoRun(true);
        try {
            if (!checkSupport()) return;
            await discoverDevice();
            await connectDevice();
            await discoverServices();
            await readCharacteristic();
            await writeCharacteristic();
            await startNotifications();
        } catch {
            // handled per step
        } finally {
            setAutoRun(false);
        }
    };

    const statusPill = (status: StepState["status"]) => {
        if (status === "ok") return "bg-emerald-500/20 text-emerald-200";
        if (status === "error") return "bg-rose-500/20 text-rose-200";
        if (status === "working") return "bg-amber-500/20 text-amber-200";
        return "bg-slate-500/20 text-slate-200";
    };

    return (
        <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/95">
            <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
                <header className="space-y-3">
                    <h2 className="text-2xl font-bold text-center sm:text-3xl">Bluetooth Test Lab</h2>
                    <p className="text-center text-sm text-slate-300 sm:text-base">
                    Discover, pair, read, write, and subscribe to notifications with Web Bluetooth.
                </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-3 sm:text-sm">
                    <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-200">
                        Secure context: {isSecureContext ? "Yes" : "No"}
                    </span>
                    <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-200">
                        Web Bluetooth: {supportInfo.hasBluetooth ? "Available" : "Missing"}
                    </span>
                    <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-200">
                        Device: {selectedName || "None"}
                    </span>
                    <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-200">
                        Connection: {isConnected ? "Connected" : "Disconnected"}
                    </span>
                </div>
                {error && (
                        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
                        {error}
                    </div>
                )}
            </header>

            <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
                    <h3 className="text-xl font-semibold">Step-by-step controls</h3>
                    <p className="mt-1 text-sm text-slate-300">
                        Run steps manually or execute the full plan. Each action requires user
                        interaction where the browser prompts for device access.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            onClick={() => checkSupport()}
                        >
                            1. Check support
                        </button>
                        <button
                                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            onClick={() => discoverDevice()}
                        >
                            2. Discover device
                        </button>
                        <button
                                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            onClick={() => connectDevice()}
                        >
                            3. Connect
                        </button>
                        <button
                                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            onClick={() => discoverServices()}
                        >
                            4. Discover services
                        </button>
                        <button
                                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            onClick={() => readCharacteristic()}
                        >
                            5. Read characteristic
                        </button>
                        <button
                                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            onClick={() => writeCharacteristic()}
                        >
                            6. Write characteristic
                        </button>
                        <button
                                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            onClick={() => startNotifications()}
                        >
                            7. Start notifications
                        </button>
                        <button
                                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            onClick={() => disconnectDevice()}
                        >
                            8. Disconnect
                        </button>
                    </div>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <button
                                className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60 sm:w-auto"
                            onClick={() => runFullTest()}
                            disabled={autoRun}
                        >
                            {autoRun ? "Running..." : "Run full plan"}
                        </button>
                        <button
                                className="w-full rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 sm:w-auto"
                            onClick={resetSession}
                        >
                            Reset session
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
                    <h3 className="text-xl font-semibold">UUID settings</h3>
                    <p className="mt-1 text-sm text-slate-300">
                        Use a known service/characteristic or enter custom UUIDs.
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                        <label className="block">
                            <span className="text-slate-200">Service UUID</span>
                            <input
                                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-base text-slate-100 sm:text-sm"
                                value={serviceUuid}
                                onChange={(event) => setServiceUuid(event.target.value.trim())}
                            />
                        </label>
                        <label className="block">
                            <span className="text-slate-200">Read characteristic</span>
                            <input
                                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-base text-slate-100 sm:text-sm"
                                value={readCharUuid}
                                onChange={(event) => setReadCharUuid(event.target.value.trim())}
                            />
                        </label>
                        <label className="block">
                            <span className="text-slate-200">Write characteristic</span>
                            <input
                                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-base text-slate-100 sm:text-sm"
                                value={writeCharUuid}
                                onChange={(event) => setWriteCharUuid(event.target.value.trim())}
                            />
                        </label>
                        <label className="block">
                            <span className="text-slate-200">Notify characteristic</span>
                            <input
                                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-base text-slate-100 sm:text-sm"
                                value={notifyCharUuid}
                                onChange={(event) => setNotifyCharUuid(event.target.value.trim())}
                            />
                        </label>
                        <label className="block">
                            <span className="text-slate-200">Write payload (hex)</span>
                            <input
                                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-base text-slate-100 sm:text-sm"
                                value={writePayload}
                                onChange={(event) => setWritePayload(event.target.value)}
                            />
                        </label>
                        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-xs text-slate-200">
                            Read value: {readValue || "-"}
                            <br />
                            Notify value: {notifyValue || "-"}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.1fr_1.2fr]">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
                    <h3 className="text-xl font-semibold">Progress checklist</h3>
                    <ul className="mt-4 space-y-3">
                        {steps.map((step) => (
                            <li key={step.key} className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">{step.label}</p>
                                    <p className="text-xs text-slate-400">{step.detail || "Waiting"}</p>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(
                                        step.status
                                    )}`}
                                >
                                    {step.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
                    <h3 className="text-xl font-semibold">Activity log</h3>
                        <div className="mt-4 max-h-[260px] space-y-2 overflow-auto text-xs sm:max-h-[360px]">
                        {logs.length === 0 && (
                            <p className="text-slate-400">No activity yet. Run a step to see logs.</p>
                        )}
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2"
                            >
                                <div className="flex items-center justify-between text-slate-300">
                                    <span className="uppercase">{log.step}</span>
                                    <span>{log.time}</span>
                                </div>
                                <p className={`mt-1 text-sm ${log.status === "error" ? "text-rose-200" : "text-slate-100"}`}>
                                    {log.message}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            </div>
        </div>
    );
}

BluetoothPage.getLayout = function getLayout(page: ReactElement) {
    return page;
};