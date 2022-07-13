/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly REACT_APP_API_ENDPOINT: string;
        readonly REACT_APP_WS_ENDPOINT: string;
    }
}

