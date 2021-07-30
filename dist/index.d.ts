declare const _default: {
    init: (root: string, repo: "api" | "core", options: Partial<import("./types").Options>) => Promise<void>;
    transpose: (root: string, file?: string | undefined, options?: Partial<import("./types").Options> | undefined) => Promise<void>;
    alias: (options?: Partial<import("./types").Options> | undefined) => void;
};
export default _default;
