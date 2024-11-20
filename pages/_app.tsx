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
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200  pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    <Image
                        src="/logo.png"
                        alt="Red Bull Logo"
                        width={300}
                        height={90}
                        priority
                        style={{ padding: "20px" }}
                    />
                </p>
            </div>
            {children}
        </main>
    );
}