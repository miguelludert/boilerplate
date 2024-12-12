/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, FormProvider } from 'react-hook-form';

export interface FormProps {
  children: any;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
}

export const Form = ({ children, onSubmit, defaultValues }: FormProps) => {
  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit((data) => {
          if (onSubmit) {
            onSubmit(data);
          }
        })}
      >
        {children}
      </form>
    </FormProvider>
  );
};
