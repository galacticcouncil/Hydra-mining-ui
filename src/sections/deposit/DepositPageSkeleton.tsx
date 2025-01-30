import Skeleton from "react-loading-skeleton"
import { SContainer, SDepositContent } from "./DepositPage.styled"

export const DepositPageSkeleton = () => {
  return (
    <SContainer>
      <SDepositContent sx={{ p: [16, 30], gap: 40 }}>
        <Skeleton width={120} height={22} sx={{ my: 10 }} />
        <div>
          <Skeleton width="40%" height={16} sx={{ mb: 10 }} />
          <Skeleton width="100%" height={12} />
          <Skeleton width="50%" height={12} />
        </div>
        <div>
          <Skeleton width="40%" height={16} sx={{ mb: 10 }} />
          <Skeleton width="100%" height={12} />
          <Skeleton width="50%" height={12} />
        </div>
        <div>
          <Skeleton width="40%" height={16} sx={{ mb: 10 }} />
          <Skeleton width="100%" height={12} />
          <Skeleton width="50%" height={12} />
        </div>
      </SDepositContent>
    </SContainer>
  )
}
