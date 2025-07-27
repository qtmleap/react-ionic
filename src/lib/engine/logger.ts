import dayjs from 'dayjs'

export namespace Logger {
  const current = (): string => {
    return dayjs().format('HH:mm:ss')
  }
  // biome-ignore lint/suspicious/noExplicitAny: reason
  export const info = (...args: any[]): void => {
    console.info(`%c[${current()}]:`, 'color: #1E90FF; font-weight: bold;', ...args)
  }

  // biome-ignore lint/suspicious/noExplicitAny: reason
  export const warn = (...args: any[]): void => {
    console.warn(`%c[${current()}]:`, 'color: #FFA500; font-weight: bold;', ...args)
  }

  // biome-ignore lint/suspicious/noExplicitAny: reason
  export const error = (...args: any[]): void => {
    console.error(`%c[${current()}]:`, 'color: #FF6347; font-weight: bold;', ...args)
  }

  // biome-ignore lint/suspicious/noExplicitAny: reason
  export const debug = (...args: any[]): void => {
    console.debug(`%c[${current()}]:`, 'color: #B0C4DE; font-weight: bold;', ...args)
  }
}
