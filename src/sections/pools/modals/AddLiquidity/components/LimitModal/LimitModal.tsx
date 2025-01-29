import { zodResolver } from "@hookform/resolvers/zod"
import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Input } from "components/Input/Input"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLiquidityLimit } from "state/liquidityLimit"
import { SBoxContainer } from "./LimitModal.styled"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"
import { z } from "zod"
import { required } from "utils/validators"
import BN from "bignumber.js"
import { Button } from "components/Button/Button"

const options = [
  { label: "1%", value: 1 },
  { label: "2%", value: 2 },
  { label: "3%", value: 3 },
]

export const LimitModal = ({ onConfirm }: { onConfirm: () => void }) => {
  const { t } = useTranslation()
  const { addLiquidityLimit, udpate } = useLiquidityLimit()

  const form = useForm<{
    value: string
  }>({
    mode: "onChange",
    defaultValues: { value: addLiquidityLimit },
    resolver: zodResolver(
      z.object({
        value: required.refine((value) => BN(value).lte(100), {
          message: t("liquidity.add.modal.limit.validation.max", {
            value: 100,
          }),
        }),
      }),
    ),
  })

  return (
    <form
      onSubmit={form.handleSubmit(({ value }) => {
        udpate(value)
        onConfirm()
      })}
      sx={{ flex: "column", justify: "space-between", height: 300, p: 24 }}
      autoComplete="off"
    >
      <Controller
        name="value"
        control={form.control}
        render={({
          field: { name, value, onChange },
          fieldState: { error },
        }) => (
          <SBoxContainer>
            <BoxSwitch
              options={options}
              selected={BN(value).gt(3) ? -1 : BN(value).toNumber()}
              onSelect={(value) => onChange(value.toString())}
            />
            <div>
              <Input
                value={value}
                onChange={onChange}
                name={name}
                label={t("custom")}
                placeholder={t("custom")}
                unit="%"
              />
              {error && <SErrorMessage>{error.message}</SErrorMessage>}
            </div>
          </SBoxContainer>
        )}
      />

      <Button fullWidth variant="primary">
        {t("confirm")}
      </Button>
    </form>
  )
}
