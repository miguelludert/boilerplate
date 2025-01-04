import { useFormContext } from 'react-hook-form';

export function Input({ name, ...props }: any) {
  const { register, getValues } = useFormContext();
  const defaultValue = getValues(name);
  return (
    <input
      {...props}
      {...register(name)}
      defaultValue={defaultValue}
      type={props.type || 'text'}
    />
  );
}
