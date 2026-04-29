import { GetStaticProps, InferGetStaticPropsType } from "next";
import Image from "next/image";
import { ReactElement, useEffect, useState } from "react";

const CACHE_REVALIDATE_TIME = 4 * 60; // seconds
const RELOAD_AFTER_MINUTES = 5;

export const getStaticProps = (async () => {
    try {
        const response = await fetch("https://n8n.dev.dcs.redbull.com/webhook/aa6746bd-5e8e-4a75-bbbd-fb150e758360", {
            method: "POST",
            headers: {
                "x-api-key": process.env.N8N_VIDERI_HEALTH_API_KEY || ""
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data from n8n webhook");
        }

        const data = await response.json();

        return {
            props: {
                data: data as HealthData,
                lastUpdated: new Date().toISOString()
            },
            revalidate: CACHE_REVALIDATE_TIME
        };
    } catch (error) {
        console.error("Failed to fetch health data:", error);

        return {
            props: {
                data: [{
                    service_name: "Health Check Service",
                    responseTime: 0,
                    data: 0,
                    healthy: false
                }] as HealthData,
                lastUpdated: new Date().toISOString(),
                error: "Failed to fetch health data"
            },
            revalidate: 60
        };
    }
}) satisfies GetStaticProps<{ data: HealthData; error?: string }>;

function formatTimeAgo(lastUpdated: string, now: Date) {
    const diff = Math.floor((now.getTime() - new Date(lastUpdated).getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    if (minutes > 0) {
        return `${minutes}m ${seconds}s ago`;
    }
    if (seconds > 0) {
        return `${seconds}s ago`;
    }
    return "just now";
}

function ResponseBadge({ seconds, healthy }: { seconds: number; healthy: boolean }) {
    if (!healthy) {
        return (
            <span className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-400 ring-1 ring-inset ring-rose-500/30">
                offline
            </span>
        );
    }
    const tone =
        seconds < 0.5
            ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
            : seconds < 1.5
                ? "bg-amber-500/10 text-amber-300 ring-amber-500/30"
                : "bg-orange-500/10 text-orange-300 ring-orange-500/30";
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-mono font-medium ring-1 ring-inset ${tone}`}>
            {seconds.toFixed(3)}s
        </span>
    );
}

function StatusDot({ healthy }: { healthy: boolean }) {
    if (healthy) {
        return (
            <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400"></span>
            </span>
        );
    }
    return (
        <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
        </span>
    );
}

export default function HealthPage({ data, lastUpdated, error }: InferGetStaticPropsType<typeof getStaticProps>) {
    const [timeAgo, setTimeAgo] = useState("just now");

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const minutes = Math.floor((now.getTime() - new Date(lastUpdated).getTime()) / 1000 / 60);
            if (minutes > RELOAD_AFTER_MINUTES) {
                window.location.reload();
                return;
            }
            setTimeAgo(formatTimeAgo(lastUpdated, now));
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    const total = data.length;
    const healthyCount = data.filter((s) => s.healthy).length;
    const allHealthy = healthyCount === total;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
                <div className="mb-8 flex justify-center">
                    <Image
                        src="/logo.png"
                        alt="Red Bull"
                        width={180}
                        height={54}
                        priority
                        className="drop-shadow-[0_0_25px_rgba(244,63,94,0.25)]"
                    />
                </div>
                <header className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
                            Digital Poster Services
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            System Health
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Live status of every service. Auto-refresh every {RELOAD_AFTER_MINUTES} minutes.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 backdrop-blur">
                        <StatusDot healthy={allHealthy} />
                        <div className="text-sm">
                            <span className="font-semibold">
                                {healthyCount}/{total}
                            </span>
                            <span className="ml-1 text-slate-400">operational</span>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                        <p className="font-semibold">Heads up</p>
                        <p className="mt-1 text-amber-200/80">{error}</p>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-2xl shadow-black/30 backdrop-blur">
                    <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-900/60 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <div className="col-span-7">Service</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-3 text-right">Response</div>
                    </div>
                    <ul className="divide-y divide-slate-800">
                        {data.map((service) => (
                            <li
                                key={service.service_name}
                                className="grid grid-cols-12 items-center px-6 py-4 transition-colors hover:bg-slate-800/40"
                            >
                                <div className="col-span-7 flex items-center gap-3">
                                    <span
                                        className={`h-2 w-2 rounded-full ${service.healthy ? "bg-emerald-400" : "bg-rose-500"}`}
                                    />
                                    <span className="font-medium text-slate-100">
                                        {service.service_name}
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <StatusDot healthy={service.healthy} />
                                </div>
                                <div className="col-span-3 text-right">
                                    <ResponseBadge seconds={service.responseTime} healthy={service.healthy} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <footer className="mt-6 flex items-center justify-between text-xs text-slate-500">
                    <span>Last update {timeAgo}</span>
                    <span className="font-mono">{new Date(lastUpdated).toLocaleString()}</span>
                </footer>
            </div>
        </div>
    );
}

HealthPage.getLayout = function getLayout(page: ReactElement) {
    return page;
};

type HealthData = {
    service_name: string,
    responseTime: number,
    data: number,
    healthy: boolean
}[];
