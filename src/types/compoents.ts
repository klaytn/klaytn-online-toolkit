export type ResultFormType<T = string> =
  | {
      success: true
      value?: T
    }
  | {
      success: false
      message: string
    }
