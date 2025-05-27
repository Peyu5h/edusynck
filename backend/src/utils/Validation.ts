import * as yup from "yup";

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name can't be this long"),
  email: yup.string().email("Enter a valid email"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password can't be this long"),
  classNumber: yup.string().max(10, "Class number can't be this long"),
});

export const loginSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email"),
  password: yup
    .string()
    .min(6, "Password can't be this short")
    .max(20, "Password can't be this long"),
});

export const teacherRegisterSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name can't be this long"),
  email: yup.string().email("Enter a valid email"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password can't be this long"),
  classNumber: yup.string().max(10, "Class number can't be this long"),
  role: yup.string().oneOf(["CLASS_TEACHER"]).default("CLASS_TEACHER"),
});
