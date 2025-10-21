import '../app/globals.css';
import type { AppProps } from 'next/app';
import Image from 'next/image';

function MyApp({ Component, pageProps }: AppProps) {
    return <Frame><Component {...pageProps} /></Frame>;
}

export default MyApp;

export function Frame({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="flex flex-col items-center justify-between p-36 mt-20" style={{ backgroundColor: 'rgba(241,246,246,255)' }}>
            <div className="fixed left-0 top-0 w-full flex justify-center z-10 pt-4">
                <Image
                    src="/logo.png"
                    alt="Red Bull Logo"
                    width={300}
                    height={90}
                    priority
                    style={{ padding: "20px" }}
                />
            </div>
            {children}
        </main>
    );
}