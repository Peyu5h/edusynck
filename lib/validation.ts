import * as yup from "yup";

export const registerSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  roll: yup.string().required("Roll no. is required"),
  email: yup.string().email("Enter a valid email"),
  password: yup.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterValues = yup.InferType<typeof registerSchema>;

export const loginSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email"),
  password: yup.string().min(6, "Password must be at least 6 characters"),
});

export type LoginValues = yup.InferType<typeof loginSchema>;

export const teacherRegisterSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Enter a valid email"),
  password: yup.string().min(6, "Password must be at least 6 characters"),
  classNumber: yup.string().required("Class is required"),
});

export type TeacherRegisterValues = yup.InferType<typeof teacherRegisterSchema>;
