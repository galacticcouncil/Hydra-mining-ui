import { useMultichainBalances } from "api/deposit"
import { Spinner } from "components/Spinner/Spinner"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useWalletAccounts } from "sections/web3-connect/Web3Connect.utils"
import { zipArrays } from "utils/rx"

export const DepositPage = () => {
  const { t } = useTranslation()
  const { data: accountsData } = useWalletAccounts()

  const accounts = useMemo(
    () => (accountsData ?? []).filter((account) => !!account?.address),
    [accountsData],
  )

  const results = useMultichainBalances(accounts.map(({ address }) => address))

  const data = useMemo(() => {
    return zipArrays(accounts, results)
  }, [accounts, results])

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      {data.map(([{ address, name }, { isLoading, data }]) => (
        <div key={address}>
          <Text fs={30} sx={{ mb: 10 }} color="brightBlue300">
            {name}
          </Text>
          <div>
            {isLoading && <Spinner />}
            {data?.map(
              ({ symbol, network, balance, decimal, token_unique_id }) => (
                <div
                  css={{
                    display: "grid",
                    gridTemplateColumns: "2fr 4fr 6fr",
                    gap: 40,
                    marginBottom: 4,
                  }}
                >
                  <Text>{network}</Text>
                  <Text>
                    {t("value.token", {
                      value: balance,
                      fixedPointScale: decimal,
                    })}{" "}
                    {symbol}
                  </Text>
                  <Text font="GeistMono" fs={12}>
                    ID: {token_unique_id}
                  </Text>
                </div>
              ),
            )}
          </div>
          {/*  <pre sx={{ color: "white" }}>{JSON.stringify(data, null, 2)}</pre> */}
        </div>
      ))}
    </div>
  )
}
