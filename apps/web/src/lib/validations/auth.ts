import { z } from 'zod'

/**
 * Sign up form validation schema
 * Enforces strong password requirements
 */
export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, '请输入邮箱')
      .email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(8, '密码至少需要8个字符')
      .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
      .regex(/[a-z]/, '密码必须包含至少一个小写字母')
      .regex(/[0-9]/, '密码必须包含至少一个数字'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>

/**
 * Sign in form validation schema
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export type SignInFormData = z.infer<typeof signInSchema>
