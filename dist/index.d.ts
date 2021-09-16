declare const _default: {
    init: (root: string, repo: "core" | "api" | "trx" | "adm", options: Partial<import("./types").Options>) => Promise<void>;
    transpose: (root: string, filepath?: string | undefined, options?: Partial<import("./types").Options> | undefined) => void;
    alias: (options?: Partial<import("./types").Options> | undefined) => void;
    hooks: (options?: Partial<import("./types").Options> | undefined) => void;
};
export default _default;
