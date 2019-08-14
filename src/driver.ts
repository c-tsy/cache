const cached: any = {}
export default class Driver {
    constructor() { }
    async start(options: any) { }
    /**
     * 获取值
     * @param key 
     * @param defaultValue 
     */
    async get(key: string, defaultValue: any = undefined) {
        let r = cached[key] || defaultValue;
        if (r) {
            if (r._e > 0) {
                if (r._e < Date.now()) {
                    return r.v;
                } else {
                    await this.del(key);
                    return defaultValue;
                }
            }
            return r.v;
        }
        return defaultValue;
    }
    /**
     * 设置值
     * @param key 
     * @param value 
     * @param expire 
     */
    async set(key: string, value: string, expire: number = 0) {
        cached[key] = { _e: expire ? Date.now() + expire : 0, v: value };
        return true;
    }
    /**
     * 删除值
     * @param key 
     */
    async del(key: string) {
        return delete cached[key];
    }
    /**
     * 列出列表
     */
    async list() {
        return Object.keys(cached);
    }
}