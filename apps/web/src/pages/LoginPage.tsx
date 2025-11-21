import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { signIn } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { signInSchema, type SignInFormData } from '@/lib/validations/auth'

/**
 * Login page component
 * Allows users to sign in with email and password
 */
export function LoginPage() {
  const { t } = useTranslation('auth')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const setUser = useAuthStore(state => state.setUser)

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: SignInFormData) {
    setIsLoading(true)

    const { user, error } = await signIn({
      email: values.email,
      password: values.password,
    })

    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: t('login.error'),
        description: error.message,
      })
      return
    }

    if (user) {
      setUser(user)
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('login.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('login.subtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('login.passwordPlaceholder')}
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('login.signingIn') : t('login.submitButton')}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-gray-600">
          {t('login.noAccount')}{' '}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t('login.signupLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
