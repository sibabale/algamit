declare module 'axios-retry' {
    import { AxiosInstance } from 'axios'

    interface IAxiosRetryConfig {
        retries?: number
        retryDelay?: (retryCount: number, error: any) => number
        shouldResetTimeout?: boolean
        // ... any additional fields you need
    }

    export default function axiosRetry(
        axios: AxiosInstance,
        config?: IAxiosRetryConfig
    ): void
}
