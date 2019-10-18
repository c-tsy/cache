import Driver from './driver';
import File from './drivers/file';
import { resolve } from 'path';
import hook, { HookWhen } from '@ctsy/hook';

export enum CacheError {
    DriverNotFound = "DriverNotFound"
}
export enum CacheHook {
    Set = "cache/Set",
    Del = "cache/Del",
    Start = "cache/Start"
}
export default class Cache {
    driver: Driver | any;
    type: string = "file";
    options: Object | any = {}
    constructor(type: string = "file", options: Object = {}) {
        this.type = type;
        this.options = options;
    }
    /**
     * 启动
     */
    async start() {
        if (this.type == "") {
            this.driver = new Driver
        } else if (this.type == 'file') {
            this.driver = new File();
        } else if ('.' == this.type.substr(0, 1)) {
            this.driver = new (require(resolve(this.type)).default)
        } else {
            this.driver = new (require(this.type).default)
        }
        if (!this.driver) { throw new Error(CacheError.DriverNotFound) }
        await hook.emit(CacheHook.Start, HookWhen.Before, this, this.options);
        await this.driver.start(this.options);
        await hook.emit(CacheHook.Start, HookWhen.After, this, this.options);
    }
    /**
     * 读数据
     * @param key 键名
     * @param dv 默认值
     */
    get(key: string, dv: any = undefined): Promise<number | string | boolean | Object | undefined> {
        return this.driver.get(key, dv);
    }
    /**
     * 存数据
     * @param key 
     * @param value 
     * @param expire 
     */
    async set(key: string, value: any, expire: number = 0) {
        await hook.emit(CacheHook.Set, HookWhen.Before, this, { key, value, expire })
        let r = await this.driver.set(key, value, expire);
        await hook.emit(CacheHook.Set, HookWhen.After, this, { key, value, expire })
        return r;
    }
    /**
     * 删除数据
     * @param key 
     */
    async del(key: string) {
        await hook.emit(CacheHook.Del, HookWhen.Before, this, { key })
        let r = await this.driver.del(key);
        await hook.emit(CacheHook.Del, HookWhen.After, this, { key })
        return r;
    }
    /**
     * 列出所有键
     */
    list() { return this.driver.list(); }
}