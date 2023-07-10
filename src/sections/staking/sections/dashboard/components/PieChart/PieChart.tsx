import { PieChart as PieChartComponent } from "components/PieChart/PieChart"
import styled from "@emotion/styled"
import { PieChartLabel } from "./PieChartLabel"
import { ComponentProps } from "react"

const SPieChart = styled(PieChartComponent)`
  background: conic-gradient(
    from 335deg at 48.08% 50.64%,
    #f6297c -0.8deg,
    rgba(246, 41, 124, 0) 285.15deg,
    #f6297c 359.2deg,
    rgba(246, 41, 124, 0) 645.15deg
  );
`

type Props = Omit<ComponentProps<typeof PieChartComponent>, "label">

export const PieChart = (props: Props) => (
  <SPieChart
    {...props}
    label={<PieChartLabel percentage={props.percentage} />}
  />
)
