import { HydrationLogoFull } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Separator, Toggle } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { HeaderMenu } from "@/modules/layout/components/HeaderMenu"

export const Header = () => {
  const { t } = useTranslation(["common"])
  const { theme, setTheme } = useTheme()
  return (
    <Flex
      py={10}
      px={[20, null, 30]}
      gap={[20, null, 40]}
      direction={["column", null, "row"]}
      bg={getToken("surfaces.themeBasePalette.background")}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid",
        borderColor: getToken("details.separators"),
      }}
      align="center"
    >
      <HydrationLogoFull />
      <HeaderMenu display={["none", null, "flex"]} />
      <Flex ml="auto" align="center" gap={12}>
        <Flex gap={8}>
          Dark Mode
          <Toggle
            checked={theme === "dark"}
            onCheckedChange={(isDark) => setTheme(isDark ? "dark" : "light")}
          />
        </Flex>
        <Button variant="secondary">{t("common:connectWallet")}</Button>
      </Flex>
      <Separator />
    </Flex>
  )
}
