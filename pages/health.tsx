import { doYouHaveInternetConnection } from "@/app/weather";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useEffect, useState } from "react";

const PAGE_RELOAD_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_REVALIDATE_TIME = 4 * 60; // 5 minutes in seconds

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
            revalidate: CACHE_REVALIDATE_TIME // ISR: regenerate page every 5 minutes
        };
    } catch (error) {
        console.error("Failed to fetch health data:", error);

        // Return fallback data in case of error
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
            revalidate: 60 // Try again in 1 minute if there was an error
        };
    }
}) satisfies GetStaticProps<{ data: HealthData; error?: string }>;

const StatusIndicator = ({ healthy }: { healthy: boolean }) => (
    <div className="flex items-center justify-center">
        <span className={`h-4 w-4 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
    </div>
);

export default function HealthPage({ data, lastUpdated, error }: InferGetStaticPropsType<typeof getStaticProps>) {

    const [timeAgo, setTimeAgo] = useState("");

    // Page auto-reload every 5 minutes
    // useEffect(() => {
    //     const timeoutId = setInterval(function () {
    //         console.log("Auto-reloading page every 5 minutes...");
    //         window.location.reload();
    //     }, PAGE_RELOAD_INTERVAL);

    //     return () => clearTimeout(timeoutId);
    // }, []);

    // Internet connection check (optional - for additional reliability)
    // useEffect(() => {
    //     const timeoutId = setInterval(function () {
    //         console.log('inside interval...')
    //         console.log("Checking internet connection...");
    //         doYouHaveInternetConnection().then(hasConnection => {
    //             console.log("Internet connection status:", hasConnection);
    //             if (!hasConnection) {
    //                 console.log("No internet connection");
    //             } else {
    //                 console.log("Internet connection is available");
    //                 window.location.reload();
    //             }
    //         }).catch(error => {
    //             console.error("Error checking internet connection:", error);
    //         });
    //     }, 3000); // Check every minute

    //     return () => clearTimeout(timeoutId);
    // }, []);

    useEffect(() => {
        const lastUpdatedDate = new Date(lastUpdated);
        const interval = setInterval(() => {
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / 1000);
            const minutes = Math.floor(diffInSeconds / 60);
            if (minutes > 5) {
                window.location.reload();
            }
            const seconds = diffInSeconds % 60;
            if (minutes > 0) {
                setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''} ago`);
            } else if (seconds > 0) {
                setTimeAgo(`${seconds} second${seconds > 1 ? 's' : ''} ago`);
            } else {
                setTimeAgo("just now");
            }
        }, 1000); // Update every second
        return () => clearInterval(interval);
    }, []);

    const elemsize = "px-6 py-4";
    return (

        <div className="w-screen h-screen p-4">
            <h1 className="text-3xl font-bold text-center mb-8">Digital Poster Services Health</h1>
            {error && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                    <p className="font-bold">Warning</p>
                    <p>{error}</p>
                </div>
            )}
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full text-left text-lg">
                    <thead className="bg-gray-100 text-gray-700 uppercase">
                        <tr>
                            <th scope="col" className={elemsize}>Service Name</th>
                            <th scope="col" className={`${elemsize} text-center`}>Status</th>
                            <th scope="col" className={`${elemsize} text-right`}>Response Time (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((service) => (
                            <tr key={service.service_name} className="bg-white border-b hover:bg-gray-50">
                                <td className={`${elemsize} font-medium text-gray-900 whitespace-nowrap`}>
                                    {service.service_name}
                                </td>
                                <td className={elemsize}>
                                    <StatusIndicator healthy={service.healthy} />
                                </td>
                                <td className={`${elemsize} text-right`}>
                                    {service.responseTime.toFixed(3)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 text-center text-gray-500">
                    <p>Time past from last update: {timeAgo}</p>
                </div>
            </div>
        </div>
    );
}

type HealthData = {
    service_name: string,
    responseTime: number,
    data: number,
    healthy: boolean
}[];