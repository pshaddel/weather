import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";


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

export default function HealthPage({ data }: InferGetServerSidePropsType<typeof getStaticProps>) {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            router.replace(router.asPath);
        }, 300000); // 300000 ms = 5 minutes

        return () => clearInterval(interval);
    }, [router]);
    const elemsize = "px-6 py-4";
    return (

        <div className="w-screen h-screen p-4">
            <h1 className="text-3xl font-bold text-center mb-8">Services Health Dashboard</h1>
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