import Skeleton from "react-loading-skeleton";
import {
  SCircle,
  SItem,
  SItemUSD,
  SItems,
} from "components/Layout/Header/settings/displayAsset/HeaderSettingsDisplayAsset.styled";

export const HeaderSettingsDisplayAssetSkeleton = () => {
  return (
    <SItems>
      <SItemUSD key={`skeleton-usd`}>
        <div sx={{ flex: "column", gap: 8, align: "flex-start" }}>
          <Skeleton height={16} width={20} />
          <Skeleton height={12} width={120} />
        </div>
        <div sx={{ flex: "row", align: "center", gap: 12 }}>
          <Skeleton height={16} width={50} />
          <SCircle isActive={false} />
        </div>
      </SItemUSD>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <SItem key={`skeleton-${n}`}>
          <div sx={{ textAlign: "start" }}>
            <Skeleton width={26} height={26} circle />
          </div>
          <div sx={{ textAlign: "start" }}>
            <Skeleton height={16} width={50} />
          </div>
          <div sx={{ flex: "row", align: "center", gap: 12 }}>
            <Skeleton height={16} width={120} />
            <SCircle isActive={false} />
          </div>
        </SItem>
      ))}
    </SItems>
  );
};
