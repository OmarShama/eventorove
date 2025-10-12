import type { AppProps } from 'next/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import { queryClient } from '@/lib/queryClient';
import '@/index.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Layout>
                    <Toaster />
                    <Component {...pageProps} />
                </Layout>
            </TooltipProvider>
        </QueryClientProvider>
    );
}


