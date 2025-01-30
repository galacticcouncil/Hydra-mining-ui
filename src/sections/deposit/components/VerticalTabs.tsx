import { Text } from "components/Typography/Text/Text"
import { SContainer, STabItem } from "./VerticalTabs.styled"

type TabItemProps = {
  id: string
  title: string
  icon?: React.ComponentType
  content?: React.ReactNode
  onClick?: (id: string) => void
}

type VerticalTabsProps = {
  value: string
  defaultItemId?: string
  title?: string
  items: TabItemProps[]
  className?: string
}

export const VerticalTabs: React.FC<VerticalTabsProps> = ({
  items,
  title,
  value,
  className,
}) => {
  const content = items.find(({ id }) => id === value)?.content

  return (
    <SContainer className={className}>
      <div>
        {title && (
          <Text
            color="whiteish500"
            fs={12}
            sx={{ mb: 6 }}
            font="GeistMedium"
            tTransform="uppercase"
          >
            {title}
          </Text>
        )}
        {items.map((item) => (
          <TabItem
            isActive={value === item.id}
            key={item.id}
            onClick={() => {
              item.onClick?.(item.id)
            }}
            {...item}
          />
        ))}
      </div>
      <div>{content}</div>
    </SContainer>
  )
}

export const TabItem: React.FC<
  TabItemProps & { onClick: (id: string) => void; isActive: boolean }
> = ({ id, title, icon: Icon, isActive, onClick }) => {
  return (
    <STabItem data-active={isActive} onClick={() => onClick?.(id)}>
      {Icon && <Icon />}
      {title}
    </STabItem>
  )
}
