import { Plus } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  FormField,
  Input,
  Spinner,
} from "@galacticcouncil/ui/components"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useRpcFormSchema } from "@/components/ProviderRpcSelect/components/RpcForm.utils"
import { useRpcListStore } from "@/states/provider"
import { pingRpc } from "@/utils/rpc"

type FormValues = {
  address: string
}

const PING_TIMEOUT = 10000

export const RpcForm = () => {
  const { t } = useTranslation()
  const { addRpc } = useRpcListStore()

  const form = useForm<FormValues>({
    defaultValues: { address: "wss://" },
    mode: "onChange",
    resolver: zodResolver(useRpcFormSchema()),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ address }: FormValues) => {
      const ping = await pingRpc(address, PING_TIMEOUT)

      if (ping === Infinity) {
        throw new Error(t("rpc.change.modal.errors.notExist"))
      }

      addRpc(address)
      form.reset()
    },
    onError: (error) => {
      form.setError("address", { message: error.message })
    },
  })

  const handleSubmit = (values: FormValues) => {
    mutate(values)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Controller
        name="address"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message}>
            <Input
              {...field}
              customSize="large"
              placeholder="wss://"
              autoComplete="off"
              readOnly={isPending}
              iconStart={Plus}
              isError={!!fieldState.error}
              iconEnd={(props) =>
                isPending ? (
                  <Spinner {...props} />
                ) : (
                  <Button
                    variant="secondary"
                    type="submit"
                    {...props}
                    sx={{ px: 12 }}
                  >
                    {t("add")}
                  </Button>
                )
              }
            />
          </FormField>
        )}
      />
    </form>
  )
}
