import { Button, Flex, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { Summary } from "@/components/Summary"
import { useAssets } from "@/providers/assetsProvider"

import { AssetSwitcher, TradeOption } from "./components"
import { useMarketValidation } from "./Market.utils"

type SwapType = "swap" | "twap"

type FormValues = {
  sell: string
  buy: string
  type: SwapType
  sellAsset: TAssetData | undefined
  buyAsset: TAssetData | undefined
}

export const Market = () => {
  const { t } = useTranslation(["common", "wallet"])
  const { tradable } = useAssets()

  const form = useForm<FormValues>({
    defaultValues: { sell: "", buy: "", type: "swap" },
    mode: "onChange",
    resolver: zodResolver(useMarketValidation()),
  })

  const [sellAsset, buyAsset] = form.watch(["sellAsset", "buyAsset"])

  const onSwitchAssets = () => {
    const { buy, sell, sellAsset, buyAsset } = form.getValues()

    form.setValue("buy", sell)
    form.setValue("sell", buy)
    form.setValue("sellAsset", buyAsset)
    form.setValue("buyAsset", sellAsset)
  }

  return (
    <form onSubmit={form.handleSubmit(() => null)}>
      <Flex sx={{ flexDirection: "column" }}>
        <Controller
          name="sell"
          control={form.control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <AssetSelect
              label={t("sell")}
              value={value}
              onChange={onChange}
              assets={tradable}
              selectedAsset={sellAsset}
              setSelectedAsset={(asset) => form.setValue("sellAsset", asset)}
              error={error?.message}
            />
          )}
        />

        <AssetSwitcher onSwitchAssets={onSwitchAssets} />

        <Controller
          name="buy"
          control={form.control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <AssetSelect
              label={t("buy")}
              value={value}
              onChange={onChange}
              assets={tradable}
              selectedAsset={buyAsset}
              setSelectedAsset={(asset) => form.setValue("buyAsset", asset)}
              error={error?.message}
            />
          )}
        />

        <Controller
          name="type"
          control={form.control}
          render={({ field: { value, onChange } }) => (
            <Flex sx={{ flexDirection: "column", gap: 8, pt: 8, pb: 12 }}>
              <TradeOption
                id="swap"
                value="12345.222"
                dollarValue="999"
                active={"swap" === value}
                onClick={onChange}
                label={t("wallet:market.form.type.single")}
                time="Instant execution"
              />
              <TradeOption
                id="twap"
                value="6789110"
                dollarValue="1000"
                diff="1233"
                active={"twap" === value}
                onClick={onChange}
                label={t("wallet:market.form.type.split")}
                time="Instant execution"
              />
            </Flex>
          )}
        />

        <Separator mx={-20} />
        <Summary
          rows={[
            {
              label: "Price impact:",
              content: "5%",
              separator: <Separator mx={-20} />,
            },
            {
              label: "Est. trade fees:",
              content: "0.10%",
              separator: <Separator mx={-20} />,
            },
            {
              label: "Minimal  received:",
              content: "33 456.56 HDX",
              separator: <Separator mx={-20} />,
            },
          ]}
        />
        <Flex
          sx={{
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
            p: 20,
          }}
        >
          <Button size="large" sx={{ width: "100%" }}>
            Swap
          </Button>

          <Text fs="p5" fw={400} color={getToken("text.high")}>
            Budget & fee will be reserved for this trade.
          </Text>
        </Flex>
      </Flex>
    </form>
  )
}
