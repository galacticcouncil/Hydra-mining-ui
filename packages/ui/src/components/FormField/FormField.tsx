import { Flex } from "@/components/Flex"
import { Text, TextProps } from "@/components/Text"
import { getToken } from "@/utils"

export const FormLabel: React.FC<TextProps> = (props) => (
  <Text fs={12} fw={400} color={getToken("text.medium")} {...props} />
)

export const FormError: React.FC<TextProps> = (props) => (
  <Text
    fs={12}
    fw={400}
    color={getToken("accents.danger.secondary")}
    {...props}
  />
)

export type FormFieldProps = {
  label?: string
  error?: string
  children: React.ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
}) => {
  return (
    <Flex as="label" direction="column" gap={6}>
      {label && <FormLabel>{label}</FormLabel>}
      {children}
      {error && <FormError>{error}</FormError>}
    </Flex>
  )
}
