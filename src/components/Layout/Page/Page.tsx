import { Header } from "components/Layout/Header/Header"
import { ReactNode, useEffect, useRef } from "react"
import { MobileNavBar } from "components/Layout/Header/MobileNavBar/MobileNavBar"
import {
  SGradientBg,
  SPage,
  SPageContent,
  SPageGrid,
  SPageInner,
} from "./Page.styled"
import { ProviderSelectButton } from "sections/provider/components/ProviderSelectButton/ProviderSelectButton"
import { useLocation } from "react-use"

type Props = {
  variant?: "stats" | "default"
  className?: string
  children: ReactNode
}

export const Page = ({ variant = "default", className, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    ref.current?.scrollTo({
      top: 0,
      left: 0,
    })
  }, [location.pathname])

  return (
    <SPage ref={ref}>
      <div css={{ position: "relative" }}>
        {variant === "stats" && <SPageGrid />}
        <SGradientBg variant={variant} />
        <Header />
        <SGradientBg variant={variant} />
        <SPageContent>
          <SPageInner className={className}>{children}</SPageInner>
          <ProviderSelectButton />
        </SPageContent>
        <MobileNavBar />
      </div>
    </SPage>
  )
}
