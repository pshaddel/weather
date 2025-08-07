import { doYouHaveInternetConnection } from "@/app/weather";
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export const getStaticProps = (async () => {
    const response  = await fetch("https://n8n.dev.dcs.redbull.com/webhook/aa6746bd-5e8e-4a75-bbbd-fb150e758360", {
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
        // Re-generate the page at most once every 5 minutes
        revalidate: 300, // In seconds
    };
}) satisfies GetStaticProps<{ data: HealthData }>;

const StatusIndicator = ({ healthy }: { healthy: boolean }) => (
    <div className="flex items-center justify-center">
        <span className={`h-4 w-4 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
    </div>
);

const RELOAD_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function HealthPage({ data, lastUpdated }: InferGetServerSidePropsType<typeof getStaticProps>) {

    const [timeAgo, setTimeAgo] = useState("");

    useEffect(() => {
        const timeoutId = setInterval(function () {
            console.log("Checking internet connection...");
            doYouHaveInternetConnection().then(hasConnection => {
                console.log("Internet connection status:", hasConnection);
                if (hasConnection) {
                    window.location.reload();
                    console.log("Reloading page...");
                } else {
                    console.log("No internet connection");
                }
            }).catch(error => {
                console.error("Error checking internet connection:", error);
            });
        }, RELOAD_INTERVAL);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        const lastUpdatedDate = new Date(lastUpdated);
        const interval = setInterval(() => {
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / 1000);
            const minutes = Math.floor(diffInSeconds / 60);
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