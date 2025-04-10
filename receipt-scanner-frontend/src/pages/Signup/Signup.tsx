import React, { useState } from 'react'; 
import { z } from 'zod'; 
import axios from 'axios';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/; 
const cellNumberRegex = /^\d+$/; 

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'), 
  age: z.string().refine((val) => !isNaN(Number(val)), 'Age must be a number'), 
  email: z.string().email('Valid email is required'), 
  cellNumber: z.string().regex(cellNumberRegex, 'Cell number must contain only digits'), 
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters') 
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)'), // password regex for security
});

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    email: '',
    cellNumber: '',
    password: '',
  }); // Initialize state object to manage form input values with useState hook

  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State to store validation errors as a type-safe object

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // Destructure event target to extract input name and value
    setFormData({ ...formData, [name]: value }); // Update formData state immutably with the new input value
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(formData);
  
    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
    } else {
      setErrors({});
      try {
        console.log('Form submitted:', formData);
  
        const response = await axios.post('http://localhost:3002/api/users/signup', {
          fullName: formData.fullName,
          age: Number(formData.age),
          email: formData.email,
          cellNumber: formData.cellNumber,
          password: formData.password,
        });
  
        console.log('✅ User created:', response.data);
        alert('Verify code');
  
      } catch (error: any) {
        console.error('❌ Error creating user:', error.response?.data || error.message);
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        /> {}
        {errors.fullName && <span>{errors.fullName}</span>}
      </div>
      <div>
        <input
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        /> {}
        {errors.age && <span>{errors.age}</span>}
      </div>
      <div>
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        /> {}
        {errors.email && <span>{errors.email}</span>}
      </div>
      <div>
        <input
          name="cellNumber"
          placeholder="+1 123-456-7890"
          value={formData.cellNumber}
          onChange={handleChange}
          required
        /> {}
        {errors.cellNumber && <span>{errors.cellNumber}</span>} {/* Display cellNumber validation error if present */}
      </div>
      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /> {}
        {errors.password && <span>{errors.password}</span>} {}
      </div>
      <button type="submit">Sign up</button> {}
    </form>
  );
};

export default Signup;