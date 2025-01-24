import { Meta, StoryObj } from "@storybook/react"

import { Box } from "./Box"

type Story = StoryObj<typeof Box>

export default {
  component: Box,
} satisfies Meta<typeof Box>

const Template = (args: Story["args"]) => (
  <Box
    display="flex"
    sx={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}
    {...args}
  >
    I am a box
  </Box>
)

export const Default: Story = {
  render: Template,
  args: {
    sx: {},
  },
}

export const WithBorderRadius: Story = {
  render: Template,
  args: {
    p: 10,
    bg: "pink",
    borderRadius: "lg",
  },
}

export const WithBackground: Story = {
  render: Template,
  args: {
    p: 10,
    bg: "pink",
  },
}

export const WithColor: Story = {
  render: Template,
  args: {
    p: 10,
    color: "red",
  },
}

export const WithPadding: Story = {
  render: Template,
  args: {
    p: 40,
    bg: "pink",
  },
}

export const WithMargin: Story = {
  render: Template,
  args: {
    p: 10,
    m: 40,
    bg: "pink",
  },
}

export const WithSize: Story = {
  render: Template,
  args: {
    p: 10,
    size: 100,
    bg: "pink",
  },
}

export const Responsive: Story = {
  render: Template,
  args: {
    p: [20, null, 40],
    m: [20, null, 40],
    size: [100, null, 200],
    bg: ["skyblue", null, "pink"],
  },
}
