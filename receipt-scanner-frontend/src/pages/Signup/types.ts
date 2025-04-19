export interface SignupFormFields {
  fullName: string;
  age: string;
  email: string;
  cellNumber: string;
  password: string;
}

/**
 * Return type of the signup hook
 */
export interface SignupControllerReturn {
  fullName: string;
  age: string;
  email: string;
  cellNumber: string;
  password: string;
  error: string;
  handleChange: (
    field: keyof SignupFormFields
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<void>;
}
