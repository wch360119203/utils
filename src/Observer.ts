// eslint-disable-next-line @typescript-eslint/no-explicit-any
type bindFun = (...args: any[]) => void
export default class Observer<T extends Record<string, bindFun>> {
  private _map = new Map<keyof T, Set<bindFun>>()
  private _rmMap = new Map<symbol, [keyof T, T[keyof T]][]>()
  /**触发事件 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dispatch<K extends keyof T>(name: K, ...args: Parameters<T[K]>) {
    const targetFnList = this._map.get(name)
    if (targetFnList) {
      targetFnList.forEach(fun => {
        fun(...args)
      })
    }
  }
  /**绑定事件
   * @param name 事件名称
   * @param fn 绑定的事件
   * @param rmSymbol 统一移除的标记
   */
  public on<K extends keyof T>(name: K, fn: T[K], rmSymbol?: symbol) {
    const target = this._map.get(name)
    if (target instanceof Set) {
      target.add(fn)
    } else {
      this._map.set(name, new Set([fn]))
    }
    if (rmSymbol) this.rmMapAdd(name, fn, rmSymbol)
    return this
  }
  /**登记待移除的事件 */
  private rmMapAdd<K extends keyof T>(name: K, fn: T[K], rmSymbol: symbol) {
    if (!this._rmMap.has(rmSymbol)) {
      this._rmMap.set(rmSymbol, [])
    }
    const target = this._rmMap.get(rmSymbol)
    target!.push([name, fn])
  }
  /**解绑事件 */
  public off<K extends keyof T>(name: K, fn?: T[K]) {
    if (!fn) {
      return this._map.delete(name)
    } else {
      const target = this._map.get(name)
      return target?.delete(fn) ?? false
    }
  }
  /**根据标记统一解绑 */
  public offBySymbol(rmSymbol: symbol) {
    const target = this._rmMap.get(rmSymbol)
    if (!target) return
    for (const [name, fn] of target) {
      this.off(name, fn)
    }
    this._rmMap.delete(rmSymbol)
  }
}
