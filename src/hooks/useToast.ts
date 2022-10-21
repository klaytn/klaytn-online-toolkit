import { toast } from 'react-toastify'

export type UseToastReturn = {
  toast: typeof toast
}

const useToast = (): UseToastReturn => {
  return { toast }
}

export default useToast
