declare const _default: {
    init: (root: string, repo: "core" | "api", options: Partial<import("./types").Options>) => Promise<void>;
    transpose: (root: string, file?: string | undefined, options?: Partial<import("./types").Options> | undefined) => Promise<void>;
    alias: (options?: Partial<import("./types").Options> | undefined) => void;
    generate: (root: string, options?: Partial<import("./types").Options> | undefined) => Promise<void>;
};
export default _default;
