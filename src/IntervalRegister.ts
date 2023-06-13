type intervalRegisterConfig = {
  intervalInms?: number
  immediately?: boolean
}
type Fn<T extends unknown[]> = (...args: T) => unknown
export class IntervalEx<T extends unknown[] = unknown[]> {
  private _config: intervalRegisterConfig | (() => intervalRegisterConfig)
  private _cb: Fn<T>
  private _time: number | undefined
  private cbArgs: T
  constructor(
    config: intervalRegisterConfig | (() => intervalRegisterConfig),
    callback: Fn<T>,
    ...args: T
  ) {
    this._config = config
    this.cbArgs = args
    this._cb = callback
    this.loadListener()
    this.start()
  }
  /**开始循环 */
  private start = () => {
    const config =
      this._config instanceof Function ? this._config() : this._config
    const intervalInms = config.intervalInms ?? 3000
    if (config.immediately === true) {
      this._cb(...this.cbArgs)
    }
    this._time = setInterval(this._cb, intervalInms, this.cbArgs)
  }
  /**暂停循环 */
  private pause = () => {
    if (this._time) {
      clearInterval(this._time)
      this._time = undefined
    }
  }
  /**注销循环 */
  public off = () => {
    this.pause()
    this.removeListener()
  }
  /**挂载监听 */
  private loadListener() {
    document.addEventListener('visibilitychange', this.visibilityListener)
  }
  /**卸载监听 */
  private removeListener() {
    document.removeEventListener('visibilitychange', this.visibilityListener)
  }
  /**页面不可见的监听 */
  private visibilityListener = () => {
    switch (document.visibilityState) {
      case 'hidden':
        this.pause()
        break
      case 'visible':
        this.start()
        break
      default:
        break
    }
  }
}
