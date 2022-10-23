export type ResultFormType =
  | {
      success: true
      value: string
    }
  | {
      success: false
      message: string
    }
