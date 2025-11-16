/// <reference types="@pptb/types" />
/// <reference types="vite/client" />

declare global {
    interface Window {
        toolboxAPI: typeof import('@pptb/types').toolboxAPI;
        dataverseAPI: typeof import('@pptb/types').dataverseAPI;
    }
}

declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const value: string;
    export default value;
}

export {};
