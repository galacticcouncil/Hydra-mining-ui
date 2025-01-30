import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SButton } from "./StepButton.styled"

export type StepButtonProps = {
  onClick?: () => void
  title: string
  description: string
}

export const StepButton: React.FC<StepButtonProps> = ({
  onClick,
  title,
  description,
}) => (
  <SButton
    onClick={onClick}
    css={!onClick && { pointerEvents: "none", opacity: 0.3 }}
  >
    <div>
      <Text fs={18} font="GeistSemiBold" color="basic100" sx={{ mb: 6 }}>
        {title}
      </Text>
      <Text fs={14} lh={20} color="basic500">
        {description}
      </Text>
    </div>
    <Icon size={20} icon={<ChevronRight sx={{ color: "brightBlue300" }} />} />
  </SButton>
)
