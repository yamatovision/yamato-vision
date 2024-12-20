import { useToast as useToastContext } from '@/context/ToastContext';

export const useToast = () => {
  const { showToast } = useToastContext();
  return { showToast };
};
